"""Tests voor de notificatiesignalen: Nederlandse strings en geen
"Taak toegewezen"-notificatie voor taken die al afgerond zijn."""
from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.models import Company
from notifications.models import Notification
from projects.models import Milestone, Project, Task


class TaskAssignmentSignalTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        User = get_user_model()
        self.user = User.objects.create_user(
            username="mariska", email="mariska@acme.test", password="x",
            company=self.company, role="contributor",
        )
        project = Project.objects.create(name="P", company=self.company, currency="EUR")
        self.milestone = Milestone.objects.create(project=project, name="Fase 1")

    def test_assignment_creates_dutch_notification(self):
        Task.objects.create(
            milestone=self.milestone, title="Stamgegevens aanleveren",
            assigned_to=self.user, status="todo",
        )
        n = Notification.objects.get(recipient=self.user)
        self.assertEqual(n.kind, "task_assigned")
        self.assertTrue(n.title.startswith("Taak toegewezen:"))
        self.assertIn("Je bent toegewezen", n.body)

    def test_no_assignment_notification_for_done_task(self):
        # Een taak die al afgerond wordt aangemaakt/bijgewerkt hoort geen
        # "toegewezen"-notificatie te geven — dat was de verwarrende mail.
        Task.objects.create(
            milestone=self.milestone, title="Aanleverlijst gemaild",
            assigned_to=self.user, status="done",
        )
        self.assertFalse(Notification.objects.filter(recipient=self.user).exists())

    def test_unchanged_assignee_does_not_renotify(self):
        t = Task.objects.create(
            milestone=self.milestone, title="Taak", assigned_to=self.user, status="todo",
        )
        Notification.objects.all().delete()
        t.progress = 50
        t.save()
        self.assertFalse(Notification.objects.filter(recipient=self.user).exists())
