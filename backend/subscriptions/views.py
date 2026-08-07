import stripe
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from datetime import timezone as dt_timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from .models import SubscriptionPlan, CompanySubscription
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionPlanListSerializer,
    StripeCheckoutSerializer,
    CompanySubscriptionSerializer,
    SubscriptionUpgradeSerializer,
    SubscriptionCancelSerializer,
    StripeCustomerSerializer,
)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanListView(generics.ListAPIView):
    """Public API view to list all active subscription plans"""
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        plan_type = self.request.query_params.get("plan_type", None)
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        return queryset.order_by("plan_type", "price")


class SubscriptionPlanDetailView(generics.RetrieveAPIView):
    """Public API view to get details of a specific subscription plan"""
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """Create a Stripe checkout session for subscription plan"""
    serializer = StripeCheckoutSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = SubscriptionPlan.objects.get(id=serializer.validated_data["plan_id"], is_active=True)
        customer = get_or_create_stripe_customer(request.user)
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
            mode="subscription",
            success_url=serializer.validated_data["success_url"],
            cancel_url=serializer.validated_data["cancel_url"],
            metadata={
                "user_id": request.user.id,
                "company_id": request.user.company.id if request.user.company else None,
                "plan_id": plan.id,
                "plan_name": plan.name,
                "plan_type": plan.plan_type,
            },
        )

        return Response({
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "plan": SubscriptionPlanListSerializer(plan).data,
        }, status=status.HTTP_201_CREATED)

    except SubscriptionPlan.DoesNotExist:
        return Response({"error": "Subscription plan not found"}, status=status.HTTP_404_NOT_FOUND)
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_or_create_stripe_customer(user):
    """Get or create a Stripe customer for the company"""
    try:
        if not user.company:
            raise Exception("User must be associated with a company")

        existing_subscription = CompanySubscription.objects.filter(
            company=user.company, stripe_customer_id__isnull=False
        ).first()

        if existing_subscription:
            return stripe.Customer.retrieve(existing_subscription.stripe_customer_id)

        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.username,
            metadata={
                "user_id": user.id,
                "company_id": user.company.id,
                "company_name": user.company.name,
            },
        )
        return customer

    except stripe.error.StripeError as e:
        raise Exception(f"Stripe customer creation failed: {str(e)}") from e


@api_view(['POST'])
@permission_classes([AllowAny])
def request_invoice(request):
    """Request for invoice-based subscription (admin approval needed)"""
    try:
        from .models_requests import InvoiceRequest
        
        plan_id = request.data.get('plan_id')
        billing_period = request.data.get('billing_period', 'monthly')
        company_name = request.data.get('company_name')
        company_vat = request.data.get('company_vat')
        contact_name = request.data.get('contact_name')
        contact_email = request.data.get('contact_email')
        contact_phone = request.data.get('contact_phone')
        notes = request.data.get('notes', '')
        
        if not all([plan_id, company_name, contact_name, contact_email]):
            return Response({'error': 'Vul alle verplichte velden in'}, status=status.HTTP_400_BAD_REQUEST)
        
        plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        
        # SAVE TO DATABASE
        invoice_req = InvoiceRequest.objects.create(
            company_name=company_name,
            company_vat=company_vat,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            plan=plan,
            billing_period=billing_period,
            notes=notes,
            status='pending'
        )
        
        # Send email to admin
        subject = f'Nieuwe factuur aanvraag - {company_name}'
        message = f"""
Nieuwe factuur aanvraag voor ProjeXtPal

Bedrijf: {company_name}
BTW: {company_vat or 'N/A'}
Contact: {contact_name} ({contact_email})
Telefoon: {contact_phone or 'N/A'}
Plan: {plan.name} ({billing_period})
Prijs: €{plan.price}
Opmerkingen: {notes or 'Geen'}

View in admin: /admin/subscriptions/invoicerequest/{invoice_req.id}/
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, ['info@projextpal.com'], fail_silently=True)
        
        # Send confirmation to customer
        customer_message = f"""
Beste {contact_name},

Bedankt voor je aanvraag voor een factuurabonnement bij ProjeXtPal.

We hebben je aanvraag ontvangen en nemen binnen 1-2 werkdagen contact op.

Plan: {plan.name}
Periode: {billing_period}

Met vriendelijke groet,
Team ProjeXtPal
"""
        send_mail('Bevestiging factuur aanvraag - ProjeXtPal', customer_message, settings.DEFAULT_FROM_EMAIL, [contact_email], fail_silently=True)
        
        return Response({
            'success': True,
            'message': 'Je aanvraag is ontvangen. We nemen binnen 1-2 werkdagen contact op.',
            'request_id': invoice_req.id
        })
        
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': 'Plan niet gevonden'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_quote(request):
    """Request for custom quote"""
    try:
        from .models_requests import QuoteRequest
        
        company_name = request.data.get('company_name')
        contact_name = request.data.get('contact_name')
        contact_email = request.data.get('contact_email')
        contact_phone = request.data.get('contact_phone')
        num_users = request.data.get('num_users')
        requirements = request.data.get('requirements', '')
        
        if not all([company_name, contact_name, contact_email]):
            return Response({'error': 'Vul alle verplichte velden in'}, status=status.HTTP_400_BAD_REQUEST)
        
        # SAVE TO DATABASE
        quote_req = QuoteRequest.objects.create(
            company_name=company_name,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            num_users=num_users,
            requirements=requirements,
            status='pending'
        )
        
        # Send emails...
        subject = f'Nieuwe offerte aanvraag - {company_name}'
        message = f"""
Nieuwe offerte aanvraag voor ProjeXtPal

Bedrijf: {company_name}
Contact: {contact_name} ({contact_email})
Telefoon: {contact_phone or 'N/A'}
Gebruikers: {num_users or 'N/A'}
Wensen: {requirements or 'Geen'}

