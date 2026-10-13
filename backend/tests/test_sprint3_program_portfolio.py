"""Tests for Sprint 3 — ProgramAIContext + PortfolioAIContext.

Covers:
- Model save + MAX_TEXT clipping (S3-01 / S3-02)
- Endpoint shapes GET/POST + create/update flow (S3-03 / S3-04)
- Tenant isolation on endpoints (user from another company → 404)
- Helpers get_program_context_prefix / get_portfolio_context_prefix:
  resolution rules, NL/EN wording, enabled/disabled flag, 8000-char cap,
  cross-tenant returns empty (S3-05)
- governance.ai_generate_text aggregates program_id + portfolio_id prefixes
  (S3-09; stubbed OpenAI call — only inspects the system_prompt that was
  built).
"""
from __future__ import annotations

import uuid
from unittest.mock import Mock, patch

import pytest
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Company
from governance.models import Portfolio, PortfolioAIContext
from governance.ai_context_views import portfolio_ai_context
from programs.models import Program, ProgramAIContext
from programs.ai_context_views import program_ai_context

from core.ai_context_helpers import (
    get_program_context_prefix,
    get_portfolio_context_prefix,
)


@pytest.fixture
def rf():
    """APIRequestFactory lets us test view functions without going through
    the project URL dispatcher, which currently blows up on an unrelated
    bot.ai import in local dev."""
    return APIRequestFactory()


def _call_program_view(rf, user, pk, method="GET", data=None):
    if method == "GET":
        req = rf.get(f"/api/v1/programs/{pk}/ai-context/")
    else:
        req = rf.post(
            f"/api/v1/programs/{pk}/ai-context/", data or {}, format="json",
        )
    force_authenticate(req, user=user)
    return program_ai_context(req, pk=pk)


def _call_portfolio_view(rf, user, pk, method="GET", data=None):
    if method == "GET":
        req = rf.get(f"/api/v1/governance/portfolios/{pk}/ai-context/")
    else:
        req = rf.post(
            f"/api/v1/governance/portfolios/{pk}/ai-context/",
            data or {}, format="json",
        )
    force_authenticate(req, user=user)
    return portfolio_ai_context(req, pk=pk)


# ---------------------------------------------------------------- fixtures

@pytest.fixture
def program_row(db, company, user):
    """A Program in the user's company."""
    return Program.objects.create(
        name="Programma Zorg 2027",
        description="Programma voor Wmo-ketenvernieuwing",
        methodology="msp",
        company=company,
        created_by=user,
        program_manager=user,
    )


@pytest.fixture
def portfolio_row(db, company, user):
    """A Portfolio in the user's company."""
    return Portfolio.objects.create(
        name="Strategisch portfolio 2027",
        description="Portfolio voor zorg-innovatie",
        company=company,
        owner=user,
    )


@pytest.fixture
def program_with_context(db, program_row):
    ProgramAIContext.objects.create(
        program=program_row,
        enabled=True,
        extracted_text="Programma-blueprint: ketenvernieuwing Wmo-trajecten Heerenveen.",
        source_files=[{"name": "Blueprint.pdf", "size": 2048, "pages": 60}],
    )
    return program_row


@pytest.fixture
def portfolio_with_context(db, portfolio_row):
    PortfolioAIContext.objects.create(
        portfolio=portfolio_row,
        enabled=True,
        extracted_text="Portfolio-strategie: investering in digitale zorgtransformatie.",
        source_files=[{"name": "Strategie2027.pdf", "size": 4096, "pages": 25}],
    )
    return portfolio_row


# ================================================================= models

class TestProgramAIContextModel:
    def test_save_clips_at_max_text(self, db, program_row):
        huge = "X" * (ProgramAIContext.MAX_TEXT + 10_000)
        aic = ProgramAIContext.objects.create(
            program=program_row, extracted_text=huge, enabled=True,
        )
        aic.refresh_from_db()
        assert len(aic.extracted_text) == ProgramAIContext.MAX_TEXT

    def test_str_and_defaults(self, db, program_row):
        aic = ProgramAIContext.objects.create(program=program_row)
        assert "program=" in str(aic)
        assert aic.enabled is True
        assert aic.source_files == []
        assert aic.extracted_text == ""


class TestPortfolioAIContextModel:
    def test_save_clips_at_max_text(self, db, portfolio_row):
        huge = "Y" * (PortfolioAIContext.MAX_TEXT + 5_000)
        aic = PortfolioAIContext.objects.create(
            portfolio=portfolio_row, extracted_text=huge, enabled=True,
        )
        aic.refresh_from_db()
        assert len(aic.extracted_text) == PortfolioAIContext.MAX_TEXT

    def test_str_and_defaults(self, db, portfolio_row):
        aic = PortfolioAIContext.objects.create(portfolio=portfolio_row)
        assert "portfolio=" in str(aic)
        assert aic.enabled is True


