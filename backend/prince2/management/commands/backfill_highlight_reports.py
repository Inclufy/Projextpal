"""Backfill HighlightReport content for any reports with empty fields.

Audit (April 2026) found that two highlight reports for project "Engine
Block X" had every content field NULL. The "auto-drafted weekly" deck
claim was therefore unsupported. This one-shot command runs
`HighlightReport.auto_draft_content()` against any report that is missing
all five narrative fields, optionally scoped to a project.

Idempotent: re-running only touches reports still missing content.

    python manage.py backfill_highlight_reports
    python manage.py backfill_highlight_reports --project-name "Engine Block X"
    python manage.py backfill_highlight_reports --all
"""

from django.core.management.base import BaseCommand
from django.db.models import Q

from prince2.models import HighlightReport


class Command(BaseCommand):
    help = "Backfill empty HighlightReport content via auto_draft_content()."

    def add_arguments(self, parser):
        parser.add_argument(
            '--project-name',
            help='Only backfill reports for projects whose name contains this string.',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Re-draft EVERY report (overwrites existing content).',
        )

    def handle(self, *args, **options):
        qs = HighlightReport.objects.all()
        if options.get('project_name'):
            qs = qs.filter(project__name__icontains=options['project_name'])

        if not options.get('all'):
            empty_q = (
                Q(status_summary__isnull=True) | Q(status_summary='')
            ) & (
                Q(work_completed__isnull=True) | Q(work_completed='')
            ) & (
                Q(work_planned_next_period__isnull=True) | Q(work_planned_next_period='')
            ) & (
                Q(issues_summary__isnull=True) | Q(issues_summary='')
            ) & (
                Q(risks_summary__isnull=True) | Q(risks_summary='')
            )
            qs = qs.filter(empty_q)

        total = qs.count()
        if total == 0:
            self.stdout.write("No highlight reports needed backfill.")
            return

        self.stdout.write(f"Backfilling {total} highlight report(s)…")
        for report in qs:
            try:
                report.auto_draft_content(save=True)
                self.stdout.write(
                    f"  - drafted report {report.pk} for "
                    f"'{report.project.name}' ({report.overall_status})"
                )
            except Exception as e:  # noqa: BLE001 — we want to report and move on
                self.stderr.write(self.style.ERROR(
                    f"  ! failed report {report.pk}: {type(e).__name__}: {e}"
                ))

        self.stdout.write(self.style.SUCCESS("Highlight report backfill complete."))
