# ============================================================
# ACADEMY - SEED SKILLS TAXONOMY (full coverage)
# ============================================================
#
# Adds 3 missing categories (technology, process-improvement,
# scaled-delivery), ~50+ skills, and bulk-creates LessonSkillMapping
# rows for every CourseLesson across all 12 courses using a title-based
# heuristic.
#
# Idempotent — safe to re-run. Existing rows are preserved, new ones
# are added with get_or_create.
# ============================================================

from django.core.management.base import BaseCommand
from django.db import transaction

from academy.models import (
    Course,
    CourseLesson,
    SkillCategory,
    Skill,
    LessonSkillMapping,
)


# ------------------------------------------------------------
# Categories — adds the 3 missing ones to the existing 6
# ------------------------------------------------------------
NEW_CATEGORIES = [
    {
        'id': 'technology',
        'name': 'Technology & AI',
        'name_nl': 'Technologie & AI',
        'icon': 'Cpu',
        'color': 'cyan',
        'order': 7,
    },
    {
        'id': 'process-improvement',
        'name': 'Process Improvement',
        'name_nl': 'Procesverbetering',
        'icon': 'Activity',
        'color': 'orange',
        'order': 8,
    },
    {
        'id': 'scaled-delivery',
        'name': 'Scaled Delivery',
        'name_nl': 'Geschaalde Levering',
        'icon': 'Network',
        'color': 'teal',
        'order': 9,
    },
]


