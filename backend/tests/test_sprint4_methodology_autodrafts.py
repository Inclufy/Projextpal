"""Tests for Sprint 4 — methodology auto-drafts from uploaded documents.

Covers:
  S4-01 — PRINCE2 Business Case auto-draft endpoint + helper
  S4-02 — PRINCE2 Project Brief auto-draft endpoint + helper
  S4-03 — Scrum vision + backlog auto-draft
  S4-04 — Kanban swimlane suggestions
  S4-05 — LSS DMAIC Define auto-draft
  S4-06 — Waterfall phase suggestions
  S4-07 — project_ai_plan `use_documents=true` injects a doc-grounded
          auto-prompt into plan_chat

Cross-cutting checks per endpoint:
  * 401 when unauthenticated
  * 404 when project id does not exist / belongs to another tenant
  * 200 fallback shape when no LLM is configured + no ProjectAIContext
    (warning present)
  * 200 fallback shape when no LLM is configured + ProjectAIContext (no
    "no context" warning)
  * 200 happy-path with a mocked LLM, deterministic payload shape

LLM calls go through core.llm_keys.get_anthropic_client /
get_openai_client. We stub those directly so the tests never touch the
real network or require API keys.
"""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Company
from projects.models import Project, ProjectAIContext
from projects.methodology_autodraft_views import (
    prince2_business_case_auto_draft,
    prince2_project_brief_auto_draft,
    scrum_auto_draft,
    kanban_suggest_swimlanes,
    lss_define_auto_draft,
    waterfall_suggest_phases,
)
from projects.ai_plan_views import project_ai_plan
from projects.methodology_autodrafts import (
    draft_business_case,
    draft_project_brief,
    draft_scrum,
    draft_kanban_swimlanes,
    draft_lss_define,
    draft_waterfall_phases,
)


# ============================================================= fixtures ===

@pytest.fixture
def rf():
    return APIRequestFactory()


@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="Tender Zorg 2027",
        description="Aanbesteding voor jeugdhulp",
        methodology="prince2",
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
            "Scope: ontwerp, implementatie, nazorg. "
            "Opleverdata Q2 en Q3. "
            "Gunningscriteria: prijs 40%, kwaliteit 60%."
        ),
        source_files=[{"name": "RFP.pdf", "size": 2048, "pages": 42}],
    )
    return project


