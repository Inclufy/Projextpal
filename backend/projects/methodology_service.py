"""Service to apply methodology templates to projects"""
from .methodology_templates import METHODOLOGY_TEMPLATES
from .models import Project, Milestone, Task, ProjectTeam
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()


def apply_methodology_template(project: Project) -> dict:
    """
    Apply methodology template to a project.
    Creates phases (as milestones), deliverables (as tasks), and default roles.
    Returns summary of what was created.
    """
    methodology = project.methodology
    if not methodology or methodology not in METHODOLOGY_TEMPLATES:
        return {'error': 'No valid methodology specified'}
    
    template = METHODOLOGY_TEMPLATES[methodology]
    created = {
        'milestones': [],
        'tasks': [],
        'roles': [],
    }
    
    # Calculate phase dates based on project dates
    start_date = project.start_date
    
    # Create Milestones from Phases
    current_date = start_date
    for phase in template.get('phases', []):
        duration_weeks = phase.get('duration_weeks', 2)
        if current_date:
            due_date = current_date + timedelta(weeks=duration_weeks)
        else:
            due_date = None
            
        milestone = Milestone.objects.create(
            project=project,
            name=phase['name'],
            description=f"Phase {phase['order']}: {phase['name']}",
            end_date=due_date,
            status='pending',
            order_index=phase['order']
        )
        created['milestones'].append(milestone.name)
        
        # Create deliverables as tasks under this milestone
        phase_deliverables = get_phase_deliverables(methodology, phase['name'])
        for idx, deliverable in enumerate(phase_deliverables):
            task = Task.objects.create(
                milestone=milestone,
                title=deliverable,
                description=f"Deliverable: {deliverable}",
                status='todo',
                priority='medium',
                order_index=idx + 1
            )
            created['tasks'].append(task.title)
        
        if current_date and duration_weeks > 0:
            current_date = due_date
    
    # Create key milestones from template
    for idx, milestone_name in enumerate(template.get('milestones', [])):
        # Check if milestone already exists (might overlap with phases)
        if not Milestone.objects.filter(project=project, name=milestone_name).exists():
            Milestone.objects.create(
                project=project,
                name=milestone_name,
                description=f"Key milestone: {milestone_name}",
                status='pending',
                order_index=100 + idx  # After phase milestones
            )
            created['milestones'].append(milestone_name)
    
    
    return created