# ------------------------------------------------------------
# Skills — ~55 skills across all 9 categories (6 existing + 3 new)
# Existing 25 skills (from seed_skills.py) are NOT duplicated;
# get_or_create is keyed on `id`.
# ------------------------------------------------------------
NEW_SKILLS = [
    # planning (existing) — add a few more
    {'id': 'wbs', 'category_id': 'planning', 'name': 'Work Breakdown Structure', 'name_nl': 'Werkstructuur (WBS)'},
    {'id': 'milestone-planning', 'category_id': 'planning', 'name': 'Milestone Planning', 'name_nl': 'Mijlpaalplanning'},
    {'id': 'sprint-planning', 'category_id': 'planning', 'name': 'Sprint Planning', 'name_nl': 'Sprint Planning'},
    {'id': 'pi-planning', 'category_id': 'planning', 'name': 'PI Planning', 'name_nl': 'PI Planning'},

    # stakeholder (existing) — add more
    {'id': 'stakeholder-analysis', 'category_id': 'stakeholder', 'name': 'Stakeholder Analysis', 'name_nl': 'Stakeholderanalyse'},
    {'id': 'influence', 'category_id': 'stakeholder', 'name': 'Influence & Persuasion', 'name_nl': 'Beïnvloeden'},

    # risk (existing) — add more
    {'id': 'quality-assurance', 'category_id': 'risk', 'name': 'Quality Assurance', 'name_nl': 'Kwaliteitsborging'},
    {'id': 'change-control', 'category_id': 'risk', 'name': 'Change Control', 'name_nl': 'Wijzigingsbeheer'},

    # leadership (existing) — add more
    {'id': 'coaching', 'category_id': 'leadership', 'name': 'Coaching', 'name_nl': 'Coaching'},
    {'id': 'servant-leadership', 'category_id': 'leadership', 'name': 'Servant Leadership', 'name_nl': 'Dienend Leiderschap'},
    {'id': 'emotional-intelligence', 'category_id': 'leadership', 'name': 'Emotional Intelligence', 'name_nl': 'Emotionele Intelligentie'},

    # financial (existing) — add more
    {'id': 'earned-value', 'category_id': 'financial', 'name': 'Earned Value Management', 'name_nl': 'Earned Value Management'},
    {'id': 'business-case', 'category_id': 'financial', 'name': 'Business Case', 'name_nl': 'Business Case'},
    {'id': 'benefits-realization', 'category_id': 'financial', 'name': 'Benefits Realization', 'name_nl': 'Batenrealisatie'},

    # tools (existing) — add more
    {'id': 'ms-project', 'category_id': 'tools', 'name': 'Microsoft Project', 'name_nl': 'Microsoft Project'},
    {'id': 'jira', 'category_id': 'tools', 'name': 'Jira / Atlassian', 'name_nl': 'Jira / Atlassian'},
    {'id': 'confluence', 'category_id': 'tools', 'name': 'Confluence', 'name_nl': 'Confluence'},
    {'id': 'reporting-dashboards', 'category_id': 'tools', 'name': 'Reporting & Dashboards', 'name_nl': 'Rapportage & Dashboards'},

    # technology (NEW)
    {'id': 'ai-literacy', 'category_id': 'technology', 'name': 'AI Literacy', 'name_nl': 'AI-geletterdheid'},
    {'id': 'prompt-engineering', 'category_id': 'technology', 'name': 'Prompt Engineering', 'name_nl': 'Prompt Engineering'},
    {'id': 'genai-tools', 'category_id': 'technology', 'name': 'Generative AI Tools', 'name_nl': 'Generatieve AI Tools'},
    {'id': 'ai-ethics', 'category_id': 'technology', 'name': 'AI Ethics & Governance', 'name_nl': 'AI Ethiek & Governance'},
    {'id': 'data-driven-pm', 'category_id': 'technology', 'name': 'Data-Driven PM', 'name_nl': 'Data-gestuurd Projectmanagement'},
    {'id': 'automation', 'category_id': 'technology', 'name': 'Workflow Automation', 'name_nl': 'Workflow Automatisering'},

    # process-improvement (NEW)
    {'id': 'dmaic', 'category_id': 'process-improvement', 'name': 'DMAIC Methodology', 'name_nl': 'DMAIC Methodologie'},
    {'id': 'lean-thinking', 'category_id': 'process-improvement', 'name': 'Lean Thinking', 'name_nl': 'Lean Denken'},
    {'id': 'value-stream-mapping', 'category_id': 'process-improvement', 'name': 'Value Stream Mapping', 'name_nl': 'Value Stream Mapping'},
    {'id': 'root-cause-analysis', 'category_id': 'process-improvement', 'name': 'Root Cause Analysis', 'name_nl': 'Hoofdoorzaakanalyse'},
    {'id': 'statistical-analysis', 'category_id': 'process-improvement', 'name': 'Statistical Analysis', 'name_nl': 'Statistische Analyse'},
    {'id': 'process-mapping', 'category_id': 'process-improvement', 'name': 'Process Mapping', 'name_nl': 'Procesmapping'},
    {'id': 'kaizen', 'category_id': 'process-improvement', 'name': 'Kaizen / Continuous Improvement', 'name_nl': 'Kaizen / Continu Verbeteren'},

    # scaled-delivery (NEW)
    {'id': 'safe-framework', 'category_id': 'scaled-delivery', 'name': 'SAFe Framework', 'name_nl': 'SAFe Framework'},
    {'id': 'art-coordination', 'category_id': 'scaled-delivery', 'name': 'Agile Release Trains', 'name_nl': 'Agile Release Trains'},
    {'id': 'portfolio-safe', 'category_id': 'scaled-delivery', 'name': 'Portfolio SAFe', 'name_nl': 'Portfolio SAFe'},
    {'id': 'program-governance', 'category_id': 'scaled-delivery', 'name': 'Program Governance', 'name_nl': 'Programmasturing'},
    {'id': 'multi-team-coordination', 'category_id': 'scaled-delivery', 'name': 'Multi-Team Coordination', 'name_nl': 'Multi-Team Coördinatie'},
    {'id': 'scrum-of-scrums', 'category_id': 'scaled-delivery', 'name': 'Scrum of Scrums', 'name_nl': 'Scrum of Scrums'},
]


