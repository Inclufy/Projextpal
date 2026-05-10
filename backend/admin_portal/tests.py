"""
Admin Portal regression tests.

Covers the admin-user-management actions that customers + sami rely on:
  - reset_password (POST /admin/users/<id>/reset-password/)
  - set_password (POST /admin/users/<id>/set-password/)
  - resend_invite (POST /admin/users/<id>/resend_invite/)

These were 404'ing in production on 2026-05-10 because the actions did
not exist on AdminUserViewSet. Tests prevent that class of bug returning.
"""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import Company

User = get_user_model()

EMAIL_TEST_OVERRIDES = dict(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjeXtPal Support <support@inclufy.com>",
    FRONTEND_URL="https://projextpal.com",
)


def _make_admin_and_target():
    company = Company.objects.create(name="testco-admin")
    admin = User.objects.create_user(
        username="admin@example.com",
        email="admin@example.com",
        password="AdminPass123!",
        first_name="Admin",
        role="superadmin",
        company=company,
        is_active=True,
        is_staff=True,
        is_superuser=True,
    )
    target = User.objects.create_user(
        username="target@example.com",
        email="target@example.com",
        password="ignored",
        first_name="Target",
        role="admin",
        company=company,
        is_active=False,
    )
    return admin, target


@override_settings(**EMAIL_TEST_OVERRIDES)
class AdminUserResetPasswordTest(TestCase):
    """POST /api/v1/admin/users/<id>/reset-password/ — sends a branded reset email."""

    def setUp(self):
        self.admin, self.target = _make_admin_and_target()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_reset_password_sends_branded_email(self):
        r = self.client.post(f"/api/v1/admin/users/{self.target.pk}/reset-password/")
        self.assertIn(r.status_code, (200, 201), r.content)
        self.assertEqual(r.data["status"], "reset_email_sent")
        self.assertEqual(r.data["email"], self.target.email)

        self.assertEqual(len(mail.outbox), 1, "no reset-password email was sent")
        msg = mail.outbox[0]
        self.assertEqual(msg.to, [self.target.email])
        self.assertIn("ProjeXtPal", msg.subject)
        # Verify branded HTML body
        html_parts = [b for b, m in msg.alternatives if m == "text/html"]
        self.assertTrue(html_parts and "reset-password" in html_parts[0])


@override_settings(**EMAIL_TEST_OVERRIDES)
class AdminUserSetPasswordTest(TestCase):
    """POST /api/v1/admin/users/<id>/set-password/ — manual password setting."""

    def setUp(self):
        self.admin, self.target = _make_admin_and_target()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_set_password_succeeds_and_activates(self):
        new_pw = "BrandNewPass2026!"
        r = self.client.post(
            f"/api/v1/admin/users/{self.target.pk}/set-password/",
            {"password": new_pw},
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.data["status"], "password_set")
        self.assertTrue(r.data["is_active"])

        # The new password actually works
        self.target.refresh_from_db()
        self.assertTrue(self.target.check_password(new_pw))
        self.assertTrue(self.target.is_active)

    def test_set_password_rejects_short_password(self):
        r = self.client.post(
            f"/api/v1/admin/users/{self.target.pk}/set-password/",
            {"password": "short"},
            format="json",
        )
        self.assertEqual(r.status_code, 400)
        self.assertIn("at least 8", r.data["error"])

    def test_set_password_rejects_missing_password(self):
        r = self.client.post(
            f"/api/v1/admin/users/{self.target.pk}/set-password/",
            {},
            format="json",
        )
        self.assertEqual(r.status_code, 400)


@override_settings(**EMAIL_TEST_OVERRIDES)
class AdminUserResendInviteTest(TestCase):
    """POST /api/v1/admin/users/<id>/resend_invite/ — re-sends verify-email."""

    def setUp(self):
        self.admin, self.target = _make_admin_and_target()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_resend_invite_sends_branded_email(self):
        # NOTE: DRF DefaultRouter slugifies the action name with underscore by default
        r = self.client.post(f"/api/v1/admin/users/{self.target.pk}/resend_invite/")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.data["status"], "invite_sent")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("ProjeXtPal", mail.outbox[0].subject)


