import { useState } from 'react';
import { 
  X, Play, FileText, CheckCircle2, Sparkles, Clock, 
  ChevronLeft, ChevronRight, BookOpen, Edit3, Save,
  Video, File, Link2, Image, Code, List, Bold, Italic,
  AlignLeft, Quote, Heading1, Heading2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================
interface Resource {
  name: string;
  type: 'PDF' | 'XLSX' | 'DOCX' | 'VIDEO' | 'LINK' | 'PPTX';
  size: string;
  description?: string;
  url?: string;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  type?: 'video' | 'quiz' | 'assignment' | 'exam' | 'certificate' | 'reading' | 'interactive';
  transcript?: string;
  content?: string;
  keyTakeaways?: string[];
  resources?: Resource[];
}

interface LessonViewerProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  courseTitle: string;
  isNL?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

// ============================================
// PARSE CONTENT TO REACT
// ============================================
const parseContent = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          {line.replace('## ', '')}
        </h2>
      );
    }
    
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-semibold text-purple-700 dark:text-purple-400 mt-6 mb-3">
          {line.replace('### ', '')}
        </h3>
      );
    }

    // Bold text processing
    const processBold = (text: string): React.ReactNode => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      if (parts.length === 1) return text;
      return parts.map((part, j) => 
        j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part}</strong> : part
      );
    };

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      return (
        <div key={index} className="flex items-start gap-4 mb-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-purple-500/20">
            {numberedMatch[1]}
          </span>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
            {processBold(numberedMatch[2])}
          </p>
        </div>
      );
    }
    
    // Bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={index} className="flex items-start gap-3 mb-3 ml-2">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-400 mt-2.5" />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {processBold(line.replace(/^[-•]\s*/, ''))}
          </p>
        </div>
      );
    }

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      // Skip separator rows
      if (line.includes('---')) return null;
      
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      
      if (!inTable) {
        inTable = true;
        return (
          <div key={index} className="my-6 overflow-hidden rounded-xl border border-purple-100 dark:border-purple-900/50">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                  {cells.map((cell, i) => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-bold text-purple-700 dark:text-purple-400">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        );
      } else {
        return (
          <tr key={index} className="border-t border-purple-50 dark:border-purple-900/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/10">
            {cells.map((cell, i) => (
              <td key={i} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {processBold(cell)}
              </td>
            ))}
          </tr>
        );
      }
    } else {
      inTable = false;
    }

    // Regular paragraph
    if (line.trim()) {
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {processBold(line)}
        </p>
      );
    }
    
    return null;
  };

  lines.forEach((line, i) => {
    const element = processLine(line, i);
    if (element) elements.push(element);
  });

  return elements;
};

// ============================================
// RESOURCE ICON
// ============================================
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'PDF': return <FileText className="h-4 w-4 text-red-500" />;
    case 'VIDEO': return <Video className="h-4 w-4 text-purple-500" />;
    case 'XLSX': return <File className="h-4 w-4 text-green-500" />;
    case 'DOCX': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'PPTX': return <File className="h-4 w-4 text-orange-500" />;
    case 'LINK': return <Link2 className="h-4 w-4 text-cyan-500" />;
    default: return <File className="h-4 w-4 text-gray-500" />;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
const LessonViewer = ({ 
  isOpen, 
  onClose, 
  lesson, 
  courseTitle,
  isNL = true,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: LessonViewerProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'takeaways'>('content');

  if (!isOpen || !lesson) return null;

  const t = {
    content: isNL ? 'Inhoud' : 'Content',
    resources: isNL ? 'Bronnen' : 'Resources',
    takeaways: isNL ? 'Kernpunten' : 'Key Takeaways',
    previous: isNL ? 'Vorige' : 'Previous',
    next: isNL ? 'Volgende' : 'Next',
    markComplete: isNL ? 'Markeer als voltooid' : 'Mark as complete',
    duration: isNL ? 'Duur' : 'Duration',
    download: isNL ? 'Download' : 'Download',
  };

  const hasContent = lesson.transcript || lesson.content;
  const hasResources = lesson.resources && lesson.resources.length > 0;
  const hasTakeaways = lesson.keyTakeaways && lesson.keyTakeaways.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-100 dark:border-purple-900/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                {lesson.type === 'video' ? (
                  <Play className="h-5 w-5 text-white" />
                ) : (
                  <BookOpen className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {courseTitle}
                </p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {lesson.duration}
                  </Badge>
                  {lesson.type && (
                    <Badge variant="outline" className="capitalize">
                      {lesson.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b border-purple-100 dark:border-purple-900/50">
          {hasContent && (
            <button
              onClick={() => setActiveTab('content')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                activeTab === 'content'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <FileText className="h-4 w-4" />
              {t.content}
            </button>
          )}
          {hasResources && (
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                activeTab === 'resources'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <File className="h-4 w-4" />
              {t.resources}
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/50 rounded-full">
                {lesson.resources?.length}
              </span>
            </button>
          )}
          {hasTakeaways && (
            <button
              onClick={() => setActiveTab('takeaways')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                activeTab === 'takeaways'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              <Sparkles className="h-4 w-4" />
              {t.takeaways}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="p-6">
              {/* Video Player (if video type) */}
              {lesson.type === 'video' && lesson.videoUrl && (
                <div className="mb-6 aspect-video bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform cursor-pointer">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                    <p className="font-medium">Preview Video</p>
                    <p className="text-sm opacity-70">{lesson.duration}</p>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className="prose prose-purple dark:prose-invert max-w-none">
                {parseContent(lesson.transcript || lesson.content || '')}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && lesson.resources && (
            <div className="p-6">
              <div className="grid gap-3">
                {lesson.resources.map((resource, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {resource.name}
                      </p>
                      {resource.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{resource.size}</span>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Takeaways Tab */}
          {activeTab === 'takeaways' && lesson.keyTakeaways && (
            <div className="p-6">
              <div className="grid gap-3">
                {lesson.keyTakeaways.map((takeaway, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
                      {takeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t.previous}
          </Button>

          <Button
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t.markComplete}
          </Button>

          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-xl"
          >
            {t.next}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
