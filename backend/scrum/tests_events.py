"""Behavioural tests for real Scrum events (#40, P2).

These prove the Scrum framework is *enforced*, not merely stored:

  * Product Goal — backlog items trace to a Product Goal and can be filtered
    by it; the goal can be marked achieved.
  * Sprint Planning commit — a Sprint is not started until the team commits a
    Sprint Goal (the *why*) AND selects PBIs (the *what*). Missing either
    returns 400 + a machine-readable ``code`` BEFORE any state change. On
    success the SprintGoal is written, items are assigned, committed points are
    recorded, and the Sprint goes active.
  * Retrospective carry-forward — still-open improvement actions are surfaced
    to the next Planning and carried forward (status carried_forward + the
    sprint they were carried into).
  * Sprint Review record — accepting demoed items marks them Done (gated on the
    sprint Definition of Done → 409 dod_not_met) and rejecting spawns a
    follow-up Product Backlog Item that keeps the Product Goal lineage and
    returns the rejected work to the backlog.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from scrum.models import (
    ProductBacklog, BacklogItem, Sprint, SprintPlanning, SprintReview,
    SprintGoal, ProductGoal, RetroActionItem, DefinitionOfDone, DoDChecklistEntry,
)


class ScrumEventsTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="ScrumCo")
        self.user = User.objects.create_user(
            email="sc@example.com", password="testpass123",
            username="sc", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Scrum Project", company=self.company,
            methodology="scrum", created_by=self.user,
        )
        self.backlog = ProductBacklog.objects.create(project=self.project)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _base(self):
        return f"/api/v1/projects/{self.project.id}/scrum/"

    def _item(self, **kwargs):
        kwargs.setdefault("title", "Item")
        kwargs.setdefault("story_points", 3)
        return BacklogItem.objects.create(backlog=self.backlog, **kwargs)

    def _sprint(self, **kwargs):
        return Sprint.objects.create(project=self.project, **kwargs)

    def _planning(self, sprint):
        return SprintPlanning.objects.create(
            sprint=sprint, scheduled_date=timezone.now(),
        )

    # ---- Product Goal: items trace to a goal --------------------------------
    def test_product_goal_create_and_trace(self):
        resp = self.client.post(
            f"{self._base()}product-goals/",
            {"title": "Cut onboarding to 5 min", "description": "north star"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        goal_id = resp.json()["id"]
        # backlog now has the goal scoped to this project
        self.assertTrue(ProductGoal.objects.filter(id=goal_id, project=self.project).exists())

        item = self._item()
        # trace the item to the goal via a plain PATCH
        r = self.client.patch(
            f"{self._base()}items/{item.id}/",
            {"product_goal": goal_id}, format="json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        item.refresh_from_db()
        self.assertEqual(item.product_goal_id, goal_id)

        # filter items by product_goal
        lst = self.client.get(f"{self._base()}items/?product_goal={goal_id}")
        body = lst.json()
        results = body.get("results", body) if isinstance(body, dict) else body
        self.assertEqual([i["id"] for i in results], [item.id])

    def test_product_goal_achieve(self):
        goal = ProductGoal.objects.create(project=self.project, backlog=self.backlog, title="G")
        r = self.client.post(f"{self._base()}product-goals/{goal.id}/achieve/", {}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        goal.refresh_from_db()
        self.assertEqual(goal.status, "achieved")

    # ---- Planning commit requires a Sprint Goal -----------------------------
    def test_commit_requires_goal(self):
        sprint = self._sprint()
        planning = self._planning(sprint)
        item = self._item()
        r = self.client.post(
            f"{self._base()}sprint-planning/{planning.id}/commit/",
            {"item_ids": [item.id]}, format="json",
        )
        self.assertEqual(r.status_code, 400, r.content)
        self.assertEqual(r.json().get("code"), "sprint_goal_required")
        sprint.refresh_from_db()
        self.assertEqual(sprint.status, "planning")  # unchanged
        item.refresh_from_db()
        self.assertIsNone(item.sprint_id)

    # ---- Planning commit requires selected items ----------------------------
    def test_commit_requires_items(self):
        sprint = self._sprint()
        planning = self._planning(sprint)
        r = self.client.post(
            f"{self._base()}sprint-planning/{planning.id}/commit/",
            {"goal": "Ship login"}, format="json",
        )
        self.assertEqual(r.status_code, 400, r.content)
        self.assertEqual(r.json().get("code"), "no_items_selected")

    # ---- Planning commit writes goal + assigns items + activates sprint -----
    def test_commit_success(self):
        sprint = self._sprint()
        planning = self._planning(sprint)
        i1 = self._item(story_points=5)
        i2 = self._item(story_points=8)
        r = self.client.post(
            f"{self._base()}sprint-planning/{planning.id}/commit/",
            {"goal": "Ship login", "item_ids": [i1.id, i2.id]}, format="json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        body = r.json()
        self.assertEqual(body["committed_story_points"], 13)
        self.assertEqual(body["committed_item_count"], 2)
        sprint.refresh_from_db()
        self.assertEqual(sprint.status, "active")
        self.assertEqual(sprint.goal, "Ship login")
        self.assertTrue(SprintGoal.objects.filter(sprint=sprint, description="Ship login").exists())
        i1.refresh_from_db(); i2.refresh_from_db()
        self.assertEqual(i1.sprint_id, sprint.id)
        self.assertEqual(i2.sprint_id, sprint.id)
        planning.refresh_from_db()
        self.assertEqual(planning.committed_story_points, 13)
        self.assertEqual(planning.status, "completed")

    def test_commit_rejects_foreign_item(self):
        other_co = Company.objects.create(name="Other")
        other_proj = Project.objects.create(name="OP", company=other_co, methodology="scrum")
        other_backlog = ProductBacklog.objects.create(project=other_proj)
        foreign = BacklogItem.objects.create(backlog=other_backlog, title="X", story_points=2)
        sprint = self._sprint()
        planning = self._planning(sprint)
        r = self.client.post(
            f"{self._base()}sprint-planning/{planning.id}/commit/",
            {"goal": "G", "item_ids": [foreign.id]}, format="json",
        )
        self.assertEqual(r.status_code, 400, r.content)
        self.assertEqual(r.json().get("code"), "invalid_items")

    # ---- Retro actions carry forward into the next Planning -----------------
    def test_retro_action_carries_forward_on_commit(self):
        # an open improvement action raised in a past sprint
        past = self._sprint()
        action = RetroActionItem.objects.create(
            project=self.project, sprint=past,
            description="Automate the release pipeline", status="open",
        )
        # it surfaces as a carry-forward candidate before planning
        surfaced = self.client.get(f"{self._base()}sprint-planning/open_retro_actions/")
        self.assertEqual(surfaced.status_code, 200, surfaced.content)
        self.assertIn(action.id, [a["id"] for a in surfaced.json()])

        # commit the next sprint → action is carried forward into it
        nxt = self._sprint()
        planning = self._planning(nxt)
        item = self._item()
        r = self.client.post(
            f"{self._base()}sprint-planning/{planning.id}/commit/",
            {"goal": "G2", "item_ids": [item.id]}, format="json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.assertIn(action.id, r.json()["carried_forward_actions"])
        action.refresh_from_db()
        self.assertEqual(action.status, "carried_forward")
        self.assertEqual(action.carried_to_sprint_id, nxt.id)

    def test_retro_action_resolve(self):
        sprint = self._sprint()
        action = RetroActionItem.objects.create(
            project=self.project, sprint=sprint, description="Do X", status="open",
        )
        r = self.client.post(f"{self._base()}retro-actions/{action.id}/resolve/", {}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        action.refresh_from_db()
        self.assertEqual(action.status, "done")
        # a resolved action no longer surfaces as a carry-forward candidate
        surfaced = self.client.get(f"{self._base()}sprint-planning/open_retro_actions/")
        self.assertNotIn(action.id, [a["id"] for a in surfaced.json()])

    # ---- Sprint Review accept marks Done; reject spawns a follow-up ---------
    def test_review_accept_and_reject(self):
        sprint = self._sprint(status="active")
        goal = ProductGoal.objects.create(project=self.project, backlog=self.backlog, title="PG")
        accepted = self._item(sprint=sprint, status="in_progress", product_goal=goal)
        rejected = self._item(sprint=sprint, status="in_progress", product_goal=goal, title="Flaky feature")
        review = SprintReview.objects.create(sprint=sprint)

        r = self.client.post(
            f"{self._base()}reviews/{review.id}/record/",
            {
                "accepted_item_ids": [accepted.id],
                "rejected": [{"item_id": rejected.id, "reason": "demo failed"}],
                "sprint_goal_achieved": True,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        body = r.json()
        accepted.refresh_from_db()
        self.assertEqual(accepted.status, "done")
        self.assertIn(accepted.id, body["accepted_item_ids"])

        # a follow-up item was spawned, keeping the Product Goal lineage
        self.assertEqual(len(body["spawned_follow_up_ids"]), 1)
        follow = BacklogItem.objects.get(id=body["spawned_follow_up_ids"][0])
        self.assertEqual(follow.product_goal_id, goal.id)
        self.assertEqual(follow.parent_id, rejected.id)
        self.assertIsNone(follow.sprint_id)  # spawned into backlog
        # the rejected item returns to the backlog
        rejected.refresh_from_db()
        self.assertIsNone(rejected.sprint_id)

    # ---- Review accept is gated on Definition of Done -----------------------
    def test_review_accept_blocked_by_dod(self):
        sprint = self._sprint(status="active")
        DefinitionOfDone.objects.create(project=self.project, item="Code reviewed", is_active=True)
        item = self._item(sprint=sprint, status="in_progress")
        review = SprintReview.objects.create(sprint=sprint)
        r = self.client.post(
            f"{self._base()}reviews/{review.id}/record/",
            {"accepted_item_ids": [item.id]}, format="json",
        )
        self.assertEqual(r.status_code, 409, r.content)
        self.assertEqual(r.json().get("code"), "dod_not_met")
        item.refresh_from_db()
        self.assertEqual(item.status, "in_progress")  # not flipped to done

        # tick the DoD entry → accept now succeeds
        dod = DefinitionOfDone.objects.get(project=self.project)
        DoDChecklistEntry.objects.create(dod_item=dod, sprint=sprint, completed=True)
        r2 = self.client.post(
            f"{self._base()}reviews/{review.id}/record/",
            {"accepted_item_ids": [item.id]}, format="json",
        )
        self.assertEqual(r2.status_code, 200, r2.content)
        item.refresh_from_db()
        self.assertEqual(item.status, "done")

    # ---- cross-tenant isolation for the new resources -----------------------
    def test_cross_tenant_hidden(self):
        other_co = Company.objects.create(name="OtherCo")
        other_proj = Project.objects.create(name="OP", company=other_co, methodology="scrum")
        other_backlog = ProductBacklog.objects.create(project=other_proj)
        ProductGoal.objects.create(project=other_proj, backlog=other_backlog, title="secret")
        RetroActionItem.objects.create(
            project=other_proj, sprint=Sprint.objects.create(project=other_proj),
            description="secret action",
        )
        g = self.client.get(f"/api/v1/projects/{other_proj.id}/scrum/product-goals/")
        gb = g.json(); gr = gb.get("results", gb) if isinstance(gb, dict) else gb
        self.assertEqual(len(gr), 0)
        a = self.client.get(f"/api/v1/projects/{other_proj.id}/scrum/retro-actions/")
        ab = a.json(); ar = ab.get("results", ab) if isinstance(ab, dict) else ab
        self.assertEqual(len(ar), 0)
