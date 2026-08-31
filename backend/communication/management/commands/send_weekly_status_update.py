"""Wekelijkse projectupdate: vers AI-statusrapport + notificatie/mail naar de
projectleiding — wat er staat en wat er nog moet gebeuren.

    python manage.py send_weekly_status_update              # alle actieve projecten
    python manage.py send_weekly_status_update --project 104
    python manage.py send_weekly_status_update --dry-run

Cron (vrijdag 16:00):
    0 16 * * 5  /usr/local/bin/docker exec -i projextpal-backend-prod \
                python manage.py send_weekly_status_update

Ontvangers per project: leden met rol project_owner/project_manager/
project_leader (ProjectMembership); fallback de aanmaker van het project.
De mail loopt via de bestaande NL-notificatiepijplijn (CTA naar het
AI-statusrapport in de app).
"""

from django.core.management.base import BaseCommand

RAG_NL = {"green": "GROEN", "amber": "ORANJE", "red": "ROOD"}
LEIDING_ROLLEN = ("project_owner", "project_manager", "project_leader")


def _recipients(project):
    users = [
        m.user for m in project.memberships.select_related("user")
        if m.role in LEIDING_ROLLEN and m.user and m.user.is_active
    ]
    if not users and project.created_by and project.created_by.is_active:
        users = [project.created_by]
    # dedupliceren met behoud van volgorde
    gezien, uniek = set(), []
    for u in users:
        if u.id not in gezien:
            gezien.add(u.id)
            uniek.append(u)
    return uniek


def _bullet(items, maximum=3):
    punten = [str(x).strip() for x in (items or []) if str(x).strip()][:maximum]
    return "".join(f"\n• {p}" for p in punten)


class Command(BaseCommand):
    help = "Genereer per actief project een statusrapport en mail de projectleiding (weekly update)."

    def add_arguments(self, parser):
        parser.add_argument("--project", type=int, default=None,
                            help="Alleen dit project-id.")
        parser.add_argument("--no-llm", action="store_true",
                            help="Alleen deterministische samenvatting (geen LLM-call).")
        parser.add_argument("--dry-run", action="store_true",
                            help="Toon projecten + ontvangers; genereer en verstuur niets.")

    def handle(self, *args, **opts):
        from projects.models import Project
        from communication.status_synthesis import generate_and_store
        from notifications.models import notify

        inactive = ["closed", "completed", "cancelled", "archived"]
        qs = Project.objects.exclude(status__in=inactive)
        if opts.get("project"):
            qs = qs.filter(id=opts["project"])

        verzonden = 0
        for project in qs.iterator():
            ontvangers = _recipients(project)
            if opts.get("dry_run"):
                self.stdout.write(
                    f"  [dry-run] {project.id} — {project.name} → "
                    f"{[u.email for u in ontvangers] or 'GEEN ONTVANGERS'}")
                continue
            if not ontvangers:
                self.stdout.write(self.style.WARNING(
                    f"  ✗ {project.name}: geen actieve projectleiding — overgeslagen"))
                continue

            report = generate_and_store(project, user=None, use_llm=not opts.get("no_llm"))
            if not report:
                self.stdout.write(self.style.WARNING(
                    f"  ✗ {project.name}: rapportgeneratie mislukt"))
                continue

            body = f"Status: {RAG_NL.get(report.overall_rag, report.overall_rag)}."
            hoogte = _bullet(report.highlights)
            if hoogte:
                body += f"\n\nWat er staat:{hoogte}"
            vervolg = _bullet(report.next_steps)
            if vervolg:
                body += f"\n\nWat er nog moet gebeuren:{vervolg}"
            blokkades = _bullet(report.blockers)
            if blokkades:
                body += f"\n\nBlokkades:{blokkades}"

            url = f"/projects/{project.id}/execution/communication/ai-status-report"
            for u in ontvangers:
                notify(
                    u, kind="status",
                    title=f"Weekly update: {project.name}",
                    body=body, url=url,
                )
            verzonden += 1
            self.stdout.write(self.style.SUCCESS(
                f"  ✓ {project.name} → {RAG_NL.get(report.overall_rag)} "
                f"naar {len(ontvangers)} ontvanger(s)"))

        if not opts.get("dry_run"):
            self.stdout.write(self.style.SUCCESS(f"Klaar. {verzonden} project(en) verstuurd."))
