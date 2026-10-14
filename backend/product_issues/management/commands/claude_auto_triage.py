"""
Automated Claude fix-agent triage — Sprint 10 S10-02.

Runs on a 15-min cron (see scripts/cron-claude-triage.sh). Each run:

  * Picks the N newest ``status=new`` + ``source=agent-scan`` issues.
  * For each one that passes ``ClaudeAutoTriage.should_auto_triage`` it
    POSTs to the configured fix-agent webhook and transitions the issue
    to ``in-progress``.

The pipeline is a NO-OP when either ``CLAUDE_AUTO_TRIAGE_ENABLED`` is
false or ``CLAUDE_FIX_AGENT_WEBHOOK`` is empty — so landing the code on
prod does not change behaviour until an operator opts in.

Flags
-----
  --dry-run   : no DB writes, no webhook POSTs (read-only).
  --limit N   : max issues processed per run (default 5).
  --issue-id N: process exactly one issue (overrides --limit).
"""
from __future__ import annotations

import logging
from typing import Any

from django.core.management.base import BaseCommand
from django.utils import timezone

from product_issues.claude_triage import ClaudeAutoTriage, TriageError
from product_issues.models import ProductIssue

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Auto-trigger a Claude fix agent for new agent-scan ProductIssues. "
        "Opt-in via CLAUDE_AUTO_TRIAGE_ENABLED + CLAUDE_FIX_AGENT_WEBHOOK."
    )

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument("--dry-run", action="store_true", default=False)
        parser.add_argument("--limit", type=int, default=5)
        parser.add_argument("--issue-id", type=int, default=None)

    def handle(self, *args: Any, **options: Any) -> None:
        dry_run: bool = options["dry_run"]
        limit: int = options["limit"]
        issue_id = options["issue_id"]

        triage = ClaudeAutoTriage()

        if not triage.enabled:
            self.stdout.write(
                "claude_auto_triage: disabled (CLAUDE_AUTO_TRIAGE_ENABLED=false)"
            )
            return
        if not triage.webhook_url:
            self.stdout.write(
                "claude_auto_triage: no CLAUDE_FIX_AGENT_WEBHOOK configured"
            )
            return

        if issue_id is not None:
            qs = ProductIssue.objects.filter(pk=issue_id)
        else:
            qs = (
                ProductIssue.objects.filter(status="new", source="agent-scan")
                .order_by("-created_at")[:limit]
            )

        started_at = timezone.now()
        triggered = 0
        skipped = 0
        failed = 0

        for issue in qs:
            if not triage.should_auto_triage(issue):
                skipped += 1
                self.stdout.write(
                    f"skip #{issue.id} ({issue.priority}/{issue.category}/{issue.status})"
                )
                continue

            if dry_run:
                self.stdout.write(f"dry-run: would trigger agent for #{issue.id}")
                triggered += 1
                continue

            try:
                agent_id = triage.trigger_fix_agent(issue)
                triage.mark_in_progress(issue, agent_id)
                triggered += 1
                self.stdout.write(
                    f"triggered {agent_id} for #{issue.id} ({issue.title[:50]})"
                )
            except TriageError as exc:
                failed += 1
                triage.mark_failed(issue, str(exc))
                self.stderr.write(f"failed #{issue.id}: {exc}")
            except Exception as exc:  # noqa: BLE001 — defensive
                failed += 1
                triage.mark_failed(issue, repr(exc))
                self.stderr.write(f"error #{issue.id}: {exc!r}")

        duration = (timezone.now() - started_at).total_seconds()
        self.stdout.write(
            f"claude_auto_triage done in {duration:.1f}s — "
            f"triggered={triggered} skipped={skipped} failed={failed}"
        )
