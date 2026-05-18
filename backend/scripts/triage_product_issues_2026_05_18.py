"""
One-shot triage script — flips ProductIssue rows that map to today's
fixed BUGs (BUG-030, BUG-031, BUG-033, BUG-034) from new/triaging to
resolved, and posts a Dutch-language comment on each one explaining
the fix.

Run on the Mac Studio:

    # Dry-run (default — prints what would change, no DB writes):
    docker exec projextpal-backend-prod python manage.py shell \
        -c "exec(open('/app/scripts/triage_product_issues_2026_05_18.py').read())"

    # Apply mode — actually writes:
    docker exec -e APPLY=1 projextpal-backend-prod python manage.py shell \
        -c "exec(open('/app/scripts/triage_product_issues_2026_05_18.py').read())"

Idempotent — re-running the script after APPLY is safe; it skips any
issue that already has a comment from this script (matched by signature
string at the head of each comment body).

Always prints a final summary table so you can verify what changed.
"""
from __future__ import annotations

import os

from django.utils import timezone

from product_issues.models import ProductIssue, ProductIssueComment


SCRIPT_SIGNATURE = "[triage-2026-05-18]"

# ────────────────────────────────────────────────────────────────────
# Mapping: catalog BUG → match rules + resolution comment
# ────────────────────────────────────────────────────────────────────
# Each entry's `match` callable returns True if a ProductIssue is the
# one the BUG fixed. Multiple BUGs may match a single issue (rare); the
# first match wins.
#
# `comment_nl` is the Dutch-language message added to the issue's
# comment thread. It includes the SCRIPT_SIGNATURE so re-runs are
# idempotent.
#
# `new_status` is one of the ProductIssue.STATUS_CHOICES values.
#
# `new_repro_result` is one of the REPRO_RESULT_CHOICES values; used to
# distinguish "we fixed the code" from "we couldn't reproduce / data
# issue".

