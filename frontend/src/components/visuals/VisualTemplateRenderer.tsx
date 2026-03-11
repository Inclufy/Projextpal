import React from 'react';
import type { VisualType, VisualData } from './types';
import { detectTopicType } from './detectTopicType';
import ProjectDefinitionVisual from './ProjectDefinitionVisual';
import TripleConstraintVisual from './TripleConstraintVisual';
import PMRoleVisual from './PMRoleVisual';
import ComparisonVisual from './ComparisonVisual';
import LifecycleVisual from './LifecycleVisual';
import StakeholderVisual from './StakeholderVisual';
import RiskVisual from './RiskVisual';
import MethodologyVisual from './MethodologyVisual';
import GenericContentVisual from './GenericContentVisual';
import { CheckCircle2, Sparkles, Tag } from 'lucide-react';

interface VisualTemplateRendererProps {
  /** The visual type from database. 'auto' means detect from content. */
  visualType: VisualType;
  /** Optional visual configuration data from database */
  visualData?: VisualData | null;
  /** The lesson content/transcript text */
  content: string;
  /** Whether to use Dutch language */
  isNL: boolean;
  /** Section index for color variation */
  index?: number;
}

/**
 * Unified visual renderer.
 *
 * Priority:
 * 1. If visualData has preview_image_url (DALL-E) → show image + metadata
 * 2. Otherwise → render the matching visual template component
 */
const VisualTemplateRenderer: React.FC<VisualTemplateRendererProps> = ({
  visualType,
  visualData,
  content,
  isNL,
  index = 0,
}) => {
  // PRIORITY 1: DALL-E approved image from LessonVisual system
  const previewUrl = visualData?.preview_image_url;
  if (previewUrl) {
    return (
      <div className="space-y-6">
        {/* DALL-E Image Card */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isNL ? 'AI-gegenereerde Visualisatie' : 'AI-generated Visualization'}
                </p>
                {visualData?.ai_intent && (
                  <p className="text-xs text-muted-foreground">{visualData.ai_intent}</p>
                )}
              </div>
            </div>
            {(visualData as any)?.approved && (
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {isNL ? 'Goedgekeurd' : 'Approved'}
              </div>
            )}
          </div>
          <img
            src={previewUrl}
            alt={visualData?.visual_id || 'Visual'}
            className="w-full h-auto rounded-xl shadow-2xl border-2 border-white dark:border-gray-700"
            loading="lazy"
          />
        </div>

        {/* AI Metadata */}
        {visualData?.ai_concepts && visualData.ai_concepts.length > 0 && (
          <div className="px-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {isNL ? 'Kernconcepten:' : 'Key Concepts:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {visualData.ai_concepts.map((concept: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Also render the template visual below the image for interactive content */}
        <TemplateVisual
          visualType={visualType}
          visualData={visualData}
          content={content}
          isNL={isNL}
          index={index}
        />
      </div>
    );
  }

  // PRIORITY 2: Template-based visual rendering
  return (
    <TemplateVisual
      visualType={visualType}
      visualData={visualData}
      content={content}
      isNL={isNL}
      index={index}
    />
  );
};

/** Inner component that renders the appropriate template */
const TemplateVisual: React.FC<VisualTemplateRendererProps> = ({
  visualType,
  visualData,
  content,
  isNL,
  index = 0,
}) => {
  const resolvedType: VisualType =
    visualType && visualType !== 'auto'
      ? visualType
      : detectTopicType(content);

  const props = { content, isNL, visualData, index };

  switch (resolvedType) {
    case 'project_def':
      return <ProjectDefinitionVisual {...props} />;
    case 'triple_constraint':
      return <TripleConstraintVisual {...props} />;
    case 'pm_role':
      return <PMRoleVisual {...props} />;
    case 'comparison':
      return <ComparisonVisual {...props} />;
    case 'lifecycle':
      return <LifecycleVisual {...props} />;
    case 'stakeholder':
      return <StakeholderVisual {...props} />;
    case 'risk':
      return <RiskVisual {...props} />;
    case 'methodology':
      return <MethodologyVisual {...props} />;
    default:
      return <GenericContentVisual {...props} />;
  }
};

export default VisualTemplateRenderer;

// Re-export for convenience
export { detectTopicType, detectTopicFromTitle } from './detectTopicType';
export { getTopicMeta } from './detectTopicType';
export type { VisualType, VisualData, ContentSection } from './types';