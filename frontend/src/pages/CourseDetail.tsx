import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Clock, BookOpen, Award, Star, Users, ChevronRight, CheckCircle2, 
  ArrowRight, GraduationCap, Trophy, Sparkles, Heart, Share2, 
  Target, Zap, Play, PlayCircle, Lock, ChevronDown, ChevronUp,
  Download, Check, ArrowLeft, Brain, Crown, Gift, FileText,
  HelpCircle, ClipboardCheck, MessageSquare, AlertCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

// ============================================
// IMPORT ACTUAL COURSE DATA
// ============================================
import { 
  Course, 
  Module, 
  Lesson,
  getCourseById,
  academyCourses,
} from "@/data/academyCourses";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  pinkLight: '#F0ABFC',
  green: '#22C55E',
  greenDark: '#16A34A',
  blue: '#3B82F6',
  orange: '#F59E0B',
  cyan: '#06B6D4',
};

// ============================================
// ICON MAPPING
// ============================================
const iconMap: Record<string, any> = {
  'Target': Target,
  'Crown': Crown,
  'Zap': Zap,
  'TrendingUp': Target,
  'GitBranch': Target,
  'Trello': Target,
  'Layers': Target,
};

// ============================================
// LESSON TYPE ICONS
// ============================================
const getLessonIcon = (type?: string) => {
  switch (type) {
    case 'quiz':
      return <HelpCircle className="h-4 w-4 text-orange-500" />;
    case 'assignment':
      return <ClipboardCheck className="h-4 w-4 text-blue-500" />;
    case 'exam':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'certificate':
      return <Award className="h-4 w-4 text-yellow-500" />;
    default:
      return <PlayCircle className="h-4 w-4 text-purple-500" />;
  }
};