RESOLUTIONS = [
    {
        "bug_id": "BUG-030",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in ["forgot-password", "forgot_password", "throttle", "throttling.py", "keyerror: '1'"]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-030\n\n"
            "✅ Opgelost — 'forgot-password' endpoint gaf 500 (KeyError: '1') op elke "
            "POST omdat de DRF throttle-rate '3/10min' niet geldig is. DRF accepteert "
            "alleen één-letter perioden (s/m/h/d), dus '10min' brak parse_rate. "
            "Aangepast naar '3/hour'. Tevens overgestapt op Redis-cache zodat alle "
            "gunicorn workers dezelfde rate-counter delen (was per-worker, dus de "
            "effectieve rate was 4× te hoog).\n\n"
            "Live sinds 2026-05-18. Smoke-test: 4-call burst geeft nu exact "
            "200, 200, 200, 429."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Throttle rate '3/10min' was invalid DRF syntax → KeyError. "
            "Fixed to '3/hour' + Redis-shared cache. Live (PR #16 + #18)."
        ),
    },
    {
        "bug_id": "BUG-031",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in ["versturen", "spinner", "probleem melden", "form hang", "product-issues form"]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-031\n\n"
            "✅ Opgelost — het 'Probleem melden'-formulier bleef tot 75 seconden op "
            "'Versturen…' staan omdat het post_save-signaal de SMTP-call synchroon "
            "uitvoerde. Nu draait die call in een daemon thread (post_save keert "
            "binnen ~1ms terug), met EMAIL_TIMEOUT=15s als plafond. Frontend heeft "
            "ook een 15s fetch-timeout via AbortController, dus de spinner kan niet "
            "meer oneindig blijven hangen.\n\n"
            "Live sinds 2026-05-18 (PR #22)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Synchronous SMTP send in post_save blocked the request thread. "
            "Now backgrounded via threading.Thread + EMAIL_TIMEOUT=15s. "
            "Frontend has matching 15s AbortController. Live (PR #22)."
        ),
    },
    {
        "bug_id": "BUG-033",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in ["nameerror", "agile/budget", "waterfall/budget", "name 'request' is not defined"]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-033\n\n"
            "✅ Opgelost — /agile/budget/items/ en /waterfall/budget/items/ gaven "
            "500 (NameError: name 'request' is not defined). Oorzaak: in "
            "get_queryset(self) was 'request.user' geschreven in plaats van "
            "'self.request.user' — die method krijgt geen request-parameter, "
            "dus de naam was onbekend. Beide viewsets gecorrigeerd.\n\n"
            "Live sinds 2026-05-18 (PR #19)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Bare `request.user` in get_queryset(self) — should be `self.request.user`. "
            "Fixed agile + waterfall budget viewsets. Live (PR #19)."
        ),
    },
    {
        "bug_id": "BUG-034",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "module script", "mime type", "expected a javascript",
                "blank page", "blanco pagina", "lege pagina",
                "cache-control", "stale tab",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-034\n\n"
            "✅ Opgelost — na een frontend-redeploy zagen open tabbladen een blanco "
            "pagina met 'Failed to load module script: Expected JavaScript … got "
            "text/html'. Oorzaak: nginx in de frontend-container zette geen "
            "Cache-Control-headers, dus browsers cachten index.html op basis van "
            "Last-Modified-heuristiek. Bij een nieuwe deploy verwees de cached HTML "
            "naar bundle-hashes die niet meer bestonden, en de SPA-fallback gaf "
            "index.html (text/html) i.p.v. JS terug.\n\n"
            "Nu: /assets/* krijgt 'public, max-age=31536000, immutable'; / krijgt "
            "'no-cache' (browser moet revalideren). Live sinds 2026-05-18 (PR #24)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Frontend nginx had no Cache-Control headers; browsers heuristically "
            "cached index.html. Added immutable cache on /assets/*, no-cache on "
            "HTML. Live (PR #24)."
        ),
    },
    {
        # Today's user-reported issue from the AI Copilot panel. Project ID
        # 3 doesn't exist in the current DB (was likely deleted), so the
        # 404 is correct DRF behaviour for `get_object_or_404` — not a
        # code bug.
        "bug_id": "USER-2026-05-18-backlog-404",
        "match": lambda i: (
            "cannot add backlog" in i.title.lower()
            or "got 404 error" in i.title.lower()
            or "/agile/backlog/" in (i.description + i.error_trace).lower()
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} USER-2026-05-18-backlog-404\n\n"
            "Onderzocht — geen code-bug. De POST naar "
            "/api/v1/projects/3/agile/backlog/ kreeg 'No Project matches the "
            "given query.' (HTTP 404) omdat project ID 3 niet (meer) bestaat "
            "in de database. De endpoint zelf werkt correct; "
            "_gated_project_lookup gebruikt get_object_or_404 en die geeft "
            "terecht 404 op een onbekend project-ID.\n\n"
            "Mogelijke oorzaken:\n"
            "- Het project is verwijderd na het kopiëren van de URL\n"
            "- Je was in een ander tenant/company-context dan het project\n"
            "- De URL werd gegenereerd vanuit gecached frontend-state\n\n"
            "Volgende keer: open /projects om te zien welke project-IDs "
            "daadwerkelijk bestaan, of probeer het via de UI in plaats van "
            "via de directe URL.\n\n"
            "UX-verbetering om dezelfde verwarring in de toekomst te "
            "voorkomen: de AI Copilot zou een 404 op /projects/<id>/* "
            "kunnen vangen en een toast tonen 'Project niet (meer) "
            "beschikbaar' i.p.v. de raw API-error door te geven. Apart "
            "ticket waard."
        ),
        "new_status": "wont-fix",
        "new_repro_result": "not-applicable",
        "resolution_summary": (
            "404 is correct — project ID 3 doesn't exist. Not a code bug. "
            "UX improvement (Copilot should catch 404 and toast) is a "
            "separate follow-up ticket."
        ),
    },
]

