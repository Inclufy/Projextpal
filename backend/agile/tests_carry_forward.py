"""Behavioural tests for retro action carry-forward (#63, AG-4).

Proves the retrospective loop closes across iterations: action items raised in
one iteration's retro surface as *open actions* on the project until resolved,
so they are not lost when the next iteration starts.

  * The action-items endpoint returns only category='action_item' items that are
    still open/in_progress (done items are excluded unless include_done=1).
  * Each row carries its originating iteration (id + name) so the team can see
    where a carried-forward action came from.
  * Marking an item 'done' (PATCH the retro item) removes it from the open list.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from agile.models import (
    AgileIteration, AgileRetrospective, AgileRetroItem,
)


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class RetroCarryForwardTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="AgileCo")
        self.user = User.objects.create_user(
            email="ag@example.com", password="testpass123",
            username="ag", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Agile Project", company=self.company,
            methodology="agile", created_by=self.user,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _retro_with_action(self, iter_name, content, status="open"):
        it = AgileIteration.objects.create(
            project=self.project, name=iter_name, status="completed",
            start_date=date.today() - timedelta(days=14),
            end_date=date.today() - timedelta(days=1),
        )
        retro = AgileRetrospective.objects.create(iteration=it, date=date.today())
        item = AgileRetroItem.objects.create(
            retrospective=retro, category="action_item",
            content=content, status=status,
        )
        return it, retro, item

    def _url(self):
        return f"/api/v1/projects/{self.project.id}/agile/retrospectives/action-items/"

    def test_open_actions_carry_forward_with_origin(self):
        it1, _, item1 = self._retro_with_action("Iteration 1", "Automate the build")
        res = self.client.get(self._url())
        self.assertEqual(res.status_code, 200)
        rows = _list(res.json())
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["content"], "Automate the build")
        self.assertEqual(rows[0]["iteration_id"], it1.id)
        self.assertEqual(rows[0]["iteration_name"], "Iteration 1")

    def test_done_actions_excluded_by_default(self):
        self._retro_with_action("Iteration 1", "Still open")
        self._retro_with_action("Iteration 1b", "Already done", status="done")
        rows = _list(self.client.get(self._url()).json())
        contents = {r["content"] for r in rows}
        self.assertEqual(contents, {"Still open"})
        # include_done surfaces the resolved one too
        rows_all = _list(self.client.get(self._url() + "?include_done=1").json())
        self.assertEqual(len(rows_all), 2)

    def test_non_action_categories_excluded(self):
        it = AgileIteration.objects.create(
            project=self.project, name="Iteration 1", status="completed",
            start_date=date.today() - timedelta(days=14),
            end_date=date.today() - timedelta(days=1),
        )
        retro = AgileRetrospective.objects.create(iteration=it, date=date.today())
        AgileRetroItem.objects.create(retrospective=retro, category="went_well", content="Good")
        AgileRetroItem.objects.create(retrospective=retro, category="to_improve", content="Bad")
        AgileRetroItem.objects.create(retrospective=retro, category="action_item", content="Do this")
        rows = _list(self.client.get(self._url()).json())
        self.assertEqual([r["content"] for r in rows], ["Do this"])

    def test_marking_done_removes_from_open_list(self):
        _, _, item = self._retro_with_action("Iteration 1", "Carry me")
        self.assertEqual(len(_list(self.client.get(self._url()).json())), 1)
        patch = self.client.patch(
            f"/api/v1/agile/retro-items/{item.id}/",
            {"status": "done"}, format="json",
        )
        self.assertIn(patch.status_code, (200, 202))
        self.assertEqual(len(_list(self.client.get(self._url()).json())), 0)
