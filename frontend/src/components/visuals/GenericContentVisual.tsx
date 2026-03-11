import React from 'react';
import type { VisualTemplateProps } from './types';
import { renderMarkdownBlock } from '@/utils/markdownRenderer';

const GenericContentVisual: React.FC<VisualTemplateProps> = ({ content }) => {
  return (
    <div className="space-y-6">
      {/* Rich Markdown Content */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {renderMarkdownBlock(content)}
        </div>
      </div>
    </div>
  );
};

export default GenericContentVisual;
