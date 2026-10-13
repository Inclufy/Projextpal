"""Tests for backend/core/i18n_ai.py — resolve_ui_language + helpers."""
import pytest
from unittest.mock import Mock

from core.i18n_ai import (
    resolve_ui_language,
    language_directive,
    prepend_language,
)


def _req(body=None, headers=None):
    r = Mock()
    r.data = body or {}
    r.headers = headers or {}
    return r


class TestResolveUiLanguage:
    def test_body_language_wins(self):
        req = _req(body={"language": "en"}, headers={"X-UI-Language": "nl"})
        assert resolve_ui_language(req) == "en"

    def test_header_fallback_when_no_body(self):
        req = _req(headers={"X-UI-Language": "fr"})
        assert resolve_ui_language(req) == "fr"

    def test_default_nl_when_nothing_set(self):
        assert resolve_ui_language(_req()) == "nl"

    def test_unsupported_language_falls_back_to_nl(self):
        req = _req(body={"language": "zz"})
        assert resolve_ui_language(req) == "nl"

    def test_case_insensitive(self):
        req = _req(body={"language": "NL"})
        assert resolve_ui_language(req) == "nl"

    def test_empty_body_language_falls_through_to_header(self):
        req = _req(body={"language": ""}, headers={"X-UI-Language": "en"})
        assert resolve_ui_language(req) == "en"

    def test_broken_request_data_returns_default(self):
        r = Mock()
        # getattr(r, 'data', None) returns a Mock; .get() returns a Mock
        # — the helper should still fall back cleanly.
        del r.data
        r.headers = {}
        assert resolve_ui_language(r) == "nl"


class TestLanguageDirective:
    def test_nl_contains_dutch_wording(self):
        d = language_directive("nl")
        assert "Nederlands" in d

    def test_en_contains_english_wording(self):
        d = language_directive("en")
        assert "English" in d

    def test_fr_contains_french_wording(self):
        d = language_directive("fr")
        assert "français" in d

    def test_unknown_falls_back_to_english(self):
        d = language_directive("xx")
        assert "English" in d


class TestPrependLanguage:
    def test_adds_directive_above_existing_system(self):
        out = prepend_language("You are helpful.", "en")
        assert out.startswith("[LANGUAGE INSTRUCTION")
        assert out.endswith("You are helpful.")
        assert "\n\n" in out

    def test_empty_system_returns_directive_only(self):
        out = prepend_language("", "nl")
        assert "Nederlands" in out
        assert "\n\n" not in out