def get_phase_deliverables(methodology: str, phase_name: str) -> list:
    """Get deliverables specific to a phase"""
    
    # Map phases to their specific deliverables
    phase_deliverables = {
        'prince2': {
            'Starting Up': ['Project Brief', 'Outline Business Case'],
            'Initiating': ['Project Initiation Document (PID)', 'Business Case', 'Project Plan'],
            'Controlling a Stage': ['Checkpoint Report', 'Highlight Report', 'Issue Register'],
            'Managing Product Delivery': ['Work Package', 'Team Plan', 'Quality Register'],
            'Managing Stage Boundaries': ['End Stage Report', 'Next Stage Plan', 'Updated Business Case'],
            'Closing': ['End Project Report', 'Lessons Learned Report', 'Project Closure Notification'],
        },
        'agile': {
            'Discovery': ['Product Vision', 'Initial Backlog', 'User Personas'],
            'Planning': ['Release Plan', 'Sprint 0 Backlog', 'Definition of Done'],
            'Iteration 1': ['Sprint Backlog', 'Working Software Increment', 'Sprint Review Notes'],
            'Iteration 2': ['Sprint Backlog', 'Working Software Increment', 'Sprint Review Notes'],
            'Iteration 3': ['Sprint Backlog', 'Working Software Increment', 'Sprint Review Notes'],
            'Release': ['Release Notes', 'Deployment Checklist', 'User Documentation'],
        },
        'scrum': {
            'Product Backlog Refinement': ['Refined Product Backlog', 'User Stories with Acceptance Criteria'],
            'Sprint 1': ['Sprint Goal', 'Sprint Backlog', 'Increment', 'Burndown Chart'],
            'Sprint 2': ['Sprint Goal', 'Sprint Backlog', 'Increment', 'Burndown Chart'],
            'Sprint 3': ['Sprint Goal', 'Sprint Backlog', 'Increment', 'Burndown Chart'],
            'Sprint 4': ['Sprint Goal', 'Sprint Backlog', 'Increment', 'Burndown Chart'],
            'Release': ['Release Increment', 'Updated Product Backlog', 'Sprint Retrospective Notes'],
        },
        'kanban': {
            'Setup': ['Kanban Board Design', 'Initial WIP Limits', 'Service Level Agreements'],
            'Flow Optimization': ['Cumulative Flow Diagram', 'Lead Time Analysis', 'Blocker Analysis'],
            'Continuous Delivery': ['Cycle Time Report', 'Throughput Metrics', 'Process Improvements'],
        },
        'waterfall': {
            'Requirements': ['Business Requirements Document', 'Functional Requirements', 'Use Cases'],
            'Design': ['System Design Document', 'Technical Architecture', 'Database Design'],
            'Implementation': ['Source Code', 'Unit Tests', 'Code Review Reports'],
            'Verification': ['Test Plan', 'Test Cases', 'UAT Sign-off', 'Bug Reports'],
            'Maintenance': ['User Manual', 'Operations Guide', 'Support Procedures'],
        },
        'lean_six_sigma_green': {
            'Define': ['Project Charter', 'SIPOC Diagram', 'Voice of Customer Analysis'],
            'Measure': ['Data Collection Plan', 'Process Map', 'Baseline Metrics'],
            'Analyze': ['Root Cause Analysis', 'Fishbone Diagram', 'Pareto Chart'],
            'Improve': ['Solution Design', 'Pilot Results', 'Implementation Plan'],
            'Control': ['Control Plan', 'SPC Charts', 'Training Materials'],
        },
        'lean_six_sigma_black': {
            'Define': ['Business Case', 'Project Charter', 'Stakeholder Analysis', 'SIPOC'],
            'Measure': ['MSA Report', 'Data Collection Plan', 'Process Capability Analysis'],
            'Analyze': ['Hypothesis Tests', 'Regression Analysis', 'FMEA'],
            'Improve': ['DOE Results', 'Pilot Plan', 'Solution Validation'],
            'Control': ['Control Plan', 'SPC Charts', 'Documentation Package', 'Training Plan'],
        },
        'hybrid': {
            'Initiation': ['Project Charter', 'Stakeholder Register', 'Initial Backlog'],
            'Planning': ['Project Plan', 'Sprint/Phase Plans', 'Risk Register'],
            'Execution Cycle 1': ['Status Reports', 'Working Deliverables', 'Change Log'],
            'Execution Cycle 2': ['Status Reports', 'Working Deliverables', 'Change Log'],
            'Closure': ['Final Deliverables', 'Lessons Learned', 'Project Closure Report'],
        },
    }
    
    return phase_deliverables.get(methodology, {}).get(phase_name, [])


def get_methodology_summary(methodology: str) -> dict:
    """Get a summary of what will be created for a methodology"""
    if methodology not in METHODOLOGY_TEMPLATES:
        return None
    
    template = METHODOLOGY_TEMPLATES[methodology]
    
    total_deliverables = 0
    phase_details = []
    for phase in template.get('phases', []):
        deliverables = get_phase_deliverables(methodology, phase['name'])
        total_deliverables += len(deliverables)
        phase_details.append({
            'name': phase['name'],
            'duration_weeks': phase.get('duration_weeks', 2),
            'deliverables': deliverables,
        })
    
    return {
        'methodology': template['name'],
        'description': template['description'],
        'phases': phase_details,
        'total_phases': len(template.get('phases', [])),
        'total_deliverables': total_deliverables,
        'default_roles': template.get('default_roles', []),
        'milestones': template.get('milestones', []),
    }