class AdminPortalTabsSmokeTest(TestCase):
    """One test per Admin Portal tab — hits the primary GET endpoint and
    asserts it responds with 200 (or 404 if not implemented — flagged but
    not failed, so we know which features need work).

    Catches the class of bug found on 2026-05-10 where the Admin Portal
    UI calls endpoints that the backend doesn't expose."""

    # endpoint → (tab label, "blocker" if true makes the test fail on 500)
    TAB_ENDPOINTS = [
        ("/api/v1/admin/stats/",            "Dashboard"),
        ("/api/v1/admin/users/",            "Users"),
        ("/api/v1/admin/tenants/",          "Organizations"),
        ("/api/v1/admin/plans/",            "Plans & Pricing"),
        ("/api/v1/admin/logs/",             "Audit Logs"),
        ("/api/v1/admin/invoices/",         "Invoices"),
        ("/api/v1/admin/invoice-settings/", "Invoice settings"),
        ("/api/v1/admin/settings/",         "Settings"),
        ("/api/v1/admin/training/courses/",     "Training/Courses"),
        ("/api/v1/admin/training/enrollments/", "Training/Enrollments"),
        ("/api/v1/admin/training/quotes/",      "Training/Quotes"),
        ("/api/v1/admin/training/analytics/",   "Training/Analytics"),
    ]

    def setUp(self):
        self.company = Company.objects.create(name="adminsmoke")
        self.admin = User.objects.create_user(
            username="su@example.com", email="su@example.com",
            password="x", first_name="Super", role="superadmin",
            company=self.company, is_active=True, is_staff=True, is_superuser=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_no_admin_endpoint_5xxs(self):
        """A 500 on any admin endpoint is a demo blocker — fail loudly."""
        five_xx = []
        for path, label in self.TAB_ENDPOINTS:
            r = self.client.get(path)
            if r.status_code >= 500:
                five_xx.append(f"{label} ({path}) → {r.status_code}\n  {r.content[:200]}")
        self.assertEqual(five_xx, [],
            "Admin portal tabs returning 5xx — these are demo blockers:\n" + "\n".join(five_xx))

    def test_no_admin_endpoint_404s(self):
        """A 404 on a tab means the page will appear empty/broken to admins.
        We flag these but treat them as warnings (some endpoints may be
        placeholders for unbuilt features). Update this list as the
        backend grows."""
        not_found = []
        for path, label in self.TAB_ENDPOINTS:
            r = self.client.get(path)
            if r.status_code == 404:
                not_found.append(f"{label} ({path})")
        # Whitelist of endpoints we know are not yet implemented:
        EXPECTED_MISSING: set[str] = set()
        unexpected = [p for p in not_found if p.split(" ")[0] not in EXPECTED_MISSING]
        self.assertEqual(unexpected, [],
            f"Admin portal tabs returning 404 unexpectedly:\n" + "\n".join(unexpected))


class AdminUserPermissionTest(TestCase):
    """Non-admin users must NOT be able to call password actions."""

    def setUp(self):
        self.company = Company.objects.create(name="permco")
        self.guest = User.objects.create_user(
            username="guest@example.com", email="guest@example.com",
            password="x", role="guest", company=self.company, is_active=True,
        )
        self.target = User.objects.create_user(
            username="t@example.com", email="t@example.com",
            password="x", role="admin", company=self.company, is_active=False,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.guest)

    def test_guest_cannot_reset_password(self):
        r = self.client.post(f"/api/v1/admin/users/{self.target.pk}/reset-password/")
        self.assertIn(r.status_code, (401, 403))

    def test_guest_cannot_set_password(self):
        r = self.client.post(
            f"/api/v1/admin/users/{self.target.pk}/set-password/",
            {"password": "ValidPass1!"},
            format="json",
        )
        self.assertIn(r.status_code, (401, 403))
