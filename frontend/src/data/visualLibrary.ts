// 🎨 VISUAL LIBRARY - Complete catalog with metadata
// Location: src/data/visualLibrary.ts

import { Visual, Methodology, ConceptClass, LearningIntent } from '../../types/visualContext';

/**
 * Complete visual library with tags, methodologies, and intent mappings
 * Priority: Higher number = more specific/preferred when multiple matches
 */
export const VISUAL_LIBRARY: Visual[] = [
  
  // ===== EXISTING VISUALS =====
  
  {
    id: 'project-definition',
    name: 'Project Definition',
    description: '3 core characteristics: Temporary, Unique, Result-oriented',
    tags: ['definition', 'fundamentals', 'intro', 'characteristics', 'what is'],
    topics: ['project basics', 'definition', 'introduction'],
    methodologies: ['generic_pm'],
    conceptClass: ['definition'],
    learningIntent: ['explain_concept'],
    priority: 50
  },
  
  {
    id: 'charter',
    name: 'Project Charter',
    description: 'Project authorization document with scope, objectives, stakeholders',
    tags: ['charter', 'initiation', 'authorization', 'document'],
    topics: ['initiation', 'governance', 'authorization'],
    methodologies: ['generic_pm', 'prince2', 'waterfall'],
    conceptClass: ['template', 'governance'],
    learningIntent: ['apply_template', 'governance'],
    priority: 70
  },
  
  {
    id: 'stakeholder',
    name: 'Stakeholder Power/Interest Matrix',
    description: 'Power vs Interest grid for stakeholder management',
    tags: ['stakeholder', 'matrix', 'power', 'interest', 'engagement'],
    topics: ['stakeholder management', 'communication'],
    methodologies: ['generic_pm'],
    conceptClass: ['diagram', 'analysis'],
    learningIntent: ['analyze_data', 'governance'],
    priority: 80
  },
  
  {
    id: 'risk',
    name: 'Risk Probability/Impact Matrix',
    description: 'Risk assessment with probability and impact axes',
    tags: ['risk', 'probability', 'impact', 'assessment', 'matrix'],
    topics: ['risk management', 'assessment'],
    methodologies: ['generic_pm'],
    conceptClass: ['diagram', 'analysis'],
    learningIntent: ['analyze_data', 'measure_metric'],
    priority: 70
  },
  
  {
    id: 'wbs',
    name: 'Work Breakdown Structure',
    description: 'Hierarchical decomposition of project deliverables',
    tags: ['wbs', 'breakdown', 'deliverables', 'hierarchy', 'scope'],
    topics: ['scope management', 'planning'],
    methodologies: ['generic_pm', 'prince2', 'waterfall'],
    conceptClass: ['diagram', 'planning'],
    learningIntent: ['explain_concept', 'apply_template'],
    priority: 75
  },
  
  {
    id: 'timeline',
    name: 'Project Timeline/Gantt',
    description: 'Time-based schedule with phases and milestones',
    tags: ['timeline', 'gantt', 'schedule', 'planning', 'milestones'],
    topics: ['time management', 'scheduling', 'planning'],
    methodologies: ['generic_pm', 'waterfall'],
    conceptClass: ['planning', 'process_flow'],
    learningIntent: ['explain_concept', 'apply_template'],
    priority: 65
  },
  
  {
    id: 'team',
    name: 'Team & RACI Matrix',
    description: 'Team roles and responsibilities matrix',
    tags: ['team', 'raci', 'roles', 'responsibilities', 'resources'],
    topics: ['resource management', 'team', 'roles'],
    methodologies: ['generic_pm'],
    conceptClass: ['role_matrix', 'diagram'],
    learningIntent: ['role_definition', 'explain_concept'],
    priority: 70
  },
  
  {
    id: 'constraint',
    name: 'Triple Constraint Triangle',
    description: 'Time, Cost, Scope triangle with Quality center',
    tags: ['constraint', 'triangle', 'time', 'cost', 'scope', 'quality'],
    topics: ['quality', 'constraints', 'balance'],
    methodologies: ['generic_pm'],
    conceptClass: ['framework', 'diagram'],
    learningIntent: ['explain_concept'],
    priority: 60
  },
  
  {
    id: 'communication',
    name: 'Communication Plan Matrix',
    description: 'Who gets what information, when, and how',
    tags: ['communication', 'stakeholder', 'reporting', 'plan'],
    topics: ['communication', 'stakeholder management'],
    methodologies: ['generic_pm'],
    conceptClass: ['template', 'planning'],
    learningIntent: ['apply_template'],
    priority: 70
  },
  
  {
    id: 'change-control',
    name: 'Change Control Process',
    description: '4-step change management flow',
    tags: ['change', 'control', 'process', 'management', 'ccb'],
    topics: ['change management', 'governance'],
    methodologies: ['generic_pm'],
    conceptClass: ['process_flow', 'governance'],
    learningIntent: ['process_overview', 'governance'],
    priority: 70
  },
  
  {
    id: 'issue-log',
    name: 'Issue Log Register',
    description: 'Issue tracking table with priority and status',
    tags: ['issue', 'log', 'register', 'tracking', 'problems'],
    topics: ['issue management', 'tracking'],
    methodologies: ['generic_pm'],
    conceptClass: ['template'],
    learningIntent: ['apply_template'],
    priority: 65
  },
  
  {
    id: 'business-case',
    name: 'Business Case Analysis',
    description: 'Cost vs Benefit analysis with ROI',
    tags: ['business case', 'roi', 'benefit', 'cost', 'justification'],
    topics: ['business case', 'finance', 'justification'],
    methodologies: ['generic_pm', 'prince2'],
    conceptClass: ['analysis', 'template'],
    learningIntent: ['analyze_data', 'explain_concept'],
    priority: 70
  },
  
  {
    id: 'lifecycle',
    name: 'Project Lifecycle',
    description: 'Project phases: Initiation → Planning → Execution → Closure',
    tags: ['lifecycle', 'phases', 'process', 'stages'],
    topics: ['project management', 'process', 'phases'],
    methodologies: ['generic_pm', 'prince2', 'waterfall'],
    conceptClass: ['process_flow', 'framework'],
    learningIntent: ['explain_concept', 'process_overview'],
    priority: 55
  },
  
  {
    id: 'acceptance-checklist',
    name: 'Acceptance Checklist',
    description: 'Project closure and acceptance criteria',
    tags: ['acceptance', 'closure', 'checklist', 'sign-off', 'handover'],
    topics: ['closure', 'acceptance', 'handover'],
    methodologies: ['generic_pm'],
    conceptClass: ['template'],
    learningIntent: ['apply_template'],
    priority: 70
  },
  
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Strengths, Weaknesses, Opportunities, Threats',
    tags: ['swot', 'analysis', 'strategy', 'assessment'],
    topics: ['analysis', 'strategy', 'assessment'],
    methodologies: ['generic_pm'],
    conceptClass: ['analysis', 'framework'],
    learningIntent: ['analyze_data'],
    priority: 60
  },
  
  {
    id: 'budget-variance',
    name: 'Budget Variance Analysis',
    description: 'Planned vs Actual budget tracking',
    tags: ['budget', 'variance', 'cost', 'control', 'evm'],
    topics: ['cost management', 'finance', 'control'],
    methodologies: ['generic_pm'],
    conceptClass: ['metric_visualization'],
    learningIntent: ['measure_metric'],
    priority: 65
  },
  
  {
    id: 'comparison',
    name: 'Comparison Table',
    description: 'Side-by-side comparison of options',
    tags: ['vs', 'versus', 'comparison', 'difference', 'compare'],
    topics: ['comparison', 'decision making'],
    methodologies: ['generic_pm', 'leadership'],
    conceptClass: ['comparison'],
    learningIntent: ['compare_options'],
    priority: 80
  },
  
  {
    id: 'methodologies',
    name: 'Methodologies Overview',
    description: 'Multiple approaches or styles shown as cards/grid',
    tags: ['methodologies', 'approaches', 'styles', 'frameworks', 'methods'],
    topics: ['methodologies', 'frameworks', 'approaches'],
    methodologies: ['generic_pm', 'leadership'],
    conceptClass: ['framework', 'comparison'],
    learningIntent: ['explain_concept', 'compare_options'],
    priority: 65
  },
  
  // ===== SCRUM SPECIFIC =====
  
  {
    id: 'sprint',
    name: 'Sprint Structure',
    description: 'Sprint cycle with planning, execution, review',
    tags: ['sprint', 'iteration', 'timebox', 'scrum'],
    topics: ['scrum', 'sprint', 'iteration'],
    methodologies: ['scrum', 'agile'],
    conceptClass: ['process_flow', 'framework'],
    learningIntent: ['explain_concept', 'process_overview'],
    priority: 90
  },
  
  {
    id: 'backlog',
    name: 'Product Backlog',
    description: 'Prioritized list of user stories and features',
    tags: ['backlog', 'user stories', 'product backlog', 'prioritization'],
    topics: ['scrum', 'backlog', 'requirements'],
    methodologies: ['scrum', 'agile'],
    conceptClass: ['template', 'planning'],
    learningIntent: ['apply_template', 'explain_concept'],
    priority: 90
  },
  
  {
    id: 'scrum-events',
    name: 'Scrum Events/Ceremonies',
    description: 'Daily standup, sprint review, retrospective flow',
    tags: ['scrum events', 'ceremonies', 'daily', 'standup', 'retrospective'],
    topics: ['scrum', 'ceremonies', 'events'],
    methodologies: ['scrum', 'agile'],
    conceptClass: ['process_flow'],
    learningIntent: ['process_overview'],
    priority: 90
  },
  
  {
    id: 'velocity',
    name: 'Velocity & Burndown Chart',
    description: 'Sprint velocity and burndown metrics',
    tags: ['velocity', 'burndown', 'burnup', 'metrics', 'scrum'],
    topics: ['scrum', 'metrics', 'velocity'],
    methodologies: ['scrum', 'agile'],
    conceptClass: ['metric_visualization'],
    learningIntent: ['measure_metric'],
    priority: 85
  },
  
  // ===== AGILE SPECIFIC =====
  
  {
    id: 'manifesto',
    name: 'Agile Manifesto',
    description: '4 values and 12 principles of Agile',
    tags: ['agile', 'manifesto', 'values', 'principles'],
    topics: ['agile', 'manifesto', 'values'],
    methodologies: ['agile'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 95
  },
  
  {
    id: 'principles',
    name: 'Agile Principles',
    description: '12 principles of Agile software development',
    tags: ['agile', 'principles', '12 principles'],
    topics: ['agile', 'principles'],
    methodologies: ['agile'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 95
  },
  
  // ===== NEW VISUALS - KANBAN =====
  
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'Board with columns: To Do, In Progress, Done with WIP limits',
    tags: ['kanban', 'board', 'wip', 'limits', 'columns', 'workflow'],
    topics: ['kanban', 'visual management', 'flow'],
    methodologies: ['kanban', 'agile'],
    conceptClass: ['diagram', 'tool_interface'],
    learningIntent: ['explain_concept', 'flow_visualization', 'tooling'],
    priority: 95
  },
  
  {
    id: 'flow-metrics',
    name: 'Flow Metrics Diagram',
    description: 'Flow efficiency, bottlenecks, and throughput visualization',
    tags: ['flow', 'metrics', 'efficiency', 'bottleneck', 'throughput'],
    topics: ['kanban', 'flow', 'metrics'],
    methodologies: ['kanban', 'agile'],
    conceptClass: ['metric_visualization', 'flow_visualization'],
    learningIntent: ['measure_metric', 'analyze_data'],
    priority: 90
  },
  
  {
    id: 'kanban-metrics',
    name: 'Kanban Metrics Chart',
    description: 'Cycle time, lead time, and throughput charts',
    tags: ['cycle time', 'lead time', 'throughput', 'kanban', 'metrics'],
    topics: ['kanban', 'metrics', 'performance'],
    methodologies: ['kanban', 'agile'],
    conceptClass: ['metric_visualization'],
    learningIntent: ['measure_metric'],
    priority: 90
  },
  
  // ===== NEW VISUALS - LEAN SIX SIGMA =====
  
  {
    id: 'dmaic-cycle',
    name: 'DMAIC Cycle',
    description: '5-step continuous improvement cycle: Define → Measure → Analyze → Improve → Control',
    tags: ['dmaic', 'lean', 'six sigma', 'cycle', 'process', 'improvement'],
    topics: ['lean six sigma', 'dmaic', 'process improvement'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['process_flow', 'framework'],
    learningIntent: ['explain_concept', 'process_overview'],
    priority: 95
  },
  
  {
    id: 'control-chart',
    name: 'Control Chart (SPC)',
    description: 'Statistical Process Control with UCL, CL, LCL and data points',
    tags: ['control chart', 'spc', 'statistical', 'ucl', 'lcl', 'variation', 'control'],
    topics: ['lean six sigma', 'control', 'statistics', 'variation'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['metric_visualization'],
    learningIntent: ['measure_metric', 'analyze_data'],
    priority: 95
  },
  
  {
    id: 'fishbone-diagram',
    name: 'Fishbone Diagram (Ishikawa)',
    description: 'Cause-and-effect diagram with 6M categories',
    tags: ['fishbone', 'ishikawa', 'cause', 'effect', 'root cause', '6m'],
    topics: ['lean six sigma', 'root cause', 'analysis'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['diagram', 'analysis'],
    learningIntent: ['analyze_data'],
    priority: 95
  },
  
  {
    id: 'pareto-chart',
    name: 'Pareto Chart',
    description: '80/20 analysis with bar chart and cumulative line',
    tags: ['pareto', '80 20', 'priority', 'analysis', 'impact'],
    topics: ['lean six sigma', 'prioritization', 'analysis'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['metric_visualization', 'analysis'],
    learningIntent: ['analyze_data', 'measure_metric'],
    priority: 90
  },
  
  {
    id: 'sipoc-diagram',
    name: 'SIPOC Diagram',
    description: 'Supplier → Input → Process → Output → Customer',
    tags: ['sipoc', 'process', 'supplier', 'customer', 'flow'],
    topics: ['lean six sigma', 'process mapping'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['diagram', 'process_flow'],
    learningIntent: ['explain_concept', 'process_overview'],
    priority: 90
  },
  
  {
    id: 'value-stream-map',
    name: 'Value Stream Map',
    description: 'Process flow with value-add time and waste identification',
    tags: ['value stream', 'vsm', 'mapping', 'flow', 'waste', 'lean'],
    topics: ['lean six sigma', 'value stream', 'waste'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['process_flow', 'diagram'],
    learningIntent: ['analyze_data', 'flow_visualization'],
    priority: 90
  },
  
  {
    id: 'waste-types',
    name: '8 Wastes Visual',
    description: '8 types of waste (TIMWOODS) with icons',
    tags: ['waste', '8 wastes', 'muda', 'timwoods', 'lean'],
    topics: ['lean six sigma', 'waste', 'lean'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 85
  },
  
  {
    id: 'capability-curve',
    name: 'Process Capability Curve',
    description: 'Bell curve showing Cp, Cpk and specification limits',
    tags: ['capability', 'cpk', 'cp', 'six sigma', 'specification', 'limits'],
    topics: ['lean six sigma', 'capability', 'statistics'],
    methodologies: ['lean_six_sigma'],
    conceptClass: ['metric_visualization', 'analysis'],
    learningIntent: ['measure_metric', 'analyze_data'],
    priority: 85
  },
  
  // ===== NEW VISUALS - SAFe =====
  
  {
    id: 'agile-release-train',
    name: 'Agile Release Train',
    description: 'Train structure with multiple agile teams',
    tags: ['art', 'agile release train', 'safe', 'teams', 'train'],
    topics: ['safe', 'art', 'scaling'],
    methodologies: ['safe', 'agile'],
    conceptClass: ['diagram', 'framework'],
    learningIntent: ['explain_concept'],
    priority: 95
  },
  
  {
    id: 'pi-planning-board',
    name: 'PI Planning Board',
    description: 'Program Increment planning with features per team per sprint',
    tags: ['pi planning', 'safe', 'program increment', 'planning'],
    topics: ['safe', 'pi planning', 'planning'],
    methodologies: ['safe', 'agile'],
    conceptClass: ['planning', 'template'],
    learningIntent: ['apply_template', 'planning'],
    priority: 95
  },
  
  {
    id: 'safe-levels',
    name: 'SAFe Levels Diagram',
    description: '3 levels: Team, Program, Portfolio hierarchy',
    tags: ['safe', 'levels', 'team', 'program', 'portfolio', 'hierarchy'],
    topics: ['safe', 'levels', 'structure'],
    methodologies: ['safe', 'agile'],
    conceptClass: ['framework', 'diagram'],
    learningIntent: ['explain_concept'],
    priority: 90
  },
  
  {
    id: 'devops-pipeline',
    name: 'DevOps Pipeline',
    description: 'CI/CD pipeline: Code → Build → Test → Deploy',
    tags: ['devops', 'pipeline', 'ci cd', 'continuous', 'deployment'],
    topics: ['safe', 'devops', 'automation'],
    methodologies: ['safe', 'agile'],
    conceptClass: ['process_flow', 'tool_interface'],
    learningIntent: ['process_overview', 'tooling'],
    priority: 85
  },
  
  // ===== NEW VISUALS - LEADERSHIP =====
  
  {
    id: 'conflict-resolution',
    name: 'Conflict Resolution Model',
    description: '5 conflict styles or mediation flow diagram',
    tags: ['conflict', 'resolution', 'mediation', 'styles', 'negotiation'],
    topics: ['leadership', 'conflict', 'soft skills'],
    methodologies: ['leadership'],
    conceptClass: ['framework', 'diagram'],
    learningIntent: ['explain_concept'],
    priority: 85
  },
  
  {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence Model',
    description: 'EQ 4 quadrants: Self-awareness, Self-management, Social awareness, Relationship management',
    tags: ['eq', 'emotional intelligence', 'self-awareness', 'leadership'],
    topics: ['leadership', 'eq', 'soft skills'],
    methodologies: ['leadership'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 85
  },
  
  {
    id: 'decision-matrix',
    name: 'Decision Matrix',
    description: 'Decision-making framework with criteria and scoring',
    tags: ['decision', 'matrix', 'criteria', 'scoring', 'evaluation'],
    topics: ['leadership', 'decision making'],
    methodologies: ['leadership', 'generic_pm'],
    conceptClass: ['template', 'analysis'],
    learningIntent: ['apply_template', 'decision_making'],
    priority: 80
  },
  
  // ===== NEW VISUALS - PROGRAM MANAGEMENT =====
  
  {
    id: 'portfolio-layer',
    name: 'Portfolio Layer Diagram',
    description: 'Projects grouped under programs and portfolios',
    tags: ['portfolio', 'program', 'projects', 'hierarchy', 'governance'],
    topics: ['program management', 'portfolio', 'governance'],
    methodologies: ['program_management'],
    conceptClass: ['diagram', 'framework'],
    learningIntent: ['explain_concept', 'governance'],
    priority: 85
  },

  {
    id: 'benefits-map',
    name: 'Benefits Realization Map',
    description: 'Benefits tracking from outputs through outcomes to strategic objectives',
    tags: ['benefits', 'realization', 'outcomes', 'strategic', 'value'],
    topics: ['program management', 'benefits', 'strategy'],
    methodologies: ['program_management'],
    conceptClass: ['diagram', 'framework'],
    learningIntent: ['explain_concept', 'analyze_data'],
    priority: 85
  },

  {
    id: 'program-governance',
    name: 'Program Governance Structure',
    description: 'Governance layers: Steering Committee, Program Board, Workstreams',
    tags: ['governance', 'steering', 'board', 'structure', 'authority'],
    topics: ['program management', 'governance', 'decision making'],
    methodologies: ['program_management'],
    conceptClass: ['governance', 'diagram'],
    learningIntent: ['governance', 'explain_concept'],
    priority: 80
  },

  // ===== NEW VISUALS - PRINCE2 =====

  {
    id: 'prince2-processes',
    name: 'PRINCE2 7 Processes',
    description: 'Starting Up → Initiating → Directing → Controlling → Managing Product Delivery → Managing Stage Boundaries → Closing',
    tags: ['prince2', 'processes', 'starting up', 'directing', 'controlling', 'closing'],
    topics: ['prince2', 'processes', 'project lifecycle'],
    methodologies: ['prince2'],
    conceptClass: ['process_flow', 'framework'],
    learningIntent: ['explain_concept', 'process_overview'],
    priority: 95
  },

  {
    id: 'prince2-themes',
    name: 'PRINCE2 7 Themes',
    description: 'Business Case, Organization, Quality, Plans, Risk, Change, Progress',
    tags: ['prince2', 'themes', 'business case', 'organization', 'quality', 'plans', 'risk', 'change', 'progress'],
    topics: ['prince2', 'themes', 'governance'],
    methodologies: ['prince2'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 95
  },

  {
    id: 'prince2-principles',
    name: 'PRINCE2 7 Principles',
    description: 'Continued Business Justification, Learn from Experience, Defined Roles, Manage by Stages, Manage by Exception, Focus on Products, Tailor to Suit',
    tags: ['prince2', 'principles', 'business justification', 'exception', 'tailor'],
    topics: ['prince2', 'principles', 'foundation'],
    methodologies: ['prince2'],
    conceptClass: ['framework'],
    learningIntent: ['explain_concept'],
    priority: 95
  },

  {
    id: 'prince2-product-planning',
    name: 'Product-Based Planning',
    description: 'Product Breakdown Structure → Product Description → Product Flow Diagram',
    tags: ['product-based planning', 'product breakdown', 'product description', 'product flow', 'prince2'],
    topics: ['prince2', 'planning', 'products'],
    methodologies: ['prince2'],
    conceptClass: ['planning', 'diagram'],
    learningIntent: ['apply_template', 'explain_concept'],
    priority: 90
  },

  {
    id: 'prince2-organization',
    name: 'PRINCE2 Organization Structure',
    description: 'Project Board (Executive, Senior User, Senior Supplier), Project Manager, Team Manager',
    tags: ['prince2', 'organization', 'project board', 'executive', 'roles'],
    topics: ['prince2', 'organization', 'roles'],
    methodologies: ['prince2'],
    conceptClass: ['role_matrix', 'diagram'],
    learningIntent: ['role_definition', 'explain_concept'],
    priority: 85
  },

  {
    id: 'prince2-stage-gates',
    name: 'PRINCE2 Stage Gates',
    description: 'Management stages with decision points and exception management',
    tags: ['prince2', 'stages', 'gates', 'manage by stages', 'exception'],
    topics: ['prince2', 'stages', 'governance'],
    methodologies: ['prince2'],
    conceptClass: ['process_flow', 'governance'],
    learningIntent: ['process_overview', 'governance'],
    priority: 85
  },

  // ===== NEW VISUALS - MS PROJECT =====

  {
    id: 'ms-project-gantt',
    name: 'MS Project Gantt View',
    description: 'Professional Gantt chart with task hierarchy, dependencies, and milestones',
    tags: ['ms project', 'gantt', 'chart', 'schedule', 'dependencies', 'milestones'],
    topics: ['ms project', 'scheduling', 'planning'],
    methodologies: ['ms_project'],
    conceptClass: ['tool_interface', 'planning'],
    learningIntent: ['tooling', 'apply_template'],
    priority: 95
  },

  {
    id: 'ms-project-resources',
    name: 'MS Project Resource Sheet',
    description: 'Resource allocation view with overallocation detection and leveling',
    tags: ['ms project', 'resources', 'allocation', 'leveling', 'overallocation'],
    topics: ['ms project', 'resource management'],
    methodologies: ['ms_project'],
    conceptClass: ['tool_interface', 'role_matrix'],
    learningIntent: ['tooling', 'analyze_data'],
    priority: 90
  },

  {
    id: 'ms-project-critical-path',
    name: 'Critical Path Method',
    description: 'Network diagram showing critical path, float, and task dependencies',
    tags: ['critical path', 'cpm', 'network', 'float', 'slack', 'dependencies'],
    topics: ['ms project', 'critical path', 'scheduling'],
    methodologies: ['ms_project', 'generic_pm'],
    conceptClass: ['diagram', 'analysis'],
    learningIntent: ['analyze_data', 'explain_concept'],
    priority: 90
  },

  {
    id: 'ms-project-tracking',
    name: 'MS Project Baseline Tracking',
    description: 'Baseline vs actual progress with earned value metrics (CPI, SPI)',
    tags: ['baseline', 'tracking', 'earned value', 'cpi', 'spi', 'progress'],
    topics: ['ms project', 'tracking', 'earned value'],
    methodologies: ['ms_project', 'generic_pm'],
    conceptClass: ['metric_visualization'],
    learningIntent: ['measure_metric', 'analyze_data'],
    priority: 90
  },

  {
    id: 'ms-project-dashboard',
    name: 'MS Project Dashboard',
    description: 'Executive dashboard with status indicators, timeline, and key metrics',
    tags: ['dashboard', 'reporting', 'status', 'executive', 'kpi'],
    topics: ['ms project', 'reporting', 'dashboard'],
    methodologies: ['ms_project'],
    conceptClass: ['metric_visualization', 'tool_interface'],
    learningIntent: ['tooling', 'measure_metric'],
    priority: 85
  },

];

/**
 * Helper function to get visual by ID
 */
export const getVisualById = (id: string): Visual | undefined => {
  return VISUAL_LIBRARY.find(v => v.id === id);
};

/**
 * Helper function to get all visuals for a methodology
 */
export const getVisualsForMethodology = (methodology: Methodology): Visual[] => {
  return VISUAL_LIBRARY.filter(v => v.methodologies.includes(methodology))
    .sort((a, b) => b.priority - a.priority);
};

/**
 * Get all visuals matching a concept class
 */
export const getVisualsByConceptClass = (conceptClass: ConceptClass): Visual[] => {
  return VISUAL_LIBRARY.filter(v => v.conceptClass.includes(conceptClass))
    .sort((a, b) => b.priority - a.priority);
};