# =============================================================== endpoints

class TestProgramAIContextEndpoint:
    def test_get_returns_exists_false_when_no_row(self, rf, user, program_row):
        resp = _call_program_view(rf, user, program_row.id, "GET")
        assert resp.status_code == 200
        assert resp.data["exists"] is False
        assert resp.data["chars"] == 0

    def test_post_creates_context(self, rf, user, program_row):
        resp = _call_program_view(rf, user, program_row.id, "POST", {
            "extracted_text": "programma-doc inhoud",
            "enabled": True,
            "source_files": [{"name": "doc.pdf", "size": 100, "pages": 3}],
        })
        assert resp.status_code == 200
        assert resp.data["exists"] is True
        assert resp.data["chars"] == len("programma-doc inhoud")
        assert resp.data["source_files"][0]["name"] == "doc.pdf"

    def test_post_updates_existing_row(self, rf, user, program_with_context):
        resp = _call_program_view(rf, user, program_with_context.id, "POST", {
            "extracted_text": "nieuwe programma-inhoud",
            "enabled": False,
            "source_files": [],
        })
        assert resp.status_code == 200
        assert resp.data["enabled"] is False
        assert resp.data["chars"] == len("nieuwe programma-inhoud")

    def test_toggle_only_keeps_text(self, rf, user, program_with_context):
        """POST with empty text + enabled=False should keep the text."""
        resp = _call_program_view(
            rf, user, program_with_context.id, "POST", {"enabled": False},
        )
        assert resp.status_code == 200
        aic = ProgramAIContext.objects.get(program=program_with_context)
        assert aic.enabled is False
        assert "ketenvernieuwing" in aic.extracted_text

    def test_cross_tenant_user_gets_404(self, rf, program_row, second_company):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="otheruser", email="other@elsewhere.com", password="pw",
        )
        other.role = "pm"
        other.company = second_company
        other.save()
        resp = _call_program_view(rf, other, program_row.id, "GET")
        assert resp.status_code == 404


class TestPortfolioAIContextEndpoint:
    def test_get_returns_exists_false_when_no_row(self, rf, user, portfolio_row):
        resp = _call_portfolio_view(rf, user, portfolio_row.id, "GET")
        assert resp.status_code == 200
        assert resp.data["exists"] is False

    def test_post_creates_context(self, rf, user, portfolio_row):
        resp = _call_portfolio_view(rf, user, portfolio_row.id, "POST", {
            "extracted_text": "portfolio strategie-doc",
            "enabled": True,
            "source_files": [{"name": "p.pdf", "size": 10, "pages": 1}],
        })
        assert resp.status_code == 200
        assert resp.data["exists"] is True
        assert resp.data["chars"] == len("portfolio strategie-doc")

    def test_cross_tenant_user_gets_404(self, rf, portfolio_row, second_company):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="othergov", email="othergov@elsewhere.com", password="pw",
        )
        other.role = "pm"
        other.company = second_company
        other.save()
        resp = _call_portfolio_view(rf, other, portfolio_row.id, "GET")
        assert resp.status_code == 404


# ================================================================= helpers

class TestProgramHelper:
    def test_returns_empty_for_anonymous(self):
        anon = Mock(is_authenticated=False)
        assert get_program_context_prefix(anon, 1) == ""

    def test_returns_empty_for_missing_program(self, user):
        assert get_program_context_prefix(user, 99999) == ""

    def test_returns_empty_for_non_numeric_id(self, user):
        assert get_program_context_prefix(user, "abc") == ""

    def test_nl_wording(self, user, program_with_context):
        out = get_program_context_prefix(user, program_with_context.id, language="nl")
        assert "[PROGRAMMA_DOCUMENTEN]" in out
        assert "Blueprint.pdf" in out
        assert "ketenvernieuwing" in out

    def test_en_wording(self, user, program_with_context):
        out = get_program_context_prefix(user, program_with_context.id, language="en")
        assert "[PROGRAM_DOCUMENTS]" in out
        assert "authoritative source" in out

    def test_disabled_toggle_returns_empty(self, user, program_row):
        ProgramAIContext.objects.create(
            program=program_row, enabled=False,
            extracted_text="should not appear",
        )
        assert get_program_context_prefix(user, program_row.id) == ""

    def test_8000_char_cap(self, user, program_row):
        ProgramAIContext.objects.create(
            program=program_row, enabled=True, extracted_text="X" * 20_000,
        )
        out = get_program_context_prefix(user, program_row.id)
        assert out.count("X") == 8000

    def test_tenant_isolation(self, program_with_context, second_company):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="otherprog", email="otherp@elsewhere.com", password="pw",
        )
        other.role = "pm"
        other.company = second_company
        other.save()
        assert get_program_context_prefix(other, program_with_context.id) == ""

    def test_superuser_sees_any(self, admin_user, program_with_context):
        out = get_program_context_prefix(admin_user, program_with_context.id)
        assert "ketenvernieuwing" in out


