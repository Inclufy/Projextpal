"""Een kaart zonder swimlane hoort op de standaardbaan te belanden, niet nergens.

KanbanCard.swimlane is null=True, dus de API accepteerde een kaart zonder baan met
een 201 en een id. Het bord groepeert per baan, dus zo'n kaart telde wél mee in de
board-teller maar verscheen in geen enkele kolom: 201 Created en toch onzichtbaar.

Dat is precies het soort fout dat een test moet vangen, want hij meldt succes.

Draait op de in-memory SQLite-test-DB — geen Docker nodig.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from kanban.models import KanbanBoard, KanbanColumn, KanbanSwimlane, KanbanCard


class KanbanCardSwimlaneFallbackTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="LaneCo")
        User = get_user_model()
        self.user = User.objects.create_user(
            email="lane@example.com", password="testpass123",
            username="lane", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Lane Project", company=self.company,
            methodology="kanban", created_by=self.user,
        )
        self.board = KanbanBoard.objects.create(project=self.project, name="Board")
        self.backlog = KanbanColumn.objects.create(
            board=self.board, name="Backlog", column_type="backlog", order=0,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self):
        return f"/api/v1/projects/{self.project.id}/kanban/cards/"

    def test_card_without_swimlane_lands_on_the_default_lane(self):
        default_lane = KanbanSwimlane.objects.create(
            board=self.board, name="Default", is_default=True, order=0,
        )
        KanbanSwimlane.objects.create(
            board=self.board, name="Expedite", is_default=False, order=1,
        )

        resp = self.client.post(
            self._url(),
            {"board": self.board.id, "column": self.backlog.id, "title": "baanloos"},
            format="json",
        )

        self.assertEqual(resp.status_code, 201)
        card = KanbanCard.objects.get(id=resp.json()["id"])
        self.assertEqual(card.swimlane_id, default_lane.id)

    def test_explicit_swimlane_is_not_overwritten(self):
        KanbanSwimlane.objects.create(
            board=self.board, name="Default", is_default=True, order=0,
        )
        expedite = KanbanSwimlane.objects.create(
            board=self.board, name="Expedite", is_default=False, order=1,
        )

        resp = self.client.post(
            self._url(),
            {"board": self.board.id, "column": self.backlog.id,
             "title": "met baan", "swimlane": expedite.id},
            format="json",
        )

        self.assertEqual(resp.status_code, 201)
        card = KanbanCard.objects.get(id=resp.json()["id"])
        self.assertEqual(card.swimlane_id, expedite.id)

    def test_board_without_any_swimlane_still_accepts_a_card(self):
        # Geen banen op het bord: de kaart hoort gewoon aangemaakt te worden, niet te
        # struikelen over de terugval.
        resp = self.client.post(
            self._url(),
            {"board": self.board.id, "column": self.backlog.id, "title": "geen banen"},
            format="json",
        )

        self.assertEqual(resp.status_code, 201)
        card = KanbanCard.objects.get(id=resp.json()["id"])
        self.assertIsNone(card.swimlane_id)

    def test_first_lane_is_used_when_none_is_marked_default(self):
        # Sommige borden zijn met de hand ingericht en hebben geen is_default-baan.
        eerste = KanbanSwimlane.objects.create(
            board=self.board, name="Eerste", is_default=False, order=0,
        )
        KanbanSwimlane.objects.create(
            board=self.board, name="Tweede", is_default=False, order=1,
        )

        resp = self.client.post(
            self._url(),
            {"board": self.board.id, "column": self.backlog.id, "title": "geen default"},
            format="json",
        )

        self.assertEqual(resp.status_code, 201)
        card = KanbanCard.objects.get(id=resp.json()["id"])
        self.assertEqual(card.swimlane_id, eerste.id)