# ------------------------------------------------------------
# Title-based heuristic — keyword → list of skill ids
# Order matters: first match wins for "primary" skill, but we
# tag up to 3 skills per lesson.
# ------------------------------------------------------------
KEYWORD_TO_SKILLS = [
    # AI / technology
    (['prompt', 'prompts'], ['prompt-engineering', 'ai-literacy']),
    (['genai', 'gen ai', 'generative ai', 'chatgpt', 'copilot'], ['genai-tools', 'ai-literacy']),
    (['ai ethic', 'ai bias', 'responsible ai', 'ai governance'], ['ai-ethics', 'ai-literacy']),
    (['ai', 'artificial intelligence', 'machine learning'], ['ai-literacy', 'data-driven-pm']),

    # Lean Six Sigma
    (['dmaic', 'define-measure', 'measure phase', 'analyze phase', 'control phase'], ['dmaic', 'process-mapping']),
    (['value stream'], ['value-stream-mapping', 'lean-thinking']),
    (['root cause', 'fishbone', 'ishikawa', '5 whys', 'pareto'], ['root-cause-analysis', 'statistical-analysis']),
    (['statistical', 'control chart', 'spc', 'hypothesis test', 'regression'], ['statistical-analysis']),
    (['lean', 'waste', 'muda'], ['lean-thinking', 'process-mapping']),
    (['kaizen', 'continuous improvement'], ['kaizen', 'lean-thinking']),
    (['six sigma', 'green belt', 'black belt'], ['dmaic', 'statistical-analysis']),

    # SAFe / scaled
    (['pi planning', 'program increment'], ['pi-planning', 'safe-framework']),
    (['art', 'release train', 'agile release train'], ['art-coordination', 'safe-framework']),
    (['portfolio safe'], ['portfolio-safe', 'safe-framework']),
    (['safe'], ['safe-framework', 'multi-team-coordination']),
    (['scrum of scrums', 'nexus', 'less'], ['scrum-of-scrums', 'multi-team-coordination']),

    # Scrum
    (['sprint planning', 'sprint plan'], ['sprint-planning', 'agile-scrum']),
    (['sprint review', 'retrospective', 'daily scrum', 'standup'], ['agile-scrum', 'team-building']),
    (['scrum master', 'product owner'], ['agile-scrum', 'servant-leadership']),
    (['scrum', 'sprint', 'backlog'], ['agile-scrum', 'sprint-planning']),

    # Kanban
    (['kanban', 'wip limit', 'cumulative flow', 'cfd'], ['kanban', 'lean-thinking']),

    # Agile general
    (['agile manifesto', 'agile principles', 'agile values'], ['agile-scrum']),
    (['agile'], ['agile-scrum']),

    # PRINCE2
    (['prince2', 'prince 2'], ['prince2', 'change-control']),
    (['7 principles', 'seven principles', '7 themes', 'seven themes', '7 processes'], ['prince2']),

    # Waterfall
    (['waterfall', 'sequential', 'phase gate', 'stage gate'], ['waterfall', 'milestone-planning']),

    # Stakeholder
    (['stakeholder map', 'stakeholder matrix', 'stakeholder analysis', 'power-interest'], ['stakeholder-analysis', 'stakeholder-engagement']),
    (['stakeholder'], ['stakeholder-engagement', 'communication']),
    (['communication plan', 'communication management'], ['communication']),
    (['conflict', 'mediation'], ['conflict-resolution', 'communication']),
    (['negotiat'], ['negotiation', 'influence']),

    # Risk / quality
    (['risk register', 'risk assessment', 'risk matrix', 'risk identification'], ['risk-assessment']),
    (['risk mitigation', 'risk response'], ['risk-mitigation']),
    (['risk'], ['risk-assessment', 'risk-mitigation']),
    (['quality plan', 'quality control', 'qc', 'inspection'], ['quality-control', 'quality-assurance']),
    (['quality assurance', 'qa'], ['quality-assurance']),
    (['change control', 'change management'], ['change-control']),
    (['issue log', 'issue management'], ['issue-management']),

    # Leadership
    (['servant leader'], ['servant-leadership', 'coaching']),
    (['coaching', 'mentor'], ['coaching']),
    (['emotional intelligence', 'eq'], ['emotional-intelligence']),
    (['team build', 'team formation', 'tuckman'], ['team-building']),
    (['motivat'], ['motivation']),
    (['delegat'], ['delegation']),
    (['decision'], ['decision-making']),
    (['leadership'], ['team-building', 'motivation']),

    # Financial
    (['budget'], ['budgeting']),
    (['cost', 'cost control'], ['cost-control', 'budgeting']),
    (['roi', 'return on investment', 'npv', 'irr'], ['roi-analysis', 'business-case']),
    (['forecast'], ['forecasting']),
    (['earned value', 'evm', 'spi', 'cpi'], ['earned-value']),
    (['business case'], ['business-case', 'roi-analysis']),
    (['benefits', 'benefits realization'], ['benefits-realization']),

    # Planning
    (['wbs', 'work breakdown'], ['wbs', 'project-planning']),
    (['critical path', 'cpm', 'pdm'], ['critical-path']),
    (['gantt'], ['gantt-charts', 'project-planning']),
    (['milestone'], ['milestone-planning']),
    (['resource'], ['resource-planning']),
    (['schedul'], ['time-management', 'project-planning']),
    (['time management'], ['time-management']),
    (['plan'], ['project-planning']),

    # Tools
    (['ms project', 'microsoft project'], ['ms-project', 'gantt-charts']),
    (['jira'], ['jira']),
    (['confluence'], ['confluence']),
    (['dashboard', 'report'], ['reporting-dashboards']),

    # Program management
    (['program govern', 'program management', 'pgmp'], ['program-governance', 'benefits-realization']),

    # Generic / default
    (['intro', 'overview', 'fundament', 'what is', 'introduction'], ['project-planning']),
]


