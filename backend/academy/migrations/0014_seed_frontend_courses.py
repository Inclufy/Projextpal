"""Seed backend Course rows for the 12 hardcoded frontend courses.

Academy uses hardcoded course content from frontend/src/data/academy/courses/*.ts
but the backend needs matching Course rows so that Enrollment, progress
tracking, certificates, and Stripe checkout all have something to FK to.

Each row uses the SAME id string as the frontend course.id — which matches
the `slug` lookup we added in migration 0013. That lets the frontend fetch
by frontend-id and the backend find the row via slug.

Safe to run multiple times: uses get_or_create. Prices are set to 0 (free)
initially; ops can raise them through the admin later.
"""
from django.db import migrations

# (frontend_id, title_en, title_nl, description_en, difficulty, duration_hours, icon, color)
COURSES = [
    ('pm-fundamentals',       'Project Management Fundamentals',     'Projectmanagement Fundamenten',        'Core PM concepts, the 5 phases, tools and templates.',            'beginner',     12, 'Layers',      '#8B5CF6'),
    ('prince2-foundation',    'PRINCE2 Foundation & Practitioner',   'PRINCE2 Foundation & Practitioner',    '7 principles, 7 themes, 7 processes — Foundation + Practitioner exam prep.', 'intermediate', 20, 'Shield',      '#4F46E5'),
    ('scrum-master',          'Scrum Master Certified',              'Scrum Master Gecertificeerd',          'Scrum framework, events, artifacts, PSM-I exam prep.',            'intermediate', 14, 'Zap',         '#10B981'),
    ('waterfall-pm',          'Waterfall Project Management',        'Waterfall Projectmanagement',          'Sequential methodology, phase gates, documentation-first delivery.','beginner',     10, 'Waves',       '#0EA5E9'),
    ('kanban-practitioner',   'Kanban for Knowledge Work',           'Kanban voor Kenniswerk',               'Flow, WIP limits, CFD, and continuous improvement.',              'intermediate', 8,  'Columns',     '#F59E0B'),
    ('agile-fundamentals',    'Agile Fundamentals',                  'Agile Fundamenten',                    'Agile Manifesto, principles, and common frameworks.',             'beginner',     8,  'Sparkles',    '#EC4899'),
    ('lean-six-sigma',        'Lean Six Sigma Green Belt',           'Lean Six Sigma Green Belt',            'DMAIC methodology, statistical tools, process improvement.',      'advanced',     30, 'Target',      '#EF4444'),
    ('leadership-pm',         'Leadership for Project Managers',     'Leiderschap voor Projectmanagers',     'Leadership styles, team dynamics, stakeholder influence.',        'intermediate', 12, 'Crown',       '#F97316'),
    ('program-management-pro','Program Management Professional',     'Program Management Professional',      'Multi-project governance, benefits realization, PgMP prep.',       'advanced',     25, 'Grid3x3',     '#6366F1'),
    ('safe-scaling-agile',    'SAFe & Scaling Agile',                'SAFe & Schaalbaar Agile',              'SAFe framework, PI Planning, ARTs, portfolio SAFe.',              'advanced',     20, 'Network',     '#14B8A6'),
    ('ms-project-masterclass','Microsoft Project Masterclass',       'Microsoft Project Masterclass',        'Hands-on MS Project: tasks, resources, baselines, reporting.',     'intermediate', 16, 'Clipboard',   '#3B82F6'),
    ('stakeholder-management','Stakeholder Management',              'Stakeholdermanagement',                'Identification, analysis, engagement strategies, comms plans.',   'beginner',     6,  'Users',       '#A855F7'),
]


def seed(apps, schema_editor):
    Course = apps.get_model('academy', 'Course')
    CourseCategory = apps.get_model('academy', 'CourseCategory')

    # Ensure a default category exists (Course.category is non-null PROTECT FK)
    category, _ = CourseCategory.objects.get_or_create(
        slug='project-management',
        defaults={'name': 'Project Management', 'icon': 'Briefcase', 'order': 1},
    )

    for fid, title_en, title_nl, desc, difficulty, hours, icon, color in COURSES:
        # Use frontend id as the slug. If a course with this slug already
        # exists (e.g. from an earlier backfill migration), leave it alone
        # so we don't overwrite admin edits.
        Course.objects.get_or_create(
            slug=fid,
            defaults={
                'title': title_en,
                'title_nl': title_nl,
                'description': desc,
                'description_nl': desc,
                'category': category,
                'difficulty': difficulty,
                'duration_hours': hours,
                'language': 'Nederlands & English',
                'icon': icon,
                'color': color,
                'has_certificate': True,
                'status': 'published',
                'price': 0,  # Free by default; ops can raise via admin
            },
        )


def unseed(apps, schema_editor):
    Course = apps.get_model('academy', 'Course')
    slugs = [c[0] for c in COURSES]
    # Only delete if no enrollments reference them (PROTECT FK would error anyway)
    for slug in slugs:
        course = Course.objects.filter(slug=slug).first()
        if course and not course.enrollments.exists():
            course.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('academy', '0013_backfill_course_slugs'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
