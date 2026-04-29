"""
Finance models — vendors, invoices, line items, payments.

Purpose: track ACTUAL external project + programme cost. The existing
projects.Expense and projects.BudgetItem models cover lightweight cost entry
(line-by-line ledger) but have no vendor master data, no invoice grouping,
and no link to incoming invoices from the financial admin (Exact, AFAS, etc.).

This module adds:
- Vendor: supplier master data (name, VAT, contact, default category).
- Invoice: a received invoice from a vendor, scoped to one project (or one
  programme). Holds totals + status + file URL + project_code for matching
  imports from the financial admin.
- InvoiceLineItem: itemised cost breakdown per invoice line.
- ProjectCostSnapshot (calculated): convenience aggregate read at API level.

All models are company-scoped via the Vendor and via Project/Program FKs.
"""
from django.conf import settings
from django.db import models


CURRENCY_CHOICES = [
    ("EUR", "Euro"),
    ("USD", "US Dollar"),
    ("GBP", "British Pound"),
    ("AED", "UAE Dirham"),
    ("SAR", "Saudi Riyal"),
    ("MAD", "Moroccan Dirham"),
]


class Vendor(models.Model):
    """Supplier / leverancier master data, scoped to a company."""

    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="vendors",
    )
    name = models.CharField(max_length=255)
    legal_name = models.CharField(
        max_length=255, blank=True,
        help_text="Statutory name on contracts/invoices, if different from display name.",
    )
    vendor_code = models.CharField(
        max_length=64, blank=True,
        help_text="Vendor code in the financial admin (Exact, AFAS, etc.). Used for import matching.",
    )
    vat_id = models.CharField(
        max_length=64, blank=True,
        help_text="VAT / BTW number (e.g. NL123456789B01).",
    )
    chamber_of_commerce = models.CharField(
        max_length=64, blank=True,
        help_text="KvK / Chamber of Commerce registration number.",
    )

    # Contact
    contact_name = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=64, blank=True)
    website = models.URLField(blank=True)

    # Address
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=128, blank=True)
    country = models.CharField(max_length=2, blank=True, help_text="ISO 3166-1 alpha-2 (NL, DE, ...).")

    # Defaults / metadata
    default_category = models.CharField(
        max_length=50, blank=True,
        help_text="Default expense category for invoices from this vendor (e.g. 'Subcontractor').",
    )
    default_currency = models.CharField(
        max_length=3, choices=CURRENCY_CHOICES, default="EUR",
    )
    payment_terms_days = models.PositiveIntegerField(
        default=30,
        help_text="Standard payment term in days.",
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="created_vendors",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("company", "vendor_code")]
        indexes = [
            models.Index(fields=["company", "name"]),
            models.Index(fields=["company", "vendor_code"]),
            models.Index(fields=["company", "vat_id"]),
        ]

    def __str__(self):
        return self.name


class Invoice(models.Model):
    """An incoming vendor invoice tied to a project or programme."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("received", "Received"),
        ("approved", "Approved"),
        ("paid", "Paid"),
        ("disputed", "Disputed"),
        ("cancelled", "Cancelled"),
    ]

    SOURCE_CHOICES = [
        ("manual", "Manual entry"),
        ("import_csv", "CSV import"),
        ("import_api", "Financial admin API"),
        ("email_parse", "Email parser"),
    ]

    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="vendor_invoices",
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name="vendor_invoices",
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="vendor_invoices",
    )
    program = models.ForeignKey(
        "programs.Program",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="vendor_invoices",
    )

    # Identifiers
    invoice_number = models.CharField(
        max_length=64,
        help_text="Vendor's invoice number (e.g. INV-2026-0042).",
    )
    project_code = models.CharField(
        max_length=64, blank=True,
        help_text="Project code on the invoice — used to auto-match to a Project on import.",
    )
    program_code = models.CharField(
        max_length=64, blank=True,
        help_text="Programme code on the invoice — used to auto-match to a Program on import.",
    )
    purchase_order = models.CharField(max_length=64, blank=True)
    external_id = models.CharField(
        max_length=128, blank=True,
        help_text="ID in the source system (Exact / AFAS / etc.) — used for idempotent imports.",
    )

    # Dates
    issue_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateField(null=True, blank=True)

    # Amounts
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="EUR")
    amount_excl_vat = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    vat_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=21,
        help_text="VAT/BTW rate as a percentage (21.00 = 21%).",
    )
    vat_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    # Workflow
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="received")
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES, default="manual")
    file_url = models.URLField(blank=True, help_text="PDF / file location.")
    notes = models.TextField(blank=True)

    # Approval audit
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="submitted_invoices",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="approved_invoices",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issue_date", "-created_at"]
        unique_together = [("vendor", "invoice_number")]
        indexes = [
            models.Index(fields=["company", "status"]),
            models.Index(fields=["project"]),
            models.Index(fields=["program"]),
            models.Index(fields=["project_code"]),
            models.Index(fields=["program_code"]),
            models.Index(fields=["external_id"]),
            models.Index(fields=["issue_date"]),
        ]

    def __str__(self):
        return f"{self.vendor.name} #{self.invoice_number} ({self.total_amount} {self.currency})"

    @property
    def remaining_amount(self):
        return float(self.total_amount) - float(self.paid_amount)

    @property
    def is_overdue(self):
        from django.utils import timezone
        if not self.due_date or self.status == "paid":
            return False
        return self.due_date < timezone.now().date()


class InvoiceLineItem(models.Model):
    """A line item within an invoice — cost breakdown."""

    CATEGORY_CHOICES = [
        ("labor", "Labor / Staff"),
        ("subcontractor", "Subcontractor"),
        ("consulting", "Consulting"),
        ("material", "Material"),
        ("hardware", "Hardware"),
        ("software", "Software"),
        ("software_license", "Software License"),
        ("cloud_services", "Cloud Services"),
        ("travel", "Travel"),
        ("training", "Training"),
        ("marketing", "Marketing"),
        ("legal", "Legal"),
        ("office", "Office / Facilities"),
        ("other", "Other"),
    ]

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="line_items",
    )
    description = models.CharField(max_length=512)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default="other")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=21)
    cost_center = models.CharField(max_length=64, blank=True)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def save(self, *args, **kwargs):
        if not self.line_total:
            self.line_total = (self.quantity or 0) * (self.unit_price or 0)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} ({self.line_total})"


class InvoicePayment(models.Model):
    """A payment (full or partial) against an invoice."""

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    paid_at = models.DateField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=64, blank=True, help_text="bank_transfer, credit_card, etc.")
    reference = models.CharField(max_length=128, blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="recorded_invoice_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_at"]

    def __str__(self):
        return f"{self.amount} on {self.paid_at}"
