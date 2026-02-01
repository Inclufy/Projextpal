from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class InvoiceSettings(models.Model):
    """
    Global invoice settings for the platform
    """
    company_name = models.CharField(max_length=255, default="Inclufy")
    company_address = models.TextField()
    company_vat_number = models.CharField(max_length=50, blank=True)
    company_registration = models.CharField(max_length=50, blank=True)
    company_email = models.EmailField()
    company_phone = models.CharField(max_length=50, blank=True)
    company_website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='invoices/logos/', null=True, blank=True)
    
    # Invoice numbering
    invoice_prefix = models.CharField(max_length=10, default="INV")
    invoice_number_sequence = models.PositiveIntegerField(default=1000)
    
    # Default settings
    default_currency = models.CharField(max_length=3, default="EUR")
    default_vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=21.00)
    
    # Payment terms
    payment_terms_days = models.PositiveIntegerField(default=30)
    
    # Bank details
    bank_name = models.CharField(max_length=255, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    bank_swift = models.CharField(max_length=20, blank=True)
    
    # Footer notes
    footer_note = models.TextField(blank=True, help_text="Appears at bottom of invoice")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Invoice Settings"
        verbose_name_plural = "Invoice Settings"
    
    def __str__(self):
        return f"Invoice Settings - {self.company_name}"
    
    def get_next_invoice_number(self):
        """Generate next invoice number and increment sequence"""
        number = f"{self.invoice_prefix}-{self.invoice_number_sequence:06d}"
        self.invoice_number_sequence += 1
        self.save()
        return number


class CompanyInvoice(models.Model):
    """
    Invoice model for subscription billing
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    PERIOD_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    CURRENCY_CHOICES = [
        ('EUR', 'Euro (€)'),
        ('USD', 'US Dollar ($)'),
        ('GBP', 'British Pound (£)'),
    ]
    
    # Identification
    invoice_number = models.CharField(max_length=50, unique=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Related models
    company = models.ForeignKey(
        'accounts.Company',
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    subscription = models.ForeignKey(
        'subscriptions.CompanySubscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )
    
    # Invoice details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    invoice_date = models.DateField()
    due_date = models.DateField()
    period_start = models.DateField()
    period_end = models.DateField()
    billing_period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    
    # Financial
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='EUR')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=21.00)
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Customer details (snapshot at time of invoice)
    customer_name = models.CharField(max_length=255)
    customer_address = models.TextField()
    customer_vat_number = models.CharField(max_length=50, blank=True)
    customer_email = models.EmailField()
    
    # PDF & Sending
    pdf_file = models.FileField(upload_to='invoices/pdfs/', null=True, blank=True)
    sent_date = models.DateTimeField(null=True, blank=True)
    sent_to = models.EmailField(blank=True)
    
    # Payment tracking
    paid_date = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True, help_text="Not visible to customer")
    
    # Auto-generation
    auto_generated = models.BooleanField(default=False)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_invoices'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-invoice_date', '-created_at']
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['company', 'invoice_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name} (€{self.total})"
    
    def calculate_totals(self):
        """Recalculate invoice totals from line items"""
        items = self.items.all()
        self.subtotal = sum(item.total for item in items)
        self.vat_amount = (self.subtotal * self.vat_rate) / 100
        self.total = self.subtotal + self.vat_amount
        self.save()
    
    def mark_as_sent(self, email=None):
        """Mark invoice as sent"""
        from django.utils import timezone
        self.status = 'sent'
        self.sent_date = timezone.now()
        if email:
            self.sent_to = email
        self.save()
    
    def mark_as_paid(self, payment_method='', reference=''):
        """Mark invoice as paid"""
        from django.utils import timezone
        self.status = 'paid'
        self.paid_date = timezone.now()
        self.payment_method = payment_method
        self.payment_reference = reference
        self.save()
    
    def check_overdue(self):
        """Check if invoice is overdue and update status"""
        from django.utils import timezone
        from datetime import date
        
        if self.status == 'sent' and self.due_date < date.today():
            self.status = 'overdue'
            self.save()
            return True
        return False
    
    @property
    def is_overdue(self):
        """Check if invoice is overdue"""
        from datetime import date
        return self.status in ['sent', 'overdue'] and self.due_date < date.today()
    
    @property
    def days_overdue(self):
        """Calculate days overdue"""
        from datetime import date
        if self.is_overdue:
            return (date.today() - self.due_date).days
        return 0


class InvoiceItem(models.Model):
    """
    Individual line items on an invoice
    """
    invoice = models.ForeignKey(
        CompanyInvoice,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    description = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # For subscription items
    subscription_plan = models.ForeignKey(
        'subscriptions.SubscriptionPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def save(self, *args, **kwargs):
        """Calculate total on save"""
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        # Update invoice totals
        self.invoice.calculate_totals()
    
    def __str__(self):
        return f"{self.description} - €{self.total}"


class InvoiceReminder(models.Model):
    """
    Track payment reminders sent for overdue invoices
    """
    
    REMINDER_TYPES = [
        ('first', 'First Reminder'),
        ('second', 'Second Reminder'),
        ('final', 'Final Notice'),
    ]
    
    invoice = models.ForeignKey(
        CompanyInvoice,
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    sent_date = models.DateTimeField(auto_now_add=True)
    sent_to = models.EmailField()
    
    # Email details
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    # Tracking
    opened = models.BooleanField(default=False)
    opened_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_date']
    
    def __str__(self):
        return f"{self.reminder_type} - {self.invoice.invoice_number}"
