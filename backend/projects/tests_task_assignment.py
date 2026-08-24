"""Tests voor multi-assignee en delegatie op taken.

Sync-regels (serializer):
  * assignees meegestuurd → leidend; assigned_to = eerste van de lijst als de
    huidige primaire eigenaar er niet in zit.
  * alleen assigned_to (legacy-client) → toevoegen aan assignees, co's blijven.
Delegatie (delegate-actie): eigenaarschap over, spoor vastgelegd, delegeerder
in raci_informed, notificatie naar de ontvanger, done-melding retour.
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from notifications.models import Notification
from projects.models import Project, Milestone, Task

User = get_user_model()


class TaskAssignmentTestsBase(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        self.pm = User.objects.create_user(
            username="pm", email="pm@acme.test", password="x",
            company=self.company, role="pm",
        )
        self.dev1 = User.objects.create_user(
            username="dev1", email="dev1@acme.test", password="x",
            company=self.company, role="contributor", first_name="Dev Een",
        )
        self.dev2 = User.objects.create_user(
            username="dev2", email="dev2@acme.test", password="x",
            company=self.company, role="contributor", first_name="Dev Twee",
        )
        self.project = Project.objects.create(
            name="P", company=self.company, status="in_progress",
            methodology="inclufy", currency="EUR",
            start_date=date.today(), end_date=date.today() + timedelta(days=30),
        )
        self.ms = Milestone.objects.create(project=self.project, name="M1")
        self.client = APIClient()
        self.client.force_authenticate(user=self.pm)

    def _post(self, url, body):
        return self.client.post(url, body, format="json", secure=True)

    def _patch(self, url, body):
        return self.client.patch(url, body, format="json", secure=True)


class MultiAssigneeTests(TaskAssignmentTestsBase):
    def test_create_with_assignees_sets_primary(self):
        r = self._post("/api/v1/projects/tasks/", {
            "milestone": self.ms.id, "title": "T",
            "assignees": [self.dev1.id, self.dev2.id],
        })
        self.assertEqual(r.status_code, 201, r.data)
        t = Task.objects.get(id=r.data["id"])
        self.assertEqual(t.assigned_to_id, self.dev1.id)
        self.assertEqual(set(t.assignees.values_list("id", flat=True)),
                         {self.dev1.id, self.dev2.id})
        names = {a["name"] for a in r.data["assignee_names"]}
        self.assertEqual(names, {"Dev Een", "Dev Twee"})

    def test_update_assignees_is_authoritative(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.dev1)
        t.assignees.add(self.dev1)
        r = self._patch(f"/api/v1/projects/tasks/{t.id}/", {"assignees": [self.dev2.id]})
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertEqual(t.assigned_to_id, self.dev2.id)
        self.assertEqual(list(t.assignees.values_list("id", flat=True)), [self.dev2.id])

    def test_update_keeps_primary_when_still_in_list(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.dev1)
        t.assignees.add(self.dev1)
        r = self._patch(f"/api/v1/projects/tasks/{t.id}/",
                        {"assignees": [self.dev2.id, self.dev1.id]})
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertEqual(t.assigned_to_id, self.dev1.id)  # blijft primair

    def test_legacy_assigned_to_adds_without_wiping(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.dev1)
        t.assignees.set([self.dev1, self.dev2])
        r = self._patch(f"/api/v1/projects/tasks/{t.id}/", {"assigned_to": self.pm.id})
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertEqual(t.assigned_to_id, self.pm.id)
        self.assertEqual(set(t.assignees.values_list("id", flat=True)),
                         {self.dev1.id, self.dev2.id, self.pm.id})

    def test_empty_assignees_unassigns(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.dev1)
        t.assignees.add(self.dev1)
        r = self._patch(f"/api/v1/projects/tasks/{t.id}/", {"assignees": []})
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertIsNone(t.assigned_to)
        self.assertEqual(t.assignees.count(), 0)

    def test_co_assignee_gets_notification(self):
        r = self._post("/api/v1/projects/tasks/", {
            "milestone": self.ms.id, "title": "T",
            "assignees": [self.dev1.id, self.dev2.id],
        })
        self.assertEqual(r.status_code, 201, r.data)
        self.assertTrue(Notification.objects.filter(
            recipient=self.dev2, kind="task_assigned").exists())
        # Precies één melding per persoon — niet dubbel via FK én m2m.
        self.assertEqual(Notification.objects.filter(
            recipient=self.dev1, kind="task_assigned").count(), 1)

    def test_my_work_includes_co_assignee(self):
        t = Task.objects.create(milestone=self.ms, title="Samen", assigned_to=self.dev1)
        t.assignees.set([self.dev1, self.dev2])
        c = APIClient()
        c.force_authenticate(user=self.dev2)
        r = c.get("/api/v1/projects/my-work/", secure=True)
        self.assertEqual(r.status_code, 200)
        titles = [i["title"] for b in r.data["buckets"].values() for i in b]
        self.assertIn("Samen", titles)


class DelegationTests(TaskAssignmentTestsBase):
    def _delegate(self, task, target, note="", as_user=None):
        c = APIClient()
        c.force_authenticate(user=as_user or self.pm)
        return c.post(f"/api/v1/projects/tasks/{task.id}/delegate/",
                      {"user_id": target.id, "note": note}, format="json", secure=True)

    def test_delegate_transfers_ownership_with_trail(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.pm)
        t.assignees.add(self.pm)
        r = self._delegate(t, self.dev1, note="Graag voor vrijdag")
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertEqual(t.assigned_to_id, self.dev1.id)
        self.assertEqual(t.delegated_by_id, self.pm.id)
        self.assertIsNotNone(t.delegated_at)
        self.assertEqual(t.delegation_note, "Graag voor vrijdag")
        self.assertEqual(list(t.assignees.values_list("id", flat=True)), [self.dev1.id])
        self.assertIn(self.pm.id, t.raci_informed.values_list("id", flat=True))
        # Ontvanger krijgt de delegatie-melding, niet de generieke.
        self.assertTrue(Notification.objects.filter(
            recipient=self.dev1, kind="task_delegated").exists())
        self.assertFalse(Notification.objects.filter(
            recipient=self.dev1, kind="task_assigned").exists())

    def test_delegate_requires_known_team_member(self):
        t = Task.objects.create(milestone=self.ms, title="T")
        other = User.objects.create_user(
            username="ext", email="ext@other.test", password="x",
            company=Company.objects.create(name="Other"),
        )
        r = self._delegate(t, other)
        self.assertEqual(r.status_code, 400)

    def test_delegate_to_self_rejected(self):
        t = Task.objects.create(milestone=self.ms, title="T")
        r = self._delegate(t, self.pm)
        self.assertEqual(r.status_code, 400)

    def test_done_task_cannot_be_delegated(self):
        t = Task.objects.create(milestone=self.ms, title="T", status="done")
        r = self._delegate(t, self.dev1)
        self.assertEqual(r.status_code, 400)

    def test_delegator_notified_on_completion(self):
        t = Task.objects.create(milestone=self.ms, title="T", assigned_to=self.pm)
        self._delegate(t, self.dev1)
        t.refresh_from_db()
        t.status = "done"
        t.save()
        self.assertTrue(Notification.objects.filter(
            recipient=self.pm, kind="task_delegated_done").exists())

    def test_my_work_lists_delegated_by_me(self):
        t = Task.objects.create(milestone=self.ms, title="Uitbesteed", assigned_to=self.pm)
        self._delegate(t, self.dev1)
        r = self.client.get("/api/v1/projects/my-work/", secure=True)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["counts"]["delegated"], 1)
        self.assertEqual(r.data["delegated"][0]["title"], "Uitbesteed")
        self.assertEqual(r.data["delegated"][0]["delegated_to"], "Dev Een")
