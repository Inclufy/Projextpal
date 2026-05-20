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

        # Milestones + tasks (Milestone uses start_date/end_date, not due_date)
        Milestone.objects.filter(project=project).delete()
        m_prep = Milestone.objects.create(
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

        Task.objects.create(
            milestone=m_reno, title="Block 4 permit follow-up",
            description="Chase municipality on Block 4 permit",
            due_date=date(2026, 5, 15),
            revised_due_date=date(2026, 5, 26),
            status="in_progress", priority="high", progress=40,
        )
        Task.objects.create(
            milestone=m_reno, title="HVAC commissioning",
            description="Final commissioning + handover docs",
            due_date=date(2026, 6, 20),
            status="todo", priority="medium", progress=10,
        )
        Task.objects.create(
            milestone=m_reno, title="Furniture order — Wave 1",
            description="Order desks + chairs for floor 1",
            due_date=date(2026, 5, 5),
            completed_on=date(2026, 5, 3),
            status="done", priority="medium", progress=100,
        )
        Task.objects.create(
            milestone=m_run, title="Network cutover",
            description="Switch users from old to new network",
            due_date=date(2026, 8, 25),
            status="todo", priority="urgent", progress=0,
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
            f"  PPTX export: /api/v1/prince2/projects/{project.id}/"
            f"prince2/highlight-reports/<id>/export/pptx/"
        )
        self.stdout.write(
            f"  AI Minutes:  POST /api/v1/communication/projects/{project.id}/"
            f"meetings/ai-minutes/  body: {{transcript: '...'}}"
        )
