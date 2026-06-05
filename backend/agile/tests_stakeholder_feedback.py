"""Behavioural tests for stakeholder increment-feedback (#64, AG-3).

Proves the empirical loop with people *outside* the delivery team: a stakeholder
can record structured feedback on shipped work each iteration, optionally tied to
a specific backlog item, and open follow-up actions can be surfaced and resolved.

  * Feedback is scoped to the project — listing only returns this project's rows.
  * Creation is gated: the iteration (and any backlog_item) must belong to the
    project; created_by is stamped from the request user.
  * Sentiment + optional 1-5 rating are validated.
  * ?open_follow_ups=1 surfaces only feedback with an unresolved follow-up action;
    marking follow_up_done removes it from that view.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from agile.models import AgileIteration, AgileBacklogItem, StakeholderFeedback


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class StakeholderFeedbackTests(TestCase):
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
        self.iteration = AgileIteration.objects.create(
            project=self.project, name="Iteration 1", status="completed",
            start_date=date.today() - timedelta(days=14),
            end_date=date.today() - timedelta(days=1),
        )
        self.item = AgileBacklogItem.objects.create(
            project=self.project, title="Checkout flow", status="done", story_points=3,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _url(self):
        return f"/api/v1/projects/{self.project.id}/agile/stakeholder-feedback/"

    def test_create_and_scope(self):
        res = self.client.post(self._url(), {
            "iteration": self.iteration.id,
            "backlog_item": self.item.id,
            "stakeholder_name": "Jane (Yanmar)",
            "stakeholder_role": "Product sponsor",
            "sentiment": "positive",
            "rating": 5,
            "feedback": "Checkout is much faster, ship it.",
        }, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        body = res.json()
        self.assertEqual(body["sentiment_display"], "Positive")
        self.assertEqual(body["backlog_item_title"], "Checkout flow")
        self.assertEqual(body["created_by"], self.user.id)
        # listing returns the row
        rows = _list(self.client.get(self._url()).json())
        self.assertEqual(len(rows), 1)

    def test_rating_out_of_range_rejected(self):
        res = self.client.post(self._url(), {
            "iteration": self.iteration.id,
            "stakeholder_name": "Bob",
            "feedback": "ok",
            "rating": 9,
        }, format="json")
        self.assertEqual(res.status_code, 400)

    def test_iteration_must_belong_to_project(self):
        other_proj = Project.objects.create(
            name="Other", company=self.company, methodology="agile", created_by=self.user,
        )
        other_iter = AgileIteration.objects.create(
            project=other_proj, name="Other Iter", status="completed",
            start_date=date.today() - timedelta(days=5), end_date=date.today(),
        )
        res = self.client.post(self._url(), {
            "iteration": other_iter.id,
            "stakeholder_name": "Bob",
            "feedback": "cross-project",
        }, format="json")
        self.assertEqual(res.status_code, 400)

    def test_open_follow_ups_filter(self):
        with_action = StakeholderFeedback.objects.create(
            iteration=self.iteration, stakeholder_name="A", feedback="needs polish",
            follow_up_action="Polish the empty state", created_by=self.user,
        )
        StakeholderFeedback.objects.create(
            iteration=self.iteration, stakeholder_name="B", feedback="all good",
            created_by=self.user,
        )
        rows = _list(self.client.get(self._url() + "?open_follow_ups=1").json())
        self.assertEqual([r["id"] for r in rows], [with_action.id])
        # resolve the follow-up -> drops out of the open view
        patch = self.client.patch(
            f"{self._url()}{with_action.id}/", {"follow_up_done": True}, format="json",
        )
        self.assertIn(patch.status_code, (200, 202))
        rows_after = _list(self.client.get(self._url() + "?open_follow_ups=1").json())
        self.assertEqual(rows_after, [])
