"""Tests for backend/core/ai_usage.py + GET /api/v1/ai/usage/."""
import pytest
from datetime import date, timedelta
from unittest.mock import Mock

from django.core.cache import cache

from core import ai_usage


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


class TestRecord:
    def test_increments_daily_counter(self):
        ai_usage.record(42, 1000, provider="openai")
        assert ai_usage.get_day(42, date.today()) == 1000

    def test_subsequent_calls_accumulate(self):
        ai_usage.record(42, 100, provider="openai")
        ai_usage.record(42, 250, provider="openai")
        assert ai_usage.get_day(42, date.today()) == 350

    def test_no_op_without_company(self):
        # Shouldn't throw; shouldn't write anywhere.
        ai_usage.record(None, 100)
        ai_usage.record(0, 100)
        assert ai_usage.get_day(0, date.today()) == 0

    def test_no_op_for_zero_or_negative_tokens(self):
        ai_usage.record(42, 0)
        ai_usage.record(42, -50)
        assert ai_usage.get_day(42, date.today()) == 0

    def test_tracks_per_provider(self):
        ai_usage.record(42, 300, provider="openai")
        ai_usage.record(42, 500, provider="anthropic")
        summary = ai_usage.get_summary(42)
        assert summary["providers_today"]["openai"] == 300
        assert summary["providers_today"]["anthropic"] == 500


class TestGetSummary:
    def test_empty_summary_shape(self):
        s = ai_usage.get_summary(42)
        assert set(s.keys()) >= {
            "available", "used_today", "used_7d", "used_30d",
            "quota_monthly", "remaining_monthly",
            "daily_avg_7d", "estimated_days_left", "warn_level",
        }
        assert s["available"] is True
        assert s["used_today"] == 0
        assert s["warn_level"] == "ok"
        assert s["estimated_days_left"] is None

    def test_no_company_returns_available_false(self):
        s = ai_usage.get_summary(None)
        assert s["available"] is False

    def test_critical_when_usage_exhausts_quota(self, settings):
        settings.AI_MONTHLY_TOKEN_QUOTA = 1000
        # Push enough tokens today so avg*7 > remaining.
        ai_usage.record(42, 1500)
        s = ai_usage.get_summary(42)
        assert s["remaining_monthly"] == 0
        assert s["warn_level"] == "critical"

    def test_warning_level_computes_from_7day_avg(self, settings):
        settings.AI_MONTHLY_TOKEN_QUOTA = 10_000
        # Add some usage today to drive a non-zero daily average.
        ai_usage.record(42, 1000)
        s = ai_usage.get_summary(42)
        # avg = 1000/7 ≈ 143; remaining = 9000; days_left ≈ 63 → "ok"
        assert s["estimated_days_left"] is not None
        assert s["warn_level"] in ("ok", "warning", "critical")

    def test_warning_when_days_left_under_7(self, settings):
        settings.AI_MONTHLY_TOKEN_QUOTA = 1200
        ai_usage.record(42, 1000)  # avg ~143/day, remaining 200, days_left ≈ 1.4
        s = ai_usage.get_summary(42)
        assert s["warn_level"] in ("warning", "critical")


class TestResponseParsers:
    def test_openai_http_shape(self):
        assert ai_usage.tokens_from_openai_http({"usage": {"total_tokens": 1234}}) == 1234
        assert ai_usage.tokens_from_openai_http({}) == 0
        assert ai_usage.tokens_from_openai_http(None) == 0

    def test_anthropic_shape_with_object(self):
        resp = Mock()
        resp.usage = Mock(input_tokens=100, output_tokens=200)
        assert ai_usage.tokens_from_anthropic(resp) == 300

    def test_anthropic_shape_with_dict(self):
        resp = {"usage": {"input_tokens": 50, "output_tokens": 75}}
        assert ai_usage.tokens_from_anthropic(resp) == 125

    def test_langchain_message_shape(self):
        msg = Mock()
        msg.response_metadata = {"token_usage": {"total_tokens": 456}}
        msg.usage_metadata = {}
        assert ai_usage.tokens_from_langchain_message(msg) == 456


class TestEndpoint:
    """The endpoint view is invoked directly to avoid pulling in the full
    URL conf (which transitively imports bot.ai → langchain.agents, a heavy
    optional dep that may not be installed in every environment)."""

    def test_requires_auth(self, api_client):
        from core.ai_usage_views import ai_usage_summary
        from rest_framework.test import APIRequestFactory
        req = APIRequestFactory().get("/api/v1/ai/usage/")
        resp = ai_usage_summary(req)
        assert resp.status_code == 401

    def test_returns_summary_for_authenticated_user(self, user, company):
        from core.ai_usage_views import ai_usage_summary
        from rest_framework.test import APIRequestFactory, force_authenticate
        ai_usage.record(company.id, 2500, provider="openai")
        req = APIRequestFactory().get("/api/v1/ai/usage/")
        force_authenticate(req, user=user)
        resp = ai_usage_summary(req)
        assert resp.status_code == 200
        body = resp.data
        assert body["available"] is True
        assert body["used_today"] == 2500
        assert "warn_level" in body
