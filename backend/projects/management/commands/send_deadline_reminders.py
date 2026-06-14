"""
Deadline reminders — heads-up so deadlines are not missed.

Scheduled (cron) command. It scans every active project for work due *today* or
*this week* (and overdue), then sends **one consolidated digest per user** —
never one email per project. A single recipient gets a single email containing:
  - "Your tasks": their own due/overdue tasks across all projects (as owner)
  - one section per project they manage (PM/creator): tasks + milestones +
    calendar events due in that project

Every recipient is filtered through the user's notification preference
(Settings → Notifications → email + "deadline"), so anyone can opt out. A
recipient with nothing due is never emailed (no "0 due" noise).

Methodology-agnostic: tasks/milestones/events hang off the project regardless of
methodology, so it works for scrum, kanban, waterfall, prince2, agile, lss, hybrid.

    python manage.py send_deadline_reminders                 # default: 7-day window
    python manage.py send_deadline_reminders --days 1        # today/tomorrow only
    python manage.py send_deadline_reminders --dry-run       # print, send nothing

Cron (daily 07:00):
    0 7 * * *  docker compose -f docker-compose.production.yml exec -T backend \
               python manage.py send_deadline_reminders
"""

from collections import defaultdict
from datetime import timedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand
from django.utils import timezone

PM_ROLES = {"pm", "program_manager", "admin", "superadmin"}
INACTIVE = ["closed", "completed", "cancelled", "archived"]


class Command(BaseCommand):
    help = "Email a single consolidated deadline digest per user for work due this week."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="Look-ahead window in days (default 7).")
        parser.add_argument("--no-overdue", action="store_true", help="Exclude already-overdue items.")
        parser.add_argument("--dry-run", action="store_true", help="Print what would be sent; send nothing.")

    def handle(self, *args, **opts):
        from projects.models import Task, Milestone, Project, ProjectEvent, ProjectTeam

        today = timezone.now().date()
        horizon = today + timedelta(days=opts["days"])
        dry = opts["dry_run"]
        include_overdue = not opts["no_overdue"]

        def in_window(d):
            if d is None or d > horizon:
                return False
            if d < today and not include_overdue:
                return False
            return True

        # Accumulate everything per user, then send ONE email each.
        #   agg[user] = {"own": [(project, task), ...],
        #                "managed": {project: {"tasks": [...], "milestones": [...], "events": [...]}}}
        # User model instances hash/equal by pk, so the same person surfaced via
        # different queries collapses into one bucket.
        agg = defaultdict(lambda: {"own": [], "managed": {}})

        for project in Project.objects.exclude(status__in=INACTIVE).iterator():
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

            # Task owners → their own-tasks bucket.
            for t in tasks:
                if t.assigned_to and getattr(t.assigned_to, "email", None):
                    agg[t.assigned_to]["own"].append((project, t))

            # PM-role team members + the project creator → managed-project bucket.
            managers = {}
            for tm in ProjectTeam.objects.filter(project=project, is_active=True).select_related("user"):
                u = tm.user
                if getattr(u, "role", None) in PM_ROLES and getattr(u, "email", None):
                    managers[u.pk] = u
            creator = getattr(project, "created_by", None)
            if creator and getattr(creator, "email", None):
                managers[creator.pk] = creator
            for u in managers.values():
                agg[u]["managed"][project] = {"tasks": tasks, "milestones": milestones, "events": events}

        emails_sent = 0
        for user, data in agg.items():
            # Respect the recipient's email preference (master switch + "deadline"
            # category). Applies to EVERY recipient — owners and PMs alike.
            try:
                from notifications.models import should_email
                if not should_email(user, "deadline"):
                    continue
            except Exception:
                pass

            own = data["own"]
            managed = data["managed"]

            sections = []
            text = [f"Hi {user.first_name or user.email},", "",
                    f"Your deadline overview for the next {opts['days']} days:", ""]
            total = 0

            if own:
                rows = []
                for project, t in sorted(own, key=lambda pt: (pt[1].due_date or today)):
                    overdue = t.due_date < today
                    flag = "OVERDUE" if overdue else f"due {t.due_date}"
                    rows.append({"text": f"{t.title} — {project.name}", "tag": flag, "danger": overdue})
                    text.append(f"  • {t.title} — {project.name} [{flag}]")
                sections.append({"heading": f"Your tasks ({len(own)})", "rows": rows})
                total += len(own)
                text.append("")

            for project, d in managed.items():
                rows = []
                for t in sorted(d["tasks"], key=lambda x: x.due_date):
                    who = (t.assigned_to.first_name or t.assigned_to.email) if t.assigned_to else "unassigned"
                    overdue = t.due_date < today
                    flag = "OVERDUE" if overdue else f"due {t.due_date}"
                    rows.append({"text": f"{t.title} — {who}", "tag": flag, "danger": overdue})
                for m in sorted(d["milestones"], key=lambda x: x.end_date):
                    overdue = m.end_date < today
                    flag = "OVERDUE" if overdue else f"due {m.end_date}"
                    rows.append({"text": f"Milestone: {m.name}", "tag": flag, "danger": overdue})
                for e in sorted(d["events"], key=lambda x: x.start_date):
                    rows.append({"text": f"Calendar: {e.title}", "tag": str(e.start_date), "danger": False})
                if rows:
                    sections.append({"heading": f"{project.name} ({len(rows)})", "rows": rows})
                    total += len(rows)
                    text.append(f"{project.name}:")
                    text += [f"  • {r['text']} [{r['tag']}]" for r in rows]
                    text.append("")

            if not sections:
                continue  # nothing relevant for this user → no email

            text += ["You can manage email reminders in Settings → Notifications.", "— ProjeXtPal"]
            subject = f"🗓️ Your deadline overview — {total} item(s) due"
            html = self._render_html(
                title="Your deadline overview",
                lead=f"Everything due across your projects over the next {opts['days']} days.",
                sections=sections,
                closing="You can manage email reminders in Settings → Notifications.",
            )
            if self._send(user.email, subject, "\n".join(text), dry, html=html):
                emails_sent += 1
            if dry:
                self.stdout.write(
                    f"  [dry] {user.email}: {total} item(s) "
                    f"({len(own)} own, {len(managed)} managed project(s))"
                )

        verb = "Would send" if dry else "Sent"
        self.stdout.write(self.style.SUCCESS(f"{verb} {emails_sent} consolidated reminder email(s)."))

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
                "closing": closing, "badge": "calendar",
            })
        except Exception:
            return None
