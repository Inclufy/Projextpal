"""
Regression tests for FEAT-001 / vendor creation.

POST /api/v1/finance/vendors/ used to INSERT the vendor row and then crash
during response serialization (VendorSerializer.get_invoice_count called
obj.invoices, but the Invoice→Vendor reverse accessor is vendor_invoices),
returning 500 to the client. A client retrying on 500 created duplicate
vendor rows in production. These tests pin the whole lifecycle to 2xx with
a correct response body.
"""
import pytest

pytestmark = pytest.mark.django_db


VENDOR_PAYLOAD = {
    "name": "Acme Tooling BV",
    "vendor_code": "ACME-001",
    "vat_id": "NL123456789B01",
    "contact_email": "billing@acme-tooling.example",
    "default_currency": "EUR",
    "payment_terms_days": 30,
}


class TestVendorCreate:
    def test_create_returns_201_with_body(self, authenticated_client, company):
        resp = authenticated_client.post(
            "/api/v1/finance/vendors/", VENDOR_PAYLOAD, format="json"
        )
        assert resp.status_code == 201, resp.content
        body = resp.json()
        assert body["name"] == "Acme Tooling BV"
        assert body["vendor_code"] == "ACME-001"
        assert body["company"] == company.id
        assert body["invoice_count"] == 0

    def test_create_does_not_leave_row_on_500_retry_pattern(self, authenticated_client):
        """The production bug: INSERT committed, then serialization crashed →
        500 → client retry → duplicate rows. With the fix, a single POST must
        yield exactly one row and a 2xx, so retries never happen."""
        from finance.models import Vendor

        resp = authenticated_client.post(
            "/api/v1/finance/vendors/", VENDOR_PAYLOAD, format="json"
        )
        assert resp.status_code == 201, resp.content
        assert Vendor.objects.filter(vendor_code="ACME-001").count() == 1

    def test_retrieve_returns_200_with_invoice_count(self, authenticated_client):
        create = authenticated_client.post(
            "/api/v1/finance/vendors/", VENDOR_PAYLOAD, format="json"
        )
        assert create.status_code == 201, create.content
        vendor_id = create.json()["id"]

        resp = authenticated_client.get(f"/api/v1/finance/vendors/{vendor_id}/")
        assert resp.status_code == 200, resp.content
        assert resp.json()["invoice_count"] == 0

    def test_invoice_count_reflects_invoices(self, authenticated_client, company, user):
        from finance.models import Invoice, Vendor

        vendor = Vendor.objects.create(company=company, name="Counted BV", created_by=user)
        Invoice.objects.create(
            company=company,
            vendor=vendor,
            invoice_number="INV-1",
            issue_date="2026-08-01",
            total_amount=100,
        )
        resp = authenticated_client.get(f"/api/v1/finance/vendors/{vendor.id}/")
        assert resp.status_code == 200, resp.content
        assert resp.json()["invoice_count"] == 1
