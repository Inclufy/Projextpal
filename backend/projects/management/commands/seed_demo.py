"""
Comprehensive demo seed — one example PROJECT per methodology, one PROGRAMME per
programme methodology, and governance demo data, so every feature can be tested
with realistic data.

    python manage.py seed_demo                  # seed into the first company
    python manage.py seed_demo --company-id 3
    python manage.py seed_demo --wipe           # remove previously seeded demo data first

Idempotent: records are keyed by their "Demo — ..." name (update_or_create), so
re-running refreshes rather than duplicates. Every section is defensive — a model
mismatch in one area never aborts the rest.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone


PROJECT_METHODOLOGIES = [
    ("inclufy", "Inclufy Best Practice"),
    ("scrum", "Scrum"),
    ("kanban", "Kanban"),
    ("waterfall", "Waterfall"),
    ("prince2", "PRINCE2"),
    ("agile", "Agile"),
    ("lean_six_sigma_green", "LSS Green Belt"),
    ("lean_six_sigma_black", "LSS Black Belt"),
    ("hybrid", "Hybrid"),
]
PROGRAM_METHODOLOGIES = [
    ("inclufy", "Inclufy Best Practice"),
    ("safe", "SAFe"),
    ("msp", "MSP"),
    ("pmi", "PMI"),
    ("prince2_programme", "PRINCE2 Programme"),
    ("hybrid", "Hybrid"),
    ("hybrid_programme", "Hybrid Programme"),
]


class Command(BaseCommand):
    help = "Seed one demo project per methodology + programmes + governance demo data."

    def add_arguments(self, parser):
        parser.add_argument("--company-id", type=int, default=None)
        parser.add_argument("--wipe", action="store_true", help="Delete prior 'Demo — ' seeded records first.")

    def handle(self, *args, **opts):
        from accounts.models import Company
        from django.contrib.auth import get_user_model

        User = get_user_model()
        if opts.get("company_id"):
            company = Company.objects.filter(id=opts["company_id"]).first()
        else:
            company = Company.objects.first()
        if not company:
            self.stderr.write("No company found — create one first.")
            return
        user = User.objects.filter(company=company).first() or User.objects.filter(is_superuser=True).first()
        self.stdout.write(f"Seeding demo data into company '{company}' (user={user})")

        if opts.get("wipe"):
            self._wipe(company)

        projects = self._seed_projects(company, user)
        programs = self._seed_programs(company, user, projects)
        self._seed_governance(company, user, projects, programs)
        self.stdout.write(self.style.SUCCESS(
            f"Done. {len(projects)} project(s), {len(programs)} programme(s) + governance demo seeded."
        ))

    # ------------------------------------------------------------------ wipe
    def _wipe(self, company):
        try:
            from projects.models import Project
            n, _ = Project.objects.filter(company=company, name__startswith="Demo — ").delete()
            self.stdout.write(f"  wiped {n} demo project rows")
        except Exception as e:
            self.stderr.write(f"  wipe projects failed: {e}")
        try:
            from programs.models import Program
            n, _ = Program.objects.filter(company=company, name__startswith="Demo — ").delete()
            self.stdout.write(f"  wiped {n} demo programme rows")
        except Exception as e:
            self.stderr.write(f"  wipe programmes failed: {e}")

    # -------------------------------------------------------------- projects
    def _seed_projects(self, company, user):
        from projects.models import Project, Milestone, Task, Risk
        today = timezone.now().date()
        created = []
        for meth, label in PROJECT_METHODOLOGIES:
            name = f"Demo — {label}"
            try:
                project, _ = Project.objects.update_or_create(
                    company=company, name=name,
                    defaults=dict(
                        methodology=meth, status="active",
                        description=f"Demo project showcasing the {label} methodology with realistic data for testing.",
                        budget=120000, currency="EUR",
                        start_date=today - timedelta(days=30), end_date=today + timedelta(days=120),
                        created_by=user,
                    ),
                )
                # Milestones
                Milestone.objects.filter(project=project).delete()
                m1 = Milestone.objects.create(project=project, name="Initiation", description="Kick-off & setup",
                                              start_date=today - timedelta(days=30), end_date=today + timedelta(days=10),
                                              status="completed", order_index=0)
                m2 = Milestone.objects.create(project=project, name="Delivery", description="Core delivery",
                                              start_date=today, end_date=today + timedelta(days=60),
                                              status="in_progress", order_index=1)
                Milestone.objects.create(project=project, name="Close-out", description="Handover & lessons",
                                         start_date=today + timedelta(days=60), end_date=today + timedelta(days=120),
                                         status="pending", order_index=2)
                # Tasks (mix of statuses + an overdue one to trigger signals)
                Task.objects.filter(milestone__project=project).delete()
                Task.objects.create(milestone=m1, title="Define scope", description="", category="Setup",
                                    status="done", priority="high", progress=100, due_date=today - timedelta(days=20))
                Task.objects.create(milestone=m2, title="Build feature A", description="", category="Build",
                                    status="in_progress", priority="high", progress=40, due_date=today + timedelta(days=15))
                Task.objects.create(milestone=m2, title="Integration test", description="", category="Test",
                                    status="todo", priority="medium", progress=0, due_date=today + timedelta(days=30))
                Task.objects.create(milestone=m2, title="Vendor deliverable (late)", description="", category="External",
                                    status="in_progress", priority="urgent", progress=10, due_date=today - timedelta(days=5))
                # Risks (with impact areas → feed compound signals)
                Risk.objects.filter(project=project).delete()
                Risk.objects.create(project=project, name="Key resource availability", description="Lead dev partly allocated",
                                    category="Operational", impact="High", probability=60, level="High", status="Open",
                                    impact_areas=["schedule", "resource"])
                Risk.objects.create(project=project, name="Budget overrun on vendor", description="External costs trending up",
                                    category="Financial", impact="Medium", probability=50, level="Medium", status="Open",
                                    impact_areas=["cost"])
                # Issue (RAID)
                try:
                    from projects.models import Issue
                    Issue.objects.filter(project=project).delete()
                    Issue.objects.create(project=project, name="Blocking dependency from vendor", description="Awaiting API access",
                                         severity="Critical", status="Open")
                except Exception:
                    pass
                # Stakeholders
                try:
                    from execution.models import Stakeholder
                    Stakeholder.objects.filter(project=project).delete()
                    Stakeholder.objects.create(project=project, company=company, name="Sponsor Demo", role="Sponsor",
                                               contact="sponsor@example.com", influence="High", governance_type="Sponsor",
                                               created_by=user)
                    Stakeholder.objects.create(project=project, company=company, name="Team Lead Demo", role="Lead",
                                               contact="lead@example.com", influence="Medium", governance_type="Team Member",
                                               created_by=user)
                except Exception:
                    pass
                # Lesson
                try:
                    from projects.models import LessonLearned
                    LessonLearned.objects.filter(project=project, title__startswith="Demo lesson").delete()
                    LessonLearned.objects.create(project=project, title="Demo lesson: early vendor alignment",
                                                 description="Aligning with the vendor earlier avoids late blockers.",
                                                 category="Process", sentiment="negative",
                                                 recommended_action="Lock vendor SLAs in the initiation phase.",
                                                 applicable_to="organisation", captured_by=user)
                except Exception:
                    pass
                created.append(project)
                self.stdout.write(self.style.SUCCESS(f"  ✓ project {name}"))
            except Exception as e:
                self.stderr.write(f"  ✗ project {name}: {e}")
        return created

    # -------------------------------------------------------------- programs
    def _seed_programs(self, company, user, projects):
        from programs.models import Program
        today = timezone.now().date()
        created = []
        for meth, label in PROGRAM_METHODOLOGIES:
            name = f"Demo — {label} Programme"
            try:
                program, _ = Program.objects.update_or_create(
                    company=company, name=name,
                    defaults=dict(
                        methodology=meth, status="active",
                        description=f"Demo programme showcasing {label} with constituent demo projects.",
                        strategic_objective="Deliver the demo strategic outcome.",
                        start_date=today - timedelta(days=30), target_end_date=today + timedelta(days=180),
                        total_budget=500000, currency="EUR", created_by=user,
                    ),
                )
                # link 2 demo projects so rollups + compound signals have data
                if projects:
                    program.projects.set(projects[:3])
                created.append(program)
                self.stdout.write(self.style.SUCCESS(f"  ✓ programme {name}"))
            except Exception as e:
                self.stderr.write(f"  ✗ programme {name}: {e}")
        return created

    # ------------------------------------------------------------ governance
    def _seed_governance(self, company, user, projects, programs):
        try:
            from governance.models import Portfolio, GovernanceBoard, Decision
        except Exception as e:
            self.stderr.write(f"  governance import failed: {e}")
            return
        prog = programs[0] if programs else None
        proj = projects[0] if projects else None
        try:
            portfolio, _ = Portfolio.objects.update_or_create(
                company=company, name="Demo — Portfolio",
                defaults=dict(description="Demo portfolio", status="active", priority="high"),
            )
            steering, _ = GovernanceBoard.objects.get_or_create(
                portfolio=portfolio, board_type="steering_committee",
                defaults=dict(name="Demo — Steering Committee"),
            )
            if prog:
                pboard, _ = GovernanceBoard.objects.get_or_create(
                    program=prog, defaults=dict(name=f"{prog.name} — Programme Board", board_type="program_board"))
            # A pending escalated decision at each tier so the dashboard + ladder show data
            if prog:
                Decision.objects.get_or_create(
                    board=pboard, program=prog, title="Demo — approve next tranche",
                    defaults=dict(description="Demo programme decision pending board vote.", impact="high", status="pending"))
            if proj:
                pjboard, _ = GovernanceBoard.objects.get_or_create(
                    project=proj, defaults=dict(name=f"{proj.name} — Project Board", board_type="project_board"))
                Decision.objects.get_or_create(
                    board=pjboard, authorized_project=proj, title="Demo — escalate vendor blocker",
                    defaults=dict(description="Demo project decision escalated to the board.\n\n[Escalated to governance (Project board) from an AI compound signal.]",
                                  impact="high", status="pending"))
            self.stdout.write(self.style.SUCCESS("  ✓ governance demo (portfolio, boards, decisions)"))
        except Exception as e:
            self.stderr.write(f"  ✗ governance: {e}")
