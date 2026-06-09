"""
Deadline reminders — heads-up so deadlines are not missed.

Scheduled (cron) command. For every active project it finds work due *today* or
*this week* (and overdue), then emails:
  - each task OWNER (assigned_to) a digest of their own due/overdue tasks
  - the project PM(s) + creator a project-wide digest (tasks + milestones +
    meetings + calendar events)

Methodology-agnostic: tasks/milestones/events hang off the project regardless of
methodology, so it works for scrum, kanban, waterfall, prince2, agile, lss, hybrid.

    python manage.py send_deadline_reminders                 # default: 7-day window
    python manage.py send_deadline_reminders --days 1        # today/tomorrow only
    python manage.py send_deadline_reminders --dry-run       # print, send nothing

Cron (daily 07:00):
    0 7 * * *  docker compose -f docker-compose.production.yml exec -T backend \
               python manage.py send_deadline_reminders
"""

from datetime import timedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand
from django.utils import timezone

PM_ROLES = {"pm", "program_manager", "admin", "superadmin"}
INACTIVE = ["closed", "completed", "cancelled", "archived"]


class Command(BaseCommand):
    help = "Email deadline reminders to task owners + PMs for work due this week."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="Look-ahead window in days (default 7).")
        parser.add_argument("--no-overdue", action="store_true", help="Exclude already-overdue items.")
        parser.add_argument("--dry-run", action="store_true", help="Print what would be sent; send nothing.")

    def handle(self, *args, **opts):
        from projects.models import Task, Milestone, Project, ProjectEvent

        today = timezone.now().date()
        horizon = today + timedelta(days=opts["days"])
        dry = opts["dry_run"]
        include_overdue = not opts["no_overdue"]

        def in_window(d):
            if d is None:
                return False
            if d > horizon:
                return False
            if d < today and not include_overdue:
                return False
            return True

        emails_sent = 0
        projects = Project.objects.exclude(status__in=INACTIVE)

        for project in projects.iterator():
            # ---- gather due work -------------------------------------------------
            tasks = [
                t for t in Task.objects.filter(milestone__project=project)
                .exclude(status="done").select_related("assigned_to", "milestone")
                if in_window(t.due_date)
            ]
            milestones = [
                m for m in Milestone.objects.filter(project=project).exclude(status="completed")
                if in_window(m.end_date)
            ]
            events = [e for e in ProjectEvent.objects.filter(project=project) if in_window(e.start_date)]

            if not (tasks or milestones or events):
                continue

            # ---- owner digests ---------------------------------------------------
            by_owner = {}
            for t in tasks:
                if t.assigned_to and getattr(t.assigned_to, "email", None):
                    by_owner.setdefault(t.assigned_to, []).append(t)

            for owner, owner_tasks in by_owner.items():
                # Respect the owner's email preference for deadline reminders.
                try:
                    from notifications.models import should_email
                    if not should_email(owner, "deadline"):
                        continue
                except Exception:
                    pass
                subject = f"⏰ {len(owner_tasks)} task(s) due in {project.name}"
                lines = [f"Hi {owner.first_name or owner.email},", "",
                         f"You have {len(owner_tasks)} task(s) due soon in '{project.name}':", ""]
                rows = []
                for t in sorted(owner_tasks, key=lambda x: x.due_date):
                    overdue = t.due_date < today
                    flag = "OVERDUE" if overdue else f"due {t.due_date}"
                    lines.append(f"  • {t.title}  [{flag}]  ({t.status})")
                    rows.append({"text": t.title, "tag": flag, "danger": overdue})
                lines += ["", "Please update status or flag blockers so deadlines aren't missed.",
                          "— ProjeXtPal"]
                html = self._render_html(
                    title=f"{len(owner_tasks)} task(s) due in {project.name}",
                    lead=f"Hi {owner.first_name or ''}, here is what's due soon in '{project.name}'.",
                    sections=[{"heading": f"Your tasks ({len(owner_tasks)})", "rows": rows}],
                    closing="Please update status or flag blockers so deadlines aren't missed.",
                )
                if self._send(owner.email, subject, "\n".join(lines), dry, html=html):
                    emails_sent += 1
                if dry:
                    self.stdout.write(f"  [dry] owner {owner.email}: {len(owner_tasks)} task(s)")

            # ---- PM / creator project digest ------------------------------------
            recipients = set()
            try:
                from projects.models import ProjectTeam
                for tm in ProjectTeam.objects.filter(project=project, is_active=True).select_related("user"):
                    if getattr(tm.user, "role", None) in PM_ROLES and getattr(tm.user, "email", None):
                        recipients.add(tm.user.email)
            except Exception:
                pass
            if getattr(project, "created_by", None) and getattr(project.created_by, "email", None):
                recipients.add(project.created_by.email)

            if recipients:
                subject = f"⏰ Deadline overview — {project.name} ({len(tasks)} task(s) due)"
                lines = [f"Deadline overview for '{project.name}' (next {opts['days']} days):", ""]
                sections = []
                if tasks:
                    lines.append(f"Tasks ({len(tasks)}):")
                    trows = []
                    for t in sorted(tasks, key=lambda x: x.due_date):
                        who = (t.assigned_to.first_name or t.assigned_to.email) if t.assigned_to else "unassigned"
                        overdue = t.due_date < today
                        flag = "OVERDUE" if overdue else f"due {t.due_date}"
                        lines.append(f"  • {t.title} — {who} [{flag}]")
                        trows.append({"text": f"{t.title} — {who}", "tag": flag, "danger": overdue})
                    lines.append("")
                    sections.append({"heading": f"Tasks ({len(tasks)})", "rows": trows})
                if milestones:
                    lines.append(f"Milestones ({len(milestones)}):")
                    mrows = []
                    for m in sorted(milestones, key=lambda x: x.end_date):
                        overdue = m.end_date < today
                        flag = "OVERDUE" if overdue else f"due {m.end_date}"
                        lines.append(f"  • {m.name} [{flag}]")
                        mrows.append({"text": m.name, "tag": flag, "danger": overdue})
                    lines.append("")
                    sections.append({"heading": f"Milestones ({len(milestones)})", "rows": mrows})
                if events:
                    lines.append(f"Calendar ({len(events)}):")
                    erows = []
                    for e in sorted(events, key=lambda x: x.start_date):
                        lines.append(f"  • {e.title} — {e.start_date}")
                        erows.append({"text": e.title, "tag": str(e.start_date), "danger": False})
                    lines.append("")
                    sections.append({"heading": f"Calendar ({len(events)})", "rows": erows})
                lines += ["Keep the team ahead of these deadlines.", "— ProjeXtPal"]
                body = "\n".join(lines)
                html = self._render_html(
                    title=f"Deadline overview — {project.name}",
                    lead=f"What's due in '{project.name}' over the next {opts['days']} days.",
                    sections=sections,
                    closing="Keep the team ahead of these deadlines.",
                )
                for addr in recipients:
                    if self._send(addr, subject, body, dry, html=html):
                        emails_sent += 1
                if dry:
                    self.stdout.write(f"  [dry] PM digest -> {', '.join(recipients)} ({len(tasks)} tasks, {len(milestones)} ms)")

        verb = "Would send" if dry else "Sent"
        self.stdout.write(self.style.SUCCESS(f"{verb} {emails_sent} reminder email(s)."))

    def _send(self, to_email, subject, body, dry, html=None):
        if dry:
            return True
        try:
            msg = EmailMultiAlternatives(
                subject=subject, body=body,
                from_email=settings.DEFAULT_FROM_EMAIL, to=[to_email],
            )
            if html:
                msg.attach_alternative(html, "text/html")
            msg.send()
            return True
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  ✗ failed -> {to_email}: {e}"))
            return False

    @staticmethod
    def _render_html(title, lead, sections, closing):
        """Branded HTML version of a digest email. Falls back to None (text
        only) if rendering fails for any reason."""
        try:
            from django.template.loader import render_to_string
            return render_to_string("emails/notification.html", {
                "title": title, "lead": lead, "sections": sections,
                "closing": closing, "badge": "bell",
            })
        except Exception:
            return None
