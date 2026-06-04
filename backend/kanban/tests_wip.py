"""Behavioural enforcement tests for Kanban WIP-at-pull (backlog #23, P1-1).

Proves the column WIP limit is enforced as a *pull* policy by behaviour, not
logged after the fact:
  #1 Pulling a card into a column already at its wip_limit → 409, card stays put.
  #2 Pulling into a column with room → 200, card moves.
  #3 An expedite swimlane bypasses the limit (class of service).
  #4 Reordering within the same column is never blocked by WIP.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from kanban.models import (
    KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard, WipLimitViolation,
)


class KanbanWipEnforcementTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="KanbanCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="kpm@example.com", password="testpass123",
            username="kpm", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Kanban Project", company=self.company,
            methodology="kanban", created_by=self.user,
        )
        self.board = KanbanBoard.objects.create(project=self.project, name="Board")
        self.todo = KanbanColumn.objects.create(
            board=self.board, name="To Do", column_type="todo", order=0,
            wip_limit=None,
        )
        # In Progress with a hard WIP limit of 2.
        self.wip = KanbanColumn.objects.create(
            board=self.board, name="In Progress", column_type="in_progress",
            order=1, wip_limit=2,
        )
        self.default_lane = KanbanSwimlane.objects.create(
            board=self.board, name="Default", is_default=True, order=0,
        )
        self.expedite_lane = KanbanSwimlane.objects.create(
            board=self.board, name="Expedite", is_default=False, order=1,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _card(self, column, title="card", swimlane=None):
        return KanbanCard.objects.create(
            board=self.board, column=column, title=title,
            swimlane=swimlane or self.default_lane,
        )

    def _move_url(self, card):
        return f"/api/v1/projects/{self.project.id}/kanban/cards/{card.id}/move/"

    def _fill_wip_column(self):
        """Put the In Progress column at exactly its limit (2 cards)."""
        self._card(self.wip, "wip-1")
        self._card(self.wip, "wip-2")

    # ---- #1 pull into a full column is rejected -------------------------
    def test_move_into_full_column_returns_409_and_does_not_move(self):
        self._fill_wip_column()
        incoming = self._card(self.todo, "incoming")

        resp = self.client.post(
            self._move_url(incoming), {"column_id": self.wip.id}, format="json"
        )

        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "wip_limit_reached")
        incoming.refresh_from_db()
        self.assertEqual(
            incoming.column_id, self.todo.id,
            "rejected card must stay in its original column",
        )
        self.assertEqual(
            self.wip.cards.count(), 2,
            "the full column must not have grown",
        )
        # the rejected pull is audited
        self.assertEqual(
            WipLimitViolation.objects.filter(column=self.wip).count(), 1,
        )

    # ---- #2 pull into a column with room succeeds -----------------------
    def test_move_into_column_with_room_succeeds(self):
        self._card(self.wip, "wip-1")  # 1 of 2 → room for one more
        incoming = self._card(self.todo, "incoming")

        resp = self.client.post(
            self._move_url(incoming), {"column_id": self.wip.id}, format="json"
        )

        self.assertEqual(resp.status_code, 200, resp.content)
        incoming.refresh_from_db()
        self.assertEqual(incoming.column_id, self.wip.id)

    # ---- #3 expedite lane bypasses the limit ----------------------------
    def test_expedite_lane_bypasses_wip_limit(self):
        self._fill_wip_column()
        incoming = self._card(self.todo, "incident", swimlane=self.expedite_lane)

        resp = self.client.post(
            self._move_url(incoming),
            {"column_id": self.wip.id, "swimlane_id": self.expedite_lane.id},
            format="json",
        )

        self.assertEqual(resp.status_code, 200, resp.content)
        incoming.refresh_from_db()
        self.assertEqual(incoming.column_id, self.wip.id)
        self.assertEqual(self.wip.cards.count(), 3, "expedite over-fills by design")

    # ---- #4 same-column reorder is never WIP-blocked --------------------
    def test_same_column_move_not_blocked_by_wip(self):
        self._fill_wip_column()
        existing = self.wip.cards.first()

        resp = self.client.post(
            self._move_url(existing),
            {"column_id": self.wip.id, "order": 5},
            format="json",
        )

        self.assertEqual(resp.status_code, 200, resp.content)
