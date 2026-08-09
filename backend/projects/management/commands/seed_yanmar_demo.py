"""
Seed a Yanmar-style demo project for the 8 June deep-dive.

Creates:
    - 1 Company (if missing)         -- "Yanmar Europe (Demo)"
    - 1 Project                      -- "Renovation Phase 2"
    - 3 PRINCE2 Stages               -- Prepare / Renovations / Run
    - Milestones + tasks across stages, with RACI + revised due dates
    - ProjectBudget incl. ETC + Contingency
    - Risks (mapped to 5x5 grid)
    - 1 HighlightReport with 4-axis RAG + highlights/lowlights
    - 2 Meetings (basic notes; AI minutes endpoint can enrich)

Idempotent: re-running updates the project in place instead of duplicating.

Usage:
    python manage.py seed_yanmar_demo
    python manage.py seed_yanmar_demo --reset    # wipe first
"""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


PROJECT_NAME = "Renovation Phase 2"
COMPANY_NAME = "Yanmar Europe (Demo)"


class Command(BaseCommand):
    help = "Seed Yanmar-style demo data for the deep-dive session."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete the demo project before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        from accounts.models import Company
        from projects.models import (
            Project, Milestone, Task, ProjectBudget, Risk,
        )
        from prince2.models import (
            Stage, HighlightReport, ProjectBoard, ProjectBoardMember,
        )
        from communication.models import Meeting

        company, _ = Company.objects.get_or_create(
            name=COMPANY_NAME,
            defaults={},
        )

        if opts["reset"]:
            Project.objects.filter(company=company, name=PROJECT_NAME).delete()
            self.stdout.write(self.style.WARNING("Reset: deleted existing demo project"))

        project, created = Project.objects.update_or_create(
            company=company,
            name=PROJECT_NAME,
            defaults=dict(
                project_type="other",
                methodology="prince2",
                budget=Decimal("450000"),
                start_date=date(2025, 12, 1),
                target_implementation_date=date(2026, 7, 31),
                end_date=date(2026, 9, 30),
                description=(
                    "Full renovation of the YEU office (Phase 2). Demolition, "
                    "HVAC, electrical, furniture and IT cutover."
                ),
                project_goal=(
                    "Hand over a renovated office, on budget, by end Q3 2026, "
                    "with zero downtime to commercial operations."
                ),
                scope_in=(
                    "- Office floors 1 and 2\n"
                    "- HVAC + electrical rework\n"
                    "- New furniture and meeting rooms\n"
                    "- IT cutover (network, AV)"
                ),
                scope_out=(
                    "- Ground floor lobby (Phase 3)\n"
                    "- Parking facility refresh\n"
                    "- External signage"
                ),
                status="in_progress",
            ),
        )

        # PRINCE2 board (members require User FK; left empty in demo)
        ProjectBoard.objects.get_or_create(project=project)

        # ---- Demo team members (owners / team managers) -----------------
        from accounts.models import CustomUser
        from projects.models import ProjectTeam

        team_spec = [
            ("maya.okonkwo@yanmar-demo.com", "Maya", "Okonkwo", "pm"),
            ("tom.devries@yanmar-demo.com", "Tom", "de Vries", "contibuter"),
            ("lena.fischer@yanmar-demo.com", "Lena", "Fischer", "contibuter"),
            ("raj.patel@yanmar-demo.com", "Raj", "Patel", "contibuter"),
        ]
        people = {}
        for email, first, last, role in team_spec:
            u, _ = CustomUser.objects.get_or_create(
                email=email,
                defaults=dict(username=email, first_name=first, last_name=last,
                              company=company, role=role, is_active=True),
            )
            # keep company/name in sync on re-run
            if u.company_id != company.id or u.first_name != first:
                u.company = company
                u.first_name = first
                u.last_name = last
                u.save(update_fields=["company", "first_name", "last_name"])
            people[first.lower()] = u
            ProjectTeam.objects.get_or_create(
                project=project, user=u, defaults=dict(is_active=True),
            )
        maya = people["maya"]
        tom = people["tom"]
        lena = people["lena"]
        raj = people["raj"]

        # Stages -- PRINCE2 status choices: planned / active / completed / exception
        stages_spec = [
            ("Prepare", date(2025, 12, 1), date(2026, 2, 28), "completed"),
            ("Renovations", date(2026, 3, 1), date(2026, 7, 31), "active"),
            ("Run", date(2026, 8, 1), date(2026, 9, 30), "planned"),
        ]
        Stage.objects.filter(project=project).delete()
        stages = []
        for name, start, end, status in stages_spec:
            stages.append(
                Stage.objects.create(
                    project=project, name=name,
                    planned_start_date=start, planned_end_date=end,
                    status=status,
                )
            )

        # ---- Work Packages (Managing Product Delivery) ------------------
        from prince2.models import WorkPackage
        WorkPackage.objects.filter(project=project).delete()
        wp_hvac = WorkPackage.objects.create(
            project=project, stage=stages[1], reference="WP-01",
            title="HVAC installation", team_manager=tom,
            description="Supply and install HVAC across floors 1 and 2.",
            product_descriptions="Installed + commissioned HVAC system with handover docs.",
            techniques="Mechanical install per spec MS-204; pressure-test before sign-off.",
            tolerances="Time: +1 week. Cost: +5%. Quality: zero open defects at handover.",
            constraints="Work outside core hours on floor 2 (occupied).",
            reporting_requirements="Weekly checkpoint report every Friday.",
            planned_start_date=date(2026, 3, 15), planned_end_date=date(2026, 6, 30),
            actual_start_date=date(2026, 3, 18),
            status="in_progress", priority="high", progress_percentage=45,
            accepted_by_tm=True, accepted_at=timezone.now(),
        )
        wp_elec = WorkPackage.objects.create(
            project=project, stage=stages[1], reference="WP-02",
            title="Electrical fit-out", team_manager=lena,
            description="First + second fix electrical, new distribution boards.",
            product_descriptions="Certified electrical installation (NEN 1010).",
            tolerances="Time: +3 days. Cost: +5%.",
            reporting_requirements="Weekly checkpoint report.",
            planned_start_date=date(2026, 4, 1), planned_end_date=date(2026, 6, 15),
            status="authorized", priority="high", progress_percentage=10,
            accepted_by_tm=True, accepted_at=timezone.now(),
        )
        wp_furniture = WorkPackage.objects.create(
            project=project, stage=stages[1], reference="WP-03",
            title="Furniture & interior", team_manager=raj,
            description="Order and install furniture, meeting rooms, signage.",
            product_descriptions="Furnished floors with meeting-room AV.",
            tolerances="Time: +1 week. Cost: +3%.",
            planned_start_date=date(2026, 4, 15), planned_end_date=date(2026, 7, 10),
            actual_start_date=date(2026, 4, 16),
            status="in_progress", priority="medium", progress_percentage=60,
            accepted_by_tm=True, accepted_at=timezone.now(),
        )
        wp_it = WorkPackage.objects.create(
            project=project, stage=stages[2], reference="WP-04",
            title="IT cutover", team_manager=tom,
            description="Network + AV cutover from old to new infrastructure.",
            product_descriptions="Live network on new infra, zero data loss.",
            tolerances="Time: 0 (fixed window). Quality: zero downtime in core hours.",
            constraints="Cutover only in the maintenance window (weekend).",
            planned_start_date=date(2026, 8, 10), planned_end_date=date(2026, 8, 31),
            status="draft", priority="urgent", progress_percentage=0,
        )
        wp_it.depends_on.set([wp_hvac, wp_elec])

        # Milestones + tasks (Milestone uses start_date/end_date, not due_date)
        Milestone.objects.filter(project=project).delete()
        Milestone.objects.create(
            project=project, name="Permits & demolition",
            description="All required permits + demolition complete",
            status="completed",
            start_date=date(2025, 12, 1), end_date=date(2026, 2, 28),
        )
        m_reno = Milestone.objects.create(
            project=project, name="Renovation works",
            description="HVAC + electrical + finishing",
            status="in_progress",
            start_date=date(2026, 3, 1), end_date=date(2026, 7, 15),
        )
        m_run = Milestone.objects.create(
            project=project, name="Cutover & handover",
            description="IT cutover, snagging, handover",
            status="pending",
            start_date=date(2026, 8, 1), end_date=date(2026, 9, 20),
        )

        # --- Activity List: work activities (owners + work-package links) ---
        Task.objects.create(
            milestone=m_reno, title="Block 4 permit follow-up",
            description="Chase municipality on Block 4 permit",
            assigned_to=maya, raci_responsible=maya,
            due_date=date(2026, 5, 15), revised_due_date=date(2026, 5, 26),
            status="in_progress", priority="high", progress=40,
        )
        Task.objects.create(
            milestone=m_reno, title="HVAC commissioning",
            description="Final commissioning + handover docs",
            assigned_to=tom, raci_responsible=tom, work_package=wp_hvac,
            due_date=date(2026, 6, 20),
            status="in_progress", priority="high", progress=45,
        )
        Task.objects.create(
            milestone=m_reno, title="Electrical first fix — floor 1",
            description="First-fix wiring + distribution board floor 1",
            assigned_to=lena, raci_responsible=lena, work_package=wp_elec,
            due_date=date(2026, 6, 10),
            status="in_progress", priority="high", progress=30,
        )
        Task.objects.create(
            milestone=m_reno, title="Furniture order — Wave 1",
            description="Order desks + chairs for floor 1",
            assigned_to=raj, raci_responsible=raj, work_package=wp_furniture,
            due_date=date(2026, 5, 5), completed_on=date(2026, 5, 3),
            status="done", priority="medium", progress=100,
        )
        Task.objects.create(
            milestone=m_reno, title="Furniture install — Wave 2",
            description="Install meeting-room furniture + AV floor 2",
            assigned_to=raj, raci_responsible=raj, work_package=wp_furniture,
            due_date=date(2026, 7, 1),
            status="todo", priority="medium", progress=0,
        )
        Task.objects.create(
            milestone=m_run, title="Network cutover",
            description="Switch users from old to new network",
            assigned_to=tom, raci_responsible=tom, work_package=wp_it,
            due_date=date(2026, 8, 25),
            status="todo", priority="urgent", progress=0,
        )
        Task.objects.create(
            milestone=m_run, title="Snagging list — floor 1",
            description="Walk floor 1, log + close snags before handover",
            assigned_to=lena, raci_responsible=lena,
            due_date=date(2026, 9, 5),
            status="todo", priority="medium", progress=0,
        )

        # --- Action Tracker: open actions / follow-ups (category="Action") ---
        m_actions = Milestone.objects.create(
            project=project, name="Meeting Actions",
            description="Action items raised in meetings and reviews",
            status="in_progress",
            start_date=date(2026, 4, 1), end_date=date(2026, 9, 30),
        )
        actions_spec = [
            ("Send permit escalation letter to municipality", maya, date(2026, 5, 20), "high", "in_progress", 50),
            ("Confirm HVAC commissioning date with supplier", tom, date(2026, 5, 28), "urgent", "todo", 0),
            ("Circulate Steerco #4 minutes to board", maya, date(2026, 5, 22), "medium", "done", 100),
            ("Update risk register after permit review", lena, date(2026, 6, 12), "medium", "todo", 0),
            ("Arrange parking-mitigation comms to staff", raj, date(2026, 6, 18), "low", "todo", 0),
            ("Order long-lead AV equipment for cutover", tom, date(2026, 6, 9), "high", "in_progress", 25),
        ]
        for title, owner, due, prio, status, prog in actions_spec:
            Task.objects.create(
                milestone=m_actions, title=title, category="Action",
                assigned_to=owner, raci_responsible=owner,
                due_date=due, status=status, priority=prio, progress=prog,
            )

        # Budget
        ProjectBudget.objects.update_or_create(
            project=project,
            defaults=dict(
                total_budget=Decimal("450000"),
                etc=Decimal("180000"),
                contingency=Decimal("50000"),
                currency="EUR",
                period_start=date(2025, 12, 1),
                period_end=date(2026, 9, 30),
            ),
        )

        # Risks (mapped onto 5x5 grid in the exporter).
        # Risk fields use capitalized choices: impact/level/status.
        Risk.objects.filter(project=project).delete()
        Risk.objects.create(
            project=project, name="Block 4 permit delay",
            description="Municipality slow on Block 4 permit",
            category="Schedule",
            probability=60, impact="High", level="High", status="Open",
        )
        Risk.objects.create(
            project=project, name="HVAC supplier slip",
            description="Subcontractor lead-time risk",
            category="Operational",
            probability=80, impact="High", level="High", status="Open",
        )
        Risk.objects.create(
            project=project, name="Parking loss during works",
            description="Reduced parking during Phase 2",
            category="Operational",
            probability=40, impact="Low", level="Medium", status="Open",
        )
        Risk.objects.create(
            project=project, name="IT cutover window",
            description="Cutover may overrun maintenance window",
            category="Technical",
            probability=40, impact="Medium", level="Medium", status="Open",
        )

        # Highlight Report (most recent)
        HighlightReport.objects.filter(project=project).delete()
        HighlightReport.objects.create(
            project=project, stage=stages[1],
            report_date=date(2026, 5, 1),
            period_start=date(2026, 4, 1), period_end=date(2026, 4, 30),
            overall_status="amber",
            rag_budget="green", rag_planning="amber", rag_resources="green",
            status_summary="Overall amber: permit slip risk on Block 4.",
            work_completed=(
                "Demolition complete; new electrical plan signed off; "
                "furniture Wave 1 ordered."
            ),
            work_planned_next_period=(
                "HVAC install start; permit follow-up; furniture Wave 2."
            ),
            highlights=(
                "Demolition done on time. Electrical plan approved by Yanmar IT. "
                "Aiden Vendor confirmed Q3 lead-time."
            ),
            lowlights=(
                "Block 4 permit still pending — risk of 2-week slip. "
                "HVAC subcontractor capacity tight."
            ),
            issues_summary="Permit Block 4 pending\nHVAC subcontractor change",
            risks_summary="Permit delay R1\nSupplier slip R2",
            budget_spent=Decimal("215000"),
            budget_forecast=Decimal("395000"),
        )

        # Meetings (2 — to demo previous-actions carry-forward).
        # Meeting model uses name/type/frequency/date+time/agenda (JSON list).
        from datetime import time as _time
        Meeting.objects.filter(project=project).delete()
        Meeting.objects.create(
            project=project, name="Steerco #3",
            type="onetime", frequency="adhoc",
            date=date(2026, 4, 15), time=_time(14, 0),
            location="YEU-A.2.04",
            agenda=["Demolition signoff", "Permit Block 4 status"],
            participants=["Shah Ally", "Dhruv Saxena", "Sami"],
        )
        Meeting.objects.create(
            project=project, name="Steerco #4 - May",
            type="onetime", frequency="adhoc",
            date=date(2026, 5, 19), time=_time(14, 0),
            location="YEU-A.2.04",
            agenda=["Deep-dive scope", "SAP integration approach"],
            participants=["Shah Ally", "Dhruv Saxena", "Sami"],
        )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded Yanmar demo project (id={project.id}) under {company.name}."
        ))
        self.stdout.write(
            f"  Team: {maya.email}, {tom.email}, {lena.email}, {raj.email}\n"
            f"  Activity List: /projects/{project.id}/planning/tasks\n"
            f"  Action Tracker: /projects/{project.id}/action-tracker\n"
            f"  Work Packages: /projects/{project.id}/prince2/work-packages\n"
            f"  Planning:      /projects/{project.id}/planning/milestones"
        )
        self.stdout.write(
            f"  PPTX export: /api/v1/prince2/projects/{project.id}/"
            f"prince2/highlight-reports/<id>/export/pptx/"
        )
        self.stdout.write(
            f"  AI Minutes:  POST /api/v1/communication/projects/{project.id}/"
            f"meetings/ai-minutes/  body: {{transcript: '...'}}"
        )
