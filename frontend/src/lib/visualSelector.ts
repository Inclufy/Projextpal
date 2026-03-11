// ============================================
// VISUAL SELECTOR - AI-powered visual selection
// ============================================
// Analyzes lesson content and selects the best visual template

interface VisualContext {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonContent: string;
  methodology: string;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessonsInModule: number;
}

interface VisualSelection {
  visualId: string;
  confidence: number;
  reasoning: string;
}

// Keyword → visual mapping with weights
const VISUAL_RULES: { keywords: string[]; visualId: string; weight: number }[] = [
  { keywords: ['charter', 'fundering', 'foundation'], visualId: 'charter', weight: 10 },
  { keywords: ['initiatie', 'initiation', 'kick-off', 'kickoff'], visualId: 'initiation', weight: 8 },
  { keywords: ['business case', 'investering', 'roi', 'kosten-baten'], visualId: 'business_case', weight: 9 },
  { keywords: ['stakeholder', 'belanghebbende', 'sponsor'], visualId: 'stakeholder', weight: 8 },
  { keywords: ['risico', 'risk', 'mitigat', 'bedreiging'], visualId: 'risk', weight: 8 },
  { keywords: ['tijdlijn', 'timeline', 'gantt', 'planning', 'milestone'], visualId: 'timeline', weight: 7 },
  { keywords: ['wbs', 'work breakdown', 'decompositie'], visualId: 'wbs', weight: 9 },
  { keywords: ['triple constraint', 'driehoek', 'tijd budget', 'scope'], visualId: 'constraint', weight: 8 },
  { keywords: ['communicatie', 'communication', 'vergadering'], visualId: 'communication', weight: 7 },
  { keywords: ['change control', 'wijzigingsbeheer', 'change request'], visualId: 'change_control', weight: 9 },
  { keywords: ['issue log', 'issue tracking', 'probleem'], visualId: 'issue_log', weight: 7 },
  { keywords: ['budget', 'earned value', 'variantie', 'variance'], visualId: 'budget_variance', weight: 8 },
  { keywords: ['acceptatie', 'acceptance', 'sign-off', 'oplevering'], visualId: 'acceptance_checklist', weight: 8 },
  { keywords: ['inkoop', 'procurement', 'leverancier', 'vendor'], visualId: 'procurement', weight: 8 },
  { keywords: ['raci', 'team', 'verantwoordelijkheid', 'rol'], visualId: 'raci', weight: 6 },
  { keywords: ['swot', 'sterktes', 'zwaktes', 'strengths'], visualId: 'swot', weight: 9 },
  { keywords: ['levenscyclus', 'lifecycle', 'fasen', 'phases'], visualId: 'lifecycle', weight: 7 },
  { keywords: ['project definitie', 'project definition', 'wat is een project', 'tijdelijk uniek'], visualId: 'project_definition', weight: 8 },
  { keywords: ['sprint', 'sprint board', 'sprint planning'], visualId: 'sprint', weight: 8 },
  { keywords: ['backlog', 'user story', 'product backlog'], visualId: 'backlog', weight: 8 },
  { keywords: ['scrum event', 'retrospective', 'daily standup', 'sprint review'], visualId: 'scrum_events', weight: 8 },
  { keywords: ['velocity', 'burndown', 'story points'], visualId: 'velocity', weight: 8 },
  { keywords: ['manifesto', 'agile waarden', 'agile values'], visualId: 'manifesto', weight: 9 },
  { keywords: ['agile vs', 'traditioneel vs', 'waterfall vs', 'vergelijking'], visualId: 'comparison', weight: 7 },
  { keywords: ['principes', 'principles', '12 principes'], visualId: 'principles', weight: 7 },
  { keywords: ['methodolog', 'framework', 'pmbok'], visualId: 'methodologies', weight: 6 },

  // ===== KANBAN =====
  { keywords: ['kanban board', 'kanban bord', 'wip limit', 'werk in uitvoering', 'kolommen'], visualId: 'kanban-board', weight: 9 },
  { keywords: ['flow metric', 'doorstroom', 'bottleneck', 'knelpunt', 'throughput'], visualId: 'flow-metrics', weight: 8 },
  { keywords: ['cycle time', 'doorlooptijd', 'lead time', 'kanban metric'], visualId: 'kanban-metrics', weight: 8 },

  // ===== LEAN SIX SIGMA =====
  { keywords: ['dmaic', 'define measure analyze', 'verbetercyclus'], visualId: 'dmaic-cycle', weight: 10 },
  { keywords: ['control chart', 'regelkaart', 'spc', 'ucl', 'lcl', 'variatie'], visualId: 'control-chart', weight: 9 },
  { keywords: ['fishbone', 'visgraat', 'ishikawa', 'oorzaak gevolg', 'root cause'], visualId: 'fishbone-diagram', weight: 9 },
  { keywords: ['pareto', '80 20', 'prioritering'], visualId: 'pareto-chart', weight: 8 },
  { keywords: ['sipoc', 'supplier input process output', 'procesflow'], visualId: 'sipoc-diagram', weight: 9 },
  { keywords: ['value stream', 'waardestroom', 'vsm', 'verspilling'], visualId: 'value-stream-map', weight: 8 },
  { keywords: ['waste', 'verspilling', 'muda', 'timwoods', '8 wastes'], visualId: 'waste-types', weight: 8 },
  { keywords: ['capability', 'cpk', 'procesvermogen', 'sigma level', 'bell curve'], visualId: 'capability-curve', weight: 8 },

  // ===== SAFe =====
  { keywords: ['agile release train', 'art', 'release train'], visualId: 'agile-release-train', weight: 9 },
  { keywords: ['pi planning', 'program increment', 'big room'], visualId: 'pi-planning-board', weight: 9 },
  { keywords: ['safe level', 'team program portfolio', 'safe hiërarchie', 'safe structuur'], visualId: 'safe-levels', weight: 8 },
  { keywords: ['devops', 'ci cd', 'pipeline', 'continuous delivery', 'deployment'], visualId: 'devops-pipeline', weight: 7 },

  // ===== LEADERSHIP =====
  { keywords: ['conflict', 'conflictoplossing', 'mediatie', 'onderhandeling'], visualId: 'conflict-resolution', weight: 8 },
  { keywords: ['emotionele intelligentie', 'emotional intelligence', 'eq', 'zelfbewustzijn', 'self-awareness'], visualId: 'emotional-intelligence', weight: 8 },
  { keywords: ['besluitvorming', 'decision matrix', 'beslissingsmatrix', 'criteria'], visualId: 'decision-matrix', weight: 7 },

  // ===== PROGRAM MANAGEMENT =====
  { keywords: ['portfolio', 'programma', 'programme', 'project hiërarchie', 'strategic alignment'], visualId: 'portfolio-layer', weight: 8 },
  { keywords: ['benefits management', 'benefits realisatie', 'batenmanagement'], visualId: 'benefits-map', weight: 8 },
  { keywords: ['program governance', 'programma governance', 'stuurgroep', 'steering committee'], visualId: 'program-governance', weight: 7 },

  // ===== PRINCE2 =====
  { keywords: ['prince2 proces', 'prince2 process', 'starting up', 'directing', 'initiating', 'controlling a stage'], visualId: 'prince2-processes', weight: 9 },
  { keywords: ['prince2 thema', 'prince2 theme', 'business case thema', 'organisation theme', 'quality theme'], visualId: 'prince2-themes', weight: 9 },
  { keywords: ['prince2 princip', 'continued business justification', 'manage by exception', 'learn from experience'], visualId: 'prince2-principles', weight: 9 },
  { keywords: ['product-based planning', 'productbeschrijving', 'product breakdown', 'product flow'], visualId: 'prince2-product-planning', weight: 8 },

  // ===== MS PROJECT =====
  { keywords: ['ms project', 'microsoft project', 'project plan software'], visualId: 'ms-project-gantt', weight: 9 },
  { keywords: ['resource allocatie', 'resource allocation', 'resource leveling', 'overallocatie'], visualId: 'ms-project-resources', weight: 8 },
  { keywords: ['critical path', 'kritieke pad', 'langste pad', 'float', 'slack'], visualId: 'ms-project-critical-path', weight: 8 },
  { keywords: ['baseline', 'voortgang tracking', 'progress tracking'], visualId: 'ms-project-tracking', weight: 8 },
  { keywords: ['project dashboard', 'rapportage', 'reporting', 'status report'], visualId: 'ms-project-dashboard', weight: 7 },
];