class TestPortfolioHelper:
    def test_returns_empty_for_anonymous(self):
        anon = Mock(is_authenticated=False)
        assert get_portfolio_context_prefix(anon, uuid.uuid4()) == ""

    def test_returns_empty_for_missing_portfolio(self, user):
        assert get_portfolio_context_prefix(user, uuid.uuid4()) == ""

    def test_returns_empty_for_non_uuid(self, user):
        assert get_portfolio_context_prefix(user, "not-a-uuid") == ""
        assert get_portfolio_context_prefix(user, 12345) == ""

    def test_nl_wording(self, user, portfolio_with_context):
        out = get_portfolio_context_prefix(user, portfolio_with_context.id, language="nl")
        assert "[PORTFOLIO_DOCUMENTEN]" in out
        assert "Strategie2027.pdf" in out

    def test_en_wording(self, user, portfolio_with_context):
        out = get_portfolio_context_prefix(user, portfolio_with_context.id, language="en")
        assert "[PORTFOLIO_DOCUMENTS]" in out

    def test_disabled_toggle_returns_empty(self, user, portfolio_row):
        PortfolioAIContext.objects.create(
            portfolio=portfolio_row, enabled=False, extracted_text="hidden",
        )
        assert get_portfolio_context_prefix(user, portfolio_row.id) == ""

    def test_8000_char_cap(self, user, portfolio_row):
        PortfolioAIContext.objects.create(
            portfolio=portfolio_row, enabled=True, extracted_text="Z" * 20_000,
        )
        out = get_portfolio_context_prefix(user, portfolio_row.id)
        assert out.count("Z") == 8000

    def test_tenant_isolation(self, portfolio_with_context, second_company):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.create_user(
            username="otherportfolio", email="op@elsewhere.com", password="pw",
        )
        other.role = "pm"
        other.company = second_company
        other.save()
        assert get_portfolio_context_prefix(other, portfolio_with_context.id) == ""

    def test_superuser_sees_any(self, admin_user, portfolio_with_context):
        out = get_portfolio_context_prefix(admin_user, portfolio_with_context.id)
        assert "zorgtransformatie" in out


# ====================================================== ai_generate_text wiring

class TestAiGenerateTextMultiLevelContext:
    """S3-09 — ai_generate_text aggregates portfolio + program + project
    context prefixes in the system prompt sent to the LLM."""

    def _patched_openai_capture(self, captured):
        """Return a stub for requests.post that records the payload and
        returns a canned 200 'ok' response. The 'content' chat path is what
        ai_generate_text consumes."""
        class _Resp:
            status_code = 200
            def raise_for_status(self):
                return None
            def json(self):
                return {
                    "choices": [{"message": {"content": "stubbed response"}}],
                    "usage": {"prompt_tokens": 1, "completion_tokens": 1},
                }
        def _fake_post(url, headers=None, json=None, timeout=None):
            captured.append(json)
            return _Resp()
        return _fake_post

    def test_program_and_portfolio_prefixes_are_included(
        self, rf, user, program_with_context, portfolio_with_context, settings,
    ):
        # Force the "no AI configured" short-circuit NOT to run.
        settings.OPENAI_API_KEY = "sk-" + ("a" * 40)

        from governance.views import ai_generate_text

        req = rf.post(
            "/api/v1/governance/ai/generate/",
            {
                "prompt": "Draft agenda",
                "program_id": program_with_context.id,
                "portfolio_id": str(portfolio_with_context.id),
            },
            format="json",
        )
        force_authenticate(req, user=user)

        captured = []
        # ai_generate_text imports requests at call-time inside the function
        # body (`import requests as http_requests`), so patch requests.post
        # at the module where it will be looked up — top-level requests.
        with patch(
            "requests.post",
            side_effect=self._patched_openai_capture(captured),
        ):
            resp = ai_generate_text(req)

        assert resp.status_code == 200
        assert len(captured) == 1, "upstream LLM call was not made"
        system_msg = captured[0]["messages"][0]["content"]
        assert "PORTFOLIO_DOCUMENT" in system_msg  # NL or EN variant
        assert "PROGRAMMA_DOCUMENT" in system_msg or "PROGRAM_DOCUMENT" in system_msg
