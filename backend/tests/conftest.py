"""
Pytest Configuration and Fixtures for ProjeXtPal Complete Test Suite
=====================================================================

COMPLETE METHODOLOGY COVERAGE (14 total):

PROJECT METHODOLOGIES (8):
1. Waterfall
2. Kanban
3. Agile/Scrum
4. PRINCE2
5. LSS Green (Lean Six Sigma Green Belt)
6. LSS Black (Lean Six Sigma Black Belt)
7. Hybrid
8. Program Management (basic)

PROGRAM METHODOLOGIES (6):
1. Program (basic)
2. SAFe (Scaled Agile Framework)
3. MSP (Managing Successful Programmes)
4. PMI (PMI Program Management Standard)
5. P2 Programme (PRINCE2 for Programmes)
6. Hybrid Programme

Usage:
    pytest tests/ -v
    pytest --cov=. --cov-report=html
    pytest -k "waterfall" -v
    pytest -k "lss" -v
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from datetime import datetime, timedelta

# Import models - with error handling
try:
    from projects.models import Project
    PROJECTS_AVAILABLE = True
except ImportError:
    PROJECTS_AVAILABLE = False
    Project = None

try:
    from accounts.models import Company
    ACCOUNTS_AVAILABLE = True
except ImportError:
    ACCOUNTS_AVAILABLE = False
    Company = None

User = get_user_model()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CORE FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def api_client():
    """API client for making requests"""
    return APIClient()


@pytest.fixture
def company(db):
    """Create a test company"""
    if not ACCOUNTS_AVAILABLE or not Company:
        pytest.skip("accounts.Company model not available")
    
    return Company.objects.create(
        name='Test Company',
        is_subscribed=True  
    )


@pytest.fixture
def second_company(db):
    """Create second company for isolation tests"""
    if not ACCOUNTS_AVAILABLE or not Company:
        pytest.skip("accounts.Company model not available")
    
    return Company.objects.create(
        name='Second Test Company',
        is_subscribed=True  
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# USER FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def user(db, company):
    """Create a test user"""
    user = User.objects.create_user(
        username='testuser',
        email='test@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Test'
    user.last_name = 'User'
    
    if hasattr(user, 'company'):
        user.company = company
    
    user.save()
    return user


@pytest.fixture
def admin_user(db, company):
    """Create an admin user"""
    user = User.objects.create_user(
        username='adminuser',
        email='admin@projextpal.com',
        password='adminpass123',
        is_staff=True,
        is_superuser=True
    )
    user.first_name = 'Admin'
    user.last_name = 'User'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'admin'
    
    user.save()
    return user


@pytest.fixture
def project_manager_user(db, company):
    """Create a project manager user"""
    user = User.objects.create_user(
        username='pmuser',
        email='pm@projextpal.com',
        password='pmpass123'
    )
    user.first_name = 'Project'
    user.last_name = 'Manager'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'project_manager'
    
    user.save()
    return user


@pytest.fixture
def team_member_user(db, company):
    """Create a team member user"""
    user = User.objects.create_user(
        username='teammember',
        email='teammember@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Team'
    user.last_name = 'Member'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'member'
    
    user.save()
    return user


@pytest.fixture
def scrum_master_user(db, company):
    """Create a scrum master user"""
    user = User.objects.create_user(
        username='scrummaster',
        email='scrummaster@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Scrum'
    user.last_name = 'Master'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'scrum_master'
    
    user.save()
    return user


@pytest.fixture
def product_owner_user(db, company):
    """Create a product owner user"""
    user = User.objects.create_user(
        username='productowner',
        email='po@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Product'
    user.last_name = 'Owner'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'product_owner'
    
    user.save()
    return user


@pytest.fixture
def program_manager_user(db, company):
    """Create a program manager user"""
    user = User.objects.create_user(
        username='programmanager',
        email='programmanager@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Program'
    user.last_name = 'Manager'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'program_manager'
    
    user.save()
    return user


@pytest.fixture
def green_belt_user(db, company):
    """Create a Lean Six Sigma Green Belt user"""
    user = User.objects.create_user(
        username='greenbelt',
        email='greenbelt@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Green'
    user.last_name = 'Belt'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'green_belt'
    if hasattr(user, 'certification'):
        user.certification = 'lss_green'
    
    user.save()
    return user


@pytest.fixture
def black_belt_user(db, company):
    """Create a Lean Six Sigma Black Belt user"""
    user = User.objects.create_user(
        username='blackbelt',
        email='blackbelt@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Black'
    user.last_name = 'Belt'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'black_belt'
    if hasattr(user, 'certification'):
        user.certification = 'lss_black'
    
    user.save()
    return user


@pytest.fixture
def master_black_belt_user(db, company):
    """Create a Lean Six Sigma Master Black Belt user"""
    user = User.objects.create_user(
        username='masterblackbelt',
        email='mbb@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Master'
    user.last_name = 'BlackBelt'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'master_black_belt'
    if hasattr(user, 'certification'):
        user.certification = 'lss_master_black'
    
    user.save()
    return user


@pytest.fixture
def release_train_engineer_user(db, company):
    """Create a Release Train Engineer (SAFe) user"""
    user = User.objects.create_user(
        username='rte',
        email='rte@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Release'
    user.last_name = 'TrainEngineer'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'release_train_engineer'
    
    user.save()
    return user


@pytest.fixture
def solution_architect_user(db, company):
    """Create a Solution Architect (SAFe) user"""
    user = User.objects.create_user(
        username='solutionarchitect',
        email='architect@projextpal.com',
        password='testpass123'
    )
    user.first_name = 'Solution'
    user.last_name = 'Architect'
    
    if hasattr(user, 'company'):
        user.company = company
    if hasattr(user, 'role'):
        user.role = 'solution_architect'
    
    user.save()
    return user


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AUTHENTICATED CLIENT FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client with regular user"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    """Authenticated API client with admin user"""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def authenticated_pm_client(api_client, project_manager_user):
    """Authenticated API client with PM user"""
    api_client.force_authenticate(user=project_manager_user)
    return api_client


@pytest.fixture
def authenticated_sm_client(api_client, scrum_master_user):
    """Authenticated API client with Scrum Master"""
    api_client.force_authenticate(user=scrum_master_user)
    return api_client


@pytest.fixture
def authenticated_po_client(api_client, product_owner_user):
    """Authenticated API client with Product Owner"""
    api_client.force_authenticate(user=product_owner_user)
    return api_client


@pytest.fixture
def authenticated_program_manager_client(api_client, program_manager_user):
    """Authenticated API client with Program Manager"""
    api_client.force_authenticate(user=program_manager_user)
    return api_client


@pytest.fixture
def authenticated_green_belt_client(api_client, green_belt_user):
    """Authenticated API client with Green Belt"""
    api_client.force_authenticate(user=green_belt_user)
    return api_client


@pytest.fixture
def authenticated_black_belt_client(api_client, black_belt_user):
    """Authenticated API client with Black Belt"""
    api_client.force_authenticate(user=black_belt_user)
    return api_client


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROJECT FIXTURES - ORIGINAL 5 METHODOLOGIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def waterfall_project(db, user, company):
    """Create a Waterfall project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Waterfall Project',
        description='Waterfall methodology test project',
        methodology='waterfall',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=180)).date()
    )


