"""
Notification engine regression tests.

Covers:
  - Each of the 4 signal handlers: fires Notification + branded email
  - NotificationPreference: opt-out suppresses email but in-app stays
  - REST API: list, unread-count, mark-read, preferences
"""
from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company
from notifications.models import Notification, NotificationKind, NotificationPreference

User = get_user_model()

EMAIL_TEST_OVERRIDES = dict(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjeXtPal Support <support@inclufy.com>",
    FRONTEND_URL="https://projextpal.com",
)


def _make_user(email: str, company: Company | None = None) -> User:
    return User.objects.create_user(
        username=email, email=email, password="x", first_name="T",
        company=company,
    )


@override_settings(**EMAIL_TEST_OVERRIDES)
class TaskAssignedSignalTest(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="testco")
        self.actor = _make_user("actor@example.com", self.company)
        self.assignee = _make_user("assignee@example.com", self.company)

    def test_task_assignment_fires_notification_and_email(self):
        from projects.models import Project, Milestone, Task

        project = Project.objects.create(
            name="P1", company=self.company, created_by=self.actor,
            description="", start_date=timezone.localdate(),
        )
        milestone = Milestone.objects.create(project=project, name="M1")
        task = Task(milestone=milestone, title="Do the thing", description="...")
        task._actor = self.actor
        task.assigned_to = self.assignee
        task.save()

        # In-app notification
        n = Notification.objects.filter(
            recipient=self.assignee,
            kind=NotificationKind.TASK_ASSIGNED,
        ).first()
        self.assertIsNotNone(n, "task assignment did not create a Notification")
        self.assertIn("Do the thing", n.title)
        self.assertEqual(n.payload["task_id"], task.pk)

        # Branded email
        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertEqual(msg.to, [self.assignee.email])
        self.assertIn("Do the thing", msg.subject)
        # Brand sanity check
        html_parts = [b for b, m in msg.alternatives if m == "text/html"]
        self.assertTrue(html_parts and "ProjeXtPal" in html_parts[0])


@override_settings(**EMAIL_TEST_OVERRIDES)
class PreferencesOptOutTest(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="testco")
        self.actor = _make_user("a@example.com", self.company)
        self.recipient = _make_user("r@example.com", self.company)

    def test_email_opt_out_suppresses_email_but_keeps_in_app(self):
        from notifications.dispatcher import dispatch
        pref = NotificationPreference.get_or_default(self.recipient)
        pref.email_task_assigned = False
        pref.save()

        dispatch(
            recipient=self.recipient,
            kind=NotificationKind.TASK_ASSIGNED,
            title="X",
            target_url="https://projextpal.com/x",
        )

        self.assertEqual(
            Notification.objects.filter(recipient=self.recipient).count(), 1,
            "opt-out must NOT prevent the in-app notification",
        )
        self.assertEqual(
            len(mail.outbox), 0,
            "opt-out must prevent the email",
        )


@override_settings(**EMAIL_TEST_OVERRIDES)
class NotificationAPITest(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="testco")
        self.user = _make_user("api@example.com", self.company)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

        # Seed two notifications
        Notification.objects.create(
            recipient=self.user, kind=NotificationKind.TASK_ASSIGNED,
            title="A", target_url="https://projextpal.com/a",
        )
        Notification.objects.create(
            recipient=self.user, kind=NotificationKind.COMMENT_MENTION,
            title="B", target_url="https://projextpal.com/b",
        )

    def test_list_and_unread_count(self):
        r = self.client.get("/api/v1/notifications/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data["results"] if "results" in r.data else r.data), 2)

        r = self.client.get("/api/v1/notifications/unread-count/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["unread"], 2)

    def test_mark_read_and_mark_all_read(self):
        n = Notification.objects.filter(recipient=self.user).first()
        r = self.client.post(f"/api/v1/notifications/{n.pk}/read/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data["is_read"])

        r = self.client.post("/api/v1/notifications/mark-all-read/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(
            Notification.objects.filter(recipient=self.user, is_read=False).count(), 0,
        )

    def test_preferences_get_and_patch(self):
        r = self.client.get("/api/v1/notifications/preferences/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data["email_task_assigned"])

        r = self.client.patch(
            "/api/v1/notifications/preferences/",
            {"email_task_assigned": False},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertFalse(r.data["email_task_assigned"])
