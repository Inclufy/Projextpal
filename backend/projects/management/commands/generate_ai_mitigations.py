"""
Management command to generate AI mitigation plans for existing risks.
Usage: python manage.py generate_ai_mitigations [--all] [--risk-id <id>]
"""

from django.core.management.base import BaseCommand
from projects.models import Risk, AIMitigation
from projects.ai_risk_mitigation import generate_ai_mitigation


class Command(BaseCommand):
    help = "Generate AI mitigation plans for risks that don't have one"

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Regenerate AI mitigation for all risks (even those with existing mitigation)",
        )
        parser.add_argument(
            "--risk-id",
            type=int,
            help="Generate AI mitigation for a specific risk ID",
        )

    def handle(self, *args, **options):
        all_risks = options.get("all")
        risk_id = options.get("risk_id")

        if risk_id:
            # Generate for specific risk
            try:
                risk = Risk.objects.get(id=risk_id)
                self.generate_for_risk(risk, force=True)
            except Risk.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"Risk with ID {risk_id} does not exist")
                )
                return
        else:
            # Get risks without AI mitigation or all risks
            if all_risks:
                risks = Risk.objects.all()
                self.stdout.write(
                    self.style.WARNING(
                        f"Regenerating AI mitigation for ALL {risks.count()} risks..."
                    )
                )
            else:
                # Only risks without AI mitigation
                risks = Risk.objects.filter(ai_mitigation__isnull=True)
                self.stdout.write(
                    self.style.WARNING(
                        f"Found {risks.count()} risks without AI mitigation"
                    )
                )

            if not risks.exists():
                self.stdout.write(
                    self.style.SUCCESS("All risks already have AI mitigation!")
                )
                return

            # Generate for each risk
            success_count = 0
            error_count = 0

            for risk in risks:
                try:
                    self.generate_for_risk(risk, force=all_risks)
                    success_count += 1
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Failed to generate AI mitigation for risk {risk.id}: {str(e)}"
                        )
                    )
                    error_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nCompleted! Success: {success_count}, Errors: {error_count}"
                )
            )

    def generate_for_risk(self, risk, force=False):
        """Generate AI mitigation for a single risk"""
        risk_data = {
            "name": risk.name,
            "description": risk.description,
            "category": risk.category,
            "impact": risk.impact,
            "probability": risk.probability,
            "level": risk.level,
            "project_name": risk.project.name if risk.project else None,
            "project_description": risk.project.description if risk.project else None,
        }

        # Generate AI mitigation
        ai_plan = generate_ai_mitigation(risk_data)

        # Create or update AI mitigation
        if force or not hasattr(risk, "ai_mitigation"):
            ai_mitigation, created = AIMitigation.objects.update_or_create(
                risk=risk,
                defaults={
                    "strategy": ai_plan["strategy"],
                    "actions": ai_plan["actions"],
                    "timeline": ai_plan["timeline"],
                    "cost": ai_plan["cost"],
                    "effectiveness": ai_plan["effectiveness"],
                },
            )

            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(
                    f"{action} AI mitigation for risk '{risk.name}' (ID: {risk.id})"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Skipped risk '{risk.name}' (ID: {risk.id}) - already has AI mitigation"
                )
            )