@pytest.fixture
def kanban_project(db, user, company):
    """Create a Kanban project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Kanban Project',
        description='Kanban methodology test project',
        methodology='kanban',
        created_by=user,
        company=company
    )


@pytest.fixture
def agile_project(db, user, company):
    """Create an Agile/Scrum project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Agile Project',
        description='Agile/Scrum methodology test project',
        methodology='agile',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


@pytest.fixture
def scrum_project(db, user, company):
    """Create a Scrum project (alias for agile)"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Scrum Project',
        description='Scrum methodology test project',
        methodology='agile',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


@pytest.fixture
def prince2_project(db, user, company):
    """Create a PRINCE2 project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test PRINCE2 Project',
        description='PRINCE2 methodology test project',
        methodology='prince2',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=365)).date()
    )


@pytest.fixture
def program(db, user, company):
    """Create a Program (for program management)"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Program',
        description='Program management test',
        methodology='program',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROJECT FIXTURES - NEW METHODOLOGIES (LSS + HYBRID)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def lss_green_project(db, user, company):
    """Create a Lean Six Sigma Green Belt project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test LSS Green Project',
        description='Lean Six Sigma Green Belt methodology test project',
        methodology='lss_green',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=90)).date()
    )


@pytest.fixture
def lss_black_project(db, user, company):
    """Create a Lean Six Sigma Black Belt project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test LSS Black Project',
        description='Lean Six Sigma Black Belt methodology test project',
        methodology='lss_black',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=180)).date()
    )


@pytest.fixture
def hybrid_project(db, user, company):
    """Create a Hybrid methodology project"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Hybrid Project',
        description='Hybrid methodology test project (combines multiple approaches)',
        methodology='hybrid',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=120)).date()
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROGRAM METHODOLOGY FIXTURES (5 NEW PROGRAMMES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def safe_program(db, user, company):
    """Create a SAFe (Scaled Agile Framework) program"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test SAFe Program',
        description='Scaled Agile Framework program test',
        methodology='safe',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


@pytest.fixture
def msp_program(db, user, company):
    """Create an MSP (Managing Successful Programmes) program"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test MSP Program',
        description='Managing Successful Programmes test',
        methodology='msp',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=730)).date()
    )


