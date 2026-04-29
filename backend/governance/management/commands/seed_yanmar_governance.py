"""Idempotent seed for the Yanmar steering committee.

Audit (April 2026) found that the Yanmar Compact Equipment Refresh programme
(programs.Program id=15) had no governance board attached, while three
unrelated CRM-style boards existed in the DB. This command provisions:

  * A `GovernanceBoard` of type 'steering_committee' for programme 15
  * Three placeholder `BoardMember` rows (Sami as chair / programme manager,
    a sponsor placeholder, an IT advisor placeholder)

Run repeatedly without producing duplicates:

    python manage.py seed_yanmar_governance
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from governance.models import GovernanceBoard, BoardMember


YANMAR_PROGRAM_ID = 15
BOARD_NAME = "Yanmar Compact Equipment Refresh — Steering Board"
BOARD_TYPE = "steering_committee"

# (email, first_name, last_name, board_role, label)
# board_role must be one of BoardMember.MEMBER_ROLES
# label is the conceptual stakeholder role (program_manager / sponsor / IT)
MEMBERS = [
    ("sami@projextpal.com",      "Sami",       "Loukile",         "chair",  "program_manager"),
    ("sponsor.tbd@yanmar.local", "TBD",        "Sponsor",         "member", "executive_sponsor"),
    ("it.tbd@yanmar.local",      "TBD",        "IT-Advisor",      "member", "technical_advisor"),
]


class Command(BaseCommand):
    help = "Seed the Yanmar steering committee + 3 placeholder board members (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        from programs.models import Program

        try:
            program = Program.objects.get(pk=YANMAR_PROGRAM_ID)
        except Program.DoesNotExist:
            self.stderr.write(self.style.ERROR(
                f"Program id={YANMAR_PROGRAM_ID} (Yanmar) not found — aborting."
            ))
            return

        board, created = GovernanceBoard.objects.get_or_create(
            program=program,
            board_type=BOARD_TYPE,
            name=BOARD_NAME,
            defaults={
                "description": (
                    "Steering committee for the Yanmar Compact Equipment Refresh "
                    "programme. Owns scope/budget/schedule decisions, reviews "
                    "highlight reports, and arbitrates cross-project escalations."
                ),
                "meeting_frequency": "Bi-weekly",
                "is_active": True,
            },
        )
        verb = "Created" if created else "Found existing"
        self.stdout.write(f"{verb} board: {board}")

        User = get_user_model()
        for email, first, last, role, label in MEMBERS:
            user, u_created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": first,
                    "last_name": last,
                },
            )
            if u_created:
                # Set unusable password — these are placeholder accounts.
                user.set_unusable_password()
                user.save(update_fields=["password"])

            member, m_created = BoardMember.objects.get_or_create(
                board=board,
                user=user,
                defaults={"role": role, "is_active": True},
            )
            mverb = "Added" if m_created else "Already present"
            self.stdout.write(f"  {mverb}: {user.email} ({role} / {label})")

            # If the chair was just promoted, attach as board.chair too so the
            # admin portal renders the chair name without an extra query.
            if role == "chair" and board.chair_id != user.id:
                board.chair = user
                board.save(update_fields=["chair"])

        self.stdout.write(self.style.SUCCESS("Yanmar governance seed complete."))
