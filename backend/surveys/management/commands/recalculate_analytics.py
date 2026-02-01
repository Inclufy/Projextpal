# surveys/management/commands/recalculate_analytics.py
from django.core.management.base import BaseCommand
from surveys.models import Survey, SurveyAnalytics


class Command(BaseCommand):
    help = 'Recalculate analytics for all surveys'

    def handle(self, *args, **options):
        surveys = Survey.objects.all()
        
        for survey in surveys:
            analytics, created = SurveyAnalytics.objects.get_or_create(survey=survey)
            analytics.calculate_metrics()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Recalculated analytics for survey "{survey.name}": '
                    f'{analytics.total_responses} responses, '
                    f'{analytics.response_rate:.1f}% response rate'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully recalculated analytics for {surveys.count()} surveys')
        )
