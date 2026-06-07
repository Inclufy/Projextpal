"""
⚠️ DEPRECATED — DO NOT RUN ON PRODUCTION.

This command seeds a granular, parallel skill taxonomy under different ids
(project-planning, agile-scrum, prince2, …). The CANONICAL Academy taxonomy
is now the course-level skill-c-* set seeded by:
    seed_lesson_skills  (skill-c-* + lesson mappings)
    seed_learning_demo  (demo progress on the canonical ids)
    dedupe_skills       (merges legacy duplicates into the canonical set)

Running this alongside the canonical set creates a confusing mix of coarse
course-level skills and fine-grained competency skills in the Skill Passport.
Kept only for reference / future redesign. Superseded 2026-06.
"""
from django.core.management.base import BaseCommand
from academy.models import SkillCategory, Skill, LessonSkillMapping


class Command(BaseCommand):
    help = '[DEPRECATED] Granular skill taxonomy — superseded by seed_lesson_skills (skill-c-*). Do not run on prod.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding skills data...')
        
        # Skill Categories
        categories_data = [
            {'id': 'planning', 'name': 'Planning & Scheduling', 'name_nl': 'Planning & Scheduling', 'icon': 'Calendar', 'color': 'blue', 'order': 1},
            {'id': 'stakeholder', 'name': 'Stakeholder Management', 'name_nl': 'Stakeholder Management', 'icon': 'Users', 'color': 'purple', 'order': 2},
            {'id': 'risk', 'name': 'Risk & Quality', 'name_nl': 'Risico & Kwaliteit', 'icon': 'AlertCircle', 'color': 'red', 'order': 3},
            {'id': 'leadership', 'name': 'Leadership', 'name_nl': 'Leiderschap', 'icon': 'Crown', 'color': 'yellow', 'order': 4},
            {'id': 'financial', 'name': 'Financial Management', 'name_nl': 'Financieel Management', 'icon': 'TrendingUp', 'color': 'green', 'order': 5},
            {'id': 'tools', 'name': 'PM Tools & Methods', 'name_nl': 'PM Tools & Methoden', 'icon': 'Briefcase', 'color': 'indigo', 'order': 6},
        ]
        
        for cat_data in categories_data:
            cat, created = SkillCategory.objects.get_or_create(
                id=cat_data['id'],
                defaults=cat_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} category: {cat.name}')
        
        # Skills
        skills_data = [
            {'id': 'project-planning', 'category_id': 'planning', 'name': 'Project Planning', 'name_nl': 'Project Planning'},
            {'id': 'time-management', 'category_id': 'planning', 'name': 'Time Management', 'name_nl': 'Tijdmanagement'},
            {'id': 'resource-planning', 'category_id': 'planning', 'name': 'Resource Planning', 'name_nl': 'Resource Planning'},
            {'id': 'critical-path', 'category_id': 'planning', 'name': 'Critical Path Analysis', 'name_nl': 'Critical Path Analyse'},
            
            {'id': 'communication', 'category_id': 'stakeholder', 'name': 'Communication', 'name_nl': 'Communicatie'},
            {'id': 'negotiation', 'category_id': 'stakeholder', 'name': 'Negotiation', 'name_nl': 'Onderhandeling'},
            {'id': 'conflict-resolution', 'category_id': 'stakeholder', 'name': 'Conflict Resolution', 'name_nl': 'Conflictoplossing'},
            {'id': 'stakeholder-engagement', 'category_id': 'stakeholder', 'name': 'Stakeholder Engagement', 'name_nl': 'Stakeholder Betrokkenheid'},
            
            {'id': 'risk-assessment', 'category_id': 'risk', 'name': 'Risk Assessment', 'name_nl': 'Risicoanalyse'},
            {'id': 'risk-mitigation', 'category_id': 'risk', 'name': 'Risk Mitigation', 'name_nl': 'Risicobeperking'},
            {'id': 'quality-control', 'category_id': 'risk', 'name': 'Quality Control', 'name_nl': 'Kwaliteitscontrole'},
            {'id': 'issue-management', 'category_id': 'risk', 'name': 'Issue Management', 'name_nl': 'Issue Management'},
            
            {'id': 'team-building', 'category_id': 'leadership', 'name': 'Team Building', 'name_nl': 'Teambuilding'},
            {'id': 'motivation', 'category_id': 'leadership', 'name': 'Motivation', 'name_nl': 'Motivatie'},
            {'id': 'decision-making', 'category_id': 'leadership', 'name': 'Decision Making', 'name_nl': 'Besluitvorming'},
            {'id': 'delegation', 'category_id': 'leadership', 'name': 'Delegation', 'name_nl': 'Delegatie'},
            
            {'id': 'budgeting', 'category_id': 'financial', 'name': 'Budgeting', 'name_nl': 'Budgettering'},
            {'id': 'cost-control', 'category_id': 'financial', 'name': 'Cost Control', 'name_nl': 'Kostenbeheersing'},
            {'id': 'roi-analysis', 'category_id': 'financial', 'name': 'ROI Analysis', 'name_nl': 'ROI Analyse'},
            {'id': 'forecasting', 'category_id': 'financial', 'name': 'Forecasting', 'name_nl': 'Forecasting'},
            
            {'id': 'agile-scrum', 'category_id': 'tools', 'name': 'Agile/Scrum', 'name_nl': 'Agile/Scrum'},
            {'id': 'waterfall', 'category_id': 'tools', 'name': 'Waterfall', 'name_nl': 'Waterfall'},
            {'id': 'prince2', 'category_id': 'tools', 'name': 'PRINCE2', 'name_nl': 'PRINCE2'},
            {'id': 'gantt-charts', 'category_id': 'tools', 'name': 'Gantt Charts', 'name_nl': 'Gantt Charts'},
            {'id': 'kanban', 'category_id': 'tools', 'name': 'Kanban', 'name_nl': 'Kanban'},
        ]
        
        for skill_data in skills_data:
            skill, created = Skill.objects.get_or_create(
                id=skill_data['id'],
                defaults=skill_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} skill: {skill.name}')
        
        # Lesson-Skill Mappings
        mappings_data = [
            {'lesson_id': 'pm-fund-l1', 'skill_id': 'project-planning', 'points_awarded': 10, 'quiz_bonus': 10},
            {'lesson_id': 'pm-fund-l2', 'skill_id': 'stakeholder-engagement', 'points_awarded': 15, 'quiz_bonus': 15},
            {'lesson_id': 'pm-fund-l3', 'skill_id': 'communication', 'points_awarded': 20, 'simulation_bonus': 15, 'practice_bonus': 20},
            {'lesson_id': 'pm-fund-l4', 'skill_id': 'risk-assessment', 'points_awarded': 20, 'simulation_bonus': 15, 'practice_bonus': 20},
            {'lesson_id': 'pm-fund-l5', 'skill_id': 'budgeting', 'points_awarded': 25, 'quiz_bonus': 20},
        ]
        
        for mapping_data in mappings_data:
            mapping, created = LessonSkillMapping.objects.get_or_create(
                lesson_id=mapping_data['lesson_id'],
                skill_id=mapping_data['skill_id'],
                defaults=mapping_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} mapping: {mapping.lesson_id} -> {mapping.skill.name}')
        
        self.stdout.write(self.style.SUCCESS('Skills data seeded successfully!'))
        self.stdout.write(f'Total categories: {SkillCategory.objects.count()}')
        self.stdout.write(f'Total skills: {Skill.objects.count()}')
        self.stdout.write(f'Total mappings: {LessonSkillMapping.objects.count()}')

        # Add short aliases for backward compatibility
        short_mappings = [
            {'lesson_id': 'l1', 'skill_id': 'project-planning', 'points_awarded': 10, 'quiz_bonus': 10},
            {'lesson_id': 'l2', 'skill_id': 'stakeholder-engagement', 'points_awarded': 15, 'quiz_bonus': 15},
            {'lesson_id': 'l3', 'skill_id': 'communication', 'points_awarded': 20, 'simulation_bonus': 15, 'practice_bonus': 20},
            {'lesson_id': 'l4', 'skill_id': 'risk-assessment', 'points_awarded': 20, 'simulation_bonus': 15, 'practice_bonus': 20},
            {'lesson_id': 'l5', 'skill_id': 'budgeting', 'points_awarded': 25, 'quiz_bonus': 20},
        ]
        
        for mapping_data in short_mappings:
            mapping, created = LessonSkillMapping.objects.get_or_create(
                lesson_id=mapping_data['lesson_id'],
                skill_id=mapping_data['skill_id'],
                defaults=mapping_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} short mapping: {mapping.lesson_id} -> {mapping.skill.name}')
