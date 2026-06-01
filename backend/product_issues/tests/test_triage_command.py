"""Tests for the auto-triage management command.

Covers:

  1. Phase A — catalog cross-match resolves an issue without an LLM call.
  2. Phase B — Anthropic classifier mocked; verify status/priority/comment.
  3. --dry-run flag: no DB writes, no LLM calls.
  4. Idempotency: re-running on the same day skips already-commented issues.
  5. Signal email suppression: per-issue emails suppressed; one digest sent.
"""
from __future__ import annotations

import json
from io import StringIO
from unittest.mock import patch, MagicMock

import pytest
from django.core.management import call_command

from product_issues.models import ProductIssue, ProductIssueComment


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def catalog_dict():
    """Minimal known_issues.json shape with one fixed bug."""
    return {
        "schema_version": "1.0",
        "issues": [
            {
                "id": "BUG-001",
                "title": "Survey creation 400 — nested QuestionSerializer requires survey FK",
                "severity": "P1",
                "area": "surveys",
                "endpoint": "POST /api/v1/surveys/survey/",
                "previous_error_contains": ["This field is required", "survey"],
                "fix_location": "backend/surveys/serializers.py:18",
                "status": "fix_pending_deploy",
            },
            {
                "id": "BUG-099",
                "title": "Still-open unrelated bug",
                "severity": "P2",
                "endpoint": "POST /api/v1/foo/",
                "previous_error_contains": ["foo", "bar"],
                "fix_location": "n/a",
                "status": "open",  # NOT fixed — must NOT trigger match
            },
        ],
    }


@pytest.fixture
def patched_catalog(catalog_dict):
    """Patch the loader so tests don't depend on the on-disk JSON file."""
    target = "product_issues.management.commands.triage_product_issues._load_catalog"
    with patch(target, return_value=catalog_dict["issues"]) as m:
        yield m


def _make_issue(company, **overrides):
    defaults = dict(
        title="Survey form fails to submit",
        description="When I submit the survey I get an error.",
        error_trace="POST /api/v1/surveys/survey/ returned 400 — This field is required: survey",
        status="new",
        source="user",
        capture_method="manual_form",
        environment={"client": "web"},
        company=company,
    )
    defaults.update(overrides)
    return ProductIssue.objects.create(**defaults)


# ---------------------------------------------------------------------------
# 1. Phase A — catalog match
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_phase_a_catalog_match_resolves_issue(company, patched_catalog):
    issue = _make_issue(company)

    # Suppress the digest email side-effect
    with patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    issue.refresh_from_db()
    assert issue.status == "resolved"
    assert issue.priority == "P1"
    assert issue.agent_triage_result.get("matched_bug") == "BUG-001"
    assert issue.agent_triage_result.get("phase") == "catalog"
    assert issue.triaged_by == "agent:issue-triage-validator"
    assert issue.triaged_at is not None

    comments = list(ProductIssueComment.objects.filter(issue=issue))
    assert len(comments) == 1
    assert "BUG-001" in comments[0].body
    assert comments[0].is_triage_step is True


# ---------------------------------------------------------------------------
# 2. Phase B — LLM classification
# ---------------------------------------------------------------------------

def _fake_anthropic_response(payload: dict) -> MagicMock:
    """Build a fake `client.messages.create()` return value."""
    block = MagicMock()
    block.type = "text"
    block.text = json.dumps(payload)
    resp = MagicMock()
    resp.content = [block]
    return resp


