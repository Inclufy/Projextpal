"""Seed the AI Literacy course row in the backend.

Matches frontend/src/data/academy/courses/ai-literacy.ts.
Slug: 'ai-literacy' (so frontend routes like /academy/course/ai-literacy
resolve to this backend row, enabling enrollment + progress + cert flow).
"""
from django.db import migrations


def seed(apps, schema_editor):
    Course = apps.get_model('academy', 'Course')
    CourseCategory = apps.get_model('academy', 'CourseCategory')

    category, _ = CourseCategory.objects.get_or_create(
        slug='ai-literacy',
        defaults={
            'name': 'AI & Digital Literacy',
            'icon': 'Sparkles',
            'order': 2,
        },
    )

    Course.objects.get_or_create(
        slug='ai-literacy',
        defaults={
            'title': 'AI Literacy for Project Professionals',
            'title_nl': 'AI Letterkundige Kennis voor Projectprofessionals',
            'description': (
                'What AI actually is, how LLMs work, where they fail, and how to '
                'use them responsibly in project work — including EU AI Act '
                'compliance.'
            ),
            'description_nl': (
                'Wat AI werkelijk is, hoe LLMs werken, waar ze falen, en hoe je '
                'ze verantwoord gebruikt in projectwerk — inclusief EU AI Act '
                'compliance.'
            ),
            'category': category,
            'difficulty': 'intermediate',
            'duration_hours': 10,
            'language': 'Nederlands & English',
            'icon': 'Sparkles',
            'color': '#A855F7',
            'has_certificate': True,
            'status': 'published',
            'price': 0,  # Free by default; ops can set paid tier via admin
            'is_new': True,
            'is_featured': True,
        },
    )


def unseed(apps, schema_editor):
    Course = apps.get_model('academy', 'Course')
    c = Course.objects.filter(slug='ai-literacy').first()
    if c and not c.enrollments.exists():
        c.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('academy', '0014_seed_frontend_courses'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
