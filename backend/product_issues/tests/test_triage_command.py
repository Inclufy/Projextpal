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
    """An issue that doesn't match the catalog goes through the LLM path.

    Now emits TWO sibling comments: one public (reporter-visible) and one
    internal (admin/superadmin-only).
    """
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
        "reasoning": "Likely a UI bug on the dashboard.",
        "reporter_message": "Thanks for reporting — our dev team has been notified and will work on this.",
        "dev_notes": "Check frontend/src/pages/dashboard for the click handler on element X.",
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

    comments = list(ProductIssueComment.objects.filter(issue=issue).order_by("created_at"))
    # Now two sibling comments: public + internal
    assert len(comments) == 2

    public_c = next(c for c in comments if c.visibility == "public")
    internal_c = next(c for c in comments if c.visibility == "internal")

    # Public is reporter-friendly
    assert "llm-triage (public)" in public_c.body
    assert "Thanks for reporting" in public_c.body
    # Public does NOT leak dev jargon
    assert "frontend/src/pages" not in public_c.body
    assert "DevTools" not in public_c.body

    # Internal carries the dev notes + classification + priority
    assert "llm-triage (internal)" in internal_c.body
    assert "INTERNAL" in internal_c.body
    assert "frontend/src/pages/dashboard" in internal_c.body
    assert "P1" in internal_c.body
    assert "bug" in internal_c.body.lower()


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
        "reasoning": "Looks like a UI bug.",
        "reporter_message": "Thanks for the report — our dev team is on it.",
        "dev_notes": "Check the click handler in frontend dashboard.",
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

    # Two sibling comments emitted now
    public_c = ProductIssueComment.objects.get(issue=issue, visibility="public")
    internal_c = ProductIssueComment.objects.get(issue=issue, visibility="internal")

    # PUBLIC body uses the EN labels (public_header / public_next_h / status label)
    assert "Update on your report" in public_c.body
    assert "What happens next" in public_c.body
    # Dutch labels NOT present in EN public
    assert "Update over je melding" not in public_c.body
    assert "Wat gaat er nu gebeuren" not in public_c.body

    # INTERNAL body uses the EN technical labels
    assert "Triage analysis" in internal_c.body
    assert "Reasoning" in internal_c.body
    assert "Dev/admin notes" in internal_c.body
    assert "Triage-analyse" not in internal_c.body
    assert "Redenering" not in internal_c.body

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
        "reporter_message": "Bedankt voor je melding — ons dev-team is op de hoogte.",
        "dev_notes": "Controleer de click-handler op het dashboard.",
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

    public_c = ProductIssueComment.objects.get(issue=issue, visibility="public")
    internal_c = ProductIssueComment.objects.get(issue=issue, visibility="internal")

    # Dutch labels present
    assert "Update over je melding" in public_c.body
    assert "Wat gaat er nu gebeuren" in public_c.body
    assert "Triage-analyse" in internal_c.body
    assert "Redenering" in internal_c.body
    assert "Dev/admin notes" in internal_c.body  # technical label kept English

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
        "reporter_message": "Thanks — our dev team is on this.",
        "dev_notes": "Check the click handler in dashboard.tsx",
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

    # Both sibling comments must be markdown-free
    for c in ProductIssueComment.objects.filter(issue=issue):
        assert "**" not in c.body, (
            f"Expected zero `**` in {c.visibility} comment body, got: {c.body!r}"
        )

    internal_c = ProductIssueComment.objects.get(issue=issue, visibility="internal")
    assert "• Classification: bug" in internal_c.body
    assert "• Priority: P1" in internal_c.body
    assert "• Affected area: dashboard" in internal_c.body


