import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, Settings, CheckCircle2, Circle, Lock, ChevronLeft,
  ChevronRight, BookOpen, Clock, Award, MessageSquare, Download,
  FileText, Menu, X, ChevronDown, ChevronUp, Loader2,
  ThumbsUp, ThumbsDown, Share2, Bookmark, RotateCcw, PlayCircle,
  List, Grid, Home, HelpCircle, Brain, Crown, Gift, Trophy,
  Sparkles, GraduationCap, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAcademyUser } from "@/hooks/useAcademyUser";

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
};

// ============================================
// LOGO COMPONENT
// ============================================
const ProjeXtPalLogo = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { width: 40, height: 16, text: 'text-base', gap: 'gap-1.5' },
    md: { width: 48, height: 20, text: 'text-lg', gap: 'gap-2' },
    lg: { width: 64, height: 26, text: 'text-xl', gap: 'gap-3' },
  };
  
  const { width, height, text, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      <svg width={width} height={height} viewBox="0 0 2078 1008" fill="none" className="shrink-0">
        <defs>
          <linearGradient id={`xGrad-player-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <polygon fill={`url(#xGrad-player-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// COURSE DATA INTERFACE
// ============================================
interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  type?: 'video' | 'quiz' | 'assignment' | 'exam' | 'certificate';
  resources?: { name: string; type: string; size: string; url?: string }[];
  transcript?: string;
  keyTakeaways?: string[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  icon: any;
  color: string;
  gradient: string;
  modules: Module[];
  totalLessons: number;
  totalDuration: string;
}

// ============================================
// IMPROVED LESSON CONTENT MODAL
// ============================================
interface LessonContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  courseTitle: string;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  hasPrevLesson?: boolean;
}

const LessonContentModal = ({ 
  isOpen, 
  onClose, 
  lesson, 
  courseTitle,
  onPrevLesson,
  onNextLesson,
  hasNextLesson = false,
  hasPrevLesson = false
}: LessonContentModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');

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
              <p className="text-purple-100 text-sm font-medium mb-1 flex items-center gap-2">
                <Play className="w-3 h-3" />
                {courseTitle}
              </p>
              <h2 className="text-white text-2xl font-bold">{lesson.title}</h2>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <FileText className="w-3 h-3 mr-1" />
                  Transcript
                </Badge>
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
              📝 Overzicht
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
              {/* Intro */}
              {lesson.transcript && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-5">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {lesson.transcript.split('\n\n')[0]}
                  </p>
                </div>
              )}

              {/* Methodologies Cards */}
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

              {/* Decision Framework */}
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

        {/* Footer with Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Vorige les
            </Button>
            <Button 
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Sluiten
            </Button>
            <Button 
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Volgende les
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MOCK COURSE DATA
// ============================================
const getCourseData = (id: string, isNL: boolean): CourseData => {
  return {
    id,
    title: 'Project Management Fundamentals',
    icon: Target,
    color: BRAND.purple,
    gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})`,
    totalLessons: 24,
    totalDuration: '12',
    modules: [
      {
        id: 'm1',
        title: isNL ? 'Module 1: Introductie Project Management' : 'Module 1: Introduction to Project Management',
        lessons: [
          { 
            id: 'l1', 
            title: isNL ? 'Wat is een project?' : 'What is a project?', 
            duration: '8:32', 
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            transcript: isNL ? 'In deze les bespreken we wat een project precies is. Een project is een tijdelijke onderneming met een duidelijk begin en einde, gericht op het bereiken van een specifiek doel.' : 'In this lesson we discuss what exactly a project is. A project is a temporary endeavor with a clear beginning and end, aimed at achieving a specific goal.',
            resources: [
              { name: isNL ? 'Les 1 Slides' : 'Lesson 1 Slides', type: 'PDF', size: '1.2 MB' },
              { name: isNL ? 'Project Definitie Checklist' : 'Project Definition Checklist', type: 'PDF', size: '245 KB' },
            ]
          },
          { 
            id: 'l2', 
            title: isNL ? 'De rol van de projectmanager' : 'The role of the project manager', 
            duration: '12:15', 
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            transcript: isNL ? 'De projectmanager is verantwoordelijk voor het plannen, uitvoeren en afsluiten van projecten.' : 'The project manager is responsible for planning, executing and closing projects.',
          },
          { 
            id: 'l3', 
            title: isNL ? 'Projectmanagement methodologieën' : 'Project management methodologies', 
            duration: '15:45', 
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            transcript: `Een projectmanagement methodologie is een gestructureerde aanpak voor het managen van projecten. Er zijn veel verschillende methodologieën, elk met eigen sterke punten.

**De Belangrijkste Methodologieën**

**1. Waterfall (Traditioneel)** - Sequentieel: fasen volgen elkaar lineair op - Veel upfront planning en documentatie - Ideaal voor: stabiele requirements, gereguleerde omgevingen, bouw

**2. Agile** - Iteratief en incrementeel - Flexibel, omarmt verandering - Frequente oplevering van werkende producten - Ideaal voor: software development, veranderende requirements

**3. Scrum** - Specifiek Agile framework - Vaste rollen (Product Owner, Scrum Master, Team) - Sprints van 1-4 weken - Ideaal voor: productontwikkeling, innovatie

**4. Kanban** - Focus op flow en visualisatie - WIP-limieten (Work In Progress) - Continue flow in plaats van sprints - Ideaal voor: operations, support, maintenance

**5. PRINCE2** - Procesgebaseerde methodologie uit het VK - Duidelijke rollen en verantwoordelijkheden - Stage-gates voor beslismomenten - Ideaal voor: overheid, governance-focus

**6. Lean Six Sigma** - Focus op procesverbetering - DMAIC cyclus (Define, Measure, Analyze, Improve, Control) - Data-gedreven besluitvorming - Ideaal voor: procesoptimalisatie, kwaliteit

**Welke Methodologie Kiezen?**

Factoren om te overwegen: - Projecttype en industrie - Requirements stabiliteit - Organisatiecultuur - Team ervaring - Regelgeving en compliance`,
            keyTakeaways: [
              'Verschillende methodologieën zijn geschikt voor verschillende projecttypes',
              'Waterfall werkt goed voor stabiele, voorspelbare projecten',
              'Agile/Scrum zijn ideaal voor innovatieve, veranderende projecten',
              'De keuze hangt af van project, organisatie en team',
              'Hybride aanpakken combineren het beste van meerdere methodologieën'
            ]
          },
          { 
            id: 'l4', 
            title: isNL ? 'De projectlevenscyclus' : 'The project lifecycle', 
            duration: '10:20', 
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          },
          { 
            id: 'l5', 
            title: isNL ? 'Quiz: Basisconcepten' : 'Quiz: Basic concepts', 
            duration: '10:00', 
            type: 'quiz',
          },
        ],
      },
      {
        id: 'm2',
        title: isNL ? 'Module 2: Project Initiatie' : 'Module 2: Project Initiation',
        lessons: [
          { id: 'l6', title: isNL ? 'Het projectcharter opstellen' : 'Creating the project charter', duration: '14:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l7', title: isNL ? 'Stakeholder analyse' : 'Stakeholder analysis', duration: '11:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l8', title: isNL ? 'Business case ontwikkelen' : 'Developing the business case', duration: '13:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l9', title: isNL ? 'Scope definitie' : 'Scope definition', duration: '9:55', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l10', title: isNL ? 'Praktijkopdracht: Project Charter' : 'Practical assignment: Project Charter', duration: '30:00', type: 'assignment' },
        ],
      },
      {
        id: 'm3',
        title: isNL ? 'Module 3: Planning' : 'Module 3: Planning',
        lessons: [
          { id: 'l11', title: isNL ? 'Work Breakdown Structure (WBS)' : 'Work Breakdown Structure (WBS)', duration: '16:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l12', title: isNL ? 'Gantt charts maken' : 'Creating Gantt charts', duration: '18:25', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l13', title: isNL ? 'Resource planning' : 'Resource planning', duration: '12:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l14', title: isNL ? 'Budget en kostenraming' : 'Budget and cost estimation', duration: '14:50', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l15', title: isNL ? 'Risicomanagement' : 'Risk management', duration: '20:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        id: 'm4',
        title: isNL ? 'Module 4: Uitvoering & Monitoring' : 'Module 4: Execution & Monitoring',
        lessons: [
          { id: 'l16', title: isNL ? 'Team management' : 'Team management', duration: '15:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l17', title: isNL ? 'Communicatie en rapportage' : 'Communication and reporting', duration: '11:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l18', title: isNL ? 'Voortgang bewaken' : 'Monitoring progress', duration: '13:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l19', title: isNL ? 'Change management' : 'Change management', duration: '10:55', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        id: 'm5',
        title: isNL ? 'Module 5: Afsluiting' : 'Module 5: Closure',
        lessons: [
          { id: 'l20', title: isNL ? 'Project afsluiten' : 'Closing the project', duration: '12:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l21', title: isNL ? 'Lessons learned' : 'Lessons learned', duration: '8:40', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l22', title: isNL ? 'Eindrapportage' : 'Final reporting', duration: '10:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l23', title: isNL ? 'Finale examen' : 'Final exam', duration: '45:00', type: 'quiz' },
          { id: 'l24', title: isNL ? 'Certificaat' : 'Certificate', duration: '2:00', type: 'certificate' },
        ],
      },
    ],
  };
};

// ============================================
// MAIN COMPONENT
// ============================================
const CourseLearningPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // Use the academy user hook
  const { 
    user, 
    loading,
    completeLesson,
    isLessonCompleted: checkLessonCompleted,
    getCourseProgress,
    saveNotes: saveUserNotes,
    getNotes: getUserNotes,
    isSuperuser,
  } = useAcademyUser();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [notes, setNotes] = useState('');
  const [question, setQuestion] = useState('');
  const [currentLessonId, setCurrentLessonId] = useState<string>('l1');
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  const isNL = language === 'nl';
  const course = getCourseData(id || '1', isNL);
  
  // Get all lessons flat
  const allLessons = course.modules.flatMap(m => m.lessons);
  
  // Initialize lesson from URL param
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam && allLessons.some(l => l.id === lessonParam)) {
      setCurrentLessonId(lessonParam);
    }
  }, [searchParams]);
  
  // Find current lesson
  const currentLesson = allLessons.find(l => l.id === currentLessonId) || allLessons[0];
  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const currentModuleIndex = course.modules.findIndex(m => m.lessons.some(l => l.id === currentLessonId));
  const currentModule = course.modules[currentModuleIndex];
  
  // Get progress from hook
  const progress = getCourseProgress(course.id);
  const completedCount = Math.round((progress / 100) * allLessons.length);
  
  // Check if lesson is completed using hook
  const isLessonCompleted = (lessonId: string) => checkLessonCompleted(course.id, lessonId);
  
  // Check if module is completed
  const isModuleCompleted = (moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return false;
    return module.lessons.every(l => isLessonCompleted(l.id));
  };

  const content = {
    tabs: {
      content: isNL ? 'Inhoud' : 'Content',
      notes: isNL ? 'Notities' : 'Notes',
      resources: isNL ? 'Resources' : 'Resources',
      qa: isNL ? 'Vragen' : 'Q&A',
    },
    labels: {
      courseContent: isNL ? 'Cursusinhoud' : 'Course Content',
      yourProgress: isNL ? 'Jouw Voortgang' : 'Your Progress',
      completed: isNL ? 'voltooid' : 'completed',
      markComplete: isNL ? 'Markeer als voltooid' : 'Mark as complete',
      markedComplete: isNL ? 'Voltooid ✓' : 'Completed ✓',
      nextLesson: isNL ? 'Volgende Les' : 'Next Lesson',
      prevLesson: isNL ? 'Vorige Les' : 'Previous Lesson',
      askAI: isNL ? 'Vraag aan AI' : 'Ask AI',
      saveNotes: isNL ? 'Notities Opslaan' : 'Save Notes',
      notesPlaceholder: isNL ? 'Schrijf hier je notities...' : 'Write your notes here...',
      questionPlaceholder: isNL ? 'Stel een vraag over deze les...' : 'Ask a question about this lesson...',
      downloadResources: isNL ? 'Download Materiaal' : 'Download Resources',
      transcript: isNL ? 'Transcript' : 'Transcript',
      viewTranscript: isNL ? 'Bekijk Transcript' : 'View Transcript',
      certificate: isNL ? 'Download Certificaat' : 'Download Certificate',
      backToCourse: isNL ? 'Terug naar Cursus' : 'Back to Course',
      congratulations: isNL ? 'Gefeliciteerd!' : 'Congratulations!',
      lessonCompleted: isNL ? 'Les voltooid!' : 'Lesson completed!',
      courseCompleted: isNL ? 'Cursus voltooid!' : 'Course completed!',
      getCertificate: isNL ? 'Download Certificaat' : 'Get Certificate',
      continueToNext: isNL ? 'Naar volgende les' : 'Continue to next lesson',
      quiz: 'Quiz',
      assignment: isNL ? 'Opdracht' : 'Assignment',
      exam: isNL ? 'Examen' : 'Exam',
    },
    defaultResources: [
      { name: isNL ? 'Presentatie Slides' : 'Presentation Slides', type: 'PDF', size: '2.4 MB' },
      { name: isNL ? 'Werkblad Template' : 'Worksheet Template', type: 'XLSX', size: '156 KB' },
      { name: isNL ? 'Checklist' : 'Checklist', type: 'PDF', size: '89 KB' },
    ],
  };

  // Load saved notes for this lesson
  useEffect(() => {
    const savedNotes = getUserNotes(course.id, currentLessonId);
    setNotes(savedNotes);
  }, [currentLessonId, course.id]);

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);
  const handleEnded = () => {
    setIsPlaying(false);
    if (!isLessonCompleted(currentLessonId)) {
      setCompletionDialogOpen(true);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return;
    
    try {
      if (!isFullscreen) {
        await playerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mark lesson as complete
  const markAsComplete = () => {
    const newProgress = completeLesson(course.id, currentLessonId, allLessons.length);
    
    toast({
      title: content.labels.lessonCompleted,
      description: isNL ? 'Je voortgang is opgeslagen.' : 'Your progress has been saved.',
    });
    
    // Check if course is complete
    if (newProgress === 100) {
      setCertificateDialogOpen(true);
    } else {
      setCompletionDialogOpen(true);
    }
  };

  // Navigate to lesson
  const goToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    // Update URL
    navigate(`/academy/course/${course.id}/learn?lesson=${lessonId}`, { replace: true });
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      goToLesson(allLessons[currentLessonIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      goToLesson(allLessons[currentLessonIndex - 1].id);
    }
  };

  // Save notes
  const handleSaveNotes = () => {
    saveUserNotes(course.id, currentLessonId, notes);
    toast({
      title: isNL ? 'Notities opgeslagen' : 'Notes saved',
      description: isNL ? 'Je notities zijn opgeslagen.' : 'Your notes have been saved.',
    });
  };

  // Ask AI
  const askAI = () => {
    if (question.trim()) {
      toast({
        title: isNL ? 'AI Assistent' : 'AI Assistant',
        description: isNL ? 'Je vraag wordt verwerkt...' : 'Processing your question...',
      });
      setQuestion('');
    }
  };

  // Control visibility
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in - redirect
  if (!user?.isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/academy/course/${id}`)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {content.labels.backToCourse}
          </Button>
          <div className="hidden md:block">
            <ProjeXtPalLogo size="sm" />
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium truncate">{course.title}</span>
            <Badge variant="outline" className="shrink-0">
              {completedCount}/{allLessons.length} {content.labels.completed}
            </Badge>
          </div>
          <Progress value={progress} className="h-1.5 mt-1" />
        </div>

        <div className="flex items-center gap-2">
          {isSuperuser && (
            <Badge className="bg-red-500 text-white border-0">
              <Crown className="w-3 h-3 mr-1" /> Admin
            </Badge>
          )}
          {user?.hasSubscription && !isSuperuser && (
            <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:mr-96' : ''}`}>
          {/* Video Container */}
          <div 
            ref={playerContainerRef}
            className="relative bg-black aspect-video w-full group"
            onMouseEnter={() => setShowControls(true)}
          >
            {/* Video Element */}
            {currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                className="w-full h-full"
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={handleWaiting}
                onCanPlay={handleCanPlay}
                onEnded={handleEnded}
                onClick={togglePlay}
              />
            ) : (
              // Placeholder for quiz/assignment/certificate
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center text-white">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: course.gradient }}
                  >
                    {currentLesson.type === 'quiz' && <HelpCircle className="w-12 h-12" />}
                    {currentLesson.type === 'assignment' && <FileText className="w-12 h-12" />}
                    {currentLesson.type === 'certificate' && <Award className="w-12 h-12" />}
                    {!currentLesson.type && <Play className="w-12 h-12 ml-1" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{currentLesson.title}</h3>
                  {currentLesson.type === 'quiz' && (
                    <Button className="mt-4 text-white" style={{ background: course.gradient }}>
                      {isNL ? 'Start Quiz' : 'Start Quiz'}
                    </Button>
                  )}
                  {currentLesson.type === 'assignment' && (
                    <Button className="mt-4 text-white" style={{ background: course.gradient }}>
                      {isNL ? 'Bekijk Opdracht' : 'View Assignment'}
                    </Button>
                  )}
                  {currentLesson.type === 'certificate' && progress === 100 && (
                    <Button className="mt-4 text-white" style={{ background: course.gradient }}>
                      <Award className="w-4 h-4 mr-2" />
                      {content.labels.certificate}
                    </Button>
                  )}
                  {currentLesson.type === 'certificate' && progress < 100 && (
                    <p className="text-white/70 mt-4">
                      {isNL 
                        ? `Voltooi alle lessen om je certificaat te ontvangen (${progress}% voltooid)`
                        : `Complete all lessons to receive your certificate (${progress}% completed)`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}

            {/* Video Controls Overlay */}
            {currentLesson.videoUrl && (
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Progress Bar */}
                <div className="mb-3">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20" 
                      onClick={goToPrevLesson}
                      disabled={currentLessonIndex === 0}
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20 w-12 h-12" 
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20" 
                      onClick={goToNextLesson}
                      disabled={currentLessonIndex === allLessons.length - 1}
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex items-center gap-2 ml-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <div className="w-24 hidden sm:block">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                        />
                      </div>
                    </div>

                    <span className="text-white text-sm ml-4">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select 
                      value={playbackSpeed}
                      onChange={(e) => changePlaybackSpeed(Number(e.target.value))}
                      className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1 cursor-pointer"
                    >
                      <option value={0.5} className="text-black">0.5x</option>
                      <option value={0.75} className="text-black">0.75x</option>
                      <option value={1} className="text-black">1x</option>
                      <option value={1.25} className="text-black">1.25x</option>
                      <option value={1.5} className="text-black">1.5x</option>
                      <option value={2} className="text-black">2x</option>
                    </select>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Center Play Button (when paused) */}
            {!isPlaying && currentLesson.videoUrl && !isBuffering && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Below Video Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl">
              {/* Lesson Title & Actions */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isLessonCompleted(currentLessonId) && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {isNL ? 'Voltooid' : 'Completed'}
                      </Badge>
                    )}
                    {currentLesson.type === 'quiz' && <Badge variant="outline">{content.labels.quiz}</Badge>}
                    {currentLesson.type === 'assignment' && <Badge variant="outline">{content.labels.assignment}</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-muted-foreground">
                    {currentModule?.title} • {isNL ? 'Les' : 'Lesson'} {course.modules[currentModuleIndex]?.lessons.findIndex(l => l.id === currentLessonId) + 1}
                  </p>
                </div>
                <div className="flex gap-2">
                  {currentLesson.transcript && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTranscriptModalOpen(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {content.labels.viewTranscript}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {isNL ? 'Opslaan' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    {isNL ? 'Delen' : 'Share'}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="content">{content.tabs.content}</TabsTrigger>
                  <TabsTrigger value="notes">{content.tabs.notes}</TabsTrigger>
                  <TabsTrigger value="resources">{content.tabs.resources}</TabsTrigger>
                  <TabsTrigger value="qa">{content.tabs.qa}</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>{isNL ? 'Over deze les' : 'About this lesson'}</h3>
                    <p>
                      {currentLesson.transcript?.split('\n\n')[0] || (isNL 
                        ? 'In deze les leer je belangrijke concepten die direct toepasbaar zijn in je projecten.'
                        : 'In this lesson you will learn important concepts that are directly applicable to your projects.')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {isLessonCompleted(currentLessonId) ? (
                      <Button 
                        variant="outline"
                        disabled
                        className="text-green-600 border-green-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {content.labels.markedComplete}
                      </Button>
                    ) : (
                      <Button 
                        onClick={markAsComplete}
                        className="text-white"
                        style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})` }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {content.labels.markComplete}
                      </Button>
                    )}
                    {currentLessonIndex < allLessons.length - 1 && (
                      <Button variant="outline" onClick={goToNextLesson}>
                        {content.labels.nextLesson}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Textarea 
                    placeholder={content.labels.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button 
                    onClick={handleSaveNotes}
                    className="text-white"
                    style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  >
                    {content.labels.saveNotes}
                  </Button>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  {(currentLesson.resources || content.defaultResources).map((resource, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <FileText className="w-5 h-5" style={{ color: BRAND.purple }} />
                          </div>
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-muted-foreground">{resource.type} • {resource.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="qa" className="space-y-4">
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND.purple}15` }}>
                          <Brain className="w-5 h-5" style={{ color: BRAND.purple }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{isNL ? 'AI Assistent' : 'AI Assistant'}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {isNL ? 'Stel een vraag over deze les en ontvang direct antwoord.' : 'Ask a question about this lesson and get an instant answer.'}
                          </p>
                          <div className="flex gap-2">
                            <Textarea 
                              placeholder={content.labels.questionPlaceholder}
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              className="flex-1 min-h-[80px]"
                            />
                          </div>
                          <Button 
                            onClick={askAI}
                            className="text-white mt-3"
                            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                            disabled={!question.trim()}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            {content.labels.askAI}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isNL ? 'Nog geen vragen. Stel je eerste vraag!' : 'No questions yet. Ask your first question!'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {sidebarOpen && (
          <aside className="hidden lg:block fixed right-0 top-14 bottom-0 w-96 bg-card border-l border-border overflow-hidden z-40">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold">{content.labels.courseContent}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progress} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-130px)]">
              <div className="p-2">
                <Accordion type="multiple" defaultValue={[`module-${currentModuleIndex}`]} className="space-y-1">
                  {course.modules.map((module, mIndex) => (
                    <AccordionItem key={module.id} value={`module-${mIndex}`} className="border rounded-lg px-2">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 text-left">
                          <div 
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isModuleCompleted(module.id)
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isModuleCompleted(module.id) ? <CheckCircle2 className="w-4 h-4" /> : mIndex + 1}
                          </div>
                          <span className="font-medium text-sm">{module.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pb-2">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => goToLesson(lesson.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left text-sm transition-colors ${
                                lesson.id === currentLessonId 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className="shrink-0">
                                {isLessonCompleted(lesson.id) ? (
                                  <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
                                ) : lesson.id === currentLessonId ? (
                                  <PlayCircle className="w-4 h-4" style={{ color: BRAND.purple }} />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`truncate ${lesson.id === currentLessonId ? 'font-medium' : ''}`}>
                                  {lesson.title}
                                </p>
                                {(lesson.type === 'quiz' || lesson.type === 'assignment') && (
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.type === 'quiz' && 'Quiz'}
                                    {lesson.type === 'assignment' && (isNL ? 'Opdracht' : 'Assignment')}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {lesson.duration}
                              </span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>

      {/* Transcript Modal */}
      <LessonContentModal
        isOpen={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        lesson={currentLesson}
        courseTitle={course.title}
        onPrevLesson={currentLessonIndex > 0 ? goToPrevLesson : undefined}
        onNextLesson={currentLessonIndex < allLessons.length - 1 ? goToNextLesson : undefined}
        hasNextLesson={currentLessonIndex < allLessons.length - 1}
        hasPrevLesson={currentLessonIndex > 0}
      />

      {/* Lesson Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: BRAND.green }} />
              {content.labels.congratulations}
            </DialogTitle>
            <DialogDescription>
              {content.labels.lessonCompleted}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})` }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground">
              {isNL 
                ? `Je hebt ${completedCount + 1} van ${allLessons.length} lessen voltooid!`
                : `You have completed ${completedCount + 1} of ${allLessons.length} lessons!`}
            </p>
            <Progress value={Math.round(((completedCount + 1) / allLessons.length) * 100)} className="mt-4" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>
              {isNL ? 'Sluiten' : 'Close'}
            </Button>
            {currentLessonIndex < allLessons.length - 1 && (
              <Button 
                onClick={() => {
                  setCompletionDialogOpen(false);
                  goToNextLesson();
                }}
                className="text-white"
                style={{ background: course.gradient }}
              >
                {content.labels.continueToNext}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: BRAND.orange }} />
              {content.labels.courseCompleted}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.pink})` }}
            >
              <Award className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">{content.labels.congratulations}</h3>
            <p className="text-muted-foreground mb-4">
              {isNL 
                ? `Je hebt "${course.title}" succesvol afgerond!`
                : `You have successfully completed "${course.title}"!`}
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCertificateDialogOpen(false)}>
              {isNL ? 'Later' : 'Later'}
            </Button>
            <Button 
              className="text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.pink})` }}
            >
              <Download className="w-4 h-4 mr-2" />
              {content.labels.getCertificate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearningPlayer;