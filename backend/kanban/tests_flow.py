"""Behavioural tests for the Kanban flow differentiators (#42, P2).

These prove Kanban is a *class-of-service flow system*, not just a board:

  * Class of service — a card flagged `expedite` bypasses the column WIP limit
    even in a normal swimlane (the legacy bypass needed a dedicated expedite
    lane); the move can also promote a card to expedite inline.
  * Block episodes — toggling a card blocked stamps `blocked_at` and opens a
    BlockEvent; unblocking closes it. This turns the boolean into measurable
    blocked time, surfaced in flow-metrics.
  * SLE breach — a card whose flow age exceeds its `sle_days` is flagged in
    flow-metrics so the board can act before delivery slips.
  * Column-scoped policies — a WorkPolicy bound to a column is fetched per
    column (Make Policies Explicit at the column header).
  * Kaizen + cadence — improvement actions and feedback cadences persist and
    a kaizen action stamps `resolved_at` when closed.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from kanban.models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard,
    WorkPolicy, BlockEvent, KaizenAction, KanbanCadence,
)


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class KanbanFlowTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="KanbanFlowCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="kf@example.com", password="testpass123",
            username="kf", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Kanban Flow Project", company=self.company,
            methodology="kanban", created_by=self.user,
        )
        self.board = KanbanBoard.objects.create(project=self.project, name="Board")
        self.todo = KanbanColumn.objects.create(
            board=self.board, name="To Do", column_type="todo", order=0,
        )
        self.wip = KanbanColumn.objects.create(
            board=self.board, name="In Progress", column_type="in_progress",
            order=1, wip_limit=2,
        )
        self.done = KanbanColumn.objects.create(
            board=self.board, name="Done", column_type="done", order=2,
            is_done_column=True,
        )
        self.lane = KanbanSwimlane.objects.create(
            board=self.board, name="Default", is_default=True, order=0,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _base(self):
        return f"/api/v1/projects/{self.project.id}/kanban/"

    def _card(self, column, title="card", **kw):
        kw.setdefault("swimlane", self.lane)
        return KanbanCard.objects.create(board=self.board, column=column, title=title, **kw)

    # ---- Class of service: expedite bypasses WIP without a lane -------------
    def test_expedite_class_bypasses_wip_limit(self):
        self._card(self.wip, "wip-1")
        self._card(self.wip, "wip-2")  # column now full (limit 2)
        incident = self._card(self.todo, "incident", class_of_service="expedite")
        resp = self.client.post(
            f"{self._base()}cards/{incident.id}/move/",
            {"column_id": self.wip.id}, format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        incident.refresh_from_db()
        self.assertEqual(incident.column_id, self.wip.id)
        self.assertEqual(self.wip.cards.count(), 3, "expedite over-fills by design")

    def test_standard_card_still_blocked_by_wip(self):
        self._card(self.wip, "wip-1")
        self._card(self.wip, "wip-2")
        normal = self._card(self.todo, "normal")  # default standard class
        resp = self.client.post(
            f"{self._base()}cards/{normal.id}/move/",
            {"column_id": self.wip.id}, format="json",
        )
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.json()["code"], "wip_limit_reached")
        normal.refresh_from_db()
        self.assertEqual(normal.column_id, self.todo.id)

    def test_move_can_promote_to_expedite_inline(self):
        self._card(self.wip, "wip-1")
        self._card(self.wip, "wip-2")
        normal = self._card(self.todo, "promote-me")
        resp = self.client.post(
            f"{self._base()}cards/{normal.id}/move/",
            {"column_id": self.wip.id, "class_of_service": "expedite"}, format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        normal.refresh_from_db()
        self.assertEqual(normal.class_of_service, "expedite")
        self.assertEqual(normal.column_id, self.wip.id)

    # ---- Block episodes ------------------------------------------------------
    def test_toggle_blocked_opens_and_closes_block_event(self):
        card = self._card(self.wip, "blocked-card")
        # block
        resp = self.client.post(
            f"{self._base()}cards/{card.id}/toggle_blocked/",
            {"reason": "waiting on vendor"}, format="json",
        )
        self.assertEqual(resp.status_code, 200)
        card.refresh_from_db()
        self.assertTrue(card.is_blocked)
        self.assertIsNotNone(card.blocked_at)
        ev = card.block_events.first()
        self.assertIsNotNone(ev)
        self.assertTrue(ev.is_open)
        self.assertEqual(ev.reason, "waiting on vendor")
        # unblock
        resp = self.client.post(
            f"{self._base()}cards/{card.id}/toggle_blocked/", {}, format="json",
        )
        self.assertEqual(resp.status_code, 200)
        card.refresh_from_db()
        self.assertFalse(card.is_blocked)
        self.assertIsNone(card.blocked_at)
        ev.refresh_from_db()
        self.assertIsNotNone(ev.unblocked_at)
        self.assertFalse(ev.is_open)

    # ---- Flow metrics: blocked + SLE breach surface --------------------------
    def test_flow_metrics_surface_blocked_and_sle_breach(self):
        # blocked card in WIP
        blocked = self._card(self.wip, "blocked")
        self.client.post(
            f"{self._base()}cards/{blocked.id}/toggle_blocked/",
            {"reason": "dependency"}, format="json",
        )
        # SLE-breached card: sle_days=1 but created 3 days ago
        breach = self._card(self.wip, "old", sle_days=1)
        KanbanCard.objects.filter(pk=breach.pk).update(
            created_at=timezone.now() - timedelta(days=3)
        )
        # expedite in flight
        self._card(self.wip, "fire", class_of_service="expedite")

        resp = self.client.get(f"{self._base()}metrics/flow-metrics/")
        self.assertEqual(resp.status_code, 200, resp.content)
        data = resp.json()
        self.assertEqual(data["blocked_count"], 1)
        self.assertEqual(data["sle_breach_count"], 1)
        self.assertEqual(data["expedite_in_flight"], 1)
        self.assertEqual(data["class_of_service_breakdown"].get("expedite"), 1)
        self.assertGreaterEqual(data["current_wip"], 3)

    # ---- Column-scoped policies ---------------------------------------------
    def test_column_scoped_policy_fetch(self):
        WorkPolicy.objects.create(
            project=self.project, column=self.wip, title="Pull rule",
            description="Only pull when a slot frees", category="entry_criteria",
        )
        WorkPolicy.objects.create(
            project=self.project, column=None, title="Board rule",
            description="Daily standup at 9", category="general",
        )
        # column filter narrows to the WIP policy
        resp = self.client.get(f"{self._base()}work-policies/?column={self.wip.id}")
        titles = [p["title"] for p in _list(resp.json())]
        self.assertIn("Pull rule", titles)
        self.assertNotIn("Board rule", titles)
        # board filter narrows to the board-wide policy
        resp = self.client.get(f"{self._base()}work-policies/?column=board")
        titles = [p["title"] for p in _list(resp.json())]
        self.assertIn("Board rule", titles)
        self.assertNotIn("Pull rule", titles)

    # ---- Kaizen + cadence ----------------------------------------------------
    def test_kaizen_action_stamps_resolved_at_when_done(self):
        resp = self.client.post(
            f"{self._base()}kaizen/",
            {"title": "Automate vendor handoff", "trigger": "blocker"}, format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        kid = resp.json()["id"]
        self.assertIsNone(resp.json().get("resolved_at"))
        resp = self.client.patch(
            f"{self._base()}kaizen/{kid}/", {"status": "done"}, format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        action = KaizenAction.objects.get(pk=kid)
        self.assertEqual(action.status, "done")
        self.assertIsNotNone(action.resolved_at)

    def test_cadence_create(self):
        resp = self.client.post(
            f"{self._base()}cadences/",
            {"name": "Replenishment", "cadence_type": "replenishment",
             "frequency": "weekly"}, format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(KanbanCadence.objects.filter(project=self.project).count(), 1)

    # ---- Cross-tenant isolation ---------------------------------------------
    def test_cross_tenant_flow_metrics_hidden(self):
        other_co = Company.objects.create(name="OtherCo")
        other = get_user_model().objects.create_user(
            email="x@other.com", password="x", username="xo",
            company=other_co, role="admin",
        )
        c = APIClient()
        c.force_authenticate(user=other)
        resp = c.get(f"{self._base()}metrics/flow-metrics/")
        self.assertIn(resp.status_code, (403, 404))
