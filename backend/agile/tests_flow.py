"""Behavioural tests for the Agile differentiator (#41, P2).

These prove Agile is a *flow system*, distinct from Scrum's batch/velocity model:

  * Goal→Epic→Item traceability — an Epic advances a single Product Goal and
    backlog items roll up through the epic; items can be filtered by goal.
  * Definition of Done gate — an item cannot move to 'done' until every REQUIRED
    DoD criterion has a met entry (409 dod_not_met + unmet_criteria) BEFORE the
    status changes. 'done' stamps completed_at.
  * WIP limit (continuous-flow cadence) — pulling an item into 'in_progress'
    beyond the configured WIP limit returns 409 wip_limit_exceeded BEFORE the
    transition; entering in_progress stamps started_at.
  * Workboard assignment — a team member can be assigned in place; a non-member
    is rejected (400 not_a_team_member).
  * Flow / outcome metrics — cycle time, throughput, WIP and column counts are
    computed from real event timestamps (the value Scrum's velocity view lacks).

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from agile.models import (
    AgileProductVision, AgileProductGoal, AgileEpic, AgileBacklogItem,
    AgileTeamMember, AgileFlowConfig, AgileDodEntry, DefinitionOfDone,
)


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class AgileFlowTests(TestCase):
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
        self.vision = AgileProductVision.objects.create(project=self.project)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _base(self):
        return f"/api/v1/projects/{self.project.id}/agile/"

    def _goal(self, title="Reach activation target"):
        return AgileProductGoal.objects.create(vision=self.vision, title=title)

    def _epic(self, goal=None, **kw):
        kw.setdefault("title", "Epic")
        return AgileEpic.objects.create(project=self.project, product_goal=goal, **kw)

    def _item(self, epic=None, **kw):
        kw.setdefault("title", "Story")
        kw.setdefault("story_points", 3)
        return AgileBacklogItem.objects.create(project=self.project, epic=epic, **kw)

    def _dod(self, desc, required=True):
        return DefinitionOfDone.objects.create(
            project=self.project, description=desc, category="quality", is_required=required,
        )

    # ---- Goal→Epic→Item traceability ----------------------------------------
    def test_goal_epic_item_traceability(self):
        goal = self._goal()
        epic = self._epic(goal=goal)
        item = self._item(epic=epic)
        # serializer surfaces the goal lineage on the item
        resp = self.client.get(f"{self._base()}backlog/{item.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["product_goal"], goal.id)
        self.assertEqual(resp.json()["product_goal_title"], goal.title)
        # filter by product_goal narrows the board
        other = self._item(epic=self._epic(goal=None, title="Loose"))
        resp = self.client.get(f"{self._base()}backlog/?product_goal={goal.id}")
        ids = [i["id"] for i in _list(resp.json())]
        self.assertIn(item.id, ids)
        self.assertNotIn(other.id, ids)

    # ---- DoD gate on done ----------------------------------------------------
    def test_transition_done_blocked_by_unmet_dod(self):
        c1 = self._dod("Tests pass")
        self._dod("Peer reviewed")
        item = self._item(status="review")
        # only one criterion met → still blocked
        AgileDodEntry.objects.create(item=item, criterion=c1, is_met=True)
        resp = self.client.post(f"{self._base()}backlog/{item.id}/transition/", {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.json()["code"], "dod_not_met")
        self.assertIn("Peer reviewed", resp.json()["unmet_criteria"])
        item.refresh_from_db()
        self.assertEqual(item.status, "review")  # unchanged
        self.assertIsNone(item.completed_at)

    def test_transition_done_allowed_when_dod_met(self):
        c1 = self._dod("Tests pass")
        c2 = self._dod("Peer reviewed")
        item = self._item(status="in_progress")
        # tick both via the dod endpoint
        for c in (c1, c2):
            r = self.client.post(f"{self._base()}backlog/{item.id}/dod/", {"criterion": c.id, "is_met": True}, format="json")
            self.assertEqual(r.status_code, 200)
        resp = self.client.post(f"{self._base()}backlog/{item.id}/transition/", {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.status, "done")
        self.assertIsNotNone(item.completed_at)

    def test_transition_done_allowed_when_no_required_dod(self):
        # only a non-required criterion exists → gate is vacuously met
        self._dod("Nice to have", required=False)
        item = self._item(status="review")
        resp = self.client.post(f"{self._base()}backlog/{item.id}/transition/", {"status": "done"}, format="json")
        self.assertEqual(resp.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.status, "done")

    # ---- WIP limit (continuous flow) ----------------------------------------
    def test_wip_limit_blocks_pull(self):
        AgileFlowConfig.objects.create(project=self.project, wip_limit=1)
        a = self._item(status="in_progress")  # already at limit
        a.started_at = timezone.now()
        a.save()
        b = self._item(status="ready")
        resp = self.client.post(f"{self._base()}backlog/{b.id}/transition/", {"status": "in_progress"}, format="json")
        self.assertEqual(resp.status_code, 409)
        self.assertEqual(resp.json()["code"], "wip_limit_exceeded")
        self.assertEqual(resp.json()["wip_limit"], 1)
        b.refresh_from_db()
        self.assertEqual(b.status, "ready")  # unchanged

    def test_in_progress_stamps_started_at(self):
        item = self._item(status="ready")
        resp = self.client.post(f"{self._base()}backlog/{item.id}/transition/", {"status": "in_progress"}, format="json")
        self.assertEqual(resp.status_code, 200)
        item.refresh_from_db()
        self.assertIsNotNone(item.started_at)

    # ---- Workboard assignment -----------------------------------------------
    def test_assign_member_and_reject_non_member(self):
        member_user = get_user_model().objects.create_user(
            email="dev@example.com", password="x", username="dev",
            company=self.company, role="member",
        )
        AgileTeamMember.objects.create(project=self.project, user=member_user, role="developer")
        item = self._item()
        resp = self.client.post(f"{self._base()}backlog/{item.id}/assign/", {"assignee": member_user.id}, format="json")
        self.assertEqual(resp.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.assignee_id, member_user.id)
        # a user who is not an Agile team member is rejected
        outsider = get_user_model().objects.create_user(
            email="out@example.com", password="x", username="out",
            company=self.company, role="member",
        )
        resp = self.client.post(f"{self._base()}backlog/{item.id}/assign/", {"assignee": outsider.id}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "not_a_team_member")

    # ---- Flow / outcome metrics ---------------------------------------------
    def test_flow_metrics_compute_cycle_time_and_throughput(self):
        now = timezone.now()
        # two completed items with known cycle times (24h and 48h)
        done1 = self._item(status="done")
        done1.started_at = now - timedelta(hours=24)
        done1.completed_at = now
        done1.save()
        done2 = self._item(status="done")
        done2.started_at = now - timedelta(hours=48)
        done2.completed_at = now
        done2.save()
        self._item(status="in_progress")  # contributes to WIP
        resp = self.client.get(f"{self._base()}flow-metrics/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["completed_total"], 2)
        self.assertEqual(data["avg_cycle_time_hours"], 36.0)
        self.assertEqual(data["throughput"], 2)
        self.assertEqual(data["column_counts"]["in_progress"], 1)
        self.assertEqual(data["current_wip"], 1)

    # ---- Cross-tenant isolation ---------------------------------------------
    def test_cross_tenant_hidden(self):
        other_co = Company.objects.create(name="OtherCo")
        other_user = get_user_model().objects.create_user(
            email="x@other.com", password="x", username="xo",
            company=other_co, role="admin",
        )
        client = APIClient()
        client.force_authenticate(user=other_user)
        item = self._item()
        resp = client.post(
            f"{self._base()}backlog/{item.id}/transition/", {"status": "in_progress"}, format="json"
        )
        self.assertIn(resp.status_code, (403, 404))
