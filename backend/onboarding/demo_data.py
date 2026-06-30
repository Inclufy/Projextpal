"""
Demo data generation for different industries.
Generates realistic projects, tasks, milestones, risks, and team members
based on the company's industry and preferred methodology.
"""
from datetime import timedelta
from django.utils import timezone
from projects.models import Project, Milestone, Task, Risk


# ─── Industry-specific demo project templates ──────────────────────

DEMO_TEMPLATES = {
    'IT & Software': [
        {
            'name': 'Cloud Migratie Platform',
            'description': 'Migratie van on-premise systemen naar cloud infrastructure',
            'project_type': 'software',
            'budget': 125000,
            'duration_weeks': 16,
            'milestones': [
                ('Assessment & Planning', 0),
                ('Infrastructure Setup', 4),
                ('Data Migratie', 8),
                ('Testen & Validatie', 12),
                ('Go-Live & Handover', 15),
            ],
            'tasks': [
                ('Huidige infrastructuur inventarisatie', 'planning', 'high', 16),
                ('Cloud architectuur ontwerp', 'planning', 'high', 24),
                ('Security assessment', 'planning', 'high', 12),
                ('CI/CD pipeline opzetten', 'execution', 'high', 20),
                ('Database migratie script', 'execution', 'medium', 16),
                ('Applicatie containerisatie', 'execution', 'medium', 32),
                ('Load testing', 'monitoring', 'high', 12),
                ('Performance monitoring setup', 'monitoring', 'medium', 8),
                ('Documentatie & training', 'monitoring', 'low', 16),
            ],
            'risks': [
                ('Dataverlies tijdens migratie', 'technical', 'high', 'medium'),
                ('Downtime overschrijding', 'schedule', 'high', 'high'),
                ('Onverwachte kosten cloud services', 'financial', 'medium', 'high'),
            ],
        },
        {
            'name': 'Mobile App Ontwikkeling',
            'description': 'Cross-platform mobiele applicatie voor klantportaal',
            'project_type': 'software',
            'budget': 85000,
            'duration_weeks': 12,
            'milestones': [
                ('UX Research & Design', 0),
                ('Backend API Development', 3),
                ('Frontend Development', 6),
                ('Beta Testing', 9),
                ('App Store Release', 11),
            ],
            'tasks': [
                ('User research & personas', 'planning', 'high', 12),
                ('Wireframes & prototyping', 'planning', 'medium', 16),
                ('UI design systeem', 'planning', 'medium', 20),
                ('REST API endpoints', 'execution', 'high', 24),
                ('Authentication & authorisatie', 'execution', 'high', 12),
                ('Push notificaties', 'execution', 'medium', 8),
                ('React Native componenten', 'execution', 'high', 40),
                ('Integratie testing', 'monitoring', 'high', 12),
                ('App Store submission', 'monitoring', 'medium', 4),
            ],
            'risks': [
                ('App Store afwijzing', 'external', 'medium', 'medium'),
                ('Performance issues mobiel', 'technical', 'medium', 'high'),
                ('Scope creep features', 'scope', 'high', 'high'),
            ],
        },
    ],

    'Bouw & Constructie': [
        {
            'name': 'Kantoorgebouw Renovatie',
            'description': 'Volledige renovatie van kantoorruimte inclusief verduurzaming',
            'project_type': 'construction',
            'budget': 450000,
            'duration_weeks': 24,
            'milestones': [
                ('Ontwerp & Vergunningen', 0),
                ('Sloop & Voorbereiding', 6),
                ('Constructie & Installatie', 10),
                ('Afwerking & Inrichting', 18),
                ('Oplevering', 23),
            ],
            'tasks': [
                ('Architectonisch ontwerp', 'planning', 'high', 40),
                ('Vergunningsaanvraag gemeente', 'planning', 'high', 8),
                ('Aanbesteding onderaannemers', 'planning', 'high', 16),
                ('Sloopwerkzaamheden', 'execution', 'high', 24),
                ('Elektra & loodgieter installatie', 'execution', 'high', 40),
                ('HVAC systeem', 'execution', 'medium', 32),
                ('Vloeren & wanden', 'execution', 'medium', 24),
                ('Duurzaamheidsmaatregelen', 'execution', 'medium', 16),
                ('Eindcontrole & oplevering', 'monitoring', 'high', 8),
            ],
            'risks': [
                ('Vergunning vertraging', 'external', 'high', 'high'),
                ('Materiaal prijsstijgingen', 'financial', 'medium', 'high'),
                ('Weersomstandigheden vertraging', 'external', 'medium', 'medium'),
                ('Asbest ontdekking', 'safety', 'low', 'high'),
            ],
        },
    ],

    'Zorg & Welzijn': [
        {
            'name': 'Elektronisch Patiëntendossier (EPD) Implementatie',
            'description': 'Implementatie nieuw EPD-systeem voor zorginstelling',
            'project_type': 'software',
            'budget': 200000,
            'duration_weeks': 20,
            'milestones': [
                ('Requirements & Selectie', 0),
                ('Configuratie & Aanpassing', 5),
                ('Data Migratie', 10),
                ('Training & Pilot', 14),
                ('Volledige Uitrol', 19),
            ],
            'tasks': [
                ('Stakeholder analyse zorgpersoneel', 'planning', 'high', 12),
                ('EPD leverancier selectie', 'planning', 'high', 20),
                ('Privacy impact assessment (DPIA)', 'planning', 'high', 16),
                ('Systeem configuratie', 'execution', 'high', 40),
                ('HL7/FHIR integraties', 'execution', 'high', 32),
                ('Historische data migratie', 'execution', 'medium', 24),
                ('Training materiaal ontwikkeling', 'monitoring', 'medium', 16),
                ('Pilot afdeling uitrol', 'monitoring', 'high', 12),
                ('Evaluatie & bijsturing', 'monitoring', 'medium', 8),
            ],
            'risks': [
                ('AVG/GDPR compliance issues', 'compliance', 'high', 'high'),
                ('Weerstand zorgpersoneel', 'organizational', 'medium', 'high'),
                ('Data integriteit na migratie', 'technical', 'high', 'medium'),
            ],
        },
    ],

    'Financiële Dienstverlening': [
        {
            'name': 'Anti-Witwas (AML) Compliance Programma',
            'description': 'Implementatie van AML/KYC compliance systeem',
            'project_type': 'consulting',
            'budget': 175000,
            'duration_weeks': 18,
            'milestones': [
                ('Gap Analyse & Risicobeoordeling', 0),
                ('Beleid & Procedures', 4),
                ('Systeem Implementatie', 8),
                ('Training & Awareness', 13),
                ('Audit & Certificering', 17),
            ],
            'tasks': [
                ('Huidige compliance gap analyse', 'planning', 'high', 20),
                ('Risicoclassificatie klanten', 'planning', 'high', 16),
                ('AML beleid opstellen', 'execution', 'high', 24),
                ('KYC procedures documenteren', 'execution', 'high', 20),
                ('Transaction monitoring tool', 'execution', 'high', 32),
                ('Verdachte transactie rapportage', 'execution', 'medium', 12),
                ('Medewerker training programma', 'monitoring', 'high', 16),
                ('Interne audit uitvoering', 'monitoring', 'high', 12),
            ],
            'risks': [
                ('Regelgeving wijzigingen', 'compliance', 'medium', 'high'),
                ('Boetes bij non-compliance', 'financial', 'low', 'high'),
                ('Technische integratie complexiteit', 'technical', 'medium', 'medium'),
            ],
        },
    ],

    'Consultancy': [
        {
            'name': 'Digitale Transformatie Adviestraject',
            'description': 'Strategisch advies en begeleiding digitale transformatie',
            'project_type': 'consulting',
            'budget': 95000,
            'duration_weeks': 14,
            'milestones': [
                ('Discovery & Assessment', 0),
                ('Strategie & Roadmap', 3),
                ('Quick Wins Implementatie', 6),
                ('Change Management', 10),
                ('Eindrapportage & Overdracht', 13),
            ],
            'tasks': [
                ('Stakeholder interviews', 'planning', 'high', 16),
                ('Huidige processen mapping', 'planning', 'high', 20),
                ('Digitale volwassenheid scan', 'planning', 'medium', 12),
                ('Transformatie roadmap', 'execution', 'high', 24),
                ('Quick win projecten identificatie', 'execution', 'medium', 8),
                ('Pilot implementatie', 'execution', 'high', 20),
                ('Change management plan', 'monitoring', 'high', 16),
                ('Eindpresentatie & aanbevelingen', 'monitoring', 'high', 8),
            ],
            'risks': [
                ('Scope creep door klant', 'scope', 'high', 'high'),
                ('Stakeholder weerstand', 'organizational', 'medium', 'medium'),
                ('Budget overschrijding', 'financial', 'medium', 'medium'),
            ],
        },
    ],

    'Retail & E-commerce': [
        {
            'name': 'Omnichannel Platform Lancering',
            'description': 'Integratie van online en offline verkoopkanalen',
            'project_type': 'software',
            'budget': 150000,
            'duration_weeks': 16,
            'milestones': [
                ('Marktanalyse & Requirements', 0),
                ('Platform Selectie & Setup', 3),
                ('Integratie & Development', 7),
                ('UAT & Soft Launch', 12),
                ('Full Launch & Marketing', 15),
            ],
            'tasks': [
                ('Klantjourney mapping', 'planning', 'high', 12),
                ('E-commerce platform selectie', 'planning', 'high', 16),
                ('POS systeem integratie', 'execution', 'high', 24),
                ('Inventory management koppeling', 'execution', 'high', 20),
                ('Payment gateway setup', 'execution', 'high', 12),
                ('Mobile responsive design', 'execution', 'medium', 16),
                ('SEO & analytics setup', 'monitoring', 'medium', 8),
                ('A/B testing framework', 'monitoring', 'low', 8),
                ('Launch campagne voorbereiding', 'monitoring', 'medium', 12),
            ],
            'risks': [
                ('Integratie complexiteit legacy', 'technical', 'high', 'high'),
                ('Data sync problemen inventory', 'technical', 'medium', 'high'),
                ('Launch timing markt', 'external', 'low', 'medium'),
            ],
        },
    ],

    'Onderwijs': [
        {
            'name': 'Learning Management System (LMS) Implementatie',
            'description': 'Implementatie van een digitaal leerplatform',
            'project_type': 'software',
            'budget': 80000,
            'duration_weeks': 14,
            'milestones': [
                ('Behoefteanalyse', 0),
                ('Platform Selectie', 3),
                ('Content Migratie', 6),
                ('Docent Training', 10),
                ('Student Uitrol', 13),
            ],
            'tasks': [
                ('Stakeholder interviews docenten', 'planning', 'high', 12),
                ('LMS vergelijking & selectie', 'planning', 'high', 16),
                ('Content structuur ontwerp', 'execution', 'high', 20),
                ('Bestaande content migratie', 'execution', 'medium', 24),
                ('Integratie met SIS', 'execution', 'high', 16),
                ('Train-de-trainer programma', 'monitoring', 'high', 12),
                ('Pilot groep evaluatie', 'monitoring', 'medium', 8),
            ],
            'risks': [
                ('Weerstand docenten', 'organizational', 'medium', 'high'),
                ('Content kwaliteit variatie', 'quality', 'medium', 'medium'),
                ('Technische problemen studenten', 'technical', 'low', 'medium'),
            ],
        },
    ],
}

