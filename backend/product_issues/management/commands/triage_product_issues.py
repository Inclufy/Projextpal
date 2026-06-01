"""
Automated ProductIssue triage — `python manage.py triage_product_issues`.

Designed to run on a 30-min cron (see scripts/cron-triage.sh). Each run:

  * Phase A — Catalog cross-match (cheap, no LLM).
    Reads tests/regression/known_issues.json and tries to match each
    open ProductIssue against a catalogued bug by endpoint substring
    or keyword overlap. If a catalog entry's status is `fixed_verified`
    or `fix_pending_deploy` we resolve the issue + credit the fix in
    a Dutch comment.

  * Phase B — LLM classification (Anthropic).
    For issues NOT matched by Phase A we ask Sonnet to return a strict
    JSON blob with classification / priority / affected_area / reasoning
    / recommended_action, then map the result to a ProductIssue
    status + priority + comment.

Idempotency: each comment starts with `[auto-triage-YYYY-MM-DD] #<issue-id>`
so a re-run on the same calendar day skips already-commented issues.

Email-storm prevention: the signal handler in product_issues/signals.py
honours `instance._suppress_email_on_save = True` and skips the per-issue
mail. After the cron run finishes we send ONE digest email to admins
summarising what changed in the run.

Flags
-----
  --dry-run   : no DB writes, no LLM calls (read-only audit).
  --limit N   : cap on issues processed per run (default 50).
  --issue-id N: process exactly one issue (overrides --limit).
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date
from pathlib import Path
from typing import Any, Optional

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from product_issues.models import ProductIssue, ProductIssueComment


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Catalog loader
# ---------------------------------------------------------------------------

def _catalog_path() -> Path:
    """Resolve tests/regression/known_issues.json regardless of CWD.

    Search order:
      1. settings.BASE_DIR / .. / tests/regression/known_issues.json
         (repo-root tests dir — production layout on Mac Studio)
      2. settings.BASE_DIR / tests/regression/known_issues.json
         (in case BASE_DIR is the repo root, not the backend dir)
      3. /app/tests/regression/known_issues.json (Docker volume mount)
    """
    base = Path(getattr(settings, "BASE_DIR", Path.cwd()))
    candidates = [
        base.parent / "tests" / "regression" / "known_issues.json",
        base / "tests" / "regression" / "known_issues.json",
        Path("/app/tests/regression/known_issues.json"),
    ]
    for p in candidates:
        if p.exists():
            return p
    # Return the first candidate so the error message is informative
    return candidates[0]


def _load_catalog() -> list[dict]:
    p = _catalog_path()
    if not p.exists():
        logger.warning("Triage: catalog not found at %s — Phase A disabled", p)
        return []
    try:
        with p.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        return list(data.get("issues") or [])
    except Exception as exc:
        logger.warning("Triage: catalog parse failed (%s): %s", p, exc)
        return []


# ---------------------------------------------------------------------------
# Catalog → ProductIssue priority mapping
# ---------------------------------------------------------------------------

_CATALOG_FIXED_STATUSES = {"fixed_verified", "fix_pending_deploy"}


def _severity_to_priority(severity: str) -> str:
    """Map catalog 'severity' (P0..P3 / feature / etc.) to ProductIssue priority."""
    sev = (severity or "").strip().upper()
    if sev in {"P0", "P1", "P2", "P3"}:
        return sev
    # 'feature' / unknown → backlog
    return "P3"


def _phase_a_match(issue: ProductIssue, entry: dict) -> bool:
    """Return True if `issue` looks like the catalogued bug `entry`.

    Match rules (either suffices):
      (a) issue's error_trace contains the catalog `endpoint` substring
          (e.g. error_trace mentions "/api/v1/surveys/survey/").
      (b) ≥2 of the catalog entry's `previous_error_contains` keywords
          appear in issue.title + issue.description + issue.error_trace
          (lowercased).

    Plus: catalog status must be `fixed_verified` or `fix_pending_deploy`
    (we never resolve against an still-open catalog bug).
    """
    cat_status = (entry.get("status") or "").lower()
    if cat_status not in _CATALOG_FIXED_STATUSES:
        return False

    text_blob = " ".join([
        issue.title or "",
        issue.description or "",
        issue.error_trace or "",
        issue.actual_behavior or "",
    ]).lower()

    # (a) endpoint substring
    endpoint = (entry.get("endpoint") or "").strip()
    if endpoint and endpoint.lower() in (issue.error_trace or "").lower():
        return True

    # (b) keyword overlap on previous_error_contains
    kws = entry.get("previous_error_contains") or []
    if not isinstance(kws, list):
        return False
    hits = sum(1 for k in kws if isinstance(k, str) and k.strip() and k.lower() in text_blob)
    return hits >= 2


# ---------------------------------------------------------------------------
# Comment idempotency
# ---------------------------------------------------------------------------

def _today_signature(issue: ProductIssue) -> str:
    """Header for triage comments — used for idempotency."""
    return f"[auto-triage-{date.today().isoformat()}] #{issue.id}"


def _already_triaged_today(issue: ProductIssue) -> bool:
    sig = _today_signature(issue)
    return ProductIssueComment.objects.filter(
        issue=issue,
        body__startswith=sig,
    ).exists()


# ---------------------------------------------------------------------------
# LLM call (Phase B)
# ---------------------------------------------------------------------------

LLM_SYSTEM_PROMPT = (
    "Je bent een productmanager voor ProjeXtPal (project-management SaaS). "
    "Je triage-rol: classificeer een gemelde ProductIssue en geef advies.\n\n"
    "Geef ALLEEN een JSON-object terug, zonder commentaar, zonder markdown-fence. "
    "Schema:\n"
    "{\n"
    '  "classification": "bug" | "duplicate" | "feature" | "needs-info" | "wontfix",\n'
    '  "priority": "P0" | "P1" | "P2" | "P3",\n'
    '  "affected_area": "<korte string, bv. surveys / governance / mobile / auth>",\n'
    '  "reasoning": "<2-3 zinnen in het Nederlands>",\n'
    '  "recommended_action": "<korte zin in het Nederlands>"\n'
    "}\n\n"
    "Heuristieken:\n"
    "- 'bug' = duidelijk een code-defect / regression.\n"
    "- 'duplicate' = lijkt op een al bekende bug; gebruik dit alleen als de "
    "  beschrijving sterk overlapt met een bestaand patroon.\n"
    "- 'feature' = verzoek tot nieuwe functionaliteit.\n"
    "- 'needs-info' = niet reproduceerbaar zonder meer info van de reporter.\n"
    "- 'wontfix' = test-data, by-design, of out-of-scope.\n"
    "- Priority: P0 = blocker (data verlies, productie down, security), "
    "  P1 = belangrijke bug die meerdere gebruikers raakt, "
    "  P2 = standaard, P3 = nice-to-have / kosmetisch.\n"
)


def _llm_user_message(issue: ProductIssue) -> str:
    parts = [
        f"Titel: {issue.title}",
        f"Beschrijving: {issue.description or '(geen)'}",
        f"Reproduction steps: {issue.reproduction_steps or '(geen)'}",
        f"Expected: {issue.expected_behavior or '(geen)'}",
        f"Actual: {issue.actual_behavior or '(geen)'}",
        f"Error trace: {(issue.error_trace or '')[:1200]}",
        f"Category: {issue.get_category_display() if issue.category else '(geen)'}",
        f"Source: {issue.get_source_display() if issue.source else '(geen)'}",
    ]
    return "\n".join(parts)


def _call_anthropic(issue: ProductIssue) -> Optional[dict]:
    """Run the Anthropic classifier. Returns parsed JSON or None on failure.

    Uses core.llm_keys.get_anthropic_client so BYO company keys + the
    platform fallback both work. The cron is cross-company, so we pass
    company=issue.company — that lets a customer's BYO Anthropic key be
    used to triage their own issues.
    """
    try:
        from core.llm_keys import get_anthropic_client
    except Exception as exc:  # pragma: no cover - import-time only
        logger.warning("Triage: cannot import core.llm_keys: %s", exc)
        return None

    company = getattr(issue, "company", None)
    try:
        client = get_anthropic_client(company)
    except Exception as exc:
        logger.warning("Triage: get_anthropic_client raised: %s", exc)
        return None
    if client is None:
        logger.warning("Triage: no Anthropic key available (company=%s)", company)
        return None

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            temperature=0,
            system=LLM_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": _llm_user_message(issue)}],
        )
    except Exception as exc:
        logger.warning("Triage: Anthropic call failed for issue #%s: %s", issue.id, exc)
        return None

    # Concatenate text blocks
    try:
        raw = "".join(
            block.text for block in resp.content
            if getattr(block, "type", "") == "text"
        )
    except Exception as exc:
        logger.warning("Triage: cannot read Anthropic response for #%s: %s", issue.id, exc)
        return None

    # Defensive JSON extraction
    match = re.search(r"\{[\s\S]*\}", raw or "")
    if not match:
        logger.warning("Triage: no JSON object found in LLM output for #%s", issue.id)
        return None
    try:
        return json.loads(match.group(0))
    except Exception as exc:
        logger.warning("Triage: JSON parse failed for #%s: %s — raw: %r",
                       issue.id, exc, raw[:200])
        return None


# ---------------------------------------------------------------------------
# Classification → ProductIssue.status mapping
# ---------------------------------------------------------------------------

_LLM_STATUS_MAP = {
    "bug": "triaging",
    "duplicate": "resolved",
    "feature": "accepted",
    "needs-info": "needs-info",
    "wontfix": "wont-fix",
}


def _normalize_priority(p: Any) -> str:
    p = str(p or "").strip().upper()
    return p if p in {"P0", "P1", "P2", "P3"} else "P2"


def _normalize_classification(c: Any) -> str:
    c = str(c or "").strip().lower()
    return c if c in _LLM_STATUS_MAP else "needs-info"


# ---------------------------------------------------------------------------
# Digest email
# ---------------------------------------------------------------------------

def _send_digest_email(
    *,
    catalog_resolved: list[tuple[int, str, str]],   # (id, title, bug_id)
    llm_classified: list[tuple[int, str, str, str]],  # (id, title, classification, priority)
    needs_info: list[tuple[int, str]],
    errors: list[tuple[int, str]],
) -> None:
    """Single digest email for this run. Reuses signals._send_email_safe."""
    total = len(catalog_resolved) + len(llm_classified) + len(needs_info)
    if total == 0 and not errors:
        return  # nothing to report

    try:
        from product_issues.signals import _send_email_safe, _admin_emails
    except Exception as exc:  # pragma: no cover
        logger.warning("Triage: cannot import signal helpers: %s", exc)
        return

    today = date.today().isoformat()
    subject = (
        f"[ProjeXtPal · Auto-triage] {today} — "
        f"{len(catalog_resolved)} catalog · {len(llm_classified)} LLM"
    )

    lines = [f"Auto-triage digest — run van {today}.", ""]
    if catalog_resolved:
        lines.append(f"Catalogus-match (resolved): {len(catalog_resolved)}")
        for iid, title, bug in catalog_resolved:
            lines.append(f"  · #{iid} — {title[:70]}  →  {bug}")
        lines.append("")
    if llm_classified:
        lines.append(f"LLM-classificatie: {len(llm_classified)}")
        for iid, title, cls, prio in llm_classified:
            lines.append(f"  · #{iid} — {title[:60]}  →  {cls} / {prio}")
        lines.append("")
    if needs_info:
        lines.append(f"Needs info (LLM kon niet classificeren): {len(needs_info)}")
        for iid, title in needs_info:
            lines.append(f"  · #{iid} — {title[:70]}")
        lines.append("")
    if errors:
        lines.append(f"Errors: {len(errors)}")
        for iid, msg in errors:
            lines.append(f"  · #{iid} — {msg}")
        lines.append("")

    text = "\n".join(lines)
    html = "<pre style='font-family: ui-monospace, monospace; font-size: 13px;'>" \
           + text.replace("<", "&lt;").replace(">", "&gt;") \
           + "</pre>"

    _send_email_safe(
        subject=subject,
        text_body=text,
        html_body=html,
        to=_admin_emails(),
    )


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "Automated ProductIssue triage: catalog cross-match (Phase A) + "
        "Anthropic LLM classifier (Phase B). Designed for a 30-min cron."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Do not write to DB and do not call the LLM."
        )
        parser.add_argument(
            "--limit", type=int, default=50,
            help="Max issues to process per run (default 50)."
        )
        parser.add_argument(
            "--issue-id", type=int, default=None,
            help="Process exactly one issue by ID (overrides --limit)."
        )

    # ------------------------------------------------------------------
    def handle(self, *args, **opts):
        dry_run: bool = opts["dry_run"]
        limit: int = opts["limit"] or 50
        issue_id: Optional[int] = opts.get("issue_id")

        self.stdout.write(self.style.NOTICE(
            f"Triage start — dry_run={dry_run} limit={limit} "
            f"issue_id={issue_id or '(any)'}"
        ))

        catalog = _load_catalog()
        self.stdout.write(f"Catalog: loaded {len(catalog)} entries.")

        # ---- Select candidates --------------------------------------
        qs = ProductIssue.objects.filter(status="new", triaged_at__isnull=True)
        if issue_id is not None:
            qs = qs.filter(pk=issue_id)
        else:
            qs = qs.order_by("created_at")[:limit]
        candidates = list(qs)
        self.stdout.write(f"Candidates: {len(candidates)} issues to consider.")

        # Counters
        n_catalog = 0
        n_llm = 0
        n_needs = 0
        n_errors = 0
        n_skipped_idempotent = 0

        # Digest buckets
        catalog_resolved: list[tuple[int, str, str]] = []
        llm_classified: list[tuple[int, str, str, str]] = []
        needs_info_list: list[tuple[int, str]] = []
        error_list: list[tuple[int, str]] = []

        for issue in candidates:
            # Idempotency
            if _already_triaged_today(issue):
                n_skipped_idempotent += 1
                self.stdout.write(f"  · #{issue.id} — already triaged today, skip")
                continue

            # ---- Phase A: catalog cross-match ----------------------
            matched = None
            for entry in catalog:
                try:
                    if _phase_a_match(issue, entry):
                        matched = entry
                        break
                except Exception as exc:
                    logger.warning("Phase A match() raised on #%s: %s", issue.id, exc)

            if matched is not None:
                bug_id = matched.get("id") or "?"
                fix_location = matched.get("fix_location") or "(catalog)"
                priority = _severity_to_priority(matched.get("severity") or "")
                cat_status = matched.get("status") or "?"

                body = (
                    f"{_today_signature(issue)} catalog-match\n\n"
                    f"Automatische triage — gemarkeerd als opgelost via "
                    f"catalogus-cross-match (`tests/regression/known_issues.json`).\n\n"
                    f"Match: **{bug_id}** — {matched.get('title', '')}\n"
                    f"Catalogus-status: `{cat_status}`\n"
                    f"Fix locatie: `{fix_location}`\n\n"
                    f"Heb je nog steeds last van dit probleem? Beantwoord deze mail "
                    f"of meld een nieuwe issue, dan kijken we opnieuw."
                )

                if not dry_run:
                    try:
                        issue.status = "resolved"
                        issue.priority = priority
                        issue.agent_triage_result = {
                            "matched_bug": bug_id,
                            "fix_location": fix_location,
                            "catalog_status": cat_status,
                            "phase": "catalog",
                        }
                        issue.triaged_by = "agent:issue-triage-validator"
                        issue.triaged_at = timezone.now()
                        if not issue.resolution_summary:
                            issue.resolution_summary = (
                                f"Resolved via catalog cross-match {bug_id} "
                                f"(fix: {fix_location})."
                            )
                        issue._suppress_email_on_save = True
                        issue.save(update_fields=[
                            "status", "priority", "agent_triage_result",
                            "triaged_by", "triaged_at", "resolution_summary",
                            "updated_at",
                        ])
                        ProductIssueComment.objects.create(
                            issue=issue,
                            author="agent:issue-triage-validator",
                            body=body,
                            is_triage_step=True,
                        )
                    except Exception as exc:
                        n_errors += 1
                        error_list.append((issue.id, f"catalog-save: {exc}"))
                        logger.exception("Triage: catalog write failed on #%s", issue.id)
                        continue

                n_catalog += 1
                catalog_resolved.append((issue.id, issue.title, bug_id))
                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ #{issue.id} — catalog-match {bug_id} → resolved/{priority}"
                ))
                continue

            # ---- Phase B: LLM classification -----------------------
            if dry_run:
                self.stdout.write(f"  · #{issue.id} — dry-run, would call LLM")
                continue

            parsed = _call_anthropic(issue)
            if parsed is None:
                # Leave status='new'; post a transient-failure comment, but
                # only once per day (idempotency upstream already guarded).
                comment_body = (
                    f"{_today_signature(issue)} llm-error\n\n"
                    f"Auto-triage tijdelijk niet beschikbaar (LLM-call faalde "
                    f"of gaf geen geldige JSON). De volgende cron-cycle "
                    f"probeert het opnieuw."
                )
                try:
                    ProductIssueComment.objects.create(
                        issue=issue,
                        author="agent:issue-triage-validator",
                        body=comment_body,
                        is_triage_step=True,
                    )
                except Exception:
                    pass
                n_errors += 1
                error_list.append((issue.id, "llm-call-failed"))
                self.stdout.write(self.style.WARNING(
                    f"  ! #{issue.id} — LLM unavailable, will retry next cycle"
                ))
                continue

            classification = _normalize_classification(parsed.get("classification"))
            priority = _normalize_priority(parsed.get("priority"))
            new_status = _LLM_STATUS_MAP[classification]
            reasoning = str(parsed.get("reasoning") or "")[:1000]
            recommended = str(parsed.get("recommended_action") or "")[:500]
            area = str(parsed.get("affected_area") or "")[:80]

            body = (
                f"{_today_signature(issue)} llm-triage\n\n"
                f"Automatische LLM-classificatie:\n"
                f"- Classification: **{classification}**\n"
                f"- Priority: **{priority}**\n"
                f"- Affected area: {area or '(onbekend)'}\n\n"
                f"**Redenering**\n{reasoning or '(geen)'}\n\n"
                f"**Aanbevolen actie**\n{recommended or '(geen)'}\n"
            )

            try:
                issue.status = new_status
                issue.priority = priority
                issue.agent_triage_result = {**parsed, "phase": "llm"}
                issue.triaged_by = "agent:issue-triage-validator"
                issue.triaged_at = timezone.now()
                issue._suppress_email_on_save = True
                issue.save(update_fields=[
                    "status", "priority", "agent_triage_result",
                    "triaged_by", "triaged_at", "updated_at",
                ])
                ProductIssueComment.objects.create(
                    issue=issue,
                    author="agent:issue-triage-validator",
                    body=body,
                    is_triage_step=True,
                )
            except Exception as exc:
                n_errors += 1
                error_list.append((issue.id, f"llm-save: {exc}"))
                logger.exception("Triage: LLM write failed on #%s", issue.id)
                continue

            if classification == "needs-info":
                n_needs += 1
                needs_info_list.append((issue.id, issue.title))
            else:
                n_llm += 1
                llm_classified.append((issue.id, issue.title, classification, priority))

            self.stdout.write(self.style.SUCCESS(
                f"  ✓ #{issue.id} — LLM {classification}/{priority} → {new_status}"
            ))

        # ---- Digest email --------------------------------------------
        if not dry_run:
            try:
                _send_digest_email(
                    catalog_resolved=catalog_resolved,
                    llm_classified=llm_classified,
                    needs_info=needs_info_list,
                    errors=error_list,
                )
            except Exception:
                logger.exception("Triage: digest email failed")

        # ---- Summary line --------------------------------------------
        total = n_catalog + n_llm + n_needs
        self.stdout.write("")
        self.stdout.write(self.style.NOTICE(
            f"INFO: triaged {total} issues — "
            f"{n_catalog} by catalog, {n_llm} by LLM, "
            f"{n_needs} needing info, {n_errors} errors "
            f"({n_skipped_idempotent} idempotent-skipped)"
        ))
