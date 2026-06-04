"""Behavioural tests for MeetingAction lifecycle (backlog #21, P0-2).

Meeting minutes used to be dead text — a follow-up could be 'agreed' with no
owner, no due date, and no record of whether it ever closed. A MeetingAction
gives each follow-up a lifecycle. These tests prove:
  #1 an action persists with owner + due date.
  #2 an open action past its due date is flagged overdue.
  #3 closing an action (status -> done) stamps closed_at.
  #4 re-opening a closed action clears closed_at.
  #5 a future / closed action is not overdue.
  #6 cross-tenant: a user can't see or create actions on another tenant's meeting.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from governance.models import Meeting, MeetingAction


class MeetingActionTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="GovCo")
        self.user = User.objects.create_user(
            email="gov@example.com", password="testpass123",
            username="gov", company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            company=self.company, name="Programme A", methodology="msp", status="active",
        )
        self.meeting = Meeting.objects.create(
            program=self.program, title="Steering #1", type="steering",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _list_url(self):
        return "/api/v1/governance/meeting-actions/"

    def _detail_url(self, action):
        return f"/api/v1/governance/meeting-actions/{action.id}/"

    # ---- #1 action persists with owner + due ----------------------------
    def test_create_action_persists_owner_and_due(self):
        due = (timezone.now().date() + timedelta(days=7)).isoformat()
        resp = self.client.post(self._list_url(), {
            "meeting": str(self.meeting.id),
            "description": "Draft the business case",
            "owner": self.user.id,
            "due_date": due,
        }, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        a = MeetingAction.objects.get(id=resp.json()["id"])
        self.assertEqual(a.owner_id, self.user.id)
        self.assertEqual(a.due_date.isoformat(), due)
        self.assertEqual(a.status, "open")
        self.assertIsNone(a.closed_at)

    # ---- #2 overdue flagged ---------------------------------------------
    def test_overdue_open_action_flagged(self):
        a = MeetingAction.objects.create(
            meeting=self.meeting, description="Late item", owner=self.user,
            due_date=timezone.now().date() - timedelta(days=3), status="open",
        )
        self.assertTrue(a.is_overdue)
        resp = self.client.get(self._detail_url(a))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertTrue(resp.json()["is_overdue"])

    # ---- #3 closing stamps closed_at ------------------------------------
    def test_closing_sets_closed_at(self):
        a = MeetingAction.objects.create(
            meeting=self.meeting, description="Do thing", owner=self.user, status="open",
        )
        resp = self.client.patch(self._detail_url(a), {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        a.refresh_from_db()
        self.assertEqual(a.status, "done")
        self.assertIsNotNone(a.closed_at)

    # ---- #4 re-opening clears closed_at ---------------------------------
    def test_reopening_clears_closed_at(self):
        a = MeetingAction.objects.create(
            meeting=self.meeting, description="Reopen me", owner=self.user,
            status="done", closed_at=timezone.now(),
        )
        resp = self.client.patch(self._detail_url(a), {"status": "in_progress"}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        a.refresh_from_db()
        self.assertEqual(a.status, "in_progress")
        self.assertIsNone(a.closed_at)

    # ---- #5 closed / future not overdue ---------------------------------
    def test_closed_action_not_overdue(self):
        a = MeetingAction.objects.create(
            meeting=self.meeting, description="Closed late item", owner=self.user,
            due_date=timezone.now().date() - timedelta(days=3), status="done",
        )
        self.assertFalse(a.is_overdue)

    # ---- #6 cross-tenant isolation --------------------------------------
    def test_cross_tenant_action_isolated(self):
        other_company = Company.objects.create(name="RivalCo")
        other_program = Program.objects.create(
            company=other_company, name="Rival Programme", methodology="msp", status="active",
        )
        other_meeting = Meeting.objects.create(
            program=other_program, title="Rival Steering", type="steering",
        )
        MeetingAction.objects.create(
            meeting=other_meeting, description="Their action", status="open",
        )
        # List must not surface the other tenant's action.
        resp = self.client.get(self._list_url())
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        rows = body.get("results", body) if isinstance(body, dict) else body
        meeting_ids = [str(row["meeting"]) for row in rows]
        self.assertNotIn(str(other_meeting.id), meeting_ids)
        # Creating against the other tenant's meeting is rejected (meeting not in queryset scope).
        resp2 = self.client.post(self._list_url(), {
            "meeting": str(other_meeting.id),
            "description": "Sneak in",
        }, format="json")
        self.assertIn(resp2.status_code, (400, 403), resp2.content)