@pytest.fixture
def pmi_program(db, user, company):
    """Create a PMI (PMI Program Management Standard) program"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test PMI Program',
        description='PMI Program Management Standard test',
        methodology='pmi',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


@pytest.fixture
def p2_programme(db, user, company):
    """Create a P2 Programme (PRINCE2 for Programmes)"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test P2 Programme',
        description='PRINCE2 for Programmes test',
        methodology='p2_programme',
        created_by=user,
        company=company,
        start_date=datetime.now().date(),
        end_date=(datetime.now() + timedelta(days=365)).date()
    )


@pytest.fixture
def hybrid_programme(db, user, company):
    """Create a Hybrid Programme (combined program approaches)"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    return Project.objects.create(
        name='Test Hybrid Programme',
        description='Hybrid programme management test',
        methodology='hybrid_programme',
        created_by=user,
        company=company,
        start_date=datetime.now().date()
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MULTIPLE PROJECTS FOR TESTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def multiple_projects(db, user, company):
    """Create multiple projects of different methodologies"""
    if not PROJECTS_AVAILABLE or not Project:
        pytest.skip("projects.Project model not available")
    
    projects = []
    
    # Waterfall
    projects.append(Project.objects.create(
        name='Waterfall Project 1',
        methodology='waterfall',
        created_by=user,
        company=company
    ))
    
    # Kanban
    projects.append(Project.objects.create(
        name='Kanban Project 1',
        methodology='kanban',
        created_by=user,
        company=company
    ))
    
    # Agile
    projects.append(Project.objects.create(
        name='Agile Project 1',
        methodology='agile',
        created_by=user,
        company=company
    ))
    
    # LSS Green
    projects.append(Project.objects.create(
        name='LSS Green Project 1',
        methodology='lss_green',
        created_by=user,
        company=company
    ))
    
    # Hybrid
    projects.append(Project.objects.create(
        name='Hybrid Project 1',
        methodology='hybrid',
        created_by=user,
        company=company
    ))
    
    return projects


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ALL METHODOLOGIES COLLECTION FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def all_project_methodologies(
    db, user, company,
    waterfall_project,
    kanban_project,
    agile_project,
    prince2_project,
    lss_green_project,
    lss_black_project,
    hybrid_project,
    program
):
    """Returns a dictionary of all 8 project methodologies"""
    return {
        'waterfall': waterfall_project,
        'kanban': kanban_project,
        'agile': agile_project,
        'prince2': prince2_project,
        'lss_green': lss_green_project,
        'lss_black': lss_black_project,
        'hybrid': hybrid_project,
        'program': program
    }


@pytest.fixture
def all_program_methodologies(
    db, user, company,
    program,
    safe_program,
    msp_program,
    pmi_program,
    p2_programme,
    hybrid_programme
):
    """Returns a dictionary of all 6 program methodologies"""
    return {
        'program': program,
        'safe': safe_program,
        'msp': msp_program,
        'pmi': pmi_program,
        'p2_programme': p2_programme,
        'hybrid_programme': hybrid_programme
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DATETIME FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def today():
    """Today's date"""
    return datetime.now().date()