# Default fallback for industries not specifically listed
DEFAULT_TEMPLATE = [
    {
        'name': 'Strategisch Verbeterproject',
        'description': 'Organisatiebrede verbetering en optimalisatie',
        'project_type': 'other',
        'budget': 75000,
        'duration_weeks': 12,
        'milestones': [
            ('Analyse & Planning', 0),
            ('Ontwerp & Voorbereiding', 3),
            ('Implementatie', 6),
            ('Evaluatie & Borging', 10),
        ],
        'tasks': [
            ('Huidige situatie analyse', 'planning', 'high', 16),
            ('Stakeholder interviews', 'planning', 'medium', 12),
            ('Verbeterplan opstellen', 'planning', 'high', 16),
            ('Implementatie activiteiten', 'execution', 'high', 32),
            ('Change management', 'execution', 'medium', 16),
            ('Voortgangsbewaking', 'monitoring', 'medium', 8),
            ('Eindevaluatie', 'monitoring', 'high', 8),
        ],
        'risks': [
            ('Onvoldoende draagvlak', 'organizational', 'medium', 'high'),
            ('Budget overschrijding', 'financial', 'medium', 'medium'),
            ('Planning vertraging', 'schedule', 'medium', 'medium'),
        ],
    },
]


def generate_demo_projects(company, user, industry, methodology='agile'):
    """Generate demo projects with tasks, milestones, and risks for a given industry."""

    templates = DEMO_TEMPLATES.get(industry, DEFAULT_TEMPLATE)

    now = timezone.now()

    for template in templates:
        start_date = now.date()
        end_date = start_date + timedelta(weeks=template['duration_weeks'])

        # Create project
        project = Project.objects.create(
            company=company,
            name=template['name'],
            description=template['description'],
            project_type=template.get('project_type', 'other'),
            methodology=methodology,
            budget=template['budget'],
            start_date=start_date,
            end_date=end_date,
            status='planning',
            created_by=user,
        )

        # Create milestones
        for milestone_name, week_offset in template['milestones']:
            milestone_date = start_date + timedelta(weeks=week_offset)
            Milestone.objects.create(
                project=project,
                name=milestone_name,
                due_date=milestone_date,
                status='pending',
            )

        # Create tasks
        for task_name, phase, priority, hours in template['tasks']:
            Task.objects.create(
                project=project,
                name=task_name,
                status='todo',
                priority=priority,
                estimated_hours=hours,
                responsible=user,
            )

        # Create risks
        for risk_name, category, probability, impact in template['risks']:
            Risk.objects.create(
                project=project,
                name=risk_name,
                category=category,
                probability=probability,
                impact=impact,
                status='identified',
                created_by=user,
            )
