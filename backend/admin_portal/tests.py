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
