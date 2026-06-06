"""
Scheduled AI status-report generation.

Run from cron (matches the triage_product_issues pattern). For every active
project it synthesises a fresh GeneratedStatusReport from live metrics.

    python manage.py generate_status_reports                # all active projects
    python manage.py generate_status_reports --methodology scrum
    python manage.py generate_status_reports --no-llm       # deterministic only
    python manage.py generate_status_reports --dry-run

Cron example (weekly, Monday 06:00):
    0 6 * * 1  docker compose -f docker-compose.production.yml exec -T backend \
               python manage.py generate_status_reports
"""

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Generate an AI status report for every active project (scheduled)."

    def add_arguments(self, parser):
        parser.add_argument("--methodology", type=str, default=None,
                            help="Only this methodology (e.g. scrum, prince2).")
        parser.add_argument("--no-llm", action="store_true",
                            help="Deterministic narrative only (no LLM call).")
        parser.add_argument("--dry-run", action="store_true",
                            help="List projects that would be processed; create nothing.")

    def handle(self, *args, **opts):
        from projects.models import Project
        from communication.status_synthesis import generate_and_store

        # "Active" = not closed/completed/cancelled.
        inactive = ["closed", "completed", "cancelled", "archived"]
        qs = Project.objects.exclude(status__in=inactive)
        if opts.get("methodology"):
            qs = qs.filter(methodology__iexact=opts["methodology"])

        total = qs.count()
        self.stdout.write(f"Active projects to process: {total}")
        ok = 0
        for project in qs.iterator():
            if opts.get("dry_run"):
                self.stdout.write(f"  [dry-run] {project.id} — {project.name}")
                continue
            report = generate_and_store(project, user=None, use_llm=not opts.get("no_llm"))
            if report:
                ok += 1
                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ {project.name} → {report.overall_rag.upper()} ({report.model_used})"
                ))
            else:
                self.stdout.write(self.style.WARNING(f"  ✗ {project.name} — generation failed"))

        if not opts.get("dry_run"):
            self.stdout.write(self.style.SUCCESS(f"Done. {ok}/{total} reports generated."))