@pytest.fixture
def yesterday():
    """Yesterday's date"""
    return (datetime.now() - timedelta(days=1)).date()


@pytest.fixture
def tomorrow():
    """Tomorrow's date"""
    return (datetime.now() + timedelta(days=1)).date()


@pytest.fixture
def next_week():
    """Date one week from now"""
    return (datetime.now() + timedelta(days=7)).date()


@pytest.fixture
def next_month():
    """Date one month from now"""
    return (datetime.now() + timedelta(days=30)).date()


@pytest.fixture
def last_week():
    """Date one week ago"""
    return (datetime.now() - timedelta(days=7)).date()


@pytest.fixture
def last_month():
    """Date one month ago"""
    return (datetime.now() - timedelta(days=30)).date()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# METHODOLOGY-SPECIFIC HELPER FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def dmaic_phases():
    """DMAIC phases for Lean Six Sigma projects"""
    return ['define', 'measure', 'analyze', 'improve', 'control']


@pytest.fixture
def dmadv_phases():
    """DMADV phases for Lean Six Sigma design projects"""
    return ['define', 'measure', 'analyze', 'design', 'verify']


@pytest.fixture
def safe_levels():
    """SAFe framework levels"""
    return ['team', 'program', 'large_solution', 'portfolio']


@pytest.fixture
def safe_pi_duration():
    """SAFe Program Increment duration (weeks)"""
    return 10


@pytest.fixture
def msp_lifecycle():
    """MSP programme lifecycle stages"""
    return [
        'identifying_a_programme',
        'defining_a_programme',
        'managing_the_tranches',
        'delivering_the_capability',
        'realising_the_benefits',
        'closing_a_programme'
    ]


@pytest.fixture
def msp_themes():
    """MSP governance themes"""
    return [
        'vision',
        'leadership_and_stakeholder_engagement',
        'benefits_management',
        'blueprint_design_and_delivery',
        'planning_and_control',
        'business_case',
        'organization_and_office',
        'risk_and_issue_management',
        'quality_and_assurance'
    ]


@pytest.fixture
def pmi_domains():
    """PMI Program Management performance domains"""
    return [
        'program_strategy_alignment',
        'program_benefits_management',
        'program_stakeholder_engagement',
        'program_governance',
        'program_lifecycle_management'
    ]


@pytest.fixture
def waterfall_phases():
    """Traditional Waterfall phases"""
    return [
        'requirements',
        'design',
        'implementation',
        'verification',
        'maintenance'
    ]


@pytest.fixture
def prince2_themes():
    """PRINCE2 project themes"""
    return [
        'business_case',
        'organization',
        'quality',
        'plans',
        'risk',
        'change',
        'progress'
    ]


@pytest.fixture
def prince2_processes():
    """PRINCE2 project processes"""
    return [
        'starting_up',
        'directing',
        'initiating',
        'controlling_a_stage',
        'managing_product_delivery',
        'managing_stage_boundary',
        'closing'
    ]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPER FIXTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def sample_team_members(db, company):
    """Create sample team members for testing"""
    members = []
    
    for i in range(5):
        user = User.objects.create_user(
            username=f'member{i}',
            email=f'member{i}@projextpal.com',
            password='testpass123'
        )
        user.first_name = f'Member'
        user.last_name = f'{i}'
        
        if hasattr(user, 'company'):
            user.company = company
        
        user.save()
        members.append(user)
    
    return members


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# METADATA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Complete test suite with ALL 14 methodologies
# Generated: 5 Feb 2026 09:50 CET
# Coverage: 8 project methodologies + 6 program methodologies
# Total: ~750+ potential tests

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# METHODOLOGY-SPECIFIC FIXTURES FOR TESTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def waterfall_phase(db, waterfall_project, user):
    """Create a Waterfall phase"""
    try:
        from waterfall.models import WaterfallPhase
        from datetime import datetime, timedelta
        
        return WaterfallPhase.objects.create(
            project=waterfall_project,
            name='Requirements',
            description='Requirements gathering phase',
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=30)).date(),
            status='active',
            order=1
        )
    except ImportError:
        pytest.skip("waterfall.WaterfallPhase model not available")


