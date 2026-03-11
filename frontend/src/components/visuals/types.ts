// ============================================
// VISUAL TEMPLATE SYSTEM - Types
// ============================================

export type VisualType =
  | 'auto'
  | 'project_def'
  | 'triple_constraint'
  | 'pm_role'
  | 'comparison'
  | 'lifecycle'
  | 'stakeholder'
  | 'risk'
  | 'methodology'
  | 'generic';

export interface VisualCard {
  title: string;
  titleNL?: string;
  description: string;
  descriptionNL?: string;
  icon?: string;
  color?: string;
  example?: string;
  exampleNL?: string;
}

export interface ComparisonItem {
  label: string;
  labelNL?: string;
  project: string;
  projectNL?: string;
  operation: string;
  operationNL?: string;
}

export interface LifecyclePhase {
  name: string;
  nameNL?: string;
  description: string;
  descriptionNL?: string;
  color?: string;
}

export interface VisualData {
  // === From LessonVisual approval (synced to CourseLesson.visual_data) ===
  visual_id?: string;
  ai_concepts?: string[];
  ai_intent?: string;
  ai_methodology?: string;
  ai_confidence?: number;
  preview_image_url?: string;
  approved?: boolean;
  approved_at?: string;

  // === Template-specific configuration ===

  // Project Definition
  cards?: VisualCard[];
  heroTitle?: string;
  heroTitleNL?: string;
  heroSubtitle?: string;
  heroSubtitleNL?: string;

  // Triple Constraint
  nodes?: { label: string; labelNL?: string; tooltip?: string; tooltipNL?: string }[];
  scenarios?: VisualCard[];

  // Comparison
  items?: ComparisonItem[];

  // Lifecycle
  phases?: LifecyclePhase[];

  // Stakeholder
  categories?: VisualCard[];

  // Risk
  risks?: VisualCard[];

  // Business case example
  businessCase?: {
    title: string;
    titleNL?: string;
    original: { time: string; budget: string; scope: string };
    change: string;
    changeNL?: string;
    options: string[];
    optionsNL?: string[];
  };
}

export interface VisualTemplateProps {
  content: string;
  isNL: boolean;
  visualData?: VisualData | null;
  index?: number;
}

export interface ContentSection {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  interactive?: React.ReactNode;
  keyPoints: string[];
}