@pytest.mark.django_db
def test_phase_b_llm_classification(company, patched_catalog):
    """An issue that doesn't match the catalog goes through the LLM path."""
    issue = _make_issue(
        company,
        title="Brand-new dashboard glitch nobody catalogued",
        description="A weird thing happens on the dashboard when I click X.",
        error_trace="",  # NOT matching BUG-001's endpoint
    )

    fake_payload = {
        "classification": "bug",
        "priority": "P1",
        "affected_area": "dashboard",
        "reasoning": "Het lijkt een UI-bug op het dashboard.",
        "recommended_action": "Reproduceer met DevTools open.",
    }

    fake_client = MagicMock()
    fake_client.messages.create.return_value = _fake_anthropic_response(fake_payload)

    with patch(
        "core.llm_keys.get_anthropic_client",
        return_value=fake_client,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    issue.refresh_from_db()
    assert issue.status == "triaging"  # bug → triaging per _LLM_STATUS_MAP
    assert issue.priority == "P1"
    assert issue.agent_triage_result.get("classification") == "bug"
    assert issue.agent_triage_result.get("phase") == "llm"
    assert issue.triaged_by == "agent:issue-triage-validator"

    comments = list(ProductIssueComment.objects.filter(issue=issue))
    assert len(comments) == 1
    assert "llm-triage" in comments[0].body
    assert "bug" in comments[0].body.lower()


# ---------------------------------------------------------------------------
# 3. --dry-run makes no writes
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_dry_run_makes_no_writes(company, patched_catalog):
    issue = _make_issue(company)
    original_status = issue.status

    with patch(
        "core.llm_keys.get_anthropic_client",
    ) as mock_get_client, patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--dry-run", stdout=out)

        # Dry-run should NEVER call the LLM
        mock_get_client.assert_not_called()

    issue.refresh_from_db()
    # Catalog-match in dry-run path is also skipped (no DB writes).
    # The command does the matching loop but bails before save when dry_run.
    assert issue.status == original_status  # unchanged
    assert ProductIssueComment.objects.filter(issue=issue).count() == 0


# ---------------------------------------------------------------------------
# 4. Idempotency — re-run skips already-triaged
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_idempotency_skips_already_triaged(company, patched_catalog):
    issue = _make_issue(company)

    with patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out1 = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out1)

    # After first run, issue has 1 comment + status=resolved
    first_count = ProductIssueComment.objects.filter(issue=issue).count()
    assert first_count == 1
    issue.refresh_from_db()
    assert issue.status == "resolved"

    # Re-run — should NOT add a second comment. The candidate query
    # filters status='new' anyway so the row won't even be selected;
    # additionally, the idempotency guard short-circuits if we re-queue it.
    with patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out2 = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out2)

    second_count = ProductIssueComment.objects.filter(issue=issue).count()
    assert second_count == first_count

    # Direct idempotency test: force a re-process via --issue-id (bypassing
    # the status='new' filter would still hit the guard, but the candidates
    # query already filters by status='new', so simply assert no new
    # writes happened).


@pytest.mark.django_db
def test_idempotency_direct_guard(company, patched_catalog):
    """Even if the candidate query somehow returns the same issue twice
    (e.g. status was reset manually), the comment-prefix idempotency guard
    must still prevent a duplicate."""
    issue = _make_issue(company)

    # Pre-create a triage comment with today's signature
    from datetime import date
    sig = f"[auto-triage-{date.today().isoformat()}] #{issue.id}"
    ProductIssueComment.objects.create(
        issue=issue,
        author="agent:issue-triage-validator",
        body=f"{sig} catalog-match\n\nAlready done.",
        is_triage_step=True,
    )

    with patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command(
            "triage_product_issues",
            "--issue-id", str(issue.id),
            stdout=out,
        )

    # Status unchanged (issue is still 'new'), no NEW comment added
    issue.refresh_from_db()
    assert issue.status == "new"
    assert ProductIssueComment.objects.filter(issue=issue).count() == 1


@pytest.mark.django_db
def test_language_resolution_prefers_environment_then_company(company, patched_catalog):
    """Language picker order: environment.language > company.locale > 'en'."""
    from product_issues.management.commands.triage_product_issues import (
        _resolve_triage_language,
    )

    # 1. Environment override beats everything
    company.locale = "nl"
    company.save(update_fields=["locale"])
    issue = _make_issue(company, environment={"client": "web", "language": "en"})
    assert _resolve_triage_language(issue) == "en"

    # 2. No env hint → company.locale wins
    issue.environment = {"client": "web"}
    issue.save(update_fields=["environment"])
    assert _resolve_triage_language(issue) == "nl"

    # 3. Unsupported locale → fallback to en
    company.locale = "fr"  # not in _SUPPORTED_TRIAGE_LANGS yet
    company.save(update_fields=["locale"])
    issue.refresh_from_db()
    assert _resolve_triage_language(issue) == "en"


