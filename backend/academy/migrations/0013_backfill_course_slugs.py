"""Backfill slugs on existing courses.

Existing rows may have slug='' because the old AI course generator
didn't set one. With CourseViewSet now supporting slug lookups, those
rows still can't be found by slug. Backfill from the title.
"""
from django.db import migrations
from django.utils.text import slugify


def backfill_slugs(apps, schema_editor):
    Course = apps.get_model('academy', 'Course')
    seen_slugs = set(
        Course.objects.exclude(slug='').values_list('slug', flat=True)
    )
    for course in Course.objects.filter(slug='').only('id', 'title'):
        base = slugify(course.title or 'course')[:50] or 'course'
        slug = base
        n = 2
        while slug in seen_slugs:
            slug = f"{base}-{n}"
            n += 1
        seen_slugs.add(slug)
        course.slug = slug
        course.save(update_fields=['slug'])


def reverse(apps, schema_editor):
    # No-op: reversing the backfill would clear slugs, which is destructive.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('academy', '0012_merge_20260225_1124'),
    ]

    operations = [
        migrations.RunPython(backfill_slugs, reverse),
    ]
