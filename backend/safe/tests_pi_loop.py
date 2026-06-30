"""Regression tests for the executable SAFe PI loop (#34).

Scenario (the acceptance criterion): an RTE can
  1. plan a PI,
  2. decompose a Feature into Stories assigned to teams,
  3. ROAM a cross-feature dependency,
  4. run a System Demo,
  5. see business-value roll-up + predictability snapshot.

Also asserts WSJF ordering of the Program Kanban and cross-tenant isolation.
"""
from datetime import date

from rest_framework.test import APIClient
from django.test import TestCase

from accounts.models import Company
from django.contrib.auth import get_user_model
from programs.models import Program, ProgramTeam
from safe.models import (
    ProgramIncrement, PIObjective, Feature, Story, Dependency,
    SystemDemo, InspectAdapt,
)

User = get_user_model()


def _list(body):
    return body.get("results", body) if isinstance(body, dict) else body


class PILoopTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Acme")
        self.user = User.objects.create_user(
            email="rte@acme.test", password="x", username="rte@acme.test",
            company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            name="Mobility", company=self.company, methodology="safe",
        )
        self.team = ProgramTeam.objects.create(
            program=self.program, user=self.user, role="dev_team",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_full_pi_loop(self):
        # 1. Plan a PI
        resp = self.client.post(
            "/api/v1/safe/pis/",
            {"program": self.program.id, "name": "PI 2026.1", "iteration_count": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        pi_id = resp.json()["id"]
        # PI Planning occurs: objectives + features can only be committed once the
        # PI Planning event is on the calendar (creation-order gate).
        ProgramIncrement.objects.filter(id=pi_id).update(pi_planning_date=date.today())

        # Objectives (drives the BV roll-up)
        PIObjective.objects.create(
            pi_id=pi_id, description="Ship onboarding", business_value=8,
            actual_value=6, assigned_team=self.team,
        )
        PIObjective.objects.create(
            pi_id=pi_id, description="Ship payments", business_value=2,
            actual_value=2,
        )

        # 2. Create two Features + decompose one into Stories assigned to the team
        f_hi = self.client.post(
            "/api/v1/safe/features/",
            {"pi": pi_id, "name": "Onboarding", "business_value": 8,
             "time_criticality": 5, "risk_reduction": 3, "job_size": 2},
            format="json",
        )
        self.assertEqual(f_hi.status_code, 201, f_hi.content)
        f_hi_id = f_hi.json()["id"]
        # WSJF = (8+5+3)/2 = 8.0
        self.assertEqual(f_hi.json()["wsjf"], 8.0)

        f_lo = self.client.post(
            "/api/v1/safe/features/",
            {"pi": pi_id, "name": "Payments", "business_value": 3,
             "time_criticality": 1, "risk_reduction": 1, "job_size": 5},
            format="json",
        )
        self.assertEqual(f_lo.status_code, 201, f_lo.content)
        f_lo_id = f_lo.json()["id"]
        # WSJF = (3+1+1)/5 = 1.0

        # Decompose the high feature into stories owned by the team
        s = self.client.post(
            "/api/v1/safe/features/%s/stories/" % f_hi_id,
            {"title": "Build signup form", "team": self.team.id,
             "story_points": 5, "iteration": 1},
            format="json",
        )
        self.assertEqual(s.status_code, 201, s.content)
        self.assertEqual(s.json()["team"], self.team.id)

        # WSJF ordering: high feature must come first on the Kanban
        flist = _list(self.client.get("/api/v1/safe/features/?pi=%s" % pi_id).json())
        self.assertEqual(flist[0]["id"], f_hi_id)
        self.assertGreater(flist[0]["wsjf"], flist[1]["wsjf"])

        # 3. ROAM a cross-feature dependency
        dep = self.client.post(
            "/api/v1/safe/dependencies/",
            {"pi": pi_id, "source_feature": f_lo_id, "target_feature": f_hi_id,
             "description": "Payments needs auth", "roam": "owned",
             "needed_by_iteration": 2},
            format="json",
        )
        self.assertEqual(dep.status_code, 201, dep.content)
        self.assertEqual(dep.json()["roam"], "owned")
        self.assertEqual(dep.json()["roam_display"], "Owned")

        # Commit the PI: with a committed objective carrying business value and
        # the dependency ROAM-triaged, planning → active succeeds.
        commit = self.client.post("/api/v1/safe/pis/%s/commit/" % pi_id, {}, format="json")
        self.assertEqual(commit.status_code, 200, commit.content)
        self.assertEqual(commit.json()["status"], "active")

        # 4. Run a System Demo
        demo = self.client.post(
            "/api/v1/safe/system-demos/",
            {"pi": pi_id, "iteration": 1, "summary": "Onboarding integrated",
             "features_demoed": [f_hi_id]},
            format="json",
        )
        self.assertEqual(demo.status_code, 201, demo.content)
        self.assertEqual(demo.json()["feature_count"], 1)

        # 5. BV roll-up + predictability
        pi = self.client.get("/api/v1/safe/pis/%s/" % pi_id).json()
        self.assertEqual(pi["planned_business_value"], 10)  # 8 + 2
        self.assertEqual(pi["actual_business_value"], 8)    # 6 + 2
        self.assertEqual(pi["predictability"], 80)          # 8/10
        self.assertEqual(pi["feature_count"], 2)

        # Snapshot into I&A
        snap = self.client.post(
            "/api/v1/safe/pis/%s/inspect-adapt/snapshot/" % pi_id, {}, format="json"
        )
        self.assertEqual(snap.status_code, 200, snap.content)
        self.assertEqual(snap.json()["predictability"], 80)
        self.assertTrue(InspectAdapt.objects.filter(pi_id=pi_id).exists())

    def test_cross_tenant_isolation(self):
        other_co = Company.objects.create(name="Globex")
        other_user = User.objects.create_user(
            email="x@globex.test", password="x", username="x@globex.test",
            company=other_co, role="admin",
        )
        other_prog = Program.objects.create(
            name="Secret", company=other_co, methodology="safe",
        )
        other_pi = ProgramIncrement.objects.create(program=other_prog, name="Hidden PI")
        Feature.objects.create(pi=other_pi, name="Secret feature")

        # Acme's RTE must not see Globex features
        rows = _list(self.client.get("/api/v1/safe/features/").json())
        names = [f["name"] for f in rows]
        self.assertNotIn("Secret feature", names)
