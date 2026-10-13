"""Tests for Sprint 5 — proactive AI, team-match, dashboard narratives.

Covers:
  S5-01 — Compliance keyword scan (NL + EN keywords, cross-tenant,
          happy path, no context, signal-driven persistence).
  S5-02 — Auto-tag project (happy, no context, fallback).
  S5-03 — Status report AI-draft (401, 404, 200 happy, 200 fallback).
  S5-04 — Risk / dependency sniff (401, 404, 200 happy, 200 fallback).
  S5-06 — Team-match (tenant isolation, happy, no members fallback).
  S5-07 — Onboarding tour (only for own team members).
  S5-08 — Dashboard narrative (refresh works).
  S5-09 — Meeting agenda AI-draft (respects ProjectAIContext).

LLM calls go through core.llm_keys.get_anthropic_client /
get_openai_client. We stub those so the tests never touch the real
network. The "fallback" path = both clients return None.
"""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Company
from projects.models import Project, ProjectAIContext, ProjectTeam

from projects.sprint5_views import (
    compliance_rescan,
    project_auto_tag,
    status_report_ai_draft,
    risk_sniff,
    team_match,
    onboarding_tour,
    dashboard_narrative,
    meeting_agenda_auto_draft,
)
from projects.compliance_scan import scan_text, all_known_slugs


# ============================================================= fixtures ===

@pytest.fixture
def rf():
    return APIRequestFactory()


@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="Jeugdzorg Programma 2027",
        description="Aanbesteding voor jeugdhulp",
        methodology="prince2",
        project_type="software",
        created_by=user,
        company=company,
    )


@pytest.fixture
def project_with_docs(db, project):
    ProjectAIContext.objects.create(
        project=project,
        enabled=True,
        extracted_text=(
            "RFP gemeente Heerenveen jeugdhulp. "
            "Compliance: AVG, Wkkgz, Jeugdwet. "
            "ISO 27001 is vereist. SOC 2 niet verplicht."
        ),
        source_files=[{"name": "RFP.pdf", "size": 2048, "pages": 42}],
    )
    return project


@pytest.fixture
def other_tenant_user(db):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    other_co = Company.objects.create(name="Other Co", is_subscribed=True)
    u = User.objects.create_user(
        username="s5other", email="s5@other.com", password="pw",
    )
    u.company = other_co
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def second_user_same_company(db, company):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    u = User.objects.create_user(
        username="s5member", email="member@projextpal.com", password="pw",
    )
    u.company = company
    u.role = "contributor"
    u.first_name = "Second"
    u.last_name = "Member"
    u.save()
    return u


def _call(rf, view_fn, user, pk, url_suffix, data=None, method="post", view_kwargs=None):
    full_url = f"/api/v1/projects/{pk}{url_suffix}"
    if method == "get":
        req = rf.get(full_url, data or {})
    else:
        req = rf.post(full_url, data or {}, format="json")
    if user is not None:
        force_authenticate(req, user=user)
    kwargs = {"pk": pk}
    if view_kwargs:
        kwargs.update(view_kwargs)
    return view_fn(req, **kwargs)


# ============================================================= S5-01 ===

