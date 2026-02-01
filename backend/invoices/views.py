from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, date, timedelta
from calendar import monthrange

from invoices.models import CompanyInvoice, InvoiceItem, InvoiceSettings, InvoiceReminder
from invoices.serializers import (
    CompanyInvoiceListSerializer,
    CompanyInvoiceDetailSerializer,
    CompanyInvoiceCreateSerializer,
    CompanyInvoiceUpdateSerializer,
    InvoiceSettingsSerializer,
    GenerateInvoiceSerializer,
    SendInvoiceSerializer,
    MarkPaidSerializer,
    InvoiceItemCreateSerializer,
)
from accounts.models import Company
from subscriptions.models import CompanySubscription

# Helper function to replace dateutil.relativedelta
def add_months(source_date, months):
    """Add months to a date"""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, monthrange(year, month)[1])
    return date(year, month, day)

class InvoiceSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing invoice settings
    Only superusers can access
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSettingsSerializer
    
    def get_queryset(self):
        if not self.request.user.is_superuser:
            return InvoiceSettings.objects.none()
        return InvoiceSettings.objects.all()
    
    def list(self, request):
        """Get or create invoice settings"""
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings, created = InvoiceSettings.objects.get_or_create(
            defaults={
                'company_name': 'Inclufy',
                'company_address': 'WTC Almere\nAlmere, Netherlands',
                'company_email': 'billing@inclufy.com',
                'default_currency': 'EUR',
                'default_vat_rate': 21.00,
            }
        )
        
        serializer = self.serializer_class(settings)
        return Response(serializer.data)


class CompanyInvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing company invoices
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyInvoiceListSerializer
        elif self.action == 'create':
            return CompanyInvoiceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CompanyInvoiceUpdateSerializer
        return CompanyInvoiceDetailSerializer
    
    def get_queryset(self):
        if not self.request.user.is_superuser:
            return CompanyInvoice.objects.none()
        
        queryset = CompanyInvoice.objects.select_related(
            'company', 'subscription', 'generated_by'
        ).prefetch_related('items', 'reminders')
        
        # Filters
        company_id = self.request.query_params.get('company')
        status_filter = self.request.query_params.get('status')
        period = self.request.query_params.get('period')
        search = self.request.query_params.get('search')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if period:
            queryset = queryset.filter(billing_period=period)
        
        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer_email__icontains=search)
            )
        
        return queryset.order_by('-invoice_date', '-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new invoice"""
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate invoices for active subscriptions
        POST /api/admin/invoices/generate/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = GenerateInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        company_ids = serializer.validated_data.get('company_ids')
        billing_period = serializer.validated_data.get('billing_period', 'monthly')
        invoice_date = serializer.validated_data.get('invoice_date', date.today())
        auto_send = serializer.validated_data.get('auto_send', False)
        
        # Calculate period dates if not provided
        period_start = serializer.validated_data.get('period_start')
        period_end = serializer.validated_data.get('period_end')
        
        if not period_start or not period_end:
            period_start, period_end = self._calculate_period_dates(
                invoice_date, billing_period
            )
        
        # Get active subscriptions
        subscriptions = CompanySubscription.objects.filter(
            status__in=['active', 'trialing'],
            billing_cycle=billing_period
        ).select_related('company', 'plan')
        
        if company_ids:
            subscriptions = subscriptions.filter(company_id__in=company_ids)
        
        # Generate invoices
        generated_invoices = []
        errors = []
        
        for subscription in subscriptions:
            try:
                invoice = self._generate_invoice_for_subscription(
                    subscription=subscription,
                    invoice_date=invoice_date,
                    period_start=period_start,
                    period_end=period_end,
                    billing_period=billing_period,
                    user=request.user
                )
                generated_invoices.append(invoice)
                
                # Auto-send if requested
                if auto_send and invoice:
                    self._send_invoice_email(invoice)
                
            except Exception as e:
                errors.append({
                    'company': subscription.company.name,
                    'error': str(e)
                })
        
        return Response({
            'success': True,
            'generated_count': len(generated_invoices),
            'invoice_ids': [inv.id for inv in generated_invoices],
            'errors': errors
        })
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """
        Send invoice via email
        POST /api/admin/invoices/{id}/send/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        serializer = SendInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email', invoice.customer_email)
        subject = serializer.validated_data.get('subject')
        message = serializer.validated_data.get('message')
        send_copy_to = serializer.validated_data.get('send_copy_to', [])
        
        try:
            # Generate PDF if not exists
            if not invoice.pdf_file:
                from invoices.utils import generate_invoice_pdf
                generate_invoice_pdf(invoice)
            
            # Send email
            success = self._send_invoice_email(
                invoice, email, subject, message, send_copy_to
            )
            
            if success:
                invoice.mark_as_sent(email)
                return Response({
                    'success': True,
                    'message': f'Invoice sent to {email}'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """
        Mark invoice as paid
        POST /api/admin/invoices/{id}/mark_paid/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        serializer = MarkPaidSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_method = serializer.validated_data.get('payment_method', '')
        payment_reference = serializer.validated_data.get('payment_reference', '')
        paid_date = serializer.validated_data.get('paid_date')
        
        invoice.mark_as_paid(payment_method, payment_reference)
        
        if paid_date:
            invoice.paid_date = paid_date
            invoice.save()
        
        return Response({
            'success': True,
            'message': 'Invoice marked as paid'
        })
    
    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """
        Generate PDF for invoice
        POST /api/admin/invoices/{id}/generate_pdf/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        
        try:
            from invoices.utils import generate_invoice_pdf
            pdf_url = generate_invoice_pdf(invoice)
            
            return Response({
                'success': True,
                'pdf_url': request.build_absolute_uri(pdf_url)
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an invoice
        POST /api/admin/invoices/{id}/cancel/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        
        if invoice.status == 'paid':
            return Response({
                'success': False,
                'message': 'Cannot cancel paid invoice'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'cancelled'
        invoice.save()
        
        return Response({
            'success': True,
            'message': 'Invoice cancelled'
        })
    
    @action(detail=False, methods=['post'])
    def check_overdue(self, request):
        """
        Check and update overdue invoices
        POST /api/admin/invoices/check_overdue/
        """
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        overdue_count = 0
        for invoice in CompanyInvoice.objects.filter(status='sent'):
            if invoice.check_overdue():
                overdue_count += 1
        
        return Response({
            'success': True,
            'overdue_count': overdue_count
        })
    
    # Helper methods
    
    def _calculate_period_dates(self, invoice_date, billing_period):
        """Calculate period start and end dates based on billing period"""
        if billing_period == 'monthly':
            # Get first day of month
            period_start = invoice_date.replace(day=1)
            # Get last day of month
            last_day = monthrange(period_start.year, period_start.month)[1]
            period_end = period_start.replace(day=last_day)
        elif billing_period == 'quarterly':
            # Get current quarter
            quarter = (invoice_date.month - 1) // 3
            period_start = date(invoice_date.year, quarter * 3 + 1, 1)
            # Calculate end of quarter (3 months later)
            end_month = quarter * 3 + 3
            last_day = monthrange(period_start.year, end_month)[1]
            period_end = date(period_start.year, end_month, last_day)
        else:  # yearly
            period_start = date(invoice_date.year, 1, 1)
            period_end = date(invoice_date.year, 12, 31)
        
        return period_start, period_end
    
    def _generate_invoice_for_subscription(self, subscription, invoice_date, 
                                          period_start, period_end, billing_period, user):
        """Generate invoice for a subscription"""
        # Get invoice settings
        settings = InvoiceSettings.objects.first()
        if not settings:
            raise Exception("Invoice settings not configured")
        
        # Calculate due date
        due_date = invoice_date + timedelta(days=settings.payment_terms_days)
        
        # Create invoice
        invoice = CompanyInvoice.objects.create(
            invoice_number=settings.get_next_invoice_number(),
            company=subscription.company,
            subscription=subscription,
            status='draft',
            invoice_date=invoice_date,
            due_date=due_date,
            period_start=period_start,
            period_end=period_end,
            billing_period=billing_period,
            currency=settings.default_currency,
            vat_rate=settings.default_vat_rate,
            customer_name=subscription.company.name,
            customer_address=getattr(subscription.company, 'address', ''),
            customer_vat_number=getattr(subscription.company, 'vat_number', ''),
            customer_email=subscription.company.owner.email if hasattr(subscription.company, 'owner') and subscription.company.owner else settings.company_email,
            auto_generated=True,
            generated_by=user
        )
        
        # Create invoice item
        InvoiceItem.objects.create(
            invoice=invoice,
            description=f"{subscription.plan.name} - {billing_period.title()} Subscription",
            details=f"Billing period: {period_start.strftime('%d %b %Y')} - {period_end.strftime('%d %b %Y')}",
            quantity=1,
            unit_price=subscription.plan.price,
            subscription_plan=subscription.plan,
            order=1
        )
        
        # Calculate totals
        invoice.calculate_totals()
        
        # Generate PDF
        from invoices.utils import generate_invoice_pdf
        generate_invoice_pdf(invoice)
        
        return invoice
    
    def _send_invoice_email(self, invoice, email=None, subject=None, 
                           message=None, send_copy_to=None):
        """Send invoice via email"""
        from django.core.mail import EmailMessage
        from django.template.loader import render_to_string
        from django.conf import settings as django_settings
        
        if not email:
            email = invoice.customer_email
        
        if not subject:
            subject = f"Invoice {invoice.invoice_number} from Inclufy"
        
        # Render email template
        context = {
            'invoice': invoice,
            'custom_message': message,
        }
        
        html_message = render_to_string('invoices/email/invoice_email.html', context)
        
        # Create email
        email_msg = EmailMessage(
            subject=subject,
            body=html_message,
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            to=[email],
            cc=send_copy_to or []
        )
        email_msg.content_subtype = 'html'
        
        # Attach PDF
        if invoice.pdf_file:
            email_msg.attach_file(invoice.pdf_file.path)
        
        try:
            email_msg.send()
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False