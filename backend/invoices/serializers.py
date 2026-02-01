from rest_framework import serializers
from invoices.models import CompanyInvoice, InvoiceItem, InvoiceSettings, InvoiceReminder
from accounts.models import Company
from subscriptions.models import CompanySubscription


class InvoiceSettingsSerializer(serializers.ModelSerializer):
    """Serializer for invoice settings"""
    
    class Meta:
        model = InvoiceSettings
        fields = [
            'id', 'company_name', 'company_address', 'company_vat_number',
            'company_registration', 'company_email', 'company_phone', 
            'company_website', 'logo', 'invoice_prefix', 'invoice_number_sequence',
            'default_currency', 'default_vat_rate', 'payment_terms_days',
            'bank_name', 'bank_account', 'bank_swift', 'footer_note'
        ]


class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for invoice line items"""
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'description', 'details', 'quantity', 
            'unit_price', 'total', 'order'
        ]
        read_only_fields = ['total']


class InvoiceItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoice items"""
    
    class Meta:
        model = InvoiceItem
        fields = ['description', 'details', 'quantity', 'unit_price', 'order']


class InvoiceReminderSerializer(serializers.ModelSerializer):
    """Serializer for payment reminders"""
    
    class Meta:
        model = InvoiceReminder
        fields = [
            'id', 'reminder_type', 'sent_date', 'sent_to',
            'subject', 'message', 'opened', 'opened_date'
        ]


class CompanyInvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice list view"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CompanyInvoice
        fields = [
            'id', 'uuid', 'invoice_number', 'company', 'company_name',
            'status', 'status_display', 'invoice_date', 'due_date',
            'period_start', 'period_end', 'billing_period',
            'currency', 'total', 'customer_name', 'sent_date',
            'paid_date', 'is_overdue', 'days_overdue', 'auto_generated'
        ]


class CompanyInvoiceDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single invoice view"""
    
    items = InvoiceItemSerializer(many=True, read_only=True)
    reminders = InvoiceReminderSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyInvoice
        fields = [
            'id', 'uuid', 'invoice_number', 'company', 'company_name',
            'subscription', 'status', 'status_display', 'invoice_date',
            'due_date', 'period_start', 'period_end', 'billing_period',
            'currency', 'subtotal', 'vat_rate', 'vat_amount', 'total',
            'customer_name', 'customer_address', 'customer_vat_number',
            'customer_email', 'pdf_file', 'pdf_url', 'sent_date', 'sent_to',
            'paid_date', 'payment_method', 'payment_reference',
            'notes', 'internal_notes', 'auto_generated', 'generated_by',
            'is_overdue', 'days_overdue', 'items', 'reminders',
            'created_at', 'updated_at'
        ]
    
    def get_pdf_url(self, obj):
        """Get PDF download URL"""
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None


class CompanyInvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices"""
    
    items = InvoiceItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = CompanyInvoice
        fields = [
            'company', 'subscription', 'invoice_date', 'due_date',
            'period_start', 'period_end', 'billing_period',
            'currency', 'vat_rate', 'customer_name', 'customer_address',
            'customer_vat_number', 'customer_email', 'notes',
            'internal_notes', 'items'
        ]
    
    def create(self, validated_data):
        """Create invoice with items"""
        items_data = validated_data.pop('items', [])
        
        # Get invoice settings
        settings = InvoiceSettings.objects.first()
        if not settings:
            raise serializers.ValidationError("Invoice settings not configured")
        
        # Generate invoice number
        validated_data['invoice_number'] = settings.get_next_invoice_number()
        
        # Set generated_by
        request = self.context.get('request')
        if request and request.user:
            validated_data['generated_by'] = request.user
        
        # Create invoice
        invoice = CompanyInvoice.objects.create(**validated_data)
        
        # Create items
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        # Calculate totals
        invoice.calculate_totals()
        
        return invoice


class CompanyInvoiceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating invoices"""
    
    class Meta:
        model = CompanyInvoice
        fields = [
            'status', 'invoice_date', 'due_date', 'customer_name',
            'customer_address', 'customer_vat_number', 'customer_email',
            'notes', 'internal_notes', 'vat_rate'
        ]


class GenerateInvoiceSerializer(serializers.Serializer):
    """Serializer for bulk invoice generation"""
    
    company_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of company IDs to generate invoices for. If empty, generates for all active subscriptions."
    )
    billing_period = serializers.ChoiceField(
        choices=['monthly', 'quarterly', 'yearly'],
        default='monthly'
    )
    invoice_date = serializers.DateField(required=False)
    period_start = serializers.DateField(required=False)
    period_end = serializers.DateField(required=False)
    auto_send = serializers.BooleanField(
        default=False,
        help_text="Automatically send invoices via email after generation"
    )
    
    def validate(self, data):
        """Validate date ranges"""
        if data.get('period_start') and data.get('period_end'):
            if data['period_start'] >= data['period_end']:
                raise serializers.ValidationError(
                    "period_start must be before period_end"
                )
        return data


class SendInvoiceSerializer(serializers.Serializer):
    """Serializer for sending invoice via email"""
    
    email = serializers.EmailField(
        required=False,
        help_text="Email address to send to. Uses customer_email if not provided."
    )
    subject = serializers.CharField(
        required=False,
        max_length=255,
        help_text="Email subject. Uses default if not provided."
    )
    message = serializers.CharField(
        required=False,
        help_text="Custom message to include in email."
    )
    send_copy_to = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        help_text="CC email addresses"
    )


class MarkPaidSerializer(serializers.Serializer):
    """Serializer for marking invoice as paid"""
    
    payment_method = serializers.CharField(max_length=50, required=False)
    payment_reference = serializers.CharField(max_length=255, required=False)
    paid_date = serializers.DateTimeField(required=False)
