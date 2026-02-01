#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from academy.models import Course, CourseCategory, CourseInstructor

# Create categories
print("Creating categories...")
pm_cat, _ = CourseCategory.objects.get_or_create(
    slug='pm',
    defaults={'name': 'Project Management', 'icon': 'Target', 'order': 1}
)
agile_cat, _ = CourseCategory.objects.get_or_create(
    slug='agile',
    defaults={'name': 'Agile & Scrum', 'icon': 'Zap', 'order': 2}
)
program_cat, _ = CourseCategory.objects.get_or_create(
    slug='program',
    defaults={'name': 'Program Management', 'icon': 'Layers', 'order': 3}
)
leadership_cat, _ = CourseCategory.objects.get_or_create(
    slug='leadership',
    defaults={'name': 'Leadership', 'icon': 'Crown', 'order': 4}
)
tools_cat, _ = CourseCategory.objects.get_or_create(
    slug='tools',
    defaults={'name': 'Tools', 'icon': 'Wrench', 'order': 5}
)

# Create instructor
print("Creating instructor...")
instructor, _ = CourseInstructor.objects.get_or_create(
    name='Sami Inclufy',
    defaults={
        'title': 'Senior PM Consultant & Academy Lead',
        'bio': 'Experienced project management professional with 10+ years in the field.',
        'bio_nl': 'Ervaren projectmanagement professional met 10+ jaar ervaring.',
    }
)

# Create courses
print("Creating courses...")

courses_data = [
    {
        'title': 'Project Management Fundamentals',
        'slug': 'pm-fundamentals',
        'category': pm_cat,
        'price': 0,
        'student_count': 12453,
        'rating': 4.9,
        'status': 'published',
        'is_featured': True,
        'is_bestseller': True,
    },
    {
        'title': 'Agile & Scrum Mastery',
        'slug': 'agile-scrum-mastery',
        'category': agile_cat,
        'price': 49.00,
        'student_count': 8934,
        'rating': 4.8,
        'status': 'published',
        'is_featured': True,
    },
    {
        'title': 'SAFe & Scaling Agile',
        'slug': 'safe-scaling-agile',
        'category': agile_cat,
        'price': 79.00,
        'student_count': 5621,
        'rating': 4.7,
        'status': 'published',
    },
    {
        'title': 'Program Management Professional',
        'slug': 'program-management-pro',
        'category': program_cat,
        'price': 99.00,
        'student_count': 3847,
        'rating': 4.9,
        'status': 'published',
    },
    {
        'title': 'PRINCE2 Foundation & Practitioner',
        'slug': 'prince2-foundation',
        'category': pm_cat,
        'price': 149.00,
        'student_count': 7234,
        'rating': 4.8,
        'status': 'published',
        'is_featured': True,
        'is_bestseller': True,
    },
    {
        'title': 'Six Sigma Green Belt',
        'slug': 'six-sigma-green-belt',
        'category': pm_cat,
        'price': 129.00,
        'student_count': 4521,
        'rating': 4.6,
        'status': 'draft',
    },
    {
        'title': 'Leadership for Project Managers',
        'slug': 'leadership-pm',
        'category': leadership_cat,
        'price': 0,
        'student_count': 2847,
        'rating': 4.7,
        'status': 'published',
    },
    {
        'title': 'Microsoft Project Masterclass',
        'slug': 'ms-project-masterclass',
        'category': tools_cat,
        'price': 39.00,
        'student_count': 1853,
        'rating': 4.5,
        'status': 'published',
    },
]

for course_data in courses_data:
    course, created = Course.objects.get_or_create(
        slug=course_data['slug'],
        defaults={
            **course_data,
            'instructor': instructor,
            'description': f'Learn {course_data["title"]} with hands-on projects and expert guidance.',
            'description_nl': f'Leer {course_data["title"]} met praktische projecten en expert begeleiding.',
            'duration_hours': 12,
            'difficulty': 'intermediate',
        }
    )
    if created:
        print(f"✓ Created: {course.title}")
    else:
        print(f"- Exists: {course.title}")

print("\n✅ Database seeded successfully!")