# Course-slug fallback skills — used if the title-heuristic finds nothing
COURSE_FALLBACK_SKILLS = {
    'pm-fundamentals':        ['project-planning', 'communication'],
    'prince2-foundation':     ['prince2', 'change-control'],
    'scrum-master':           ['agile-scrum', 'sprint-planning'],
    'waterfall-pm':           ['waterfall', 'milestone-planning'],
    'kanban-practitioner':    ['kanban', 'lean-thinking'],
    'agile-fundamentals':     ['agile-scrum'],
    'lean-six-sigma':         ['dmaic', 'lean-thinking'],
    'leadership-pm':          ['team-building', 'motivation'],
    'program-management-pro': ['program-governance', 'benefits-realization'],
    'safe-scaling-agile':     ['safe-framework', 'pi-planning'],
    'ms-project-masterclass': ['ms-project', 'gantt-charts'],
    'stakeholder-management': ['stakeholder-engagement', 'communication'],
}


def derive_skills_for_lesson(lesson, course_slug):
    """Return up to 3 skill ids for a lesson based on its title."""
    title = (lesson.title or '').lower()
    matched = []
    for keywords, skill_ids in KEYWORD_TO_SKILLS:
        for kw in keywords:
            if kw in title:
                for sid in skill_ids:
                    if sid not in matched:
                        matched.append(sid)
                break
        if len(matched) >= 3:
            break
    if not matched:
        matched = list(COURSE_FALLBACK_SKILLS.get(course_slug, ['project-planning']))
    return matched[:3]


class Command(BaseCommand):
    help = 'Seeds full skills taxonomy + tags every CourseLesson with skills (idempotent).'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding skills taxonomy (full coverage)…')

        # 1) Categories
        cat_created = 0
        for data in NEW_CATEGORIES:
            _, created = SkillCategory.objects.get_or_create(
                id=data['id'], defaults=data,
            )
            if created:
                cat_created += 1
        self.stdout.write(f'  Categories — added {cat_created}, total {SkillCategory.objects.count()}')

        # 2) Skills
        skill_created = 0
        valid_skill_ids = set()
        for data in NEW_SKILLS:
            _, created = Skill.objects.get_or_create(
                id=data['id'], defaults=data,
            )
            if created:
                skill_created += 1
            valid_skill_ids.add(data['id'])
        # Include existing skills from seed_skills too
        for sid in Skill.objects.values_list('id', flat=True):
            valid_skill_ids.add(sid)
        self.stdout.write(f'  Skills — added {skill_created}, total {Skill.objects.count()}')

        # 3) Lesson mappings — iterate every lesson in every course
        mapping_created = 0
        mapping_skipped = 0
        course_qs = Course.objects.all().prefetch_related('modules__lessons')
        for course in course_qs:
            slug = course.slug
            for module in course.modules.all():
                for lesson in module.lessons.all():
                    skill_ids = derive_skills_for_lesson(lesson, slug)
                    for sid in skill_ids:
                        if sid not in valid_skill_ids:
                            continue
                        _, created = LessonSkillMapping.objects.get_or_create(
                            lesson_id=str(lesson.id),
                            skill_id=sid,
                            defaults={
                                'points_awarded': 15,
                                'quiz_bonus': 10,
                                'simulation_bonus': 10,
                                'practice_bonus': 10,
                            },
                        )
                        if created:
                            mapping_created += 1
                        else:
                            mapping_skipped += 1

        self.stdout.write(
            f'  Lesson mappings — created {mapping_created}, '
            f'already existed {mapping_skipped}, '
            f'total {LessonSkillMapping.objects.count()}'
        )
        self.stdout.write(self.style.SUCCESS('Skills taxonomy seeded.'))
