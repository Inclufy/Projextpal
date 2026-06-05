"""Behavioural tests for binding board decisions + funded portfolio (backlog #44, P2-Governance).

Three previously-inert governance records are now real behavioural gates:

  Binding vote (quorum)
    A board-level Decision linked to a board with quorum > 0 cannot be applied
    until it has gathered the board's quorum of APPROVE votes (and approve must
    outnumber reject). Applying early → 409 quorum_not_met + blockers + tally.
    Once the votes are in, apply succeeds and flips the target component.
    Votes are closed once the decision is applied (append-only).

  Funded portfolio (ComponentFunding)
    A portfolio allocates funding to components. Approving an allocation is
    gated: the sum of APPROVED allocations can never exceed the portfolio's
    allocated budget → 409 over_budget. total_funded / remaining_budget reflect
    only approved allocations.

  Stakeholder engagement assessment
    engagement_gap = steps from current → desired engagement (0 if at/above).

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from programs.models import Program
from governance.models import (
    Portfolio, ComponentFunding, GovernanceBoard, GovernanceStakeholder,
    Decision, DecisionVote,
)


class _Base(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="GovCo")
        self.user = User.objects.create_user(
            email="gov@example.com", password="testpass123",
            username="gov", company=self.company, role="admin",
        )
        self.program = Program.objects.create(
            company=self.company, name="Programme A", methodology="msp", status="planning",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)


class QuorumGateTests(_Base):
    def _board(self, quorum):
        return GovernanceBoard.objects.create(
            name="Steering", board_type="steering_committee",
            program=self.program, quorum=quorum,
        )

    def _decision(self, board):
        return Decision.objects.create(
            program=self.program, title="Authorize stage", status="pending",
            outcome="hold", authorized_program=self.program, board=board,
        )

    def _apply_url(self, d):
        return f"/api/v1/governance/decisions/{d.id}/apply/"

    def _votes_url(self, d):
        return f"/api/v1/governance/decisions/{d.id}/votes/"

    # ---- apply blocked until quorum of approve votes -------------------
    def test_apply_blocked_without_quorum(self):
        board = self._board(quorum=2)
        d = self._decision(board)
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        body = resp.json()
        self.assertEqual(body.get("code"), "quorum_not_met")
        self.assertTrue(body.get("blockers"))
        self.assertEqual(body["tally"]["approve"], 0)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, "planning")  # untouched

    def test_apply_succeeds_once_quorum_met(self):
        User = get_user_model()
        board = self._board(quorum=2)
        d = self._decision(board)
        # First approve via the votes endpoint (as request.user).
        r1 = self.client.post(self._votes_url(d), {"vote": "approve"}, format="json")
        self.assertEqual(r1.status_code, 200, r1.content)
        # Still one short of quorum.
        early = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(early.status_code, 409, early.content)
        # Second approve from another board member.
        other = User.objects.create_user(
            email="gov2@example.com", password="testpass123",
            username="gov2", company=self.company, role="member",
        )
        DecisionVote.objects.create(decision=d, voter=other, vote="approve")
        ok = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, "on_hold")

    def test_reject_majority_blocks_even_at_quorum(self):
        User = get_user_model()
        board = self._board(quorum=1)
        d = self._decision(board)
        self.client.post(self._votes_url(d), {"vote": "approve"}, format="json")
        # Two rejects outnumber the single approve.
        for i in range(2):
            u = User.objects.create_user(
                email=f"rej{i}@example.com", password="x", username=f"rej{i}",
                company=self.company, role="member",
            )
            DecisionVote.objects.create(decision=d, voter=u, vote="reject")
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "quorum_not_met")

    def test_vote_is_update_or_create(self):
        board = self._board(quorum=1)
        d = self._decision(board)
        self.client.post(self._votes_url(d), {"vote": "reject"}, format="json")
        self.client.post(self._votes_url(d), {"vote": "approve"}, format="json")
        self.assertEqual(DecisionVote.objects.filter(decision=d, voter=self.user).count(), 1)
        self.assertEqual(d.vote_tally()["approve"], 1)
        self.assertEqual(d.vote_tally()["reject"], 0)

    def test_votes_closed_after_apply(self):
        board = self._board(quorum=1)
        d = self._decision(board)
        self.client.post(self._votes_url(d), {"vote": "approve"}, format="json")
        self.client.post(self._apply_url(d), {}, format="json")
        resp = self.client.post(self._votes_url(d), {"vote": "reject"}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "decision_applied")

    def test_invalid_vote_rejected(self):
        board = self._board(quorum=1)
        d = self._decision(board)
        resp = self.client.post(self._votes_url(d), {"vote": "maybe"}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertEqual(resp.json().get("code"), "invalid_vote")

    def test_no_quorum_board_unconstrained(self):
        board = self._board(quorum=0)
        d = self._decision(board)
        resp = self.client.post(self._apply_url(d), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.program.refresh_from_db()
        self.assertEqual(self.program.status, "on_hold")


class ComponentFundingTests(_Base):
    def _portfolio(self, budget):
        return Portfolio.objects.create(
            name="Portfolio A", company=self.company, budget_allocated=budget,
        )

    def _funding_url(self):
        return "/api/v1/governance/component-fundings/"

    def _approve_url(self, f):
        return f"/api/v1/governance/component-fundings/{f.id}/approve/"

    def test_over_budget_approval_blocked(self):
        p = self._portfolio(Decimal("100000.00"))
        f1 = ComponentFunding.objects.create(
            portfolio=p, title="Tranche 1", amount=Decimal("80000.00"),
            created_by=self.user,
        )
        f2 = ComponentFunding.objects.create(
            portfolio=p, title="Tranche 2", amount=Decimal("30000.00"),
            created_by=self.user,
        )
        r1 = self.client.post(self._approve_url(f1), {}, format="json")
        self.assertEqual(r1.status_code, 200, r1.content)
        # 80k + 30k = 110k > 100k budget → blocked.
        r2 = self.client.post(self._approve_url(f2), {}, format="json")
        self.assertEqual(r2.status_code, 409, r2.content)
        self.assertEqual(r2.json().get("code"), "over_budget")
        f2.refresh_from_db()
        self.assertEqual(f2.status, "requested")

    def test_total_funded_counts_only_approved(self):
        p = self._portfolio(Decimal("100000.00"))
        f1 = ComponentFunding.objects.create(
            portfolio=p, title="A", amount=Decimal("40000.00"), created_by=self.user,
        )
        ComponentFunding.objects.create(
            portfolio=p, title="B", amount=Decimal("20000.00"), created_by=self.user,
        )
        self.assertEqual(p.total_funded, Decimal("0"))
        self.client.post(self._approve_url(f1), {}, format="json")
        p.refresh_from_db()
        self.assertEqual(p.total_funded, Decimal("40000.00"))
        self.assertEqual(p.remaining_budget, Decimal("60000.00"))

    def test_already_approved_is_409(self):
        p = self._portfolio(Decimal("100000.00"))
        f = ComponentFunding.objects.create(
            portfolio=p, title="A", amount=Decimal("10000.00"), created_by=self.user,
        )
        self.client.post(self._approve_url(f), {}, format="json")
        resp = self.client.post(self._approve_url(f), {}, format="json")
        self.assertEqual(resp.status_code, 409, resp.content)
        self.assertEqual(resp.json().get("code"), "already_approved")

    def test_unbudgeted_portfolio_allows_any_amount(self):
        p = self._portfolio(None)
        f = ComponentFunding.objects.create(
            portfolio=p, title="A", amount=Decimal("999999.00"), created_by=self.user,
        )
        resp = self.client.post(self._approve_url(f), {}, format="json")
        self.assertEqual(resp.status_code, 200, resp.content)
        p.refresh_from_db()
        self.assertIsNone(p.remaining_budget)


class EngagementGapTests(TestCase):
    def test_engagement_gap_math(self):
        User = get_user_model()
        company = Company.objects.create(name="EngCo")
        user = User.objects.create_user(
            email="s@example.com", password="x", username="s", company=company,
        )
        program = Program.objects.create(
            company=company, name="P", methodology="msp", status="planning",
        )
        # neutral(2) → leading(4) = gap 2
        sh = GovernanceStakeholder.objects.create(
            user=user, role="key_stakeholder", program=program,
            current_engagement="neutral", desired_engagement="leading",
        )
        self.assertEqual(sh.engagement_gap, 2)
        # already above target → 0
        sh.current_engagement = "leading"
        sh.desired_engagement = "supportive"
        self.assertEqual(sh.engagement_gap, 0)