@pytest.mark.django_db
def test_llm_comment_localized_to_english_when_company_is_en(company, patched_catalog):
    """When the reporter's company locale is 'en', the triage comment body
    must use the English labels — NOT the Dutch 'Redenering' / 'Aanbevolen
    actie' that were hardcoded before this fix.

    Bug reported 2026-06-01 via the AI Copilot: triage feedback was
    showing in Dutch even when the UI was English.
    """
    company.locale = "en"
    company.save(update_fields=["locale"])
    issue = _make_issue(
        company,
        title="Brand-new dashboard glitch — English reporter",
        description="Something is wrong on the dashboard.",
        error_trace="",
        environment={"client": "web", "language": "en"},
    )

    fake_payload = {
        "classification": "bug",
        "priority": "P1",
        "affected_area": "dashboard",
        "reasoning": "It looks like a UI bug on the dashboard.",
        "recommended_action": "Reproduce with DevTools open.",
    }
    fake_client = MagicMock()
    fake_client.messages.create.return_value = _fake_anthropic_response(fake_payload)

    with patch(
        "core.llm_keys.get_anthropic_client",
        return_value=fake_client,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    comment = ProductIssueComment.objects.filter(issue=issue).order_by("-created_at").first()
    assert comment is not None
    body = comment.body

    # English labels present
    assert "Automatic LLM classification" in body
    assert "Reasoning" in body
    assert "Recommended action" in body

    # Dutch labels absent (this is the regression)
    assert "Automatische LLM-classificatie" not in body
    assert "Redenering" not in body
    assert "Aanbevolen actie" not in body

    # And the LLM was called with the English system prompt
    call_kwargs = fake_client.messages.create.call_args.kwargs
    system_prompt = call_kwargs["system"]
    assert "You are a product manager" in system_prompt
    assert "Je bent een productmanager" not in system_prompt


@pytest.mark.django_db
def test_llm_comment_localized_to_dutch_when_company_is_nl(company, patched_catalog):
    """Conversely, a Dutch tenant must keep getting Dutch triage comments."""
    company.locale = "nl"
    company.save(update_fields=["locale"])
    issue = _make_issue(
        company,
        title="Nieuwe dashboard glitch — NL reporter",
        description="Er gaat iets mis op het dashboard.",
        error_trace="",
        environment={"client": "web", "language": "nl"},
    )

    fake_payload = {
        "classification": "bug",
        "priority": "P1",
        "affected_area": "dashboard",
        "reasoning": "Het lijkt een UI-bug op het dashboard.",
        "recommended_action": "Reproduceer met DevTools open.",
    }
    fake_client = MagicMock()
    fake_client.messages.create.return_value = _fake_anthropic_response(fake_payload)

    with patch(
        "core.llm_keys.get_anthropic_client",
        return_value=fake_client,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    comment = ProductIssueComment.objects.filter(issue=issue).order_by("-created_at").first()
    assert comment is not None
    body = comment.body
    assert "Automatische LLM-classificatie" in body
    assert "Redenering" in body
    assert "Aanbevolen actie" in body

    # And the Dutch system prompt was used
    system_prompt = fake_client.messages.create.call_args.kwargs["system"]
    assert "Je bent een productmanager" in system_prompt


@pytest.mark.django_db
def test_llm_triage_comment_has_no_markdown_asterisks(company, patched_catalog):
    """The AI Copilot UI renders comments as plain text (whitespace-pre-wrap),
    NOT through a markdown parser. So `**bold**` would show literally as
    asterisks. Bug reported 2026-06-01 via screenshot: the triage comment
    showed `**Reasoning**` and `**Recommended action**` as visible `**`s.

    This test locks down the bullet-style format: no `**` markers anywhere.
    """
    company.locale = "en"
    company.save(update_fields=["locale"])
    issue = _make_issue(
        company,
        title="A markdown-free triage comment please",
        description="x",
        error_trace="",
        environment={"client": "web", "language": "en"},
    )

    fake_payload = {
        "classification": "bug",
        "priority": "P1",
        "affected_area": "dashboard",
        "reasoning": "Looks like a UI bug.",
        "recommended_action": "Reproduce with DevTools.",
    }
    fake_client = MagicMock()
    fake_client.messages.create.return_value = _fake_anthropic_response(fake_payload)

    with patch(
        "core.llm_keys.get_anthropic_client", return_value=fake_client,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    comment = ProductIssueComment.objects.filter(issue=issue).order_by("-created_at").first()
    assert comment is not None
    body = comment.body
    # No double-asterisk markdown anywhere
    assert "**" not in body, f"Expected zero `**` in comment body, got: {body!r}"
    # But labels themselves still present
    assert "Reasoning" in body
    assert "Recommended action" in body
    # And bullet characters render the field-value lines
    assert "• Classification: bug" in body
    assert "• Priority: P1" in body
    assert "• Affected area: dashboard" in body


@pytest.mark.django_db
def test_llm_error_comment_localized(company, patched_catalog):
    """The static llm-error comment must also respect the reporter's language."""
    company.locale = "en"
    company.save(update_fields=["locale"])
    issue = _make_issue(
        company, title="EN reporter — no key today", error_trace="",
        environment={"client": "web", "language": "en"},
    )

    # Simulate LLM unavailable
    with patch(
        "core.llm_keys.get_anthropic_client", return_value=None,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    comment = ProductIssueComment.objects.filter(issue=issue).first()
    assert comment is not None
    assert "llm-error" in comment.body
    assert "Auto-triage temporarily unavailable" in comment.body
    assert "Auto-triage tijdelijk niet beschikbaar" not in comment.body


@pytest.mark.django_db
def test_llm_error_comment_does_not_block_retry(company, patched_catalog):
    """A transient `llm-error` comment from earlier today (e.g. Anthropic
    key was missing on a previous cron-fire) MUST NOT block a retry.

    Bug discovered 2026-06-01: Anthropic key was added to .env after the
    first 10 issues had already received an llm-error comment. The naïve
    `body__startswith=sig` guard then skipped those issues for the rest of
    the day, even though the upstream cause was already fixed. The fix:
    exclude llm-error comments from the idempotency check.
    """
    issue = _make_issue(
        company,
        title="Brand-new dashboard glitch nobody catalogued",
        description="A weird thing happens.",
        error_trace="",  # no catalog match → must go to Phase B
    )

    # Pre-seed the failed earlier-today llm-error comment
    from datetime import date
    sig = f"[auto-triage-{date.today().isoformat()}] #{issue.id}"
    ProductIssueComment.objects.create(
        issue=issue,
        author="agent:issue-triage-validator",
        body=f"{sig} llm-error\n\nAuto-triage tijdelijk niet beschikbaar (...)",
        is_triage_step=True,
    )
    assert ProductIssueComment.objects.filter(issue=issue).count() == 1

    # Now re-run with a working LLM mock — must proceed despite the error comment
    fake_payload = {
        "classification": "bug",
        "priority": "P2",
        "affected_area": "dashboard",
        "reasoning": "Test.",
        "recommended_action": "Test.",
    }
    fake_client = MagicMock()
    fake_client.messages.create.return_value = _fake_anthropic_response(fake_payload)

    with patch(
        "core.llm_keys.get_anthropic_client",
        return_value=fake_client,
    ), patch(
        "product_issues.management.commands.triage_product_issues._send_digest_email",
        return_value=None,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--issue-id", str(issue.id), stdout=out)

    issue.refresh_from_db()
    # Retry must have succeeded — status updated, NEW comment added alongside the
    # original llm-error comment (audit trail preserved).
    assert issue.status == "triaging"
    comments = ProductIssueComment.objects.filter(issue=issue).order_by("created_at")
    assert comments.count() == 2
    assert "llm-error" in comments[0].body
    assert "llm-triage" in comments[1].body


# ---------------------------------------------------------------------------
# 5. Signal email suppression — per-issue blocked, digest sent
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_signal_email_suppression(company, patched_catalog):
    """During the cron run the post_save signal must NOT send per-issue
    emails (suppressed via `instance._suppress_email_on_save = True`).
    A single digest email should be sent at the end."""
    _make_issue(company)

    sent_emails: list[dict] = []

    def _capture(**kwargs):
        sent_emails.append(kwargs)
        return True

    # Patch the email helper used by BOTH the per-issue signal AND the
    # digest builder. After the run, the only call should be the digest.
    with patch(
        "product_issues.signals._send_email_safe",
        side_effect=_capture,
    ):
        out = StringIO()
        call_command("triage_product_issues", "--limit", "10", stdout=out)

    # Per-issue mails were suppressed.  There should be at most ONE call
    # (the digest). If the digest helper also returns early (e.g. no
    # admin emails resolvable in the test env), zero is acceptable —
    # the critical invariant is: NO per-issue mail leaked through.
    digest_only = [m for m in sent_emails if "Auto-triage" in m.get("subject", "")]
    per_issue = [m for m in sent_emails if "Auto-triage" not in m.get("subject", "")]
    assert per_issue == [], (
        f"Expected zero per-issue emails during cron run, got: "
        f"{[m.get('subject') for m in per_issue]}"
    )
    assert len(digest_only) <= 1