@pytest.fixture
def kanban_board(db, kanban_project, user):
    """Create a Kanban board with default columns"""
    try:
        from kanban.models import KanbanBoard, KanbanColumn
        
        board = KanbanBoard.objects.create(
            project=kanban_project,
            name='Main Board',
            description='Test kanban board'
        )
        
        # Create default columns
        columns = ['Backlog', 'To Do', 'In Progress', 'Done']
        for i, col_name in enumerate(columns):
            KanbanColumn.objects.create(
                board=board,
                name=col_name,
                wip_limit=5 if col_name == 'In Progress' else None,
                order=i
            )
        
        return board
    except ImportError:
        pytest.skip("kanban.KanbanBoard model not available")


@pytest.fixture
def prince2_stage(db, prince2_project, user):
    """Create a PRINCE2 stage"""
    try:
        from prince2.models import Prince2Stage
        from datetime import datetime, timedelta
        
        return Prince2Stage.objects.create(
            project=prince2_project,
            name='Initiation',
            description='Initiation stage',
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=30)).date(),
            status='active',
            order=1
        )
    except ImportError:
        pytest.skip("prince2.Prince2Stage model not available")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# METHODOLOGY-SPECIFIC FIXTURES FOR TESTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def agile_iteration(db, agile_project):
    """Create an agile iteration for testing"""
    try:
        from agile.models import AgileIteration
        from datetime import datetime, timedelta
        
        return AgileIteration.objects.create(
            project=agile_project,
            name='Sprint 1',
            goal='Test sprint goal',
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=14)).date(),
            status='active'
        )
    except ImportError:
        pytest.skip("agile.AgileIteration model not available")


@pytest.fixture
def waterfall_phase(db, waterfall_project):
    """Create a Waterfall phase"""
    try:
        from waterfall.models import WaterfallPhase
        from datetime import datetime, timedelta
        
        return WaterfallPhase.objects.create(
            project=waterfall_project,
            phase_type='requirements',
            name='Requirements Phase',
            description='Requirements gathering',
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=30)).date(),
            status='active',
            order=1
        )
    except ImportError:
        pytest.skip("waterfall.WaterfallPhase model not available")


@pytest.fixture
def kanban_board(db, kanban_project):
    """Create a Kanban board with columns"""
    try:
        from kanban.models import KanbanBoard, KanbanColumn
        
        board = KanbanBoard.objects.create(
            project=kanban_project,
            name='Main Board',
            description='Test board'
        )
        
        # Create default columns
        for i, name in enumerate(['Backlog', 'To Do', 'In Progress', 'Done']):
            KanbanColumn.objects.create(
                board=board,
                name=name,
                column_type='custom',
                order=i,
                wip_limit=5 if name == 'In Progress' else None
            )
        
        return board
    except ImportError:
        pytest.skip("kanban.KanbanBoard model not available")


@pytest.fixture  
def kanban_column(db, kanban_board):
    """Get first column from kanban board"""
    return kanban_board.columns.first()


@pytest.fixture
def prince2_stage(db, prince2_project):
    """Create a PRINCE2 stage"""
    try:
        from prince2.models import Stage
        from datetime import datetime, timedelta
        
        return Stage.objects.create(
            project=prince2_project,
            name='Initiation',
            description='Initiation stage',
            start_date=datetime.now().date(),
            planned_end_date=(datetime.now() + timedelta(days=30)).date(),
            status='active',
            order=1
        )
    except ImportError:
        pytest.skip("prince2.Stage model not available")
