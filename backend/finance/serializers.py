"""Finance serializers — Vendor, Invoice, line items, payments."""
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Invoice, InvoiceLineItem, InvoicePayment, Vendor


# ---------- Vendor ----------

class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight vendor representation for dropdowns / list views."""

    class Meta:
        model = Vendor
        fields = ["id", "name", "vendor_code", "vat_id", "default_currency", "is_active"]


class VendorSerializer(serializers.ModelSerializer):
    invoice_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id", "company", "name", "legal_name", "vendor_code",
            "vat_id", "chamber_of_commerce",
            "contact_name", "contact_email", "contact_phone", "website",
            "address_line_1", "address_line_2", "postal_code", "city", "country",
            "default_category", "default_currency", "payment_terms_days",
            "is_active", "notes",
            "created_by", "created_at", "updated_at",
            "invoice_count",
        ]
        read_only_fields = ["company", "created_by", "created_at", "updated_at", "invoice_count"]

    def get_invoice_count(self, obj):
        return obj.invoices.count()


# ---------- Line items / payments ----------

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = [
            "id", "invoice", "description", "category",
            "quantity", "unit_price", "line_total", "vat_rate",
            "cost_center", "period_start", "period_end", "notes", "created_at",
        ]
        read_only_fields = ["created_at"]
        extra_kwargs = {"invoice": {"required": False}}


class InvoicePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoicePayment
        fields = [
            "id", "invoice", "paid_at", "amount", "method",
            "reference", "recorded_by", "created_at",
        ]
        read_only_fields = ["recorded_by", "created_at"]


# ---------- Invoice ----------

class InvoiceListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True, default=None)

    class Meta:
        model = Invoice
        fields = [
            "id", "vendor", "vendor_name", "project", "project_name",
            "invoice_number", "issue_date", "due_date",
            "total_amount", "paid_amount", "currency", "status",
        ]


class InvoiceDetailSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    payments = InvoicePaymentSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True, default=None)
    program_name = serializers.CharField(source="program.name", read_only=True, default=None)
    remaining_amount = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            "id", "company", "vendor", "vendor_name",
            "project", "project_name", "program", "program_name",
            "invoice_number", "project_code", "program_code",
            "purchase_order", "external_id",
            "issue_date", "due_date", "paid_at",
            "currency", "amount_excl_vat", "vat_rate", "vat_amount",
            "total_amount", "paid_amount",
            "status", "source", "file_url", "notes",
            "submitted_by", "approved_by", "approved_at",
            "created_at", "updated_at",
            "line_items", "payments",
            "remaining_amount", "is_overdue",
        ]
        read_only_fields = [
            "company", "submitted_by", "approved_by", "approved_at",
            "created_at", "updated_at",
        ]


class InvoiceCreateUpdateSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            "id", "vendor", "project", "program",
            "invoice_number", "project_code", "program_code",
            "purchase_order", "external_id",
            "issue_date", "due_date",
            "currency", "amount_excl_vat", "vat_rate", "vat_amount",
            "total_amount",
            "status", "source", "file_url", "notes",
            "line_items",
        ]

    def validate_status(self, value):
        return value.lower() if isinstance(value, str) else value

    @transaction.atomic
    def create(self, validated_data):
        line_items = validated_data.pop("line_items", [])
        invoice = Invoice.objects.create(**validated_data)
        for li in line_items:
            li.pop("invoice", None)
            InvoiceLineItem.objects.create(invoice=invoice, **li)
        return invoice

    @transaction.atomic
    def update(self, instance, validated_data):
        line_items = validated_data.pop("line_items", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if line_items is not None:
            instance.line_items.all().delete()
            for li in line_items:
                li.pop("invoice", None)
                InvoiceLineItem.objects.create(invoice=instance, **li)
        return instance