APPLY = os.environ.get("APPLY") == "1"

# ────────────────────────────────────────────────────────────────────
# Triage loop
# ────────────────────────────────────────────────────────────────────

print(f"\n{'='*70}")
print(f"  ProductIssue triage — 2026-05-18 session")
print(f"  Mode: {'APPLY (DB writes ENABLED)' if APPLY else 'DRY-RUN (no DB writes)'}")
print(f"{'='*70}\n")

OPEN_STATUSES = ["new", "triaging", "needs-info", "accepted", "in-progress"]
candidates = list(
    ProductIssue.objects.filter(status__in=OPEN_STATUSES).order_by("created_at")
)
print(f"Found {len(candidates)} open ProductIssue rows. Walking each one...\n")

actions = []
for issue in candidates:
    matched = None
    for r in RESOLUTIONS:
        try:
            if r["match"](issue):
                matched = r
                break
        except Exception as exc:
            print(f"  ! match() error on issue #{issue.id} for {r['bug_id']}: {exc}")

    if not matched:
        print(f"  · #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}' — no match, leaving as-is")
        continue

    # Idempotency check — has this exact triage already been written?
    already_done = ProductIssueComment.objects.filter(
        issue=issue,
        body__startswith=f"{SCRIPT_SIGNATURE} {matched['bug_id']}",
    ).exists()
    if already_done:
        print(f"  · #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}' — already triaged for {matched['bug_id']}, skipping")
        continue

    print(f"  → #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}'")
    print(f"      MATCH    : {matched['bug_id']}")
    print(f"      → status : {issue.status}  →  {matched['new_status']}")
    print(f"      → repro  : {issue.reproduction_result or '(empty)'}  →  {matched['new_repro_result']}")
    print(f"      + comment ({len(matched['comment_nl'])} chars)")

    actions.append((issue, matched))

print(f"\n{'─'*70}")
print(f"Planned actions: {len(actions)}")
print(f"{'─'*70}\n")

if APPLY:
    for issue, r in actions:
        ProductIssueComment.objects.create(
            issue=issue,
            author=f"agent:triage-2026-05-18",
            body=r["comment_nl"],
            is_triage_step=True,
        )
        issue.status = r["new_status"]
        issue.reproduction_result = r["new_repro_result"]
        if not issue.resolution_summary:
            issue.resolution_summary = r["resolution_summary"]
        issue.triaged_by = f"agent:triage-2026-05-18 + human:sami"
        issue.triaged_at = timezone.now()
        issue.save(
            update_fields=[
                "status",
                "reproduction_result",
                "resolution_summary",
                "triaged_by",
                "triaged_at",
                "updated_at",
            ]
        )
        print(f"  ✓ wrote: #{issue.id} → {r['new_status']} + comment ({r['bug_id']})")
    print(f"\n{len(actions)} issue(s) updated.\n")
else:
    print("DRY-RUN — no DB writes. To apply, re-run with:")
    print("  docker exec -e APPLY=1 projextpal-backend-prod \\")
    print("      python manage.py shell -c \"exec(open('/app/scripts/triage_product_issues_2026_05_18.py').read())\"\n")

# ────────────────────────────────────────────────────────────────────
# Final state summary
# ────────────────────────────────────────────────────────────────────
print(f"{'='*70}")
print("Current state (all ProductIssues, newest first):")
print(f"{'='*70}")
for issue in ProductIssue.objects.all().order_by("-created_at")[:20]:
    age_d = (timezone.now() - issue.created_at).days
    print(
        f"  #{issue.id:>4} [{issue.status:<11}] "
        f"prio={issue.priority or '--':<2} "
        f"sev={issue.severity or '--':<8} "
        f"{age_d:>3}d old  "
        f"'{issue.title[:50]}'"
    )
print()
