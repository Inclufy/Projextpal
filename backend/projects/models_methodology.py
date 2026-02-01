from django.db import models

class ProjectMethodology(models.Model):
    """Project methodology templates"""
    
    METHODOLOGY_CHOICES = [
        ('prince2', 'PRINCE2'),
        ('agile', 'Agile'),
        ('scrum', 'Scrum'),
        ('kanban', 'Kanban'),
        ('waterfall', 'Waterfall'),
        ('lean_green', 'Lean Six Sigma (Green Belt)'),
        ('lean_black', 'Lean Six Sigma (Black Belt)'),
        ('hybrid', 'Hybrid'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='folder')
    color = models.CharField(max_length=20, default='#6366f1')
    
    # Template structure stored as JSON
    phases = models.JSONField(default=list)  # List of phases
    default_roles = models.JSONField(default=list)  # Default team roles
    deliverables = models.JSONField(default=list)  # Standard deliverables
    milestones = models.JSONField(default=list)  # Default milestones
    task_categories = models.JSONField(default=list)  # Task categories/types
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Project Methodologies"
    
    def __str__(self):
        return self.name


def get_methodology_templates():
    """Returns all methodology templates with their configurations"""
    return {
        'prince2': {
            'name': 'PRINCE2',
            'description': 'Projects IN Controlled Environments - A structured project management method with defined roles and stages.',
            'icon': 'crown',
            'color': '#8b5cf6',
            'phases': [
                {'name': 'Starting Up', 'order': 1, 'description': 'Initial project viability assessment'},
                {'name': 'Initiating', 'order': 2, 'description': 'Detailed planning and business case'},
                {'name': 'Directing', 'order': 3, 'description': 'Project board oversight throughout'},
                {'name': 'Controlling a Stage', 'order': 4, 'description': 'Day-to-day management'},
                {'name': 'Managing Product Delivery', 'order': 5, 'description': 'Team execution'},
                {'name': 'Managing Stage Boundaries', 'order': 6, 'description': 'Stage transitions'},
                {'name': 'Closing', 'order': 7, 'description': 'Formal project closure'},
            ],
            'default_roles': [
                {'name': 'Executive', 'description': 'Overall project accountability'},
                {'name': 'Senior User', 'description': 'User requirements representation'},
                {'name': 'Senior Supplier', 'description': 'Supplier resources representation'},
                {'name': 'Project Manager', 'description': 'Day-to-day project management'},
                {'name': 'Team Manager', 'description': 'Team delivery management'},
                {'name': 'Project Assurance', 'description': 'Independent oversight'},
            ],
            'deliverables': [
                'Project Brief', 'Business Case', 'Project Initiation Document (PID)',
                'Stage Plan', 'Work Package', 'Checkpoint Report', 'Highlight Report',
                'End Stage Report', 'End Project Report', 'Lessons Log'
            ],
            'milestones': [
                {'name': 'Project Mandate Approved', 'phase': 'Starting Up'},
                {'name': 'PID Approved', 'phase': 'Initiating'},
                {'name': 'Stage Gate Review', 'phase': 'Managing Stage Boundaries'},
                {'name': 'Project Closure', 'phase': 'Closing'},
            ],
            'task_categories': ['Management', 'Quality', 'Risk', 'Change Control', 'Communication']
        },
        
        'agile': {
            'name': 'Agile',
            'description': 'Iterative approach focusing on collaboration, flexibility, and continuous delivery of value.',
            'icon': 'zap',
            'color': '#10b981',
            'phases': [
                {'name': 'Discovery', 'order': 1, 'description': 'Understanding requirements and vision'},
                {'name': 'Planning', 'order': 2, 'description': 'Release and iteration planning'},
                {'name': 'Iteration', 'order': 3, 'description': 'Development sprints'},
                {'name': 'Review', 'order': 4, 'description': 'Demo and feedback'},
                {'name': 'Release', 'order': 5, 'description': 'Deployment to production'},
            ],
            'default_roles': [
                {'name': 'Product Owner', 'description': 'Defines and prioritizes requirements'},
                {'name': 'Agile Coach', 'description': 'Facilitates agile practices'},
                {'name': 'Development Team', 'description': 'Cross-functional delivery team'},
                {'name': 'Stakeholder', 'description': 'Provides feedback and requirements'},
            ],
            'deliverables': [
                'Product Vision', 'Product Backlog', 'User Stories', 'Sprint Backlog',
                'Working Software', 'Release Notes', 'Retrospective Actions'
            ],
            'milestones': [
                {'name': 'Vision Defined', 'phase': 'Discovery'},
                {'name': 'Backlog Prioritized', 'phase': 'Planning'},
                {'name': 'Sprint Complete', 'phase': 'Iteration'},
                {'name': 'Release Deployed', 'phase': 'Release'},
            ],
            'task_categories': ['User Story', 'Bug', 'Technical Debt', 'Spike', 'Improvement']
        },
        
        'scrum': {
            'name': 'Scrum',
            'description': 'Framework for developing complex products through iterative sprints with defined ceremonies.',
            'icon': 'repeat',
            'color': '#f59e0b',
            'phases': [
                {'name': 'Product Backlog Refinement', 'order': 1, 'description': 'Grooming and prioritizing backlog'},
                {'name': 'Sprint Planning', 'order': 2, 'description': 'Planning sprint work'},
                {'name': 'Sprint Execution', 'order': 3, 'description': 'Daily scrums and development'},
                {'name': 'Sprint Review', 'order': 4, 'description': 'Demo to stakeholders'},
                {'name': 'Sprint Retrospective', 'order': 5, 'description': 'Team improvement'},
            ],
            'default_roles': [
                {'name': 'Product Owner', 'description': 'Maximizes product value'},
                {'name': 'Scrum Master', 'description': 'Facilitates scrum process'},
                {'name': 'Development Team', 'description': 'Self-organizing delivery team'},
            ],
            'deliverables': [
                'Product Backlog', 'Sprint Backlog', 'Increment', 'Definition of Done',
                'Sprint Goal', 'Burndown Chart', 'Velocity Chart'
            ],
            'milestones': [
                {'name': 'Sprint Start', 'phase': 'Sprint Planning'},
                {'name': 'Sprint Goal Achieved', 'phase': 'Sprint Execution'},
                {'name': 'Increment Delivered', 'phase': 'Sprint Review'},
            ],
            'task_categories': ['Story', 'Task', 'Bug', 'Epic', 'Spike']
        },
        
        'kanban': {
            'name': 'Kanban',
            'description': 'Visual workflow management with continuous delivery and WIP limits.',
            'icon': 'columns',
            'color': '#3b82f6',
            'phases': [
                {'name': 'Backlog', 'order': 1, 'description': 'Work items waiting to start'},
                {'name': 'Ready', 'order': 2, 'description': 'Prioritized and ready to pull'},
                {'name': 'In Progress', 'order': 3, 'description': 'Currently being worked on'},
                {'name': 'Review', 'order': 4, 'description': 'Awaiting review or approval'},
                {'name': 'Done', 'order': 5, 'description': 'Completed work'},
            ],
            'default_roles': [
                {'name': 'Service Delivery Manager', 'description': 'Manages flow and delivery'},
                {'name': 'Service Request Manager', 'description': 'Manages incoming requests'},
                {'name': 'Team Member', 'description': 'Executes work items'},
            ],
            'deliverables': [
                'Kanban Board', 'WIP Limits', 'Cumulative Flow Diagram',
                'Lead Time Report', 'Cycle Time Report', 'Throughput Metrics'
            ],
            'milestones': [
                {'name': 'Board Setup', 'phase': 'Backlog'},
                {'name': 'WIP Limits Established', 'phase': 'In Progress'},
                {'name': 'Flow Optimized', 'phase': 'Done'},
            ],
            'task_categories': ['Standard', 'Expedite', 'Fixed Date', 'Intangible']
        },
        
        'waterfall': {
            'name': 'Waterfall',
            'description': 'Sequential design process with distinct phases flowing downward.',
            'icon': 'arrow-down',
            'color': '#64748b',
            'phases': [
                {'name': 'Requirements', 'order': 1, 'description': 'Gather and document requirements'},
                {'name': 'Design', 'order': 2, 'description': 'System and software design'},
                {'name': 'Implementation', 'order': 3, 'description': 'Development and coding'},
                {'name': 'Verification', 'order': 4, 'description': 'Testing and quality assurance'},
                {'name': 'Maintenance', 'order': 5, 'description': 'Ongoing support and updates'},
            ],
            'default_roles': [
                {'name': 'Project Manager', 'description': 'Overall project coordination'},
                {'name': 'Business Analyst', 'description': 'Requirements gathering'},
                {'name': 'Solution Architect', 'description': 'Technical design'},
                {'name': 'Developer', 'description': 'Implementation'},
                {'name': 'QA Engineer', 'description': 'Testing and verification'},
            ],
            'deliverables': [
                'Requirements Document', 'Design Specification', 'Technical Architecture',
                'Source Code', 'Test Plans', 'User Manual', 'Deployment Guide'
            ],
            'milestones': [
                {'name': 'Requirements Signed Off', 'phase': 'Requirements'},
                {'name': 'Design Approved', 'phase': 'Design'},
                {'name': 'Development Complete', 'phase': 'Implementation'},
                {'name': 'UAT Complete', 'phase': 'Verification'},
                {'name': 'Go Live', 'phase': 'Maintenance'},
            ],
            'task_categories': ['Analysis', 'Design', 'Development', 'Testing', 'Documentation']
        },
        
        'lean_green': {
            'name': 'Lean Six Sigma (Green Belt)',
            'description': 'DMAIC methodology for process improvement with moderate complexity.',
            'icon': 'target',
            'color': '#22c55e',
            'phases': [
                {'name': 'Define', 'order': 1, 'description': 'Define problem and project scope'},
                {'name': 'Measure', 'order': 2, 'description': 'Measure current performance'},
                {'name': 'Analyze', 'order': 3, 'description': 'Analyze root causes'},
                {'name': 'Improve', 'order': 4, 'description': 'Implement solutions'},
                {'name': 'Control', 'order': 5, 'description': 'Sustain improvements'},
            ],
            'default_roles': [
                {'name': 'Green Belt', 'description': 'Project leader'},
                {'name': 'Champion', 'description': 'Executive sponsor'},
                {'name': 'Process Owner', 'description': 'Owns the process being improved'},
                {'name': 'Team Member', 'description': 'Subject matter expert'},
            ],
            'deliverables': [
                'Project Charter', 'SIPOC Diagram', 'Voice of Customer', 'Process Map',
                'Data Collection Plan', 'Pareto Chart', 'Fishbone Diagram',
                'Solution Design', 'Control Plan', 'Control Charts'
            ],
            'milestones': [
                {'name': 'Charter Approved', 'phase': 'Define'},
                {'name': 'Baseline Established', 'phase': 'Measure'},
                {'name': 'Root Cause Identified', 'phase': 'Analyze'},
                {'name': 'Solution Implemented', 'phase': 'Improve'},
                {'name': 'Process Controlled', 'phase': 'Control'},
            ],
            'task_categories': ['Analysis', 'Data Collection', 'Improvement', 'Documentation', 'Training']
        },
        
        'lean_black': {
            'name': 'Lean Six Sigma (Black Belt)',
            'description': 'Advanced DMAIC methodology with statistical analysis for complex improvements.',
            'icon': 'award',
            'color': '#1f2937',
            'phases': [
                {'name': 'Define', 'order': 1, 'description': 'Define complex problem and business case'},
                {'name': 'Measure', 'order': 2, 'description': 'Advanced measurement system analysis'},
                {'name': 'Analyze', 'order': 3, 'description': 'Statistical analysis and hypothesis testing'},
                {'name': 'Improve', 'order': 4, 'description': 'Design of experiments and optimization'},
                {'name': 'Control', 'order': 5, 'description': 'Statistical process control'},
            ],
            'default_roles': [
                {'name': 'Black Belt', 'description': 'Project leader and statistical expert'},
                {'name': 'Master Black Belt', 'description': 'Technical mentor'},
                {'name': 'Champion', 'description': 'Executive sponsor'},
                {'name': 'Green Belt', 'description': 'Supporting project leader'},
                {'name': 'Process Owner', 'description': 'Owns the process being improved'},
            ],
            'deliverables': [
                'Business Case', 'Project Charter', 'Stakeholder Analysis', 'SIPOC',
                'MSA Report', 'Process Capability Analysis', 'Hypothesis Tests',
                'Regression Analysis', 'DOE Results', 'SPC Charts', 'Control Plan'
            ],
            'milestones': [
                {'name': 'Tollgate 1 - Define Complete', 'phase': 'Define'},
                {'name': 'Tollgate 2 - Measure Complete', 'phase': 'Measure'},
                {'name': 'Tollgate 3 - Analyze Complete', 'phase': 'Analyze'},
                {'name': 'Tollgate 4 - Improve Complete', 'phase': 'Improve'},
                {'name': 'Tollgate 5 - Control Complete', 'phase': 'Control'},
            ],
            'task_categories': ['Statistical Analysis', 'Data Collection', 'Experimentation', 'Documentation', 'Training', 'Validation']
        },
        
        'hybrid': {
            'name': 'Hybrid',
            'description': 'Combines elements from multiple methodologies based on project needs.',
            'icon': 'git-merge',
            'color': '#ec4899',
            'phases': [
                {'name': 'Initiation', 'order': 1, 'description': 'Project setup and planning'},
                {'name': 'Planning', 'order': 2, 'description': 'Detailed planning and design'},
                {'name': 'Execution', 'order': 3, 'description': 'Iterative delivery cycles'},
                {'name': 'Monitoring', 'order': 4, 'description': 'Progress tracking and adjustment'},
                {'name': 'Closure', 'order': 5, 'description': 'Project completion and handover'},
            ],
            'default_roles': [
                {'name': 'Project Manager', 'description': 'Overall coordination'},
                {'name': 'Product Owner', 'description': 'Requirements and priorities'},
                {'name': 'Team Lead', 'description': 'Team delivery management'},
                {'name': 'Team Member', 'description': 'Execution and delivery'},
            ],
            'deliverables': [
                'Project Charter', 'Product Backlog', 'Sprint/Phase Plans',
                'Status Reports', 'Working Deliverables', 'Lessons Learned'
            ],
            'milestones': [
                {'name': 'Project Kickoff', 'phase': 'Initiation'},
                {'name': 'Planning Complete', 'phase': 'Planning'},
                {'name': 'Iteration Complete', 'phase': 'Execution'},
                {'name': 'Project Closure', 'phase': 'Closure'},
            ],
            'task_categories': ['Planning', 'Development', 'Testing', 'Documentation', 'Review']
        },
    }
