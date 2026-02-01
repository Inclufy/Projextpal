"""Project methodology templates with phases, roles, deliverables, and milestones"""

METHODOLOGY_TEMPLATES = {
    'prince2': {
        'name': 'PRINCE2',
        'description': 'Projects IN Controlled Environments - A structured project management method with defined roles and stages.',
        'icon': 'crown',
        'color': '#8b5cf6',
        'phases': [
            {'name': 'Starting Up', 'order': 1, 'duration_weeks': 2},
            {'name': 'Initiating', 'order': 2, 'duration_weeks': 3},
            {'name': 'Controlling a Stage', 'order': 3, 'duration_weeks': 8},
            {'name': 'Managing Product Delivery', 'order': 4, 'duration_weeks': 12},
            {'name': 'Managing Stage Boundaries', 'order': 5, 'duration_weeks': 2},
            {'name': 'Closing', 'order': 6, 'duration_weeks': 2},
        ],
        'default_roles': ['Executive', 'Senior User', 'Senior Supplier', 'Project Manager', 'Team Manager', 'Project Assurance'],
        'deliverables': ['Project Brief', 'Business Case', 'Project Initiation Document (PID)', 'Stage Plan', 'Work Package', 'Checkpoint Report', 'Highlight Report', 'End Stage Report', 'End Project Report', 'Lessons Log'],
        'milestones': ['Project Mandate Approved', 'PID Approved', 'Stage Gate Review', 'Project Closure'],
    },
    
    'agile': {
        'name': 'Agile',
        'description': 'Iterative approach focusing on collaboration, flexibility, and continuous delivery of value.',
        'icon': 'zap',
        'color': '#10b981',
        'phases': [
            {'name': 'Discovery', 'order': 1, 'duration_weeks': 2},
            {'name': 'Planning', 'order': 2, 'duration_weeks': 1},
            {'name': 'Iteration 1', 'order': 3, 'duration_weeks': 2},
            {'name': 'Iteration 2', 'order': 4, 'duration_weeks': 2},
            {'name': 'Iteration 3', 'order': 5, 'duration_weeks': 2},
            {'name': 'Release', 'order': 6, 'duration_weeks': 1},
        ],
        'default_roles': ['Product Owner', 'Agile Coach', 'Development Team', 'Stakeholder'],
        'deliverables': ['Product Vision', 'Product Backlog', 'User Stories', 'Sprint Backlog', 'Working Software', 'Release Notes'],
        'milestones': ['Vision Defined', 'Backlog Prioritized', 'Sprint Complete', 'Release Deployed'],
    },
    
    'scrum': {
        'name': 'Scrum',
        'description': 'Framework for developing complex products through iterative sprints with defined ceremonies.',
        'icon': 'repeat',
        'color': '#f59e0b',
        'phases': [
            {'name': 'Product Backlog Refinement', 'order': 1, 'duration_weeks': 1},
            {'name': 'Sprint 1', 'order': 2, 'duration_weeks': 2},
            {'name': 'Sprint 2', 'order': 3, 'duration_weeks': 2},
            {'name': 'Sprint 3', 'order': 4, 'duration_weeks': 2},
            {'name': 'Sprint 4', 'order': 5, 'duration_weeks': 2},
            {'name': 'Release', 'order': 6, 'duration_weeks': 1},
        ],
        'default_roles': ['Product Owner', 'Scrum Master', 'Development Team'],
        'deliverables': ['Product Backlog', 'Sprint Backlog', 'Increment', 'Definition of Done', 'Sprint Goal', 'Burndown Chart'],
        'milestones': ['Sprint Planning Complete', 'Sprint Goal Achieved', 'Increment Delivered', 'Release Complete'],
    },
    
    'kanban': {
        'name': 'Kanban',
        'description': 'Visual workflow management with continuous delivery and WIP limits.',
        'icon': 'columns',
        'color': '#3b82f6',
        'phases': [
            {'name': 'Setup', 'order': 1, 'duration_weeks': 1},
            {'name': 'Flow Optimization', 'order': 2, 'duration_weeks': 4},
            {'name': 'Continuous Delivery', 'order': 3, 'duration_weeks': 0},
        ],
        'default_roles': ['Service Delivery Manager', 'Service Request Manager', 'Team Member'],
        'deliverables': ['Kanban Board', 'WIP Limits', 'Cumulative Flow Diagram', 'Lead Time Report', 'Cycle Time Report'],
        'milestones': ['Board Setup Complete', 'WIP Limits Established', 'Flow Stabilized'],
    },
    
    'waterfall': {
        'name': 'Waterfall',
        'description': 'Sequential design process with distinct phases flowing downward.',
        'icon': 'arrow-down',
        'color': '#64748b',
        'phases': [
            {'name': 'Requirements', 'order': 1, 'duration_weeks': 4},
            {'name': 'Design', 'order': 2, 'duration_weeks': 4},
            {'name': 'Implementation', 'order': 3, 'duration_weeks': 8},
            {'name': 'Verification', 'order': 4, 'duration_weeks': 4},
            {'name': 'Maintenance', 'order': 5, 'duration_weeks': 0},
        ],
        'default_roles': ['Project Manager', 'Business Analyst', 'Solution Architect', 'Developer', 'QA Engineer'],
        'deliverables': ['Requirements Document', 'Design Specification', 'Technical Architecture', 'Source Code', 'Test Plans', 'User Manual'],
        'milestones': ['Requirements Signed Off', 'Design Approved', 'Development Complete', 'UAT Complete', 'Go Live'],
    },
    
    'lean_six_sigma_green': {
        'name': 'Lean Six Sigma (Green Belt)',
        'description': 'DMAIC methodology for process improvement with moderate complexity.',
        'icon': 'target',
        'color': '#22c55e',
        'phases': [
            {'name': 'Define', 'order': 1, 'duration_weeks': 2},
            {'name': 'Measure', 'order': 2, 'duration_weeks': 3},
            {'name': 'Analyze', 'order': 3, 'duration_weeks': 3},
            {'name': 'Improve', 'order': 4, 'duration_weeks': 4},
            {'name': 'Control', 'order': 5, 'duration_weeks': 2},
        ],
        'default_roles': ['Green Belt', 'Champion', 'Process Owner', 'Team Member'],
        'deliverables': ['Project Charter', 'SIPOC Diagram', 'Voice of Customer', 'Process Map', 'Data Collection Plan', 'Pareto Chart', 'Fishbone Diagram', 'Control Plan'],
        'milestones': ['Charter Approved', 'Baseline Established', 'Root Cause Identified', 'Solution Implemented', 'Process Controlled'],
    },
    
    'lean_six_sigma_black': {
        'name': 'Lean Six Sigma (Black Belt)',
        'description': 'Advanced DMAIC methodology with statistical analysis for complex improvements.',
        'icon': 'award',
        'color': '#1f2937',
        'phases': [
            {'name': 'Define', 'order': 1, 'duration_weeks': 3},
            {'name': 'Measure', 'order': 2, 'duration_weeks': 4},
            {'name': 'Analyze', 'order': 3, 'duration_weeks': 5},
            {'name': 'Improve', 'order': 4, 'duration_weeks': 6},
            {'name': 'Control', 'order': 5, 'duration_weeks': 3},
        ],
        'default_roles': ['Black Belt', 'Master Black Belt', 'Champion', 'Green Belt', 'Process Owner'],
        'deliverables': ['Business Case', 'Project Charter', 'Stakeholder Analysis', 'SIPOC', 'MSA Report', 'Process Capability Analysis', 'Hypothesis Tests', 'Regression Analysis', 'DOE Results', 'SPC Charts', 'Control Plan'],
        'milestones': ['Tollgate 1 - Define', 'Tollgate 2 - Measure', 'Tollgate 3 - Analyze', 'Tollgate 4 - Improve', 'Tollgate 5 - Control'],
    },
    
    'program': {
        'name': 'Program Management',
        'description': 'Manage multiple related projects to achieve strategic objectives and realize benefits.',
        'icon': 'layers',
        'color': '#6366f1',
        'phases': [
            {'name': 'Program Definition', 'order': 1, 'duration_weeks': 4},
            {'name': 'Program Planning', 'order': 2, 'duration_weeks': 6},
            {'name': 'Program Execution', 'order': 3, 'duration_weeks': 0},
            {'name': 'Benefits Realization', 'order': 4, 'duration_weeks': 0},
            {'name': 'Program Closure', 'order': 5, 'duration_weeks': 4},
        ],
        'default_roles': ['Program Sponsor', 'Program Director', 'Program Manager', 'Project Manager', 'Benefits Manager', 'Resource Manager'],
        'deliverables': ['Program Charter', 'Program Roadmap', 'Benefits Register', 'Resource Plan', 'Governance Framework', 'Program Status Report', 'Benefits Realization Report'],
        'milestones': ['Program Approved', 'Roadmap Finalized', 'Benefits Baseline Set', 'First Project Delivered', 'Benefits Realized', 'Program Closed'],
    },
    
    'hybrid': {
        'name': 'Hybrid',
        'description': 'Combines elements from multiple methodologies based on project needs.',
        'icon': 'git-merge',
        'color': '#ec4899',
        'phases': [
            {'name': 'Initiation', 'order': 1, 'duration_weeks': 2},
            {'name': 'Planning', 'order': 2, 'duration_weeks': 2},
            {'name': 'Execution Cycle 1', 'order': 3, 'duration_weeks': 4},
            {'name': 'Execution Cycle 2', 'order': 4, 'duration_weeks': 4},
            {'name': 'Closure', 'order': 5, 'duration_weeks': 2},
        ],
        'default_roles': ['Project Manager', 'Product Owner', 'Team Lead', 'Team Member'],
        'deliverables': ['Project Charter', 'Product Backlog', 'Sprint/Phase Plans', 'Status Reports', 'Working Deliverables', 'Lessons Learned'],
        'milestones': ['Project Kickoff', 'Planning Complete', 'Cycle 1 Complete', 'Cycle 2 Complete', 'Project Closure'],
    },
}

def get_all_methodologies():
    """Returns list of all methodologies for dropdown"""
    return [
        {'code': code, 'name': data['name'], 'description': data['description'], 'icon': data['icon'], 'color': data['color']}
        for code, data in METHODOLOGY_TEMPLATES.items()
    ]

def get_methodology_template(code):
    """Returns full template for a specific methodology"""
    return METHODOLOGY_TEMPLATES.get(code)
