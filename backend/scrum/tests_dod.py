"""Behavioural enforcement tests for the Scrum DoD gate (backlog #24, P1-2).

Proves the Definition of Done actually gates 'Done' by behaviour, not a free
dropdown click:
  #1 Marking an item 'done' with unticked DoD criteria → 409, item stays.
  #2 After every active DoD criterion is ticked for the sprint → 'done' = 200.
  #3 A project with no active DoD criteria is not gated (no-op).
  #4 An item not assigned to a sprint is not gated.
  #5 Increment.meets_dod flips true only when DoD met AND all sprint items done.
  #6 sync endpoint idempotently creates one entry per active criterion.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from scrum.models import (
    ProductBacklog, BacklogItem, Sprint, DefinitionOfDone,
    DoDChecklistEntry, Increment,
)


class ScrumDodGateTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="ScrumCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="spo@example.com", password="testpass123",
            username="spo", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Scrum Project", company=self.company,
            methodology="scrum", created_by=self.user,
        )
        self.backlog = ProductBacklog.objects.create(project=self.project)
        self.sprint = Sprint.objects.create(
            project=self.project, name="Sprint 1", number=1, status="active",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _dod(self, item, order=0):
        return DefinitionOfDone.objects.create(
            project=self.project, item=item, order=order, is_active=True,
        )

    def _item(self, title="Story", status="in_progress", sprint=True):
        return BacklogItem.objects.create(
            backlog=self.backlog, title=title, status=status,
            sprint=self.sprint if sprint else None,
        )

    def _status_url(self, item):
        return (
            f"/api/v1/projects/{self.project.id}/scrum/items/{item.id}/update_status/"
        )

    # ---- #1 unticked DoD blocks 'done' ----------------------------------
    def test_done_blocked_when_dod_unticked(self):
        self._dod("Code reviewed")
        self._dod("Tests pass", order=1)
        item = self._item()

        resp = self.client.post(self._status_url(item), {"status": "done"}, format="json")

        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "dod_not_met")
        self.assertEqual(len(resp.json().get("unmet_criteria")), 2)
        item.refresh_from_db()
        self.assertEqual(item.status, "in_progress", "item must not flip to done")

    # ---- #2 ticking all criteria unblocks 'done' ------------------------
    def test_done_allowed_after_all_criteria_ticked(self):
        d1 = self._dod("Code reviewed")
        d2 = self._dod("Tests pass", order=1)
        item = self._item()

        # sync creates the per-sprint entries
        sync = self.client.post(
            f"/api/v1/projects/{self.project.id}/scrum/dod-entries/sync/",
            {"sprint": self.sprint.id}, format="json",
        )
        self.assertEqual(sync.status_code, 200, sync.content)
        self.assertEqual(sync.json()["created"], 2)

        # tick both via the toggle action
        for d in (d1, d2):
            entry = DoDChecklistEntry.objects.get(dod_item=d, sprint=self.sprint)
            t = self.client.post(
                f"/api/v1/projects/{self.project.id}/scrum/dod-entries/{entry.id}/toggle/",
                {}, format="json",
            )
            self.assertEqual(t.status_code, 200, t.content)
            self.assertTrue(t.json()["completed"])

        resp = self.client.post(self._status_url(item), {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        item.refresh_from_db()
        self.assertEqual(item.status, "done")

    # ---- #3 no DoD defined → not gated ----------------------------------
    def test_no_active_dod_is_not_gated(self):
        item = self._item()
        resp = self.client.post(self._status_url(item), {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        item.refresh_from_db()
        self.assertEqual(item.status, "done")

    # ---- #4 item not in a sprint → not gated ----------------------------
    def test_item_without_sprint_is_not_gated(self):
        self._dod("Code reviewed")
        item = self._item(sprint=False)
        resp = self.client.post(self._status_url(item), {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)

    # ---- #5 increment meets_dod flips only when DoD met + all done ------
    def test_increment_meets_dod_flag(self):
        d1 = self._dod("Code reviewed")
        item_a = self._item("A")
        item_b = self._item("B")
        inc = Increment.objects.create(
            sprint=self.sprint, project=self.project,
            version="1.0.0", description="Sprint 1 increment",
        )
        self.assertFalse(inc.meets_dod)

        # tick the single DoD criterion
        entry = DoDChecklistEntry.objects.create(
            dod_item=d1, sprint=self.sprint, completed=True,
        )

        # mark A done — B still open → increment should NOT meet DoD yet
        self.client.post(self._status_url(item_a), {"status": "done"}, format="json")
        inc.refresh_from_db()
        self.assertFalse(inc.meets_dod, "not all items done yet")

        # mark B done — now all items done AND DoD met → flag flips
        self.client.post(self._status_url(item_b), {"status": "done"}, format="json")
        inc.refresh_from_db()
        self.assertTrue(inc.meets_dod)
        _ = entry  # keep ref

    # ---- #6 sync is idempotent ------------------------------------------
    def test_sync_is_idempotent(self):
        self._dod("Code reviewed")
        url = f"/api/v1/projects/{self.project.id}/scrum/dod-entries/sync/"
        first = self.client.post(url, {"sprint": self.sprint.id}, format="json")
        second = self.client.post(url, {"sprint": self.sprint.id}, format="json")
        self.assertEqual(first.json()["created"], 1)
        self.assertEqual(second.json()["created"], 0, "no duplicate rows")
        self.assertEqual(
            DoDChecklistEntry.objects.filter(sprint=self.sprint).count(), 1
        )
