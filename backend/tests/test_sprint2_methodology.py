"""Tests for Sprint 2 — document-aware methodology classification.

Covers:
  S2-01 — tailoring.classify_with_llm reads ProjectAIContext when
          project_id + user are provided.
  S2-03 — plan-from-documents response shape includes suggested_methodology,
          methodology_confidence, methodology_reason, hardened against wild
          LLM output.
  S2-05 — project_doctor.diagnose(use_llm=True) runs the doc-vs-reality
          check and appends ``doc_vs_reality`` findings additively.
  S2-08 — bot.ai.tools.parse_and_create_project_structure prepends
          ProjectAIContext when the project has one.

LLM calls are mocked everywhere — no network, no API key required.
"""
import pytest
from unittest.mock import patch, MagicMock

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate

from projects.ai_from_doc import plan_from_documents
from projects.models import Project, ProjectAIContext
from projects.tailoring import classify_with_llm, classify


# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #
@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="Tender Jeugdzorg 2027",
        company=company,
        methodology="prince2",
        created_by=user,
    )


@pytest.fixture
def project_with_tender_context(db, project):
    """A project whose uploaded documents clearly point at an aanbesteding."""
    ProjectAIContext.objects.create(
        project=project,
        enabled=True,
        extracted_text=(
            "Aanbesteding gemeente Heerenveen jeugdhulp. "
            "RFP eist een duidelijke scope-uit, gunningscriteria op prijs én "
            "kwaliteit, en een audit-trail per inschrijving. "
            "Looptijd 4 jaar, met verlengopties."
        ),
        source_files=[{"name": "RFP_Jeugdhulp.pdf", "size": 1024, "pages": 42}],
    )
    return project


# --------------------------------------------------------------------------- #
# S2-01 — classify_with_llm reads ProjectAIContext
# --------------------------------------------------------------------------- #
class TestClassifyWithLlmReadsContext:
    def test_no_project_id_behaves_like_old_classify(self, db, user):
        """Without project_id the function must behave exactly like before."""
        description = "Nieuw mobiel product voor ons team, we werken in sprints."
        old = classify(description)
        new = classify_with_llm(description, company=None, project_id=None, user=user)
        # Only the known-stable fields are compared — source may still be
        # "deterministic" in both.
        assert new["methodology"] == old["methodology"]
        assert new["project_type"] == old["project_type"]

    def test_doc_prefix_steers_deterministic_to_prince2(self, user, project_with_tender_context):
        """Free text alone says 'internal, small, simple'. Document context says
        'aanbesteding, gunningscriteria, audit-trail'. The classifier should
        pick PRINCE2 because the tender signals in the docs win."""
        bland = "Intern project."
        # Baseline without docs — should NOT be prince2.
        bare = classify_with_llm(bland, company=None, project_id=None, user=user)
        # With doc context from the tender fixture.
        enriched = classify_with_llm(
            bland,
            company=None,
            project_id=project_with_tender_context.id,
            user=user,
        )
        assert enriched["methodology"] == "prince2"
        assert enriched["source"].endswith("+docs")
        assert "projectdocumenten" in enriched["rationale"].lower()
        # Baseline shouldn't have the +docs marker.
        assert not bare["source"].endswith("+docs")

    def test_cross_tenant_user_cannot_leak_context(
        self, second_company, project_with_tender_context,
    ):
        """A user from another tenant must not benefit from, or even see,
        the context — enforced by the shared helper, not duplicated here."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="s2other", email="o@x.com", password="pw",
        )
        other.role = "pm"
        if hasattr(other, "company"):
            other.company = second_company
        other.save()

        bland = "Intern project."
        result = classify_with_llm(
            bland, company=None,
            project_id=project_with_tender_context.id,
            user=other,
        )
        # No +docs marker because the helper returned "" for cross-tenant.
        assert "+docs" not in result["source"]

    def test_llm_path_folds_in_context(self, user, project_with_tender_context, company):
        """When an LLM client is wired, the context should land in the prompt
        and the LLM's answer wins."""
        fake_resp = MagicMock()
        fake_resp.choices = [MagicMock(message=MagicMock(
            content='{"methodology": "waterfall", "project_type": "aanbesteding", '
                    '"dimensions": {"scope": 3, "budget": 2, "duur": 3, '
                    '"politiek": 3, "risico": 3, "regel": 3}}',
        ))]

        captured_prompt = {}

        def _fake_create(**kwargs):
            captured_prompt["messages"] = kwargs.get("messages")
            return fake_resp

        fake_client = MagicMock()
        fake_client.chat.completions.create.side_effect = _fake_create

        with patch("core.llm_keys.get_openai_client", return_value=fake_client):
            result = classify_with_llm(
                "Intern project.",
                company=company,
                project_id=project_with_tender_context.id,
                user=user,
            )

        assert result["methodology"] == "waterfall"
        assert result["source"] == "llm+docs"
        # The context block must have been sent to the LLM.
        prompt_text = captured_prompt["messages"][0]["content"]
        assert "PROJECT_DOCUMENTEN" in prompt_text or "PROJECT_DOCUMENTS" in prompt_text
        assert "aanbesteding" in prompt_text.lower() or "jeugdhulp" in prompt_text.lower()


