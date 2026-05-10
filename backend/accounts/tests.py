"""
Regression tests for ProjeXtPal account flows.

These tests target the failure modes we've actually hit in production:
  1. Schema drift on `accounts_company` (NotNullViolation on require_2fa, etc.)
  2. Email helper crashes that cascade into 500 on /auth/register/
  3. Plain-text mails leaking back into a flow that should be branded HTML

Run with:
    docker exec -it projextpal-backend-prod python3 manage.py test accounts -v 2
"""
from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse, NoReverseMatch

from accounts.models import Company, CustomUser


class CompanyInsertSmokeTest(TestCase):
    """Catches the 2026-05-10 schema drift: DB had NOT NULL columns the
    model didn't know about, so Company.objects.create() raised
    NotNullViolation on /auth/register/."""

    def test_company_create_minimal_succeeds(self):
        """The exact call PublicAdminRegisterSerializer.create() makes must work."""
        company = Company.objects.create(
            name="regression-co",
            description="",
        )
        self.assertIsNotNone(company.pk)
        self.assertEqual(company.name, "regression-co")

    def test_user_create_with_company_succeeds(self):
        """Signup also creates a CustomUser linked to the new Company."""
        company = Company.objects.create(name="regression-co-2")
        user = CustomUser.objects.create(
            username="signup@example.com",
            email="signup@example.com",
            first_name="Test",
            is_active=False,
            role="admin",
            company=company,
        )
        self.assertEqual(user.company_id, company.pk)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjeXtPal Support <support@inclufy.com>",
    FRONTEND_URL="https://projextpal.com",
)
class BrandedEmailSendTest(TestCase):
    """Verifies send_branded_email renders new HTML templates and produces
    a deliverable EmailMultiAlternatives — would have caught a broken
    template extends/inheritance chain immediately."""

    def test_verify_email_renders_html_with_brand(self):
        from core.email_send import send_branded_email
        send_branded_email(
            template_key="verify_email",
            recipient="user@example.com",
            lang="nl",
            url="https://projextpal.com/verify-email/abc/",
            name="Sami",
            expires_in_hours=24,
        )
        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]

        # Subject is i18n'd
        self.assertIn("ProjeXtPal", msg.subject)
        self.assertEqual(msg.to, ["user@example.com"])

        # HTML alternative present + branded
        html_parts = [body for body, mimetype in msg.alternatives if mimetype == "text/html"]
        self.assertEqual(len(html_parts), 1)
        html = html_parts[0]
        self.assertIn("ProjeXtPal", html)
        self.assertIn("https://projextpal.com/verify-email/abc/", html)
        # Brand colors should be present (paars)
        self.assertIn("#7c3aed", html)
        # Plain-text fallback exists
        self.assertTrue(msg.body)

    def test_supported_langs_all_render(self):
        from core.email_send import send_branded_email
        from core.email_i18n import SUPPORTED_LANGS

        for lang in SUPPORTED_LANGS:
            mail.outbox = []
            send_branded_email(
                template_key="password_reset",
                recipient=f"u+{lang}@example.com",
                lang=lang,
                url="https://projextpal.com/x",
                name="Sami",
                expires_in_hours=1,
            )
            self.assertEqual(len(mail.outbox), 1, f"no mail sent for {lang}")
            msg = mail.outbox[0]
            self.assertTrue(msg.subject, f"empty subject for {lang}")
            self.assertIn("ProjeXtPal", msg.subject, f"unbranded subject for {lang}")

    def test_arabic_renders_rtl_root(self):
        from core.email_send import send_branded_email
        send_branded_email(
            template_key="verify_email",
            recipient="ar@example.com",
            lang="ar",
            url="https://projextpal.com/x",
            name="Sami",
            expires_in_hours=24,
        )
        html = mail.outbox[0].alternatives[0][0]
        self.assertIn('dir="rtl"', html)
        self.assertIn('lang="ar"', html)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjeXtPal Support <support@inclufy.com>",
    FRONTEND_URL="https://projextpal.com",
)
class SignupViewIntegrationTest(TestCase):
    """End-to-end smoke for /auth/register/ — create company, create user,
    send branded verify mail. Catches both the DB schema bug and the
    email pipeline in one go."""

    def _resolve_register_url(self):
        for name in ("public-admin-register", "register-admin", "auth-register"):
            try:
                return reverse(name)
            except NoReverseMatch:
                continue
        # fallback to literal path used by the frontend
        return "/api/v1/auth/register/"

    def test_signup_creates_company_user_and_branded_mail(self):
        url = self._resolve_register_url()
        payload = {
            "email": "newuser@example.com",
            "password": "SignupTest123!",
            "first_name": "New",
            "company_name": "RegressionCo",
        }
        response = self.client.post(url, payload, format="json")

        # We accept any 2xx — the exact response body shape varies.
        # The hard requirement is that the DB writes + email send don't crash.
        self.assertIn(
            response.status_code, (200, 201, 202),
            f"signup returned {response.status_code}: {response.content[:200]!r}",
        )
        self.assertTrue(
            CustomUser.objects.filter(email="newuser@example.com").exists(),
            "user not created — signup pipeline broken",
        )
        self.assertEqual(len(mail.outbox), 1, "no verification mail sent")
        self.assertIn("ProjeXtPal", mail.outbox[0].subject)