View in admin: /admin/subscriptions/quoterequest/{quote_req.id}/
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, ['info@projextpal.com'], fail_silently=True)
        
        customer_message = f"""
Beste {contact_name},

Bedankt voor je aanvraag voor een offerte op maat bij ProjeXtPal.

We nemen binnen 1-2 werkdagen contact op.

Met vriendelijke groet,
Team ProjeXtPal
"""
        send_mail('Bevestiging offerte aanvraag - ProjeXtPal', customer_message, settings.DEFAULT_FROM_EMAIL, [contact_email], fail_silently=True)
        
        return Response({
            'success': True,
            'message': 'Je offerte aanvraag is ontvangen. We nemen binnen 1-2 werkdagen contact op.',
            'request_id': quote_req.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_demo(request):
    """Request for product demo"""
    try:
        from .models_requests import DemoRequest
        
        company_name = request.data.get('company_name')
        contact_name = request.data.get('contact_name')
        contact_email = request.data.get('contact_email')
        contact_phone = request.data.get('contact_phone')
        preferred_date = request.data.get('preferred_date')
        preferred_time = request.data.get('preferred_time')
        num_participants = request.data.get('num_participants', 1)
        message_text = request.data.get('message', '')
        
        if not all([company_name, contact_name, contact_email]):
            return Response({'error': 'Vul alle verplichte velden in'}, status=status.HTTP_400_BAD_REQUEST)
        
        # SAVE TO DATABASE
        demo_req = DemoRequest.objects.create(
            company_name=company_name,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            preferred_date=preferred_date if preferred_date else None,
            preferred_time=preferred_time if preferred_time else None,
            num_participants=num_participants,
            message=message_text,
            status='pending'
        )
        
        # Send email to admin
        subject = f'Nieuwe demo aanvraag - {company_name}'
        message = f"""
Nieuwe demo aanvraag voor ProjeXtPal

Bedrijf: {company_name}
Contact: {contact_name} ({contact_email})
Telefoon: {contact_phone or 'N/A'}
Datum: {preferred_date or 'Flexibel'}
Tijd: {preferred_time or 'Flexibel'}
Deelnemers: {num_participants}
Bericht: {message_text or 'Geen'}

View in admin: /admin/subscriptions/demorequest/{demo_req.id}/
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, ['info@projextpal.com'], fail_silently=True)
        
        # Send confirmation to customer
        customer_message = f"""
Beste {contact_name},

Bedankt voor je interesse in een demo van ProjeXtPal!

We hebben je aanvraag ontvangen en nemen binnen 1 werkdag contact op om een geschikte tijd af te spreken.

Met vriendelijke groet,
Team ProjeXtPal
"""
        send_mail('Bevestiging demo aanvraag - ProjeXtPal', customer_message, settings.DEFAULT_FROM_EMAIL, [contact_email], fail_silently=True)
        
        return Response({
            'success': True,
            'message': 'Demo aanvraag ontvangen. We nemen binnen 1 werkdag contact op.',
            'request_id': demo_req.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_billing_portal_session(request):
    """Create a Stripe Billing Portal session"""
    try:
        customer = get_or_create_stripe_customer(request.user)
        return_url = request.data.get("return_url") or request.META.get("HTTP_ORIGIN") or request.build_absolute_uri("/")
        session = stripe.billing_portal.Session.create(customer=customer.id, return_url=return_url)
        return Response({"url": session.url})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def retry_latest_invoice(request):
    """Retry payment for the latest open/failed invoice"""
    try:
        if not request.user.company:
            return Response({"error": "User must be associated with a company"}, status=status.HTTP_400_BAD_REQUEST)

        subscription = CompanySubscription.objects.filter(company=request.user.company).first()
        if not subscription:
            return Response({"error": "No subscription found"}, status=status.HTTP_404_NOT_FOUND)

        invoices = stripe.Invoice.list(subscription=subscription.stripe_subscription_id, limit=1)
        if not invoices.data:
            return Response({"error": "No invoices found"}, status=status.HTTP_404_NOT_FOUND)

        invoice = invoices.data[0]
        paid_invoice = stripe.Invoice.pay(invoice.id)
        return Response({"status": paid_invoice.status, "invoice_id": paid_invoice.id})
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_plans_by_type(request):
    """Get subscription plans grouped by type"""
    monthly_plans = SubscriptionPlan.objects.filter(plan_type="monthly", is_active=True).order_by("price")
    yearly_plans = SubscriptionPlan.objects.filter(plan_type="yearly", is_active=True).order_by("price")
    serializer = SubscriptionPlanListSerializer
    return Response({
        "monthly": serializer(monthly_plans, many=True).data,
        "yearly": serializer(yearly_plans, many=True).data,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        "status": "healthy",
        "service": "subscriptions",
        "active_plans": SubscriptionPlan.objects.filter(is_active=True).count(),
    })


class CompanySubscriptionView(generics.RetrieveAPIView):
    """Get current company's subscription"""
    serializer_class = CompanySubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            if not self.request.user.company:
                return None
            return CompanySubscription.objects.get(
                company=self.request.user.company,
                status__in=["active", "trialing", "past_due"],
            )
        except CompanySubscription.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        subscription = self.get_object()
        if not subscription:
            return Response({"error": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(subscription).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upgrade_subscription(request):
    """Upgrade subscription to new plan"""
    serializer = SubscriptionUpgradeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        if not request.user.company:
            return Response({"error": "User must be associated with a company"}, status=status.HTTP_400_BAD_REQUEST)

        current_subscription = CompanySubscription.objects.get(company=request.user.company)
        new_plan = SubscriptionPlan.objects.get(id=serializer.validated_data["new_plan_id"], is_active=True)

        stripe_subscription = stripe.Subscription.retrieve(current_subscription.stripe_subscription_id)
        updated_subscription = stripe.Subscription.modify(
            current_subscription.stripe_subscription_id,
            items=[{"id": stripe_subscription["items"]["data"][0]["id"], "price": new_plan.stripe_price_id}],
            proration_behavior="create_prorations",
            cancel_at_period_end=False,
        )

        current_subscription.plan = new_plan
        current_subscription.current_period_start = timezone.datetime.fromtimestamp(updated_subscription.get("current_period_start", 0), tz=dt_timezone.utc) if updated_subscription.get("current_period_start") else None
        current_subscription.current_period_end = timezone.datetime.fromtimestamp(updated_subscription.get("current_period_end", 0), tz=dt_timezone.utc) if updated_subscription.get("current_period_end") else None
        if updated_subscription.get("cancel_at_period_end") is False:
            current_subscription.cancel_at_period_end = False
            current_subscription.canceled_at = None
        current_subscription.save()

        return Response({
            "message": "Subscription upgraded successfully",
            "subscription": CompanySubscriptionSerializer(current_subscription).data,
        })

    except CompanySubscription.DoesNotExist:
        return Response({"error": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)
    except SubscriptionPlan.DoesNotExist:
        return Response({"error": "Invalid plan selected"}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel subscription"""
    serializer = SubscriptionCancelSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        if not request.user.company:
            return Response({"error": "User must be associated with a company"}, status=status.HTTP_400_BAD_REQUEST)

        subscription = CompanySubscription.objects.get(company=request.user.company)
        cancel_immediately = serializer.validated_data["cancel_immediately"]

        if cancel_immediately:
            stripe.Subscription.delete(subscription.stripe_subscription_id)
            subscription.status = "canceled"
            subscription.canceled_at = timezone.now()
        else:
            stripe.Subscription.modify(subscription.stripe_subscription_id, cancel_at_period_end=True)
            subscription.cancel_at_period_end = True

        subscription.save()
        return Response({
            "message": "Subscription canceled successfully",
            "subscription": CompanySubscriptionSerializer(subscription).data,
        })

    except CompanySubscription.DoesNotExist:
        return Response({"error": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reactivate_subscription(request):
    """Reactivate canceled subscription"""
    try:
        if not request.user.company:
            return Response({"error": "User must be associated with a company"}, status=status.HTTP_400_BAD_REQUEST)

        subscription = CompanySubscription.objects.get(company=request.user.company)
        if not subscription.cancel_at_period_end:
            return Response({"error": "Subscription is not scheduled for cancellation"}, status=status.HTTP_400_BAD_REQUEST)

        stripe.Subscription.modify(subscription.stripe_subscription_id, cancel_at_period_end=False)
        subscription.reactivate_subscription()

        return Response({
            "message": "Subscription reactivated successfully",
            "subscription": CompanySubscriptionSerializer(subscription).data,
        })

    except CompanySubscription.DoesNotExist:
        return Response({"error": "No subscription found"}, status=status.HTTP_404_NOT_FOUND)
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
