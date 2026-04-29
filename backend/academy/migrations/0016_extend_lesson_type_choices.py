"""Extend CourseLesson.lesson_type choices to include 'exam', 'practice',
'pdf', 'docx'.

These types are emitted by the frontend TS course definitions and ingested
by the import_frontend_courses management command. Adding them to choices
is a metadata-only change (CharField, max_length unchanged), but Django
still tracks it in the migration graph.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academy', '0015_seed_ai_literacy_course'),
    ]

    operations = [
        migrations.AlterField(
            model_name='courselesson',
            name='lesson_type',
            field=models.CharField(
                choices=[
                    ('video', 'Video'),
                    ('text', 'Text/Article'),
                    ('quiz', 'Quiz'),
                    ('assignment', 'Assignment'),
                    ('download', 'Downloadable Resource'),
                    ('exam', 'Exam'),
                    ('practice', 'Practice / Exercise'),
                    ('pdf', 'PDF Document'),
                    ('docx', 'DOCX Document'),
                ],
                default='video',
                max_length=20,
            ),
        ),
    ]