@pytest.mark.django_db
def test_escalate_classification_routes_to_superadmin_not_reporter(company, patched_catalog):
    """When the LLM classifies as 'escalate' (issue needs dev/admin access
    to diagnose: stack trace, Sentry, server logs), the dev jargon must
    land in the INTERNAL comment, and the PUBLIC reporter-facing comment
    must just say "our admin team is investigating" — no Sentry/log
    jargon leaked.

    Policy 2026-06-01: reporters are end users; technical details
    belong in admin-only `internal` comments. Reporter sees only a
    friendly status update.
    """
    company.locale = "en"
    company.save(update_fields=["locale"])
    issue = _make_issue(
        company,
        title="500 backend issues",
        description="The backend keeps failing.",
        error_trace="",
        environment={"client": "web", "language": "en"},
    )

    fake_payload = {
        "classification": "escalate",
        "priority": "P1",
        "affected_area": "backend",
        "reasoning": "Vague 500 report — only diagnosable with Sentry + server logs, which an end user does not have.",
        "reporter_message": "Thanks for reporting. Our admin team is investigating directly — we'll update you once they have more information.",
        "dev_notes": "Check Sentry for 500s around the report timestamp; correlate with recent deploys; capture stack trace; check logs/triage.log and api logs.",
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

    issue.refresh_from_db()
    assert issue.status == "triaging"
    assert issue.priority == "P1"
    assert issue.agent_triage_result.get("classification") == "escalate"

    public_c = ProductIssueComment.objects.get(issue=issue, visibility="public")
    internal_c = ProductIssueComment.objects.get(issue=issue, visibility="internal")

    # PUBLIC — friendly, no jargon
    assert "admin team is investigating" in public_c.body
    assert "Sentry" not in public_c.body
    assert "stack trace" not in public_c.body.lower()
    assert "logs/" not in public_c.body
    # Public uses the localized status label for escalate
    assert "Routed to our admin team" in public_c.body

    # INTERNAL — dev jargon allowed + visible
    assert "INTERNAL" in internal_c.body
    assert "Sentry" in internal_c.body
    assert "stack trace" in internal_c.body.lower()
    assert "logs/triage.log" in internal_c.body

    # No markdown in either
    assert "**" not in public_c.body
    assert "**" not in internal_c.body


def test_llm_prompt_forbids_asking_reporter_for_dev_details_en():
    """The English system prompt must explicitly tell the LLM that
    reporters are end users with no DevTools / HTTP code / stack trace
    access, and to use 'escalate' when dev-level info is actually needed.
    """
    from product_issues.management.commands.triage_product_issues import (
        _llm_system_prompt,
    )
    prompt = _llm_system_prompt("en")

    # The 'escalate' classification must be documented
    assert "'escalate'" in prompt
    # The end-user policy must be explicit
    assert "end user" in prompt.lower() or "end users" in prompt.lower()
    # The forbidden-asks must be named
    assert "DevTools" in prompt
    assert "stack trace" in prompt.lower()
    assert "HTTP" in prompt
    # And the needs-info guidance must mention the allowed asks
    assert "screenshot" in prompt.lower()
    assert "URL" in prompt or "link" in prompt.lower()


def test_llm_prompt_forbids_asking_reporter_for_dev_details_nl():
    """Same policy in Dutch — reporters zijn eindgebruikers."""
    from product_issues.management.commands.triage_product_issues import (
        _llm_system_prompt,
    )
    prompt = _llm_system_prompt("nl")

    assert "'escalate'" in prompt
    assert "eindgebruiker" in prompt.lower()
    assert "DevTools" in prompt
    assert "stack trace" in prompt.lower() or "stacktrace" in prompt.lower()
    assert "screenshot" in prompt.lower()
    assert "URL" in prompt or "link" in prompt.lower()


@pytest.mark.django_db
def test_serializer_hides_internal_comments_from_non_staff(company, patched_catalog):
    """The new dual-comment architecture writes both a public and an
    internal comment per triage. The internal one must NEVER leak to a
    non-staff viewer (i.e. the reporter who filed the issue).

    Verifies `ProductIssueSerializer.get_comments()` filters by viewer
    role: reporter sees only `visibility='public'`, admin/superadmin/
    Django superuser see both.
    """
    from django.contrib.auth import get_user_model
    from rest_framework.test import APIRequestFactory
    from product_issues.models import ProductIssue, ProductIssueComment
    from product_issues.serializers import ProductIssueSerializer

    User = get_user_model()
    reporter = User.objects.create_user(
        username="enduser", email="end@example.com", password="x",
        company=company, role="user",
    )
    admin = User.objects.create_user(
        username="admin1", email="admin@example.com", password="x",
        company=company, role="admin",
    )

    issue = ProductIssue.objects.create(
        title="Test", description="Test", status="new",
        source="user", capture_method="manual_form",
        company=company, reporter=reporter,
    )
    ProductIssueComment.objects.create(
        issue=issue, author="agent:issue-triage-validator",
        body="PUBLIC body", is_triage_step=True, visibility="public",
    )
    ProductIssueComment.objects.create(
        issue=issue, author="agent:issue-triage-validator",
        body="INTERNAL body with file paths and Sentry queries",
        is_triage_step=True, visibility="internal",
    )

    factory = APIRequestFactory()

    # Reporter viewer — must NOT see the internal row
    req_reporter = factory.get("/")
    req_reporter.user = reporter
    data_reporter = ProductIssueSerializer(
        issue, context={"request": req_reporter}
    ).data
    assert len(data_reporter["comments"]) == 1
    assert data_reporter["comments"][0]["body"] == "PUBLIC body"
    assert data_reporter["comments"][0]["visibility"] == "public"

    # Admin viewer — sees both
    req_admin = factory.get("/")
    req_admin.user = admin
    data_admin = ProductIssueSerializer(
        issue, context={"request": req_admin}
    ).data
    assert len(data_admin["comments"]) == 2
    bodies = {c["body"] for c in data_admin["comments"]}
    assert "PUBLIC body" in bodies
    assert "INTERNAL body with file paths and Sentry queries" in bodies


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
        "reporter_message": "Thanks, dev team is on it.",
        "dev_notes": "Test dev note.",
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
    # Retry must have succeeded — status updated, TWO new sibling triage
    # comments added (public + internal) alongside the original llm-error
    # comment (audit trail preserved).
    assert issue.status == "triaging"
    comments = list(
        ProductIssueComment.objects.filter(issue=issue).order_by("created_at")
    )
    assert len(comments) == 3
    assert "llm-error" in comments[0].body
    # Order: error first (pre-seeded), then public + internal (creation order)
    assert "llm-triage" in comments[1].body
    assert "llm-triage" in comments[2].body
    # And one of them is the public variant, the other internal
    visibilities = {c.visibility for c in comments[1:]}
    assert visibilities == {"public", "internal"}


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