export async function buildVisualContext(
  course: any,
  module: any,
  lesson: any,
  moduleIndex: number,
  lessonIndex: number
): Promise<VisualContext> {
  return {
    courseTitle: course?.title || '',
    moduleTitle: module?.title || '',
    lessonTitle: lesson?.title || '',
    lessonContent: lesson?.content || '',
    methodology: course?.methodology || module?.methodology || 'generic_pm',
    moduleIndex,
    lessonIndex,
    totalModules: course?.modules?.length || 1,
    totalLessonsInModule: module?.lessons?.length || 1,
  };
}

export function selectVisual(context: VisualContext): VisualSelection {
  const searchText = `${context.lessonTitle} ${context.moduleTitle} ${context.lessonContent}`.toLowerCase();

  let bestMatch: { visualId: string; score: number } = { visualId: 'lifecycle', score: 0 };

  for (const rule of VISUAL_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score += rule.weight;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { visualId: rule.visualId, score };
    }
  }

  const confidence = bestMatch.score > 0 ? Math.min(bestMatch.score / 20, 1) : 0.1;

  return {
    visualId: bestMatch.visualId,
    confidence,
    reasoning: bestMatch.score > 0
      ? `Matched visual '${bestMatch.visualId}' with score ${bestMatch.score}`
      : 'No keyword match found, using default lifecycle visual',
  };
}