class TestComplianceScan:
    def test_scan_text_nl_keywords(self):
        """NL regime names are detected."""
        text = (
            "Deze aanbesteding valt onder de AVG en de Jeugdwet. "
            "ISO 27001 certificering is vereist."
        )
        flags = scan_text(text)
        assert "avg_gdpr" in flags
        assert "jeugdwet" in flags
        assert "iso_27001" in flags

    def test_scan_text_en_keywords(self):
        text = "This solution must be GDPR-compliant and achieve SOC 2 Type II."
        flags = scan_text(text)
        assert "avg_gdpr" in flags
        assert "soc2" in flags

    def test_scan_text_word_boundary(self):
        """Partial matches must not trigger — SOC 2 should not match ``associate``."""
        text = "Our association values compliance."
        flags = scan_text(text)
        assert "soc2" not in flags

    def test_scan_empty_text(self):
        assert scan_text("") == []
        assert scan_text(None) == []

    def test_rescan_persists_flags(self, rf, user, project_with_docs):
        resp = _call(rf, compliance_rescan, user, project_with_docs.id, "/compliance/rescan/")
        assert resp.status_code == 200
        body = resp.data
        assert "avg_gdpr" in body["flags"]
        assert "wkkgz" in body["flags"]
        assert body["source"] == "deterministic"
        assert body["has_context"] is True
        # Flag is persisted.
        project_with_docs.refresh_from_db()
        assert "avg_gdpr" in project_with_docs.compliance_flags

    def test_rescan_without_context(self, rf, user, project):
        resp = _call(rf, compliance_rescan, user, project.id, "/compliance/rescan/")
        assert resp.status_code == 200
        assert resp.data["flags"] == []
        assert resp.data["has_context"] is False

    def test_rescan_unauth(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/compliance/rescan/", {}, format="json")
        resp = compliance_rescan(req, pk=project.id)
        assert resp.status_code in (401, 403)

    def test_rescan_cross_tenant_404(self, rf, other_tenant_user, project_with_docs):
        resp = _call(rf, compliance_rescan, other_tenant_user,
                     project_with_docs.id, "/compliance/rescan/")
        assert resp.status_code == 404

    def test_signal_updates_project_on_context_save(self, db, project):
        """Signal path: creating a ProjectAIContext populates compliance_flags."""
        ProjectAIContext.objects.create(
            project=project, enabled=True,
            extracted_text="NIS2 directive applies. ISO 9001 compliance required.",
        )
        project.refresh_from_db()
        assert "nis2" in project.compliance_flags
        assert "iso_9001" in project.compliance_flags

    def test_all_slugs_discoverable(self):
        slugs = list(all_known_slugs())
        for s in ("avg_gdpr", "iso_27001", "iso_9001", "wkkgz", "jeugdwet",
                  "wmo", "aanbestedingswet", "besluit_informatiebeveiliging",
                  "nis2", "dora", "soc2", "pci_dss"):
            assert s in slugs


# ============================================================= S5-02 ===

class TestAutoTag:
    def test_fallback_no_context_returns_metadata_tags(self, rf, user, project):
        resp = _call(rf, project_auto_tag, user, project.id, "/auto-tag/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        assert isinstance(body["tags"], list)
        # Methodology / type bleed through as tags.
        assert "prince2" in body["tags"]
        assert "software" in body["tags"]
        project.refresh_from_db()
        assert project.ai_suggested_tags == body["tags"]

    def test_ai_happy_path(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "tags": ["jeugdzorg", "gemeente", "aanbesteding", "iso-27001", "avg"],
        }))]
        fake_resp.usage = MagicMock(input_tokens=10, output_tokens=10)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, project_auto_tag, user, project_with_docs.id, "/auto-tag/")
        assert resp.status_code == 200
        assert resp.data["source"] == "ai"
        assert "jeugdzorg" in resp.data["tags"]
        assert len(resp.data["tags"]) <= 5

    def test_unauth_401(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/auto-tag/", {}, format="json")
        resp = project_auto_tag(req, pk=project.id)
        assert resp.status_code in (401, 403)

    def test_cross_tenant_404(self, rf, other_tenant_user, project):
        resp = _call(rf, project_auto_tag, other_tenant_user, project.id, "/auto-tag/")
        assert resp.status_code == 404


# ============================================================= S5-03 ===

class TestStatusReportAiDraft:
    def test_fallback_shape(self, rf, user, project):
        resp = _call(rf, status_report_ai_draft, user, project.id,
                     "/status-reports/auto-draft/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        for k in ("headline", "summary", "period_start", "period_end",
                  "highlights", "risks", "actions_required"):
            assert k in body["suggested"]
        # Warnings include the no-context notice.
        assert any("documenten" in w.lower() or "documents" in w.lower()
                   for w in body["warnings"])

    def test_ai_happy_path(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "headline": "Week 42 — jeugdzorg programma on track",
            "summary": "Intake volume stable; two risks under watch.",
            "period_start": "2026-10-06",
            "period_end": "2026-10-13",
            "highlights": ["Intake dashboard launched", "GDPR DPIA signed"],
            "risks": ["Vendor cert delay"],
            "actions_required": ["Confirm Q4 budget with steering"],
        }))]
        fake_resp.usage = MagicMock(input_tokens=50, output_tokens=100)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, status_report_ai_draft, user, project_with_docs.id,
                         "/status-reports/auto-draft/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "ai"
        assert body["suggested"]["headline"].startswith("Week 42")
        assert len(body["suggested"]["highlights"]) == 2

    def test_unauth_401(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/status-reports/auto-draft/",
                      {}, format="json")
        resp = status_report_ai_draft(req, pk=project.id)
        assert resp.status_code in (401, 403)

    def test_unknown_project_404(self, rf, user):
        resp = _call(rf, status_report_ai_draft, user, 999_999,
                     "/status-reports/auto-draft/")
        assert resp.status_code == 404


# ============================================================= S5-04 ===