@pytest.fixture
def other_tenant_user(db):
    """A user in a *different* company — used to verify tenant isolation.

    The role defaults to 'guest' which is fine for the 404 check (they
    are not a company-wide role, not a member, not the creator)."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    other_co = Company.objects.create(name="Other Co", is_subscribed=True)
    u = User.objects.create_user(
        username="s4other", email="s4@other.com", password="pw",
    )
    u.company = other_co
    u.role = "pm"
    u.save()
    return u


# =================================================== endpoint URL table ===

ENDPOINT_TABLE = [
    ("business_case", "/prince2/business-case/auto-draft/", prince2_business_case_auto_draft,
     ["executive_summary", "reasons", "business_options",
      "expected_benefits", "expected_dis_benefits", "major_risks"]),
    ("project_brief", "/prince2/project-brief/auto-draft/", prince2_project_brief_auto_draft,
     ["project_definition", "business_case_outline",
      "project_product_description", "project_approach"]),
]


def _call(rf, view_fn, user, pk, url_suffix, data=None, headers=None):
    headers = headers or {}
    req = rf.post(f"/api/v1/projects/{pk}{url_suffix}", data or {}, format="json", **headers)
    if user is not None:
        force_authenticate(req, user=user)
    return view_fn(req, pk=pk)


# ============================================================= S4-01/02 ===

class TestPrince2AutoDrafts:
    """Business Case + Project Brief share the same contract."""

    @pytest.mark.parametrize("name,url_suffix,view_fn,fields", ENDPOINT_TABLE)
    def test_unauthenticated_returns_401_or_403(
        self, rf, project, name, url_suffix, view_fn, fields,
    ):
        from rest_framework.exceptions import NotAuthenticated
        req = rf.post(f"/api/v1/projects/{project.id}{url_suffix}", {}, format="json")
        resp = view_fn(req, pk=project.id)
        assert resp.status_code in (401, 403)

    @pytest.mark.parametrize("name,url_suffix,view_fn,fields", ENDPOINT_TABLE)
    def test_unknown_project_returns_404(
        self, rf, user, name, url_suffix, view_fn, fields,
    ):
        resp = _call(rf, view_fn, user, 999_999, url_suffix)
        assert resp.status_code == 404

    @pytest.mark.parametrize("name,url_suffix,view_fn,fields", ENDPOINT_TABLE)
    def test_other_tenant_cannot_draft(
        self, rf, other_tenant_user, project, name, url_suffix, view_fn, fields,
    ):
        resp = _call(rf, view_fn, other_tenant_user, project.id, url_suffix)
        assert resp.status_code == 404

    @pytest.mark.parametrize("name,url_suffix,view_fn,fields", ENDPOINT_TABLE)
    def test_fallback_without_docs_sets_warning(
        self, rf, user, project, name, url_suffix, view_fn, fields,
    ):
        # No LLM keys configured in test env → both anthropic + openai clients
        # return None → fallback path. No ProjectAIContext → warning present.
        resp = _call(rf, view_fn, user, project.id, url_suffix)
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        assert set(fields).issubset(set(body["suggested"].keys()))
        warnings = body["warnings"]
        assert any("documenten" in w.lower() or "documents" in w.lower() for w in warnings)

    @pytest.mark.parametrize("name,url_suffix,view_fn,fields", ENDPOINT_TABLE)
    def test_fallback_with_docs_no_context_warning(
        self, rf, user, project_with_docs, name, url_suffix, view_fn, fields,
    ):
        resp = _call(rf, view_fn, user, project_with_docs.id, url_suffix)
        assert resp.status_code == 200
        body = resp.data
        # With docs the "no context" warning must not be there — only the
        # "no LLM key" warning may remain.
        joined = " ".join(body["warnings"]).lower()
        assert "upload" not in joined and "upload een" not in joined
        # Context prefix was consumed, but with no LLM it still falls back —
        # that's fine, the test only guards the warning content.
        assert body["source"] in ("ai", "fallback")

    def test_bc_ai_happy_path_shape(self, rf, user, project_with_docs):
        """When Anthropic returns a valid JSON reply the view surfaces it as
        source='ai' with all 6 BC fields coerced to strings."""
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "executive_summary": "Deliver tender outcomes.",
            "reasons": "Legal obligation.",
            "business_options": "Do nothing, do minimum, do all.",
            "expected_benefits": "Service quality up.",
            "expected_dis_benefits": "Short-term training load.",
            "major_risks": "Vendor lock-in.",
        }))]
        fake_resp.usage = MagicMock(input_tokens=100, output_tokens=200)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(
                rf, prince2_business_case_auto_draft, user,
                project_with_docs.id, "/prince2/business-case/auto-draft/",
            )
        assert resp.status_code == 200
        assert resp.data["source"] == "ai"
        assert resp.data["suggested"]["executive_summary"] == "Deliver tender outcomes."
        for f in ["reasons", "business_options", "expected_benefits",
                  "expected_dis_benefits", "major_risks"]:
            assert isinstance(resp.data["suggested"][f], str)


# ============================================================== S4-03 ===

class TestScrumAutoDraft:
    def test_fallback_shape(self, rf, user, project):
        resp = _call(rf, scrum_auto_draft, user, project.id, "/scrum/auto-draft/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        assert "vision" in body["suggested"]
        assert "backlog_items" in body["suggested"]
        assert isinstance(body["suggested"]["backlog_items"], list)
        assert len(body["suggested"]["backlog_items"]) >= 3

    def test_ai_coerces_priority_and_strips_blank_titles(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "vision": "Build an inclusive youth-care portal.",
            "backlog_items": [
                {"title": "As a case-worker I log intakes", "priority": "high",
                 "description": "d1", "acceptance_criteria": "ac1"},
                {"title": "", "priority": "high"},  # must be dropped
                {"title": "Enable multi-language consent", "priority": "weird"},  # coerce to medium
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=50, output_tokens=50)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(rf, scrum_auto_draft, user, project_with_docs.id, "/scrum/auto-draft/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "ai"
        items = body["suggested"]["backlog_items"]
        assert len(items) == 2
        assert items[1]["priority"] == "medium"
        assert all(it["title"] for it in items)

    def test_cross_tenant_denied(self, rf, other_tenant_user, project):
        resp = _call(rf, scrum_auto_draft, other_tenant_user, project.id, "/scrum/auto-draft/")
        assert resp.status_code == 404

    def test_unauthenticated(self, rf, project):
        req = rf.post(f"/api/v1/projects/{project.id}/scrum/auto-draft/", {}, format="json")
        resp = scrum_auto_draft(req, pk=project.id)
        assert resp.status_code in (401, 403)


# ============================================================== S4-04 ===

class TestKanbanSwimlanes:
    def test_fallback_shape(self, rf, user, project):
        resp = _call(rf, kanban_suggest_swimlanes, user, project.id, "/kanban/suggest-swimlanes/")
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        lanes = body["suggested"]["swimlanes"]
        assert 3 <= len(lanes) <= 6
        for lane in lanes:
            assert "name" in lane
            assert "color_hex" in lane
            assert lane["color_hex"].startswith("#")

    def test_ai_bad_hex_falls_back_to_default(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "swimlanes": [
                {"name": "Backend", "color_hex": "not a color"},
                {"name": "Frontend", "color_hex": "#ff00aa"},
                {"name": "", "color_hex": "#000000"},  # dropped
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=10, output_tokens=10)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(
                rf, kanban_suggest_swimlanes, user, project_with_docs.id,
                "/kanban/suggest-swimlanes/",
            )
        assert resp.status_code == 200
        lanes = resp.data["suggested"]["swimlanes"]
        assert len(lanes) == 2
        assert lanes[0]["color_hex"] == "#6366f1"  # default — bad hex
        assert lanes[1]["color_hex"] == "#ff00aa"


# ============================================================== S4-05 ===

class TestLSSDefine:
    def test_fallback_sipoc_has_all_keys(self, rf, user, project):
        resp = _call(rf, lss_define_auto_draft, user, project.id, "/lss/define/auto-draft/")
        assert resp.status_code == 200
        body = resp.data
        for k in ("problem_statement", "scope", "sipoc", "project_charter"):
            assert k in body["suggested"]
        for sk in ("suppliers", "inputs", "process", "outputs", "customers"):
            assert sk in body["suggested"]["sipoc"]

    def test_ai_sipoc_items_coerced_to_strings(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "problem_statement": "Intake throughput too low.",
            "scope": "Intake-to-assignment.",
            "sipoc": {
                "suppliers": ["Gemeente", "Zorgaanbieders"],
                "inputs": ["Aanvraag", "Dossier"],
                "process": ["Intake", "Beoordeling", "Besluit"],
                "outputs": ["Beschikking"],
                "customers": ["Burger"],
            },
            "project_charter": "Charter v1.",
        }))]
        fake_resp.usage = MagicMock(input_tokens=20, output_tokens=20)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(
                rf, lss_define_auto_draft, user, project_with_docs.id,
                "/lss/define/auto-draft/",
            )
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "ai"
        assert len(body["suggested"]["sipoc"]["process"]) == 3


# ============================================================== S4-06 ===

class TestWaterfallPhases:
    def test_fallback_phases_count_and_dates(self, rf, user, project):
        project.start_date = __import__("datetime").date(2026, 1, 1)
        project.end_date = __import__("datetime").date(2026, 6, 1)
        project.save()
        resp = _call(rf, waterfall_suggest_phases, user, project.id, "/waterfall/suggest-phases/")
        assert resp.status_code == 200
        phases = resp.data["suggested"]["phases"]
        assert 4 <= len(phases) <= 8
        for p in phases:
            assert "name" in p and p["start_date"] and p["end_date"]

    def test_ai_filters_blank_phase_names(self, rf, user, project_with_docs):
        fake_resp = MagicMock()
        fake_resp.content = [MagicMock(type="text", text=json.dumps({
            "phases": [
                {"name": "Discovery", "start_date": "2026-01-01",
                 "end_date": "2026-01-31", "deliverables": ["Report"],
                 "gate_criteria": "Approved brief."},
                {"name": "", "start_date": "2026-02-01", "end_date": "2026-02-10"},
                {"name": "Build", "start_date": "2026-02-01",
                 "end_date": "2026-04-30", "deliverables": [],
                 "gate_criteria": "Unit tests green."},
            ],
        }))]
        fake_resp.usage = MagicMock(input_tokens=10, output_tokens=10)
        fake_client = MagicMock()
        fake_client.messages.create.return_value = fake_resp
        with patch("core.llm_keys.get_anthropic_client", return_value=fake_client):
            resp = _call(
                rf, waterfall_suggest_phases, user, project_with_docs.id,
                "/waterfall/suggest-phases/",
            )
        phases = resp.data["suggested"]["phases"]
        assert [p["name"] for p in phases] == ["Discovery", "Build"]


# ======================================================== language check ===

class TestLanguageHeader:
    """NL and EN warning strings must differ so the UI can show them."""

    def test_bc_warnings_nl(self, rf, user, project):
        resp = _call(
            rf, prince2_business_case_auto_draft, user, project.id,
            "/prince2/business-case/auto-draft/",
            data={"language": "nl"},
        )
        joined = " ".join(resp.data["warnings"]).lower()
        assert "geen project-documenten" in joined

    def test_bc_warnings_en(self, rf, user, project):
        resp = _call(
            rf, prince2_business_case_auto_draft, user, project.id,
            "/prince2/business-case/auto-draft/",
            data={"language": "en"},
        )
        joined = " ".join(resp.data["warnings"]).lower()
        assert "no project documents" in joined


# ======================================================= helper direct ===

class TestHelperDirect:
    """A direct call into the draft_* helpers is useful to pin the
    fallback-shape contract independent of DRF view wiring."""

    def test_bc_fallback_has_all_fields(self, db, user, project):
        res = draft_business_case(project, user, "nl", "")
        assert res.source == "fallback"
        for f in ["executive_summary", "reasons", "business_options",
                  "expected_benefits", "expected_dis_benefits", "major_risks"]:
            assert f in res.suggested

    def test_brief_fallback_has_all_fields(self, db, user, project):
        res = draft_project_brief(project, user, "nl", "")
        for f in ["project_definition", "business_case_outline",
                  "project_product_description", "project_approach"]:
            assert f in res.suggested

    def test_scrum_fallback_vision_non_empty(self, db, user, project):
        res = draft_scrum(project, user, "nl", "")
        assert res.suggested["vision"]

    def test_kanban_fallback_valid_hex(self, db, user, project):
        res = draft_kanban_swimlanes(project, user, "nl", "")
        for lane in res.suggested["swimlanes"]:
            assert len(lane["color_hex"]) == 7

    def test_lss_fallback_charter_non_empty(self, db, user, project):
        res = draft_lss_define(project, user, "nl", "")
        assert res.suggested["project_charter"]

    def test_waterfall_fallback_dates_within_project_range(self, db, user, project):
        import datetime
        project.start_date = datetime.date(2026, 1, 1)
        project.end_date = datetime.date(2026, 6, 1)
        project.save()
        res = draft_waterfall_phases(project, user, "nl", "")
        for p in res.suggested["phases"]:
            assert "2026-" in p["start_date"]
            assert "2026-" in p["end_date"]


# =============================================== S4-07 use_documents ===

class TestProjectAiPlanUseDocuments:
    """`use_documents: true` with no messages auto-injects a doc-grounded
    prompt into plan_chat. We stub plan_chat to assert it was called with
    exactly one user message that mentions documents."""

    def test_use_documents_without_messages_injects_prompt(
        self, rf, user, project_with_docs,
    ):
        req = rf.post(
            f"/api/v1/projects/{project_with_docs.id}/ai-plan/",
            {"messages": [], "use_documents": True, "language": "nl"},
            format="json",
        )
        force_authenticate(req, user=user)
        captured = {}

        def fake_plan_chat(project, user, messages, language="nl"):
            captured["messages"] = messages
            captured["language"] = language
            return {"action": "propose", "message": "ok", "proposal": {
                "milestones": [], "risks": [],
            }, "source": "ai"}

        with patch("projects.ai_planner.plan_chat", side_effect=fake_plan_chat):
            resp = project_ai_plan(req, pk=project_with_docs.id)
        assert resp.status_code == 200
        assert len(captured["messages"]) == 1
        assert captured["messages"][0]["role"] == "user"
        assert "document" in captured["messages"][0]["content"].lower()

    def test_use_documents_without_context_falls_through(
        self, rf, user, project,
    ):
        """No ProjectAIContext → no auto-prompt; plan_chat sees the empty
        list it was given (and the planner's own default kicks in)."""
        req = rf.post(
            f"/api/v1/projects/{project.id}/ai-plan/",
            {"messages": [], "use_documents": True},
            format="json",
        )
        force_authenticate(req, user=user)
        captured = {}

        def fake_plan_chat(project, user, messages, language="nl"):
            captured["messages"] = messages
            return {"action": "propose", "message": "ok", "proposal": {
                "milestones": [], "risks": [],
            }, "source": "ai"}

        with patch("projects.ai_planner.plan_chat", side_effect=fake_plan_chat):
            resp = project_ai_plan(req, pk=project.id)
        assert resp.status_code == 200
        # The view did NOT inject anything — the planner was handed an empty
        # list and will use its own default fallback prompt.
        assert captured["messages"] == []

    def test_use_documents_with_user_messages_does_not_override(
        self, rf, user, project_with_docs,
    ):
        """When the user already typed something, use_documents is a no-op."""
        req = rf.post(
            f"/api/v1/projects/{project_with_docs.id}/ai-plan/",
            {
                "messages": [{"role": "user", "content": "Maak een plan"}],
                "use_documents": True,
            },
            format="json",
        )
        force_authenticate(req, user=user)
        captured = {}

        def fake_plan_chat(project, user, messages, language="nl"):
            captured["messages"] = messages
            return {"action": "propose", "message": "ok", "proposal": {
                "milestones": [], "risks": [],
            }, "source": "ai"}

        with patch("projects.ai_planner.plan_chat", side_effect=fake_plan_chat):
            resp = project_ai_plan(req, pk=project_with_docs.id)
        assert resp.status_code == 200
        assert captured["messages"][0]["content"] == "Maak een plan"
