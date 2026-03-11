// ============================================
// VISUAL SERVICE - Persistent Visual Storage
// ============================================
// Stores approved visuals per lesson so they don't need to be
// re-rendered every time the CourseLearningPlayer loads.

import type { VisualType } from '@/components/visuals/types';

export interface VisualData {
  visual_id: string;
  lesson_id: string;
  course_id?: string;
  module_id?: string;
  visual_type: 'template' | 'image' | 'custom';
  preview_image_url?: string;
  ai_intent?: string;
  ai_concepts?: string[];
  ai_methodology?: string;
  template_key?: string; // e.g. 'charter', 'business_case', 'lifecycle', etc.
  custom_html?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VisualTemplate {
  id: string;
  name: string;
  nameNL: string;
  description: string;
  descriptionNL: string;
  category: string;
  keywords: string[];
  preview_thumbnail?: string;
}

// All available visual templates that match CourseLearningPlayer's renderVisual()
export const VISUAL_TEMPLATES: VisualTemplate[] = [
  {
    id: 'charter',
    name: 'Project Charter',
    nameNL: 'Project Charter',
    description: 'Project foundation document with purpose, scope, stakeholders, and success criteria',
    descriptionNL: 'Projectfundament met doel, scope, stakeholders en succescriteria',
    category: 'Initiation',
    keywords: ['charter', 'foundation', 'document'],
  },
  {
    id: 'initiation',
    name: 'Project Initiation',
    nameNL: 'Project Initiatie',
    description: 'From idea to approval: Idea → Business Case → Charter → Kick-off',
    descriptionNL: 'Van idee naar goedkeuring: Idee → Business Case → Charter → Kick-off',
    category: 'Initiation',
    keywords: ['initiation', 'initiatie', 'start'],
  },
  {
    id: 'business_case',
    name: 'Business Case',
    nameNL: 'Business Case',
    description: 'Problem, solution, cost-benefit analysis and ROI visualization',
    descriptionNL: 'Probleem, oplossing, kosten-baten analyse en ROI visualisatie',
    category: 'Initiation',
    keywords: ['business', 'case', 'roi'],
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder Analysis',
    nameNL: 'Stakeholder Analyse',
    description: 'Stakeholder mapping with power/interest matrix',
    descriptionNL: 'Stakeholder mapping met macht/interesse matrix',
    category: 'Planning',
    keywords: ['stakeholder', 'belanghebbende'],
  },
  {
    id: 'risk',
    name: 'Risk Management',
    nameNL: 'Risicomanagement',
    description: 'Risk identification, assessment and mitigation strategies',
    descriptionNL: 'Risico-identificatie, beoordeling en mitigatiestrategieën',
    category: 'Planning',
    keywords: ['risk', 'risico'],
  },
  {
    id: 'timeline',
    name: 'Project Timeline',
    nameNL: 'Project Tijdlijn',
    description: 'Gantt-style timeline with milestones and phases',
    descriptionNL: 'Gantt-stijl tijdlijn met mijlpalen en fases',
    category: 'Planning',
    keywords: ['timeline', 'tijdlijn', 'gantt'],
  },
  {
    id: 'wbs',
    name: 'Work Breakdown Structure',
    nameNL: 'Work Breakdown Structure',
    description: 'Hierarchical decomposition of project deliverables',
    descriptionNL: 'Hiërarchische decompositie van projectresultaten',
    category: 'Planning',
    keywords: ['wbs', 'breakdown', 'decomposition'],
  },
  {
    id: 'constraint',
    name: 'Triple Constraint',
    nameNL: 'Triple Constraint',
    description: 'Time, Budget & Scope triangle with interactive scenarios',
    descriptionNL: 'Tijd, Budget & Scope driehoek met interactieve scenario\'s',
    category: 'Core Concepts',
    keywords: ['constraint', 'triangle', 'driehoek'],
  },
  {
    id: 'communication',
    name: 'Communication Plan',
    nameNL: 'Communicatieplan',
    description: 'Stakeholder communication matrix and channels',
    descriptionNL: 'Stakeholder communicatiematrix en kanalen',
    category: 'Execution',
    keywords: ['communication', 'communicatie'],
  },
  {
    id: 'change_control',
    name: 'Change Control',
    nameNL: 'Wijzigingsbeheer',
    description: 'Change request process and approval workflow',
    descriptionNL: 'Wijzigingsverzoek proces en goedkeuringsworkflow',
    category: 'Monitoring',
    keywords: ['change', 'control', 'wijziging'],
  },
  {
    id: 'issue_log',
    name: 'Issue Log',
    nameNL: 'Issue Log',
    description: 'Issue tracking and resolution management',
    descriptionNL: 'Issue tracking en oplossingsmanagement',
    category: 'Monitoring',
    keywords: ['issue', 'log', 'tracking'],
  },
  {
    id: 'budget_variance',
    name: 'Budget Variance',
    nameNL: 'Budget Variantie',
    description: 'Budget tracking with earned value metrics',
    descriptionNL: 'Budget tracking met earned value metrics',
    category: 'Monitoring',
    keywords: ['budget', 'variance', 'earned'],
  },
  {
    id: 'acceptance_checklist',
    name: 'Acceptance Checklist',
    nameNL: 'Acceptatie Checklist',
    description: 'Project acceptance criteria and sign-off checklist',
    descriptionNL: 'Project acceptatiecriteria en goedkeuringschecklist',
    category: 'Closing',
    keywords: ['acceptance', 'checklist', 'sign-off'],
  },
  {
    id: 'procurement',
    name: 'Procurement Plan',
    nameNL: 'Inkoopplan',
    description: 'Procurement strategy and vendor management',
    descriptionNL: 'Inkoopstrategie en leveranciersbeheer',
    category: 'Planning',
    keywords: ['procurement', 'inkoop', 'vendor'],
  },
  {
    id: 'raci',
    name: 'RACI / Team Matrix',
    nameNL: 'RACI / Team Matrix',
    description: 'Responsibility assignment matrix for team roles',
    descriptionNL: 'Verantwoordelijkheidsmatrix voor teamrollen',
    category: 'Planning',
    keywords: ['raci', 'team', 'matrix'],
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    nameNL: 'SWOT Analyse',
    description: 'Strengths, Weaknesses, Opportunities, Threats grid',
    descriptionNL: 'Sterktes, Zwaktes, Kansen, Bedreigingen grid',
    category: 'Analysis',
    keywords: ['swot', 'analysis'],
  },
  {
    id: 'lifecycle',
    name: 'Project Lifecycle',
    nameNL: 'Project Levenscyclus',
    description: 'Project phases from initiation to closing',
    descriptionNL: 'Projectfasen van initiatie tot afsluiting',
    category: 'Core Concepts',
    keywords: ['lifecycle', 'levenscyclus', 'fasen'],
  },
  {
    id: 'project_definition',
    name: 'Project Definition',
    nameNL: 'Project Definitie',
    description: 'What makes a project: temporary, unique, goal-oriented',
    descriptionNL: 'Wat maakt een project: tijdelijk, uniek, doelgericht',
    category: 'Core Concepts',
    keywords: ['project', 'definition', 'definitie'],
  },
  // Agile templates
  {
    id: 'sprint',
    name: 'Sprint Board',
    nameNL: 'Sprint Board',
    description: 'Sprint planning board with backlog items',
    descriptionNL: 'Sprint planning board met backlog items',
    category: 'Agile',
    keywords: ['sprint', 'board'],
  },
  {
    id: 'backlog',
    name: 'Product Backlog',
    nameNL: 'Product Backlog',
    description: 'Prioritized backlog with user stories',
    descriptionNL: 'Geprioriteerde backlog met user stories',
    category: 'Agile',
    keywords: ['backlog', 'user story'],
  },
  {
    id: 'scrum_events',
    name: 'Scrum Events',
    nameNL: 'Scrum Events',
    description: 'Sprint ceremonies and Scrum framework events',
    descriptionNL: 'Sprint ceremonies en Scrum framework events',
    category: 'Agile',
    keywords: ['scrum', 'event', 'ceremony'],
  },
  {
    id: 'velocity',
    name: 'Velocity Chart',
    nameNL: 'Velocity Chart',
    description: 'Team velocity tracking across sprints',
    descriptionNL: 'Team velocity tracking over sprints',
    category: 'Agile',
    keywords: ['velocity', 'chart'],
  },
  {
    id: 'manifesto',
    name: 'Agile Manifesto',
    nameNL: 'Agile Manifesto',
    description: 'The four values and twelve principles of Agile',
    descriptionNL: 'De vier waarden en twaalf principes van Agile',
    category: 'Agile',
    keywords: ['manifesto', 'agile', 'values'],
  },
  {
    id: 'comparison',
    name: 'Agile vs Traditional',
    nameNL: 'Agile vs Traditioneel',
    description: 'Side-by-side comparison of methodologies',
    descriptionNL: 'Vergelijking van methodologieën naast elkaar',
    category: 'Agile',
    keywords: ['comparison', 'agile', 'traditional'],
  },
  {
    id: 'principles',
    name: 'Agile Principles',
    nameNL: 'Agile Principes',
    description: 'The twelve principles behind the Agile Manifesto',
    descriptionNL: 'De twaalf principes achter het Agile Manifesto',
    category: 'Agile',
    keywords: ['principles', 'principe'],
  },
  {
    id: 'methodologies',
    name: 'PM Methodologies',
    nameNL: 'PM Methodologieën',
    description: 'Overview of project management methodologies',
    descriptionNL: 'Overzicht van projectmanagement methodologieën',
    category: 'Core Concepts',
    keywords: ['methodolog', 'framework'],
  },
];

// ============================================
// VISUAL ID → TEMPLATE KEY RESOLVER
// ============================================
// Maps admin-generated visual IDs (e.g. "project_charter_model_visualization")
// to the template keys used by CourseLearningPlayer's renderVisual()
// (e.g. "charter", "risk", "lifecycle")
const VISUAL_ID_PATTERNS: { pattern: RegExp; templateKey: string }[] = [
  { pattern: /charter/i, templateKey: 'charter' },
  { pattern: /initiat/i, templateKey: 'initiation' },
  { pattern: /business.?case|roi/i, templateKey: 'business_case' },
  { pattern: /stakeholder|belanghebbend/i, templateKey: 'stakeholder' },
  { pattern: /risk|risico/i, templateKey: 'risk' },
  { pattern: /timeline|tijdlijn|gantt/i, templateKey: 'timeline' },
  { pattern: /wbs|breakdown|decomposit/i, templateKey: 'wbs' },
  { pattern: /constraint|triangle|driehoek|triple/i, templateKey: 'constraint' },
  { pattern: /communicat/i, templateKey: 'communication' },
  { pattern: /change.?control|wijziging/i, templateKey: 'change_control' },
  { pattern: /issue.?log|issue.?track/i, templateKey: 'issue_log' },
  { pattern: /budget|variance|earned.?value|cost.?estimat/i, templateKey: 'budget_variance' },
  { pattern: /acceptance|checklist|sign.?off/i, templateKey: 'acceptance_checklist' },
  { pattern: /procurement|inkoop|vendor/i, templateKey: 'procurement' },
  { pattern: /raci|team.?matrix|responsibility/i, templateKey: 'raci' },
  { pattern: /swot/i, templateKey: 'swot' },
  { pattern: /lifecycle|levenscyclus|project.?fase/i, templateKey: 'lifecycle' },
  { pattern: /sprint/i, templateKey: 'sprint' },
  { pattern: /backlog/i, templateKey: 'backlog' },
  { pattern: /scrum.?event|retrospective|daily.?standup/i, templateKey: 'scrum_events' },
  { pattern: /velocity|burndown/i, templateKey: 'velocity' },
  { pattern: /manifesto/i, templateKey: 'manifesto' },
  { pattern: /comparison|agile.?vs|traditional.?vs/i, templateKey: 'comparison' },
  { pattern: /principles?|princip/i, templateKey: 'principles' },
  { pattern: /methodolog|framework|prince2|pmbok/i, templateKey: 'methodologies' },
  { pattern: /project.?definition|scope.?definition/i, templateKey: 'project_definition' },
  { pattern: /certific/i, templateKey: 'lifecycle' }, // certificates → lifecycle fallback
  { pattern: /quiz|exam|assessment/i, templateKey: 'lifecycle' }, // quiz → lifecycle fallback
  { pattern: /planning|resource.?plan/i, templateKey: 'timeline' },
  { pattern: /quality|monitoring|execution/i, templateKey: 'lifecycle' },
  { pattern: /closure|closing|final/i, templateKey: 'acceptance_checklist' },
];

/**
 * Resolves an admin Visual ID (e.g. "project_charter_model_visualization")
 * to the template key used by CourseLearningPlayer (e.g. "charter").
 * Also checks the lesson title for better matching.
 */
export function resolveTemplateKey(
  visualId: string,
  lessonTitle?: string
): string {
  const searchText = `${visualId} ${lessonTitle || ''}`;

  for (const { pattern, templateKey } of VISUAL_ID_PATTERNS) {
    if (pattern.test(searchText)) {
      return templateKey;
    }
  }

  // Fallback: check if the visualId itself is already a valid template key
  const directMatch = VISUAL_TEMPLATES.find(t => t.id === visualId.toLowerCase());
  if (directMatch) return directMatch.id;

  return 'lifecycle'; // default fallback
}

/**
 * Maps a template key (from resolveTemplateKey) to the VisualType enum
 * used by VisualTemplateRenderer. Many template keys map to a smaller
 * set of available React components.
 */
const TEMPLATE_KEY_TO_VISUAL_TYPE: Record<string, VisualType> = {
  // Direct matches
  project_definition: 'project_def',
  stakeholder: 'stakeholder',
  risk: 'risk',
  lifecycle: 'lifecycle',
  comparison: 'comparison',
  constraint: 'triple_constraint',

  // Mapped to closest template
  charter: 'project_def',
  initiation: 'project_def',
  business_case: 'project_def',
  timeline: 'lifecycle',
  wbs: 'lifecycle',
  communication: 'stakeholder',
  change_control: 'risk',
  issue_log: 'risk',
  budget_variance: 'triple_constraint',
  acceptance_checklist: 'lifecycle',
  procurement: 'stakeholder',
  raci: 'stakeholder',
  swot: 'risk',
  sprint: 'lifecycle',
  backlog: 'lifecycle',
  scrum_events: 'lifecycle',
  velocity: 'triple_constraint',
  manifesto: 'methodology',
  principles: 'methodology',
  methodologies: 'methodology',
  methodology: 'methodology',
  agile: 'methodology',
  scrum: 'methodology',
  waterfall: 'methodology',
  kanban: 'methodology',
  prince2: 'methodology',
  safe: 'methodology',
  lean: 'methodology',
};

export function resolveVisualType(templateKeyOrVisualId: string): VisualType {
  // 1. Direct VisualType match (already a valid type)
  const validTypes: VisualType[] = ['project_def', 'triple_constraint', 'pm_role', 'comparison', 'lifecycle', 'stakeholder', 'risk', 'methodology', 'generic'];
  if (validTypes.includes(templateKeyOrVisualId as VisualType)) {
    return templateKeyOrVisualId as VisualType;
  }

  // 2. Lookup from template key
  const mapped = TEMPLATE_KEY_TO_VISUAL_TYPE[templateKeyOrVisualId.toLowerCase()];
  if (mapped) return mapped;

  // 3. Try resolveTemplateKey first, then map
  const templateKey = resolveTemplateKey(templateKeyOrVisualId);
  const fromKey = TEMPLATE_KEY_TO_VISUAL_TYPE[templateKey];
  if (fromKey) return fromKey;

  return 'generic';
}

// ============================================
// ADMIN PORTAL TYPES - Used by VisualManagement.tsx
// ============================================
export interface LessonVisual {
  id: number;
  lesson_id: number;
  lesson_title: string;
  visual_id: string;
  ai_confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  ai_concepts?: string[];
  ai_intent?: string;
  ai_methodology?: string;
  custom_keywords?: string;
  preview_image_url?: string;
  created_at: string;
  updated_at?: string;
}

// Storage key prefix
const STORAGE_KEY = 'inclufai_visuals';

class VisualService {
  // ============================================
  // GET approved visual for a lesson
  // ============================================
  async getApprovedVisual(lessonId: string): Promise<VisualData | null> {
    try {
      // Try API first — uses the ViewSet's by_lesson action
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/by_lesson/?lesson_id=${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.visual_id) return data;
      }
    } catch {
      // API not available, fall through to localStorage
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`${STORAGE_KEY}_${lessonId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.approved) return parsed;
      } catch {
        // Invalid JSON
      }
    }

    return null;
  }

  // ============================================
  // SAVE/APPROVE a visual for a lesson
  // ============================================
  async saveVisual(lessonId: string, visual: Partial<VisualData>): Promise<VisualData> {
    const now = new Date().toISOString();
    const fullVisual: VisualData = {
      visual_id: visual.visual_id || '',
      lesson_id: lessonId,
      course_id: visual.course_id,
      module_id: visual.module_id,
      visual_type: visual.visual_type || 'template',
      preview_image_url: visual.preview_image_url,
      ai_intent: visual.ai_intent,
      ai_concepts: visual.ai_concepts,
      ai_methodology: visual.ai_methodology,
      template_key: visual.template_key || visual.visual_id,
      custom_html: visual.custom_html,
      approved: true,
      approved_at: now,
      created_at: visual.created_at || now,
      updated_at: now,
    };

    try {
      // Try API first — update the LessonVisual via the ViewSet
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...fullVisual, lesson: lessonId }),
      });

      if (response.ok) {
        const saved = await response.json();
        // Also save to localStorage as cache
        localStorage.setItem(`${STORAGE_KEY}_${lessonId}`, JSON.stringify(saved));
        return saved;
      }
    } catch {
      // API not available, fall through to localStorage
    }

    // Fallback: save to localStorage
    localStorage.setItem(`${STORAGE_KEY}_${lessonId}`, JSON.stringify(fullVisual));
    return fullVisual;
  }

  // ============================================
  // DELETE a visual for a lesson
  // ============================================
  async deleteVisual(lessonId: string): Promise<void> {
    try {
      // First get the visual ID for this lesson
      const visual = await this.getApprovedVisual(lessonId);
      if (visual && (visual as any).id) {
        await fetch(`/api/v1/academy/visuals/lesson-visuals/${(visual as any).id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
      }
    } catch {
      // API not available
    }

    localStorage.removeItem(`${STORAGE_KEY}_${lessonId}`);
  }

  // ============================================
  // GET all saved visuals for a course
  // ============================================
  async getVisualsForCourse(courseId: string): Promise<VisualData[]> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/?course_id=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch {
      // API not available
    }

    // Fallback: scan localStorage
    const visuals: VisualData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data.course_id === courseId) {
            visuals.push(data);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }
    return visuals;
  }

  // ============================================
  // GET all available templates
  // ============================================
  getTemplates(): VisualTemplate[] {
    return VISUAL_TEMPLATES;
  }

  // ============================================
  // FIND best matching template for lesson content
  // ============================================
  suggestTemplate(lessonTitle: string, lessonContent?: string): VisualTemplate | null {
    const searchText = `${lessonTitle} ${lessonContent || ''}`.toLowerCase();

    let bestMatch: VisualTemplate | null = null;
    let bestScore = 0;

    for (const template of VISUAL_TEMPLATES) {
      let score = 0;
      for (const keyword of template.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score += keyword.length; // Longer keywords = more specific match
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    return bestMatch;
  }

  // ============================================
  // ADMIN: Get visuals by course (with optional status filter)
  // Used by VisualManagement.tsx
  // ============================================
  async getVisualsByCourse(courseId: string, status?: string): Promise<LessonVisual[]> {
    try {
      const params = new URLSearchParams();
      params.set('course_id', courseId);
      if (status) params.set('status', status);
      const url = `/api/v1/academy/visuals/lesson-visuals/?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch {
      // API not available
    }
    return [];
  }

  // ============================================
  // ADMIN: Generate visuals for all lessons in a course
  // ============================================
  async generateVisuals(courseId: string, force: boolean = false): Promise<{ generated: number; skipped: number; errors?: string[] }> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/generate_visuals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ course_id: courseId, regenerate: force }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Generate failed: ${response.status}`);
    } catch (error) {
      console.error('generateVisuals error:', error);
      throw error;
    }
  }

  // ============================================
  // ADMIN: Approve a visual
  // ============================================
  async approveVisual(visualId: number): Promise<void> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/${visualId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Approve failed: ${response.status}`);
      }
    } catch (error) {
      console.error('approveVisual error:', error);
      throw error;
    }
  }

  // ============================================
  // ADMIN: Reject a visual (optionally with custom keywords for regeneration)
  // ============================================
  async rejectVisual(visualId: number, customKeywords?: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/${visualId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ custom_keywords: customKeywords }),
      });

      if (!response.ok) {
        throw new Error(`Reject failed: ${response.status}`);
      }
    } catch (error) {
      console.error('rejectVisual error:', error);
      throw error;
    }
  }

  // ============================================
  // ADMIN: Regenerate a visual with custom keywords
  // ============================================
  async regenerateVisual(visualId: number, keywords: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/${visualId}/regenerate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ custom_keywords: keywords }),
      });

      if (!response.ok) {
        throw new Error(`Regenerate failed: ${response.status}`);
      }
    } catch (error) {
      console.error('regenerateVisual error:', error);
      throw error;
    }
  }

  // ============================================
  // ADMIN: Generate DALL-E preview image for a visual
  // ============================================
  async generatePreviewImage(visualId: number): Promise<{ image_url: string }> {
    try {
      const response = await fetch(`/api/v1/academy/visuals/lesson-visuals/${visualId}/generate_preview_image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Preview generation failed: ${response.status}`);
    } catch (error) {
      console.error('generatePreviewImage error:', error);
      throw error;
    }
  }
}

export const visualService = new VisualService();