class TestRiskSniff:
    def test_fallback_empty_when_no_docs(self, rf, user, project):
        resp = _call(rf, risk_sniff, user, project.id, "/risk-sniff/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        assert body["suggested"]["suggested_risks"] == []
        assert body["suggested"]["suggested_dependencies"] == []

    def test_ai_happy_path_coerces_fields(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "suggested_risks": [
                {"name": "GDPR DPIA late", "description": "DPIA still in review",
                 "category": "Compliance", "impact": "High", "probability": 70,
                 "mitigation_hint": "Escalate to DPO"},
                # Invalid category gets normalized.
                {"name": "Vendor dependency", "category": "weird", "impact": "weird",
                 "probability": "many"},
                # Blank name — dropped.
                {"name": ""},
            ],
            "suggested_dependencies": [
                {"name": "Legal review", "description": "Blocks go-live",
                 "blocking_milestone": "M3"},
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=20, output_tokens=50)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, risk_sniff, user, project_with_docs.id, "/risk-sniff/")
        assert resp.status_code == 200
        risks = resp.data["suggested"]["suggested_risks"]
        assert len(risks) == 2
        assert risks[1]["category"] == "Operational"
        assert risks[1]["impact"] == "Medium"
        assert risks[1]["probability"] == 50
        deps = resp.data["suggested"]["suggested_dependencies"]
        assert deps[0]["blocking_milestone"] == "M3"

    def test_unauth_401(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/risk-sniff/", {}, format="json")
        resp = risk_sniff(req, pk=project.id)
        assert resp.status_code in (401, 403)

    def test_cross_tenant_404(self, rf, other_tenant_user, project):
        resp = _call(rf, risk_sniff, other_tenant_user, project.id, "/risk-sniff/")
        assert resp.status_code == 404


# ============================================================= S5-06 ===

class TestTeamMatch:
    def test_no_candidates_returns_empty(self, rf, user, project):
        # Only `user` exists in this company, so pool is 1. Still returns 200
        # with suggestions (fallback with naive rank).
        resp = _call(rf, team_match, user, project.id, "/team-match/")
        assert resp.status_code == 200
        assert "suggestions" in resp.data["suggested"]

    def test_tenant_isolated(self, rf, user, project, second_user_same_company,
                              other_tenant_user):
        """Users from other companies must NEVER appear in the suggestions."""
        resp = _call(rf, team_match, user, project.id, "/team-match/")
        assert resp.status_code == 200
        ids = [s["user_id"] for s in resp.data["suggested"]["suggestions"]]
        assert other_tenant_user.id not in ids

    def test_ai_filters_hallucinated_user_ids(self, rf, user, project,
                                                second_user_same_company,
                                                other_tenant_user):
        fake_resp = MagicMock()
        # LLM returns a mix: real same-company user, other-tenant hallucination,
        # and a totally made-up id.
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "suggestions": [
                {"user_id": second_user_same_company.id, "name": "Second",
                 "match_score": 85, "reasoning": "Experienced"},
                {"user_id": other_tenant_user.id, "name": "Hallucinated",
                 "match_score": 90, "reasoning": "Should drop"},
                {"user_id": 999_999, "name": "No such user",
                 "match_score": 80, "reasoning": "Also drop"},
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=10, output_tokens=20)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, team_match, user, project.id, "/team-match/")
        assert resp.status_code == 200
        ids = [s["user_id"] for s in resp.data["suggested"]["suggestions"]]
        assert second_user_same_company.id in ids
        assert other_tenant_user.id not in ids
        assert 999_999 not in ids

    def test_unauth_401(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/team-match/", {}, format="json")
        resp = team_match(req, pk=project.id)
        assert resp.status_code in (401, 403)


# ============================================================= S5-07 ===

class TestOnboardingTour:
    def test_only_for_own_team_members(self, rf, user, project,
                                        second_user_same_company):
        # Not a team member yet → 404.
        resp = _call(rf, onboarding_tour, user, project.id,
                     f"/team/{second_user_same_company.id}/onboarding-tour/",
                     method="get",
                     view_kwargs={"user_id": second_user_same_company.id})
        assert resp.status_code == 404

    def test_tour_returned_for_active_member(self, rf, user, project,
                                               second_user_same_company):
        ProjectTeam.objects.create(
            project=project, user=second_user_same_company,
            added_by=user, is_active=True,
        )
        resp = _call(rf, onboarding_tour, user, project.id,
                     f"/team/{second_user_same_company.id}/onboarding-tour/",
                     method="get",
                     view_kwargs={"user_id": second_user_same_company.id})
        assert resp.status_code == 200
        assert "greeting" in resp.data["suggested"]
        assert resp.data["suggested"]["greeting"]

    def test_cross_tenant_404(self, rf, other_tenant_user, project,
                                second_user_same_company):
        ProjectTeam.objects.create(
            project=project, user=second_user_same_company, is_active=True,
        )
        resp = _call(rf, onboarding_tour, other_tenant_user, project.id,
                     f"/team/{second_user_same_company.id}/onboarding-tour/",
                     method="get",
                     view_kwargs={"user_id": second_user_same_company.id})
        assert resp.status_code == 404

    def test_unauth_401(self, rf, project, second_user_same_company):
        req = rf.get(
            f"/api/v1/projects/{project.id}/team/{second_user_same_company.id}/onboarding-tour/",
        )
        resp = onboarding_tour(req, pk=project.id, user_id=second_user_same_company.id)
        assert resp.status_code in (401, 403)


# ============================================================= S5-08 ===

class TestDashboardNarrative:
    def test_fallback_shape(self, rf, user, project):
        resp = _call(rf, dashboard_narrative, user, project.id,
                     "/dashboard/narrative/", method="get")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        for k in ("headline", "body", "key_insights"):
            assert k in body["suggested"]
        assert project.name in body["suggested"]["headline"]

    def test_ai_happy_path(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "headline": "Programma loopt op schema",
            "body": "Alle grote mijlpalen zijn gehaald; 1 risico onder observatie.",
            "key_insights": ["Compliance dekking volledig", "GDPR DPIA getekend"],
        }))]
        fake_resp.usage = MagicMock(input_tokens=15, output_tokens=25)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, dashboard_narrative, user, project_with_docs.id,
                         "/dashboard/narrative/", method="get")
        assert resp.status_code == 200
        assert resp.data["source"] == "ai"
        assert resp.data["suggested"]["headline"] == "Programma loopt op schema"

    def test_refresh_works(self, rf, user, project_with_docs):
        """Calling the endpoint twice in a row must both succeed — the view
        is idempotent and does not depend on hidden session state."""
        r1 = _call(rf, dashboard_narrative, user, project_with_docs.id,
                   "/dashboard/narrative/", method="get")
        r2 = _call(rf, dashboard_narrative, user, project_with_docs.id,
                   "/dashboard/narrative/", method="get")
        assert r1.status_code == 200 and r2.status_code == 200

    def test_unauth_401(self, rf, project):
        req = rf.get(f"/api/v1/projects/{project.id}/dashboard/narrative/")
        resp = dashboard_narrative(req, pk=project.id)
        assert resp.status_code in (401, 403)

    def test_cross_tenant_404(self, rf, other_tenant_user, project):
        resp = _call(rf, dashboard_narrative, other_tenant_user, project.id,
                     "/dashboard/narrative/", method="get")
        assert resp.status_code == 404


# ============================================================= S5-09 ===

class TestMeetingAgenda:
    def test_fallback_shape(self, rf, user, project):
        resp = _call(rf, meeting_agenda_auto_draft, user, project.id,
                     "/meetings/auto-draft-agenda/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        items = body["suggested"]["agenda_items"]
        assert isinstance(items, list)
        assert len(items) >= 3
        for item in items:
            assert "title" in item and "duration_min" in item

    def test_ai_uses_context(self, rf, user, project_with_docs):
        """When ProjectAIContext exists, the no-context warning MUST NOT be
        the first thing in warnings — the endpoint consumes the prefix."""
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "agenda_items": [
                {"title": "Review intake flow", "duration_min": 20,
                 "discussion_points": ["Volume", "SLAs"],
                 "required_decisions": ["Add 2nd tier?"]},
                {"title": "GDPR DPIA sign-off", "duration_min": 15,
                 "discussion_points": [], "required_decisions": []},
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=20, output_tokens=50)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, meeting_agenda_auto_draft, user,
                         project_with_docs.id, "/meetings/auto-draft-agenda/")
        assert resp.status_code == 200
        assert resp.data["source"] == "ai"
        assert len(resp.data["suggested"]["agenda_items"]) == 2
        # Context was consumed → the "no documents" warning must not be
        # present.
        joined = " ".join(resp.data["warnings"]).lower()
        assert "upload" not in joined

    def test_coerces_bad_duration(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "agenda_items": [
                {"title": "Session", "duration_min": "forever"},  # coerce to 15
                {"title": "", "duration_min": 10},  # dropped
                {"title": "Cap", "duration_min": 9999},  # capped at 240
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=5, output_tokens=5)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, meeting_agenda_auto_draft, user,
                         project_with_docs.id, "/meetings/auto-draft-agenda/")
        items = resp.data["suggested"]["agenda_items"]
        assert len(items) == 2
        assert items[0]["duration_min"] == 15
        assert items[1]["duration_min"] == 240

    def test_unauth_401(self, rf, project):
        req = rf.post(
            f"/api/v1/projects/{project.id}/meetings/auto-draft-agenda/",
            {}, format="json",
        )
        resp = meeting_agenda_auto_draft(req, pk=project.id)
        assert resp.status_code in (401, 403)