// ============================================
// LOGO COMPONENT
// ============================================
const ProjeXtPalLogo = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { width: 48, height: 20, text: 'text-lg', gap: 'gap-2' },
    md: { width: 64, height: 26, text: 'text-xl', gap: 'gap-3' },
    lg: { width: 96, height: 38, text: 'text-2xl', gap: 'gap-3' },
  };
  
  const { width, height, text, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      <svg width={width} height={height} viewBox="0 0 2078 1008" fill="none" className="shrink-0">
        <defs>
          <linearGradient id={`xGrad-detail-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND.pink} />
            <stop offset="100%" stopColor={BRAND.pinkLight} />
          </linearGradient>
        </defs>
        <rect fill={BRAND.green} y="778" width="215" height="230" rx="30" />
        <text x="107" y="920" textAnchor="middle" fill="white" fontSize="110" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">AI</text>
        <path fill="currentColor" d="M487,0H0V216H487c84,0,152,68,152,152s-68,152-152,152H0V736H487c203,0,368-165,368-368S690,0,487,0Z" />
        <polygon fill="currentColor" points="1656 586 1497 746 1383 631 1337 586 1383 540 1497 426 1656 586" />
        <polygon fill="currentColor" points="2078 1008 1759 1008 1542 791 1702 631 2078 1008" />
        <polygon fill="currentColor" points="2020 222 1702 540 1542 381 1701 222 2020 222" />
        <polygon fill={`url(#xGrad-detail-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// MODULE ACCORDION COMPONENT
// ============================================
interface ModuleAccordionProps {
  module: Module;
  moduleIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onLessonClick: (lesson: Lesson) => void;
  isNL: boolean;
  completedLessons?: string[];
}

const ModuleAccordion = ({ 
  module, 
  moduleIndex, 
  isExpanded, 
  onToggle, 
  onLessonClick,
  isNL,
  completedLessons = []
}: ModuleAccordionProps) => {
  const lessonsCount = module.lessons.length;
  const completedCount = module.lessons.filter(l => completedLessons.includes(l.id)).length;
  const totalDuration = module.lessons.reduce((acc, l) => {
    const parts = l.duration.split(':');
    return acc + (parseInt(parts[0]) || 0);
  }, 0);

  return (
    <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 overflow-hidden mb-3 hover:ring-purple-200 dark:hover:ring-purple-800 transition-all">
      {/* Module Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
              boxShadow: `0 4px 14px ${BRAND.purple}40`
            }}
          >
            {moduleIndex + 1}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 dark:text-white">{module.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lessonsCount} {isNL ? 'lessen' : 'lessons'} • {totalDuration} min
              {completedCount > 0 && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  • {completedCount}/{lessonsCount} {isNL ? 'voltooid' : 'completed'}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {completedCount === lessonsCount && lessonsCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Lessons List */}
      {isExpanded && (
        <div className="px-5 pb-4 border-t border-purple-50 dark:border-purple-900/30">
          <div className="pt-3 space-y-1">
            {module.lessons.map((lesson, lessonIndex) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isPreview = lessonIndex < 2; // First 2 lessons are preview

              return (
                <button
                  key={lesson.id}
                  onClick={() => onLessonClick(lesson)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group text-left"
                >
                  {/* Lesson Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      getLessonIcon(lesson.type)
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${
                        isCompleted 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400'
                      }`}>
                        {lesson.title}
                      </span>
                      {isPreview && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs shrink-0">
                          Preview
                        </Badge>
                      )}
                      {lesson.type === 'quiz' && (
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs shrink-0">
                          Quiz
                        </Badge>
                      )}
                      {lesson.type === 'assignment' && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs shrink-0">
                          Opdracht
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">
                    {lesson.duration}
                  </span>

                  {/* Lock/Play Icon */}
                  <div className="w-6 flex justify-center shrink-0">
                    {isPreview ? (
                      <Play className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================
// IMPROVED PREVIEW MODAL COMPONENT
// ============================================
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  courseTitle: string;
}

const PreviewModal = ({ isOpen, onClose, lesson, courseTitle }: PreviewModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lesson) return null;

  // Methodologies data
  const methodologies = [
    { 
      emoji: '🌊', 
      name: 'Waterfall', 
      subtitle: 'Traditioneel', 
      description: 'Sequentieel: fasen volgen elkaar lineair op - Veel upfront planning en documentatie - Ideaal voor: stabiele requirements, gereguleerde omgevingen, bouw', 
      tags: ['Stabiele requirements', 'Gereguleerde omgevingen'], 
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      emoji: '⚡', 
      name: 'Agile', 
      subtitle: 'Iteratief', 
      description: 'Iteratief en incrementeel - Flexibel, omarmt verandering - Frequente oplevering van werkende producten - Ideaal voor: software development, veranderende requirements', 
      tags: ['Software development', 'Veranderende requirements'], 
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      emoji: '🎯', 
      name: 'Scrum', 
      subtitle: 'Agile Framework', 
      description: 'Specifiek Agile framework - Vaste rollen (Product Owner, Scrum Master, Team) - Sprints van 1-4 weken - Ideaal voor: productontwikkeling, innovatie', 
      tags: ['Productontwikkeling', 'Innovatie'], 
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      emoji: '📊', 
      name: 'Kanban', 
      subtitle: 'Flow-based', 
      description: 'Focus op flow en visualisatie - WIP-limieten (Work In Progress) - Continue flow in plaats van sprints - Ideaal voor: operations, support, maintenance', 
      tags: ['Operations', 'Support', 'Maintenance'], 
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      emoji: '👑', 
      name: 'PRINCE2', 
      subtitle: 'Procesgebaseerd', 
      description: 'Procesgebaseerde methodologie uit het VK - Duidelijke rollen en verantwoordelijkheden - Stage-gates voor beslismomenten - Ideaal voor: overheid, governance-focus', 
      tags: ['Overheid', 'Governance-focus'], 
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      emoji: '📈', 
      name: 'Lean Six Sigma', 
      subtitle: 'Procesverbetering', 
      description: 'Focus op procesverbetering - DMAIC cyclus (Define, Measure, Analyze, Improve, Control) - Data-gedreven besluitvorming - Ideaal voor: procesoptimalisatie, kwaliteit', 
      tags: ['Procesoptimalisatie', 'Kwaliteit'], 
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const isMethodologyLesson = lesson.title?.toLowerCase().includes('methodologie');
  const keyTakeaways = lesson.keyTakeaways || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        {/* Header met gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-sm font-medium mb-1">{courseTitle}</p>
              <h2 className="text-white text-2xl font-bold">{lesson.title}</h2>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {lesson.duration}
                </Badge>
                {lesson.type === 'quiz' && (
                  <Badge className="bg-orange-400 text-white border-0">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Quiz
                  </Badge>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📝 Overview
            </button>
            {lesson.transcript && (
              <button
                onClick={() => setActiveTab('transcript')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'transcript'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Transcript
              </button>
            )}
            {keyTakeaways.length > 0 && (
              <button
                onClick={() => setActiveTab('takeaways')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'takeaways'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                ✨ Key Takeaways
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayCircle className="h-16 w-16 mx-auto mb-3 opacity-80" />
                  <p className="text-lg font-medium">Preview Video</p>
                  <p className="text-sm opacity-70">{lesson.duration}</p>
                </div>
              </div>

              {/* Intro */}
              {lesson.transcript && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-5">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {lesson.transcript.split('\n\n')[0]}
                  </p>
                </div>
              )}

              {/* Methodologies Cards (alleen voor methodologie lessen) */}
              {isMethodologyLesson && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    🎯 De Belangrijkste Methodologieën
                  </h3>
                  
                  <div className="space-y-3">
                    {methodologies.map((method, i) => (
                      <div 
                        key={i}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`bg-gradient-to-br ${method.gradient} rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform`}>
                            <span className="text-2xl">{method.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                {i + 1}. {method.name}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({method.subtitle})
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {method.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {method.tags.map((tag, j) => (
                                <span 
                                  key={j}
                                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Framework (alleen voor methodologie lessen) */}
              {isMethodologyLesson && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <span>🤔</span> Welke Methodologie Kiezen?
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">1</span>
                      </div>
                      <p><strong>Projecttype en industrie</strong> - Wat voor soort project is het?</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">2</span>
                      </div>
                      <p><strong>Requirements stabiliteit</strong> - Hoe zeker zijn de requirements?</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">3</span>
                      </div>
                      <p><strong>Organisatiecultuur</strong> - Past het bij je organisatie?</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">4</span>
                      </div>
                      <p><strong>Team ervaring</strong> - Heeft het team de juiste skills?</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">5</span>
                      </div>
                      <p><strong>Regelgeving en compliance</strong> - Zijn er wettelijke eisen?</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && lesson.transcript && (
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {lesson.transcript.split('\n\n').map((paragraph, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Takeaways Tab */}
          {activeTab === 'takeaways' && keyTakeaways.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Belangrijkste Punten
              </h3>
              {keyTakeaways.map((takeaway, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
                    {takeaway}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Sluiten
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Start Les
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isNL = language === 'nl';

  const [expandedModules, setExpandedModules] = useState<string[]>(['0']);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get course data by ID
  const course = useMemo(() => {
    if (!id) return null;
    
    // Try getCourseById first
    const foundCourse = getCourseById(id);
    if (foundCourse) return foundCourse;
    
    // Try numeric ID (legacy support)
    const numId = parseInt(id);
    if (!isNaN(numId) && numId > 0 && numId <= academyCourses.length) {
      return academyCourses[numId - 1];
    }
    
    // Default to first course
    return academyCourses[0];
  }, [id]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!course) return { modules: 0, lessons: 0, duration: 0 };
    
    const modules = course.modules.length;
    const lessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const duration = course.modules.reduce((acc, m) => {
      return acc + m.lessons.reduce((lacc, l) => {
        const parts = l.duration.split(':');
        return lacc + (parseInt(parts[0]) || 0);
      }, 0);
    }, 0);

    return { modules, lessons, duration: Math.round(duration / 60) };
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isNL ? 'Cursus niet gevonden' : 'Course not found'}
          </h2>
          <Button onClick={() => navigate('/academy/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isNL ? 'Terug naar Academy' : 'Back to Academy'}
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[course.icon] || Target;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    toast({
      title: isNL ? "Ingeschreven!" : "Enrolled!",
      description: isNL ? "Je kunt nu beginnen met de cursus" : "You can now start the course",
    });
  };

  const handleStartCourse = () => {
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      navigate(`/academy/course/${course.id}/learn/${course.modules[0].lessons[0].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/academy/marketplace')} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">{isNL ? 'Terug naar cursussen' : 'Back to courses'}</span>
            </button>
            <ProjeXtPalLogo size="sm" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="p-3 rounded-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${course.color}20, ${course.color}10)`,
                  }}
                >
                  <IconComponent className="h-6 w-6" style={{ color: course.color }} />
                </div>
                <div className="flex gap-2">
                  {course.bestseller && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      <Trophy className="h-3 w-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                  {course.featured && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {course.subtitle}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-900 dark:text-white">{course.rating}</span>
                  <span className="text-gray-500">({course.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} {isNL ? 'studenten' : 'students'}</span>
                </div>
                <Badge variant="outline" className="text-gray-600">
                  {course.difficulty}
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {course.language}
                </Badge>
              </div>
            </div>

            {/* What You'll Learn */}
            <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {isNL ? 'Wat je leert' : 'What you\'ll learn'}
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isNL ? 'Cursusinhoud' : 'Course Content'}
                </h2>
                <span className="text-sm text-gray-500">
                  {totals.modules} {isNL ? 'modules' : 'modules'} • {totals.lessons} {isNL ? 'lessen' : 'lessons'} • {totals.duration} {isNL ? 'uur totaal' : 'hours total'}
                </span>
              </div>

              {/* Module Accordions */}
              {course.modules.map((module, index) => (
                <ModuleAccordion
                  key={module.id}
                  module={module}
                  moduleIndex={index}
                  isExpanded={expandedModules.includes(index.toString())}
                  onToggle={() => toggleModule(index.toString())}
                  onLessonClick={handleLessonClick}
                  isNL={isNL}
                />
              ))}
            </div>

            {/* Requirements */}
            <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {isNL ? 'Vereisten' : 'Requirements'}
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {isNL ? 'Voor wie is deze cursus?' : 'Who is this course for?'}
                </h2>
                <ul className="space-y-2">
                  {course.targetAudience.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Users className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {isNL ? 'Je Instructor' : 'Your Instructor'}
                </h2>
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  >
                    {course.instructor.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{course.instructor.name}</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">{course.instructor.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{course.instructor.bio}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {course.instructor.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.instructor.students.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.instructor.courses} {isNL ? 'cursussen' : 'courses'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 overflow-hidden">
                {/* Preview Image */}
                <div 
                  className="aspect-video flex items-center justify-center cursor-pointer group"
                  style={{ background: course.gradient }}
                  onClick={() => course.modules[0]?.lessons[0] && handleLessonClick(course.modules[0].lessons[0])}
                >
                  <div className="text-center text-white">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <span className="font-medium">Preview</span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold" style={{ color: BRAND.green }}>
                        {course.freeForCustomers ? (isNL ? 'Gratis' : 'Free') : `€${course.price}`}
                      </span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">€{course.originalPrice}</span>
                      )}
                    </div>
                    {course.freeForCustomers && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                        <Gift className="h-4 w-4" />
                        {isNL ? 'Inbegrepen in je abonnement' : 'Included in your subscription'}
                      </p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  {isEnrolled ? (
                    <Button 
                      onClick={handleStartCourse}
                      className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {isNL ? 'Start Cursus' : 'Start Course'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isNL ? 'Start Cursus' : 'Start Course'}
                    </Button>
                  )}

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsSaved(!isSaved)}
                      className="flex-1 rounded-xl border-purple-200 hover:bg-purple-50"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      {isNL ? 'Bewaren' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-purple-200 hover:bg-purple-50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {isNL ? 'Delen' : 'Share'}
                    </Button>
                  </div>

                  {/* Course Includes */}
                  <div className="space-y-3 pt-4 border-t border-purple-100 dark:border-purple-900/30">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {isNL ? 'Deze cursus bevat:' : 'This course includes:'}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>{totals.duration} {isNL ? 'uur totaal' : 'hours total'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span>{totals.lessons} {isNL ? 'lessen' : 'lessons'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Download className="h-4 w-4 text-purple-500" />
                        <span>{isNL ? 'Downloadbare resources' : 'Downloadable resources'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span>{isNL ? 'Levenslange toegang' : 'Lifetime access'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span>{isNL ? 'AI-ondersteuning' : 'AI support'}</span>
                      </div>
                      {course.certificate && (
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>{isNL ? 'Certificaat' : 'Certificate'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Training */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {isNL ? 'Training voor je team?' : 'Training for your team?'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {isNL ? 'Vraag een offerte aan voor groepstrainingen met korting.' : 'Request a quote for group training with discounts.'}
                        </p>
                        <Button variant="outline" size="sm" className="w-full rounded-lg border-purple-200 text-purple-600 hover:bg-purple-100">
                          {isNL ? 'Offerte Aanvragen' : 'Request Quote'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        lesson={previewLesson}
        courseTitle={course.title}
      />
    </div>
  );
};

export default CourseDetail;