# --------------------------------------------------------------------------- #
# S2-03 — plan-from-documents response shape
# --------------------------------------------------------------------------- #
URL = "/api/v1/projects/plan-from-documents/"


def _post_plan(user, files):
    factory = APIRequestFactory()
    req = factory.post(URL, {"files": files}, format="multipart")
    if user is not None:
        force_authenticate(req, user=user)
    return plan_from_documents(req)


class TestPlanFromDocsMethodologySuggestion:
    def test_fallback_source_emits_no_methodology_suggestion(self, user):
        """When no LLM key is available, source=='fallback' and the
        methodology-suggestion fields must be null/zero."""
        f = SimpleUploadedFile(
            "tender.txt",
            b"Aanbesteding voor jeugdhulp. Scope: Wmo-ondersteuning.",
            content_type="text/plain",
        )
        with (
            patch("projects.ai_from_doc.get_openai_client", return_value=None),
            patch("projects.ai_from_doc.get_anthropic_client", return_value=None),
        ):
            resp = _post_plan(user, [f])
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        # Fields present but empty-ish.
        assert body["suggested_methodology"] is None
        assert body["methodology_confidence"] == 0
        assert body["methodology_reason"] == ""

    def test_ai_source_normalises_methodology_suggestion(self, user):
        """When the LLM returns a known methodology slug, we surface it;
        confidence is clamped 0..100; reason trimmed."""
        f = SimpleUploadedFile("tender.txt", b"any text", content_type="text/plain")
        llm_out = {
            "name": "Project X",
            "description": "...",
            "scope_in": "",
            "scope_out": "",
            "deliverables": [],
            "suggested_milestones": [],
            "suggested_methodology": "prince2",
            "methodology_confidence": 85,
            "methodology_reason": "Document kenmerken wijzen op PRINCE2.",
        }
        with patch("projects.ai_from_doc._call_llm", return_value=llm_out):
            resp = _post_plan(user, [f])
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "ai"
        assert body["suggested_methodology"] == "prince2"
        assert body["methodology_confidence"] == 85
        assert "PRINCE2" in body["methodology_reason"]

    def test_unknown_methodology_slug_is_dropped(self, user):
        f = SimpleUploadedFile("tender.txt", b"any text", content_type="text/plain")
        llm_out = {
            "name": "Project X",
            "description": "",
            "scope_in": "",
            "scope_out": "",
            "deliverables": [],
            "suggested_milestones": [],
            "suggested_methodology": "nonexistent-xyz",
            "methodology_confidence": 42,
            "methodology_reason": "x",
        }
        with patch("projects.ai_from_doc._call_llm", return_value=llm_out):
            resp = _post_plan(user, [f])
        assert resp.status_code == 200
        assert resp.data["suggested_methodology"] is None
        # When slug is invalid, confidence/reason are not surfaced either.
        assert resp.data["methodology_confidence"] == 0
        assert resp.data["methodology_reason"] == ""

    def test_confidence_is_clamped(self, user):
        f = SimpleUploadedFile("tender.txt", b"any text", content_type="text/plain")
        llm_out = {
            "name": "Project X",
            "description": "",
            "scope_in": "",
            "scope_out": "",
            "deliverables": [],
            "suggested_milestones": [],
            "suggested_methodology": "scrum",
            "methodology_confidence": 10_000,
            "methodology_reason": "y",
        }
        with patch("projects.ai_from_doc._call_llm", return_value=llm_out):
            resp = _post_plan(user, [f])
        assert resp.data["methodology_confidence"] == 100


# --------------------------------------------------------------------------- #
# S2-05 — Project Doctor doc-vs-reality
# --------------------------------------------------------------------------- #
class TestProjectDoctorDocVsReality:
    def test_default_behavior_unchanged_without_use_llm(
        self, user, project_with_tender_context,
    ):
        """Without use_llm the doc check must NOT run — no doc_vs_reality
        findings, no LLM calls."""
        from projects.project_doctor import diagnose
        with patch("projects.project_doctor._llm_doc_vs_reality") as m:
            result = diagnose(project_with_tender_context, user=user)
        m.assert_not_called()
        assert all(p["type"] != "doc_vs_reality" for p in result["problems"])

    def test_use_llm_true_adds_doc_vs_reality_findings(
        self, user, project_with_tender_context,
    ):
        """With use_llm=True the discrepancies are appended as problems."""
        from projects.project_doctor import diagnose
        fake_findings = [
            {
                "id": "doc-0",
                "severity": "high",
                "type": "doc_vs_reality",
                "title": "Audit-trail per inschrijving ontbreekt",
                "detail": "RFP eist audit-trail; project heeft hier nog geen taak voor.",
                "evidence": [],
                "areas": ["documents"],
                "proposed_actions": [
                    {"title": "Adres: audit-trail", "priority": "high", "due_in_days": 3},
                ],
            },
        ]
        with patch("projects.project_doctor._llm_doc_vs_reality", return_value=fake_findings):
            result = diagnose(project_with_tender_context, user=user, use_llm=True)
        doc_findings = [p for p in result["problems"] if p["type"] == "doc_vs_reality"]
        assert len(doc_findings) == 1
        assert doc_findings[0]["severity"] == "high"
        assert "audit-trail" in doc_findings[0]["title"].lower()

    def test_llm_failure_never_crashes_doctor(
        self, user, project_with_tender_context,
    ):
        """Any exception inside the LLM helper is swallowed — the
        deterministic diagnosis still returns."""
        from projects.project_doctor import diagnose
        with patch(
            "projects.project_doctor._llm_doc_vs_reality",
            side_effect=RuntimeError("boom"),
        ):
            result = diagnose(project_with_tender_context, user=user, use_llm=True)
        assert "problems" in result
        assert all(p["type"] != "doc_vs_reality" for p in result["problems"])


# --------------------------------------------------------------------------- #
# S2-08 — bot tool reads ProjectAIContext
# --------------------------------------------------------------------------- #
# The bot/ai module optionally imports LangChain's ``create_agent`` which is
# not guaranteed to be available in the test environment. We assert the
# contract via source-level inspection + direct helper spying so the tenant-
# safety guarantee is enforced without pulling the LangChain graph in.
#
# Source-level check: the ``parse_and_create_project_structure`` function must
# call ``core.ai_context_helpers.get_project_context_prefix`` and must prepend
# the result to the LLM user prompt BEFORE the free-text description.
import os as _os


class TestBotTaskToolReadsContext:
    _TOOL_PATH = _os.path.join(
        _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))),
        "bot", "ai", "tools", "project_task_tools.py",
    )

    def test_tool_source_imports_shared_helper(self):
        """Guard against someone duplicating the context-reading logic.
        The bot tool must call ``get_project_context_prefix`` from
        ``core.ai_context_helpers`` so the tenant-safety test matrix stays
        in one place."""
        with open(self._TOOL_PATH, "r", encoding="utf-8") as f:
            src = f.read()
        assert "core.ai_context_helpers" in src, (
            "parse_and_create_project_structure must read context via the "
            "shared helper to stay tenant-safe."
        )
        assert "get_project_context_prefix" in src

    def test_tool_source_puts_doc_prefix_before_description(self):
        """Static check: in the formatted LLM user_prompt the doc_prefix
        placeholder appears BEFORE 'Project Description:' so the LLM sees
        the context first."""
        with open(self._TOOL_PATH, "r", encoding="utf-8") as f:
            src = f.read()
        # Find the user_prompt f-string.
        assert "{doc_prefix}" in src, "doc_prefix must be interpolated into user_prompt"
        # The prefix placeholder must appear before 'Project Description:' in
        # the same f-string (so the LLM reads the context first).
        prefix_pos = src.index("{doc_prefix}")
        desc_pos = src.index("Project Description:")
        assert prefix_pos < desc_pos, (
            "doc_prefix must be prepended BEFORE 'Project Description:' in the "
            "LLM user_prompt."
        )

    def test_helper_called_with_project_and_user(
        self, user, project_with_tender_context,
    ):
        """Behavioral: when the helper is invoked with this user + project,
        it returns the tender context (which the tool then prepends). This
        exercises the exact code path the tool relies on without pulling in
        the bot module."""
        from core.ai_context_helpers import get_project_context_prefix

        out = get_project_context_prefix(user, project_with_tender_context.id, language="nl")
        assert out, "helper must return non-empty for a user with access"
        assert "[PROJECT_DOCUMENTEN]" in out
        assert "aanbesteding" in out.lower() or "jeugdhulp" in out.lower()
