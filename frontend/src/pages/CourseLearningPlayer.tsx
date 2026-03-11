import React, { useState, useEffect, useRef, useMemo } from 'react';
import { visualService } from "@/services/visualService";
import QuizEngine from "@/components/academy/QuizEngine";
import AiCoachPanel from "@/components/academy/AiCoachPanel";
import { getCourseById, getModulesByCourseId } from "@/data/academy/courses";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, CheckCircle2, Circle, Lock, ChevronLeft,
  ChevronRight, BookOpen, Clock, Award, MessageSquare, Download,
  FileText, Menu, X, Loader2, PlayCircle,
  Brain, Crown, Trophy, Sparkles, GraduationCap, Target, Zap,
  Bot, User, Briefcase, FlaskConical, Share2, Bookmark, 
  ThumbsUp, ThumbsDown, Lightbulb, TrendingUp, TrendingDown, BarChart3, AlertCircle,
  Users, Calendar, Repeat, Rocket, FileCheck, Eye, Star,
  Medal, Flame, Check, XCircle, Save, Send, Sparkle, HelpCircle, CalendarDays, ListChecks, Code, Info , 
  RefreshCw, ArrowDown, DollarSign, CheckCircle, Layers, AlertTriangle, ClipboardCheck, Package, CheckSquare, 
  UserCheck, FolderCheck, ShieldCheck, ShoppingCart, Scale, Wrench, ShoppingBag, Search, Building2, Handshake, 
  ShieldAlert, ClipboardList, Wallet, CreditCard, PiggyBank, Minus, Triangle, GitCompare,Tag} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdownBlock } from "@/utils/markdownRenderer";
import { cn } from "@/lib/utils";
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

// 1. Import useSkills at the top
import { useSkills } from '@/hooks/useSkills';
import { SkillsTab } from '@/components/academy/SkillsTab';
import VisualTemplateRenderer from '@/components/visuals/VisualTemplateRenderer';

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
// INTERFACES
// ============================================
interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  type?: 'video' | 'quiz' | 'assignment' | 'reading' | 'exam' | 'certificate';
  resources?: { name: string; type: string; size: string; url?: string }[];
  transcript?: string;
  content?: string;
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

interface InteractiveSlide {
  id: string;
  title: string;
  content: string;
  visual?: 'diagram' | 'chart' | 'comparison' | 'list' | 'quote';
  question?: {
    text: string;
    options: string[];
    correct: number;
  };
}

// NEW: Score Tracking Interface
interface SimulationScore {
  scenarioId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timestamp: Date;
}

// NEW: Practice Work Interface
interface PracticeWork {
  lessonId: string;
  content: string;
  submittedAt: Date;
  aiFeedback?: string;
  score?: number;
}

// NEW: Achievement Interface
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

// ============================================
// API BASE URL
// ============================================
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

// ============================================
// HELPER FUNCTIONS
// ============================================
const getLessonGlobalIndex = (modules: Module[], lessonId: string): number => {
  let count = 0;
  for (const mod of modules) {
    for (const les of mod.lessons) {
      count++;
      if (les.id === lessonId) return count;
    }
  }
  return 0;
};

/**
 * Fetch course data from backend API.
 * Returns null if API is unavailable — caller should fall back to static data.
 */
const fetchCourseFromAPI = async (courseId: string, isNL: boolean): Promise<CourseData | null> => {
  try {
    const res = await fetch(`${API_BASE}/academy/courses/${courseId}/`);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.modules || data.modules.length === 0) return null;

    return {
      id: data.id,
      title: isNL && data.title_nl ? data.title_nl : data.title,
      icon: Target,
      color: data.color || BRAND.purple,
      gradient: data.gradient || `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})`,
      totalLessons: data.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0),
      totalDuration: String(data.duration_hours || 0),
      modules: data.modules.map((mod: any, mIdx: number) => ({
        id: String(mod.id),
        title: isNL && mod.title_nl ? `Module ${mIdx + 1}: ${mod.title_nl}` : `Module ${mIdx + 1}: ${mod.title}`,
        lessons: (mod.lessons || []).map((les: any) => ({
          id: String(les.id),
          title: isNL && les.title_nl ? les.title_nl : les.title,
          duration: les.duration_minutes ? `${les.duration_minutes}:00` : '10:00',
          type: les.lesson_type as any,
          transcript: isNL && les.content_nl ? les.content_nl : les.content,
          content: isNL && les.content_nl ? les.content_nl : les.content,
          keyTakeaways: [],
          videoUrl: les.video_url || undefined,
          // Visual template config from API
          visual_type: les.visual_type || 'auto',
          visual_data: les.visual_data || null,
        })),
      })),
    };
  } catch {
    return null;
  }
};

const getCourseData = (id: string, isNL: boolean): CourseData => {
  const staticCourse = getCourseById(id);
  const staticModules = getModulesByCourseId(id);

  if (staticCourse && staticModules.length > 0) {
    return {
      id,
      title: isNL && staticCourse.titleNL ? staticCourse.titleNL : staticCourse.title,
      icon: Target,
      gradient: staticCourse.gradient || `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})`,
      totalLessons: staticModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0),
      totalDuration: String(staticCourse.duration || 0),
      modules: staticModules.map((mod, mIdx) => ({
        id: mod.id,
        title: isNL && mod.titleNL ? `Module ${mIdx + 1}: ${mod.titleNL}` : `Module ${mIdx + 1}: ${mod.title}`,
        lessons: (mod.lessons || []).map(les => ({
          id: les.id,
          title: isNL && les.titleNL ? les.titleNL : les.title,
          duration: les.duration || '10:00',
          type: les.type as any,
          transcript: les.transcript,
          content: les.content,
          keyTakeaways: les.keyTakeaways,
          videoUrl: les.videoUrl || undefined,
          resources: les.type === 'video' ? [
            { name: isNL ? 'Presentatie Slides' : 'Presentation Slides', type: 'PDF', size: '2.4 MB' },
            { name: isNL ? 'Werkblad Template' : 'Worksheet Template', type: 'XLSX', size: '156 KB' },
          ] : undefined,
        })),
      })),
    };
  }

  return {
    id,
    title: 'Course',
    icon: Target,
    gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.purpleDark})`,
    totalLessons: 1,
    totalDuration: '1',
    modules: [{
      id: 'fallback-m1',
      title: isNL ? 'Module 1: Introductie' : 'Module 1: Introduction',
      lessons: [{
        id: 'fallback-l1',
        title: isNL ? 'Welkom' : 'Welcome',
        duration: '5:00',
      }],
    }],
  };
};

// IMPROVED: Generate interactive slides with smart titles
const generateInteractiveSlides = (lesson: Lesson, isNL: boolean): InteractiveSlide[] => {
  const slides: InteractiveSlide[] = [];
  
  // ALWAYS create at least a title slide
  slides.push({
    id: 'slide-0',
    title: lesson.title,
    content: lesson.content || (isNL ? `Welkom bij de les: **${lesson.title}**\n\nIn deze les leer je over dit onderwerp.` : `Welcome to: **${lesson.title}**\n\nIn this lesson you will learn about this topic.`),
    visual: 'default'
  });
  
  // If we have actual content, add more slides
  if (lesson.transcript || lesson.content) {
    const textToSplit = lesson.transcript || lesson.content || '';
    const paragraphs = textToSplit.split('\n\n').filter(p => p.trim().length > 50);
    
    paragraphs.forEach((para, i) => {
      // Extract smart title from first sentence
      const firstSentence = para.split(/[.!?]/)[0].trim();
      const slideTitle = firstSentence.length > 5 && firstSentence.length < 60 
        ? firstSentence 
        : `${isNL ? 'Onderdeel' : 'Part'} ${i + 1}`;
      
      slides.push({
        id: `slide-${i + 1}`,
        title: slideTitle,
        content: para,
        visual: i % 3 === 0 ? 'diagram' : i % 3 === 1 ? 'list' : 'comparison'
      });
    });
  } else {
    // NO content? Create placeholder slides based on lesson title
    const topicKeywords = lesson.title.toLowerCase();
    
    if (topicKeywords.includes('business case')) {
      slides.push({
        id: 'slide-1',
        title: isNL ? 'Wat is een Business Case?' : 'What is a Business Case?',
        content: isNL 
          ? 'Een **business case** is een document dat de waarde van een project rechtvaardigt.\n\nHet bevat:\n- Probleemstelling\n- Voorgestelde oplossing\n- Kosten en baten analyse\n- Risico\'s en alternatieven'
          : 'A **business case** is a document that justifies the value of a project.\n\nIt contains:\n- Problem statement\n- Proposed solution\n- Cost-benefit analysis\n- Risks and alternatives',
      });
      
      slides.push({
        id: 'slide-2',
        title: isNL ? 'Waarom een Business Case?' : 'Why a Business Case?',
        content: isNL
          ? 'Een business case helpt bij:\n\n- **Besluitvorming**: Geeft leiders info om go/no-go te beslissen\n- **Verwachtingen**: Stelt duidelijke doelen en verwachtingen\n- **Verantwoording**: Legitimeert het gebruik van resources'
          : 'A business case helps with:\n\n- **Decision making**: Gives leaders info to decide go/no-go\n- **Expectations**: Sets clear goals and expectations\n- **Accountability**: Legitimizes use of resources',
      });
      
      slides.push({
        id: 'slide-3',
        title: isNL ? 'Elementen van een Business Case' : 'Elements of a Business Case',
        content: isNL
          ? '**Executive Summary**: Korte samenvatting\n\n**Probleem**: Wat is het probleem?\n\n**Oplossing**: Hoe lossen we het op?\n\n**Kosten/Baten**: Wat kost het en wat levert het op?\n\n**Tijdlijn**: Wanneer doen we het?\n\n**Risico\'s**: Wat kan er misgaan?'
          : '**Executive Summary**: Brief overview\n\n**Problem**: What is the problem?\n\n**Solution**: How do we solve it?\n\n**Costs/Benefits**: What does it cost and what does it deliver?\n\n**Timeline**: When do we do it?\n\n**Risks**: What can go wrong?',
      });
    }
    
    // Generic fallback if no specific content
    if (slides.length === 1) {
      slides.push({
        id: 'slide-generic-1',
        title: isNL ? 'Hoofdpunten' : 'Key Points',
        content: isNL 
          ? `Over **${lesson.title}**:\n\nDit is een belangrijk onderwerp in projectmanagement.\n\nBestudeer de resources voor meer details.`
          : `About **${lesson.title}**:\n\nThis is an important project management topic.\n\nStudy the resources for more details.`,
      });
      
      slides.push({
        id: 'slide-generic-2',
        title: isNL ? 'Praktische Toepassing' : 'Practical Application',
        content: isNL 
          ? `**${lesson.title}** wordt gebruikt om:\n\n- Betere beslissingen te nemen\n- Risico\'s te verminderen\n- Succes te verhogen`
          : `**${lesson.title}** is used to:\n\n- Make better decisions\n- Reduce risks\n- Increase success`,
      });
    }
  }
  
  // Knowledge check question
  if (slides.length > 1) {
    slides.push({
      id: `slide-quiz`,
      title: isNL ? 'Check je begrip' : 'Check your understanding',
      content: isNL ? 'Test wat je geleerd hebt over dit onderwerp.' : 'Test what you learned about this topic.',
      visual: 'chart',
      question: {
        text: isNL 
          ? `Wat is het belangrijkste doel van ${lesson.title.toLowerCase()}?`
          : `What is the main purpose of ${lesson.title.toLowerCase()}?`,
        options: [
          isNL ? 'Project documenteren' : 'Document the project',
          isNL ? 'Besluitvorming ondersteunen' : 'Support decision making',
          isNL ? 'Team motiveren' : 'Motivate the team',
        ],
        correct: 1
      }
    });
  }
  
  // Summary slide
  if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
    slides.push({
      id: 'slide-summary',
      title: isNL ? '📝 Samenvatting' : '📝 Summary',
      content: lesson.keyTakeaways.join('\n\n'),
      visual: 'list'
    });
  }
  
  return slides;
};
// ============================================
// MAIN COMPONENT
// ============================================
const CourseLearningPlayer = () => {
  const navigate = useNavigate();
  const { slug, id: lessonIdParam } = useParams<{ slug: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { awardSkillPoints } = useSkills();
  
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
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');
  const [currentLessonId, setCurrentLessonId] = useState<string>('l1');
  const [contentSlide, setContentSlide] = useState(0);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  
  // Interactive content state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideAnswers, setSlideAnswers] = useState<Record<string, number>>({});
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);  
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('lifecycle');
  const [approvedVisualData, setApprovedVisualData] = useState<any>(null);

  
  // NEW: Store current scenario in state
  const [currentScenario, setCurrentScenario] = useState<{
    simulation: { title: string; description: string; options: string[]; correctAnswer: number };
    practice: { title: string; description: string; template: string };
  } | null>(null);

  // NEW FEATURES STATE
  // Feature 1: Score Tracking
  const [simulationScores, setSimulationScores] = useState<SimulationScore[]>([]);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [currentSimulationAnswer, setCurrentSimulationAnswer] = useState<number | null>(null);
  
  // Feature 2: Practice Work Storage
  const [practiceWork, setPracticeWork] = useState<PracticeWork[]>([]);
  const [currentPracticeContent, setCurrentPracticeContent] = useState(''); 

  // ============================================
  // VISUAL RENDERING — Unified in VisualTemplateRenderer
  // Old renderVisual + 25 keyword template functions removed.
  // All rendering now goes through contentSections → VisualTemplateRenderer.
  // ============================================
  const isNL = language === "nl";

  // Get course data
  const course = getCourseData(slug || '', isNL);

  // Get all lessons flat
  const allLessons = course.modules.flatMap(m => m.lessons);

  // Initialize lesson from URL param
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam && allLessons.some(l => l.id === lessonParam)) {
      setCurrentLessonId(lessonParam);
    }
  }, [searchParams]);

  // Reset slide index when lesson changes
  useEffect(() => {
    setContentSlide(0);
  }, [currentLessonId]);

  // Find current lesson
  const currentLesson = allLessons.find(l => l.id === currentLessonId) || allLessons[0];
  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const currentModuleIndex = course.modules.findIndex(m => m.lessons.some(l => l.id === currentLessonId));
  const currentModule = course.modules[currentModuleIndex];

// Legacy detectTopicType kept as stub for any remaining references
const detectTopicType = (text: string): 'project_def' | 'triple_constraint' | 'pm_role' | 'comparison' | 'lifecycle' | 'stakeholder' | 'risk' | 'generic' => {
  const lower = text.toLowerCase();
  
  if ((lower.includes('project') && (lower.includes('definitie') || lower.includes('definition'))) || 
      (lower.includes('tijdelijk') && lower.includes('uniek') && lower.includes('resultaat'))) {
    return 'project_def';
  }
  
  if (lower.includes('triple constraint') || 
      (lower.includes('tijd') && lower.includes('budget') && lower.includes('kwaliteit')) ||
      (lower.includes('time') && lower.includes('budget') && lower.includes('quality'))) {
    return 'triple_constraint';
  }
  
  if (lower.includes('projectmanager') || lower.includes('pm rol') || lower.includes('pm role') ||
      (lower.includes('verantwoordelijk') && lower.includes('plannen'))) {
    return 'pm_role';
  }
  
  if ((lower.includes('project') && lower.includes('operatie')) || 
      (lower.includes('project') && lower.includes('operation')) ||
      lower.includes('verschil tussen')) {
    return 'comparison';
  }
  
  if (lower.includes('lifecycle') || lower.includes('levenscyclus') || lower.includes('fasen')) {
    return 'lifecycle';
  }
  
  if (lower.includes('stakeholder') || lower.includes('belanghebbende')) {
    return 'stakeholder';
  }
  
  if (lower.includes('risico') || lower.includes('risk')) {
    return 'risk';
  }
  
  return 'generic';
};
const renderProjectDefinitionVisual = (content: string, isNL: boolean) => `
  <div class="space-y-6">
    <!-- Hero Statement -->
    <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl shadow-xl">
      <h3 class="text-2xl font-bold mb-2">${isNL ? '🎯 Een Project Heeft 3 DNA-eigenschappen' : '🎯 A Project Has 3 DNA Characteristics'}</h3>
      <p class="opacity-90">${isNL ? 'Zonder deze 3? Dan is het géén project!' : 'Without these 3? Then it\'s not a project!'}</p>
    </div>
    
    <!-- 3 Visual Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Tijdelijk -->
      <div class="group relative bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-2xl hover:scale-105 cursor-pointer">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"></div>
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <h4 class="text-2xl font-bold text-center mb-4 text-blue-900 dark:text-blue-100">
          ⏱️ ${isNL ? 'Tijdelijk' : 'Temporary'}
        </h4>
        <p class="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Heeft een <strong class="text-blue-600">duidelijk begin en einde</strong>. Niet doorlopend zoals operationele taken.' : 'Has a <strong class="text-blue-600">clear start and end</strong>. Not ongoing like operational tasks.'}
        </p>
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm font-semibold text-blue-600 mb-2">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${isNL ? 'Website redesign (3 maanden)' : 'Website redesign (3 months)'}</div>
        </div>
      </div>
      
      <!-- Card 2: Uniek -->
      <div class="group relative bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-2xl hover:scale-105 cursor-pointer">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl"></div>
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
        </div>
        <h4 class="text-2xl font-bold text-center mb-4 text-purple-900 dark:text-purple-100">
          ✨ ${isNL ? 'Uniek' : 'Unique'}
        </h4>
        <p class="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Levert een <strong class="text-purple-600">uniek product of resultaat</strong>. Geen repetitief proces.' : 'Delivers a <strong class="text-purple-600">unique product or result</strong>. Not a repetitive process.'}
        </p>
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm font-semibold text-purple-600 mb-2">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${isNL ? 'Uniek CRM voor jouw bedrijf' : 'Custom CRM for your company'}</div>
        </div>
      </div>
      
      <!-- Card 3: Resultaatgericht -->
      <div class="group relative bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-2xl hover:scale-105 cursor-pointer">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-2xl"></div>
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <h4 class="text-2xl font-bold text-center mb-4 text-green-900 dark:text-green-100">
          🎯 ${isNL ? 'Resultaatgericht' : 'Goal-oriented'}
        </h4>
        <p class="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Gericht op <strong class="text-green-600">specifieke, meetbare doelen</strong> en deliverables.' : 'Focused on <strong class="text-green-600">specific, measurable goals</strong> and deliverables.'}
        </p>
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm font-semibold text-green-600 mb-2">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${isNL ? '+30% efficiëntie bereiken' : 'Achieve +30% efficiency'}</div>
        </div>
      </div>
    </div>
    
    <!-- Real-world Example Banner -->
    <div class="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-2xl">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h5 class="text-xl font-bold">${isNL ? '💼 Praktijk Voorbeeld' : '💼 Real-World Example'}</h5>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-white/10 backdrop-blur rounded-xl p-6">
            <div class="text-sm font-semibold mb-2 opacity-90">${isNL ? '✅ DIT IS EEN PROJECT:' : '✅ THIS IS A PROJECT:'}</div>
            <p class="font-bold text-lg mb-2">${isNL ? 'Nieuw CRM Systeem Implementeren' : 'Implement New CRM System'}</p>
            <ul class="space-y-1 text-sm opacity-90">
              <li>⏱️ ${isNL ? 'Duur: 6 maanden' : 'Duration: 6 months'}</li>
              <li>✨ ${isNL ? 'Uniek voor jouw bedrijf' : 'Unique to your company'}</li>
              <li>🎯 ${isNL ? 'Doel: +30% klanttevredenheid' : 'Goal: +30% customer satisfaction'}</li>
            </ul>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-6">
            <div class="text-sm font-semibold mb-2 opacity-90">${isNL ? '❌ DIT IS GÉÉN PROJECT:' : '❌ THIS IS NOT A PROJECT:'}</div>
            <p class="font-bold text-lg mb-2">${isNL ? 'Dagelijkse Klanten Helpen' : 'Daily Customer Support'}</p>
            <ul class="space-y-1 text-sm opacity-90">
              <li>🔄 ${isNL ? 'Doorlopend proces' : 'Ongoing process'}</li>
              <li>📋 ${isNL ? 'Repetitieve taken' : 'Repetitive tasks'}</li>
              <li>⚙️ ${isNL ? 'Standaard procedures' : 'Standard procedures'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
const renderTripleConstraintVisual = (content: string, isNL: boolean) => `
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl">
      <h3 class="text-3xl font-bold mb-3">${isNL ? '⚖️ De Magische Driehoek' : '⚖️ The Magic Triangle'}</h3>
      <p class="text-lg opacity-90">${isNL ? 'Verander 1 kant, beïnvloed de andere 2!' : 'Change 1 side, affect the other 2!'}</p>
    </div>
    
    <!-- Interactive Triangle Visualization -->
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12 rounded-2xl">
      <div class="relative mx-auto" style="max-width: 500px;">
        <!-- SVG Triangle -->
        <svg viewBox="0 0 400 350" class="w-full">
          <defs>
            <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f97316;stop-opacity:0.3" />
              <stop offset="50%" style="stop-color:#ef4444;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <!-- Triangle shape -->
          <polygon points="200,50 370,300 30,300" fill="url(#triGrad)" stroke="#f97316" stroke-width="4" filter="url(#glow)"/>
          <!-- Connecting lines -->
          <line x1="200" y1="50" x2="200" y2="300" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
          <line x1="30" y1="300" x2="370" y2="300" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
          <line x1="30" y1="300" x2="200" y2="50" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
        </svg>
        
        <!-- Time Node (Top) -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
          <div class="group relative">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-white font-bold text-sm">${isNL ? 'TIJD' : 'TIME'}</span>
            </div>
            <div class="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="bg-blue-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">
                ${isNL ? 'Hoelang duurt het?' : 'How long?'}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Budget Node (Bottom Left) -->
        <div class="absolute bottom-0 left-0 translate-y-4 -translate-x-6">
          <div class="group relative">
            <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-white font-bold text-sm">${isNL ? 'BUDGET' : 'BUDGET'}</span>
            </div>
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="bg-green-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">
                ${isNL ? 'Hoeveel mag het kosten?' : 'How much?'}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Scope/Quality Node (Bottom Right) -->
        <div class="absolute bottom-0 right-0 translate-y-4 translate-x-6">
          <div class="group relative">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-white font-bold text-sm text-center px-1">${isNL ? 'SCOPE' : 'SCOPE'}</span>
            </div>
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="bg-purple-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">
                ${isNL ? 'Wat moet het opleveren?' : 'What to deliver?'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Interactive Scenarios -->
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Scenario 1 -->
      <div class="group bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800 hover:border-red-500 hover:shadow-xl transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-2xl">⚠️</span>
          </div>
          <h5 class="font-bold text-lg">${isNL ? 'Minder Tijd?' : 'Less Time?'}</h5>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Dan heb je <strong class="text-red-600">meer budget</strong> nodig (extra mensen) OF moet je <strong class="text-red-600">minder features</strong> opleveren.' : 'Then you need <strong class="text-red-600">more budget</strong> (extra people) OR must deliver <strong class="text-red-600">fewer features</strong>.'}
        </p>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs font-semibold text-red-600 mb-1">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-xs text-gray-500">${isNL ? '6 → 4 maanden = +€20k budget' : '6 → 4 months = +€20k budget'}</div>
        </div>
      </div>
      
      <!-- Scenario 2 -->
      <div class="group bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-orange-200 dark:border-orange-800 hover:border-orange-500 hover:shadow-xl transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-2xl">💰</span>
          </div>
          <h5 class="font-bold text-lg">${isNL ? 'Minder Budget?' : 'Less Budget?'}</h5>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Dan duurt het <strong class="text-orange-600">langer</strong> (minder mensen) OF lever je <strong class="text-orange-600">minder features</strong> op.' : 'Then it takes <strong class="text-orange-600">longer</strong> (fewer people) OR you deliver <strong class="text-orange-600">fewer features</strong>.'}
        </p>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs font-semibold text-orange-600 mb-1">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-xs text-gray-500">${isNL ? '€100k → €70k = +2 maanden' : '€100k → €70k = +2 months'}</div>
        </div>
      </div>
      
      <!-- Scenario 3 -->
      <div class="group bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500 hover:shadow-xl transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span class="text-2xl">🎯</span>
          </div>
          <h5 class="font-bold text-lg">${isNL ? 'Meer Features?' : 'More Features?'}</h5>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          ${isNL ? 'Dan heb je <strong class="text-purple-600">meer tijd</strong> EN/OF <strong class="text-purple-600">meer budget</strong> nodig!' : 'Then you need <strong class="text-purple-600">more time</strong> AND/OR <strong class="text-purple-600">more budget</strong>!'}
        </p>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs font-semibold text-purple-600 mb-1">${isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
          <div class="text-xs text-gray-500">${isNL ? '20 → 40 features = 2x tijd/budget' : '20 → 40 features = 2x time/budget'}</div>
        </div>
      </div>
    </div>
    
    <!-- Real Business Case -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div>
            <h5 class="text-2xl font-bold">${isNL ? '🏢 Echte Business Case' : '🏢 Real Business Case'}</h5>
            <p class="opacity-90">${isNL ? 'Website Redesign Project' : 'Website Redesign Project'}</p>
          </div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Original -->
          <div class="bg-white/10 backdrop-blur rounded-xl p-6">
            <div class="text-sm font-semibold mb-3 opacity-90">${isNL ? '📊 ORIGINEEL PLAN' : '📊 ORIGINAL PLAN'}</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">⏱️</span>
                <span>${isNL ? '3 maanden' : '3 months'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">💰</span>
                <span>€50.000</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">🎯</span>
                <span>${isNL ? '20 pagina\'s' : '20 pages'}</span>
              </div>
            </div>
          </div>
          
          <!-- Change -->
          <div class="bg-red-500/30 backdrop-blur rounded-xl p-6 border-2 border-red-400/50">
            <div class="text-sm font-semibold mb-3">${isNL ? '⚠️ WIJZIGING' : '⚠️ CHANGE'}</div>
            <div class="space-y-2 text-sm">
              <div class="font-bold text-lg mb-2">${isNL ? 'CEO wil 40 pagina\'s!' : 'CEO wants 40 pages!'}</div>
              <div class="text-sm opacity-90">${isNL ? '(2x meer scope 🎯)' : '(2x more scope 🎯)'}</div>
            </div>
          </div>
          
          <!-- Solution -->
          <div class="bg-green-500/30 backdrop-blur rounded-xl p-6 border-2 border-green-400/50">
            <div class="text-sm font-semibold mb-3">${isNL ? '✅ OPTIES' : '✅ OPTIONS'}</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-green-300">A.</span>
                <span>${isNL ? '6 maanden (2x tijd)' : '6 months (2x time)'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-green-300">B.</span>
                <span>${isNL ? '€100k (2x budget)' : '€100k (2x budget)'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-green-300">C.</span>
                <span>${isNL ? '30 pagina\'s (compromis)' : '30 pages (compromise)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
const renderGenericContent = (content: string, isNL: boolean, index: number) => {
  // Extract first 3 sentences as key points
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints = sentences.slice(0, 4).map(s => s.trim());
  
  const colors = [
    { from: 'from-blue-500', to: 'to-cyan-500', border: 'border-blue-200 dark:border-blue-800' },
    { from: 'from-purple-500', to: 'to-pink-500', border: 'border-purple-200 dark:border-purple-800' },
    { from: 'from-green-500', to: 'to-emerald-500', border: 'border-green-200 dark:border-green-800' },
    { from: 'from-orange-500', to: 'to-red-500', border: 'border-orange-200 dark:border-orange-800' }
  ];
  
  const color = colors[index % 4];
  
  return `
    <div class="space-y-6">
      <!-- Content Card -->
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 ${color.border} shadow-lg">
        <div class="prose prose-lg max-w-none dark:prose-invert">
          ${content.split('\n').filter(p => p.trim()).map(para => 
            `<p class="leading-relaxed mb-4">${para.trim()}</p>`
          ).join('')}
        </div>
      </div>
      
      <!-- Key Points -->
      ${keyPoints.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${keyPoints.map((point, i) => `
            <div class="flex items-start gap-3 p-4 bg-gradient-to-r ${color.from} ${color.to} bg-opacity-10 dark:bg-opacity-20 rounded-xl border ${color.border}">
              <div class="w-6 h-6 bg-gradient-to-br ${color.from} ${color.to} rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">${point}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};
// ============================================
// MAIN CONTENT SECTIONS — API-driven + dynamic fallback
// Uses VisualTemplateRenderer React components
// ============================================
const contentSections = useMemo(() => {
  const fullContent = currentLesson?.transcript || currentLesson?.content || '';

  if (!fullContent) {
    return [{
      title: isNL ? 'Lesinhoud' : 'Lesson Content',
      subtitle: '',
      icon: <BookOpen className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl',
      content: '',
      reactContent: (
        <p className="text-center py-12 text-gray-500">
          {isNL ? 'Geen inhoud beschikbaar' : 'No content available'}
        </p>
      ),
      keyPoints: [] as string[],
    }];
  }

  // Get visual config — merge API data with any fetched LessonVisual data
  const apiVisualType = (currentLesson as any)?.visual_type || 'auto';
  const lessonVisualData = (currentLesson as any)?.visual_data || null;
  // approvedVisualData from LessonVisual fetch takes priority (has preview_image_url etc.)
  const apiVisualData = approvedVisualData || lessonVisualData;

  // Split content into sections (~500 chars each)
  const rawSections: string[] = [];
  const sentences = fullContent.split(/(?<=[.!?])\s+/);
  let currentSection = '';

  for (const sentence of sentences) {
    currentSection += sentence + ' ';
    if (currentSection.length > 500) {
      rawSections.push(currentSection.trim());
      currentSection = '';
    }
  }
  if (currentSection.trim()) rawSections.push(currentSection.trim());

  const sections = rawSections.slice(0, 4);

  const icons = [
    <Target className="w-8 h-8 text-white" />,
    <Triangle className="w-8 h-8 text-white" />,
    <GitCompare className="w-8 h-8 text-white" />,
    <Users className="w-8 h-8 text-white" />,
  ];

  const colors = [
    'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl',
    'bg-gradient-to-br from-orange-600 to-red-600 shadow-xl',
    'bg-gradient-to-br from-green-600 to-emerald-600 shadow-xl',
    'bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl',
  ];

  return sections.map((sectionText, index) => {
    // Use API visual type for the first section, auto-detect for subsequent
    const visualType = index === 0 && apiVisualType !== 'auto' ? apiVisualType : 'auto';
    const visualData = index === 0 ? apiVisualData : null;

    // Get topic type for title/subtitle (either from API or auto-detected)
    const resolvedType = visualType !== 'auto' ? visualType : detectTopicType(sectionText);

    let title = '';
    let subtitle = '';

    if (resolvedType === 'project_def') {
      title = isNL ? 'Wat is een Project?' : 'What is a Project?';
      subtitle = isNL ? 'De 3 kernkenmerken' : 'The 3 core characteristics';
    } else if (resolvedType === 'triple_constraint') {
      title = isNL ? 'De Triple Constraint' : 'The Triple Constraint';
      subtitle = isNL ? 'Tijd, Budget & Scope' : 'Time, Budget & Scope';
    } else if (resolvedType === 'pm_role') {
      title = isNL ? 'De Rol van de PM' : 'The Role of the PM';
      subtitle = isNL ? 'Verantwoordelijkheden' : 'Responsibilities';
    } else if (resolvedType === 'comparison') {
      title = isNL ? 'Project vs. Operatie' : 'Project vs. Operation';
      subtitle = isNL ? 'Ken het verschil' : 'Know the difference';
    } else if (resolvedType === 'lifecycle') {
      title = isNL ? 'Projectlevenscyclus' : 'Project Lifecycle';
      subtitle = isNL ? 'De fasen van een project' : 'The phases of a project';
    } else if (resolvedType === 'stakeholder') {
      title = isNL ? 'Stakeholder Management' : 'Stakeholder Management';
      subtitle = isNL ? 'Belanghebbenden in kaart' : 'Mapping stakeholders';
    } else if (resolvedType === 'risk') {
      title = isNL ? 'Risicomanagement' : 'Risk Management';
      subtitle = isNL ? 'Identificeer & beheers risico\'s' : 'Identify & manage risks';
    } else {
      const firstSentence = sectionText.split(/[.!?]/)[0]?.trim() || '';
      title = firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence;
      subtitle = `${isNL ? 'Deel' : 'Part'} ${index + 1}`;
    }

    return {
      title,
      subtitle,
      icon: icons[index % 4],
      color: colors[index % 4],
      content: '', // No longer using HTML strings
      reactContent: (
        <VisualTemplateRenderer
          visualType={visualType}
          visualData={visualData}
          content={sectionText}
          isNL={isNL}
          index={index}
        />
      ),
      keyPoints: [] as string[],
    };
  });
}, [currentLesson, isNL, approvedVisualData]);
  // Get interactive slides
  const slides = generateInteractiveSlides(currentLesson, isNL);
  
  // Get progress from hook
  const progress = getCourseProgress(course.id);
  const completedCount = Math.round((progress / 100) * allLessons.length);
  
  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => checkLessonCompleted(course.id, lessonId);
  
  // Check if module is completed
  const isModuleCompleted = (moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return false;
    return module.lessons.every(l => isLessonCompleted(l.id));
  };
  // NEW: Achievement System Functions
  const checkAndUnlockAchievements = (trigger: string, data?: any) => {
    const updatedAchievements = [...achievements];
    let newlyUnlocked: Achievement | null = null;
    updatedAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      switch (achievement.id) {
        case 'first-lesson':
          if (trigger === 'lesson-complete' && completedCount === 1) {
            achievement.unlocked = true;
            newlyUnlocked = achievement;
          }
          break;
        case 'perfect-score':
          if (trigger === 'simulation-correct') {
            achievement.progress = (achievement.progress || 0) + 1;
            if (achievement.progress >= (achievement.maxProgress || 3)) {
              achievement.unlocked = true;
              newlyUnlocked = achievement;
            }
          }
          break;
        case 'practice-master':
          if (trigger === 'practice-submit') {
            achievement.progress = (achievement.progress || 0) + 1;
            if (achievement.progress >= (achievement.maxProgress || 5)) {
              achievement.unlocked = true;
              newlyUnlocked = achievement;
            }
          }
          break;
        case 'speed-learner':
          if (trigger === 'lesson-complete') {
            // In real implementation, check if 5 lessons completed today
            achievement.progress = (achievement.progress || 0) + 1;
            if (achievement.progress >= (achievement.maxProgress || 5)) {
              achievement.unlocked = true;
              newlyUnlocked = achievement;
            }
          }
          break;
      }
    });
    setAchievements(updatedAchievements);
    if (newlyUnlocked) {
      setUnlockedAchievement(newlyUnlocked);
      setShowAchievementDialog(true);
      
      // Confetti effect would go here
      toast({
        title: isNL ? '🏆 Achievement Unlocked!' : '🏆 Achievement Unlocked!',
        description: newlyUnlocked.title,
      });
    }
  };
  // NEW: Simulation Answer Handler with Score Tracking + Skill Points
const handleSimulationAnswer = async (answerIndex: number, correctIndex: number) => {
  const isCorrect = answerIndex === correctIndex;
  
  const newScore: SimulationScore = {
    scenarioId: currentLessonId,
    selectedAnswer: answerIndex,
    correctAnswer: correctIndex,
    isCorrect,
    timestamp: new Date(),
  };
  
  setSimulationScores([...simulationScores, newScore]);
  setCurrentSimulationAnswer(answerIndex);
  setShowScoreDialog(true);
  
  if (isCorrect) {
    // Award skill points for correct simulation
    await awardSkillPoints(currentLessonId, 'simulation_correct');
    checkAndUnlockAchievements('simulation-correct');
    
    toast({
      title: isNL ? '🎯 Correct!' : '🎯 Correct!',
      description: isNL ? 'Je hebt extra skill punten verdiend!' : 'You earned bonus skill points!',
    });
  }
};
  // NEW: Practice Work Save Handler + Skill Points
const handleSavePracticeWork = async () => {
  setSavingPractice(true);
  
  try {
    const newWork: PracticeWork = {
      lessonId: currentLessonId,
      content: currentPracticeContent,
      submittedAt: new Date(),
    };
    
    setPracticeWork([...practiceWork, newWork]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Award skill points for practice submission
    await awardSkillPoints(currentLessonId, 'practice_submit');
    
    checkAndUnlockAchievements('practice-submit');
    
    toast({
      title: isNL ? '💾 Opgeslagen!' : '💾 Saved!',
      description: isNL ? 'Je werk is opgeslagen en je hebt skill punten verdiend!' : 'Your work is saved and you earned skill points!',
    });
  } catch (error) {
    console.error('Failed to save practice:', error);
    toast({
      title: isNL ? 'Fout' : 'Error',
      description: isNL ? 'Kon opdracht niet opslaan' : 'Failed to save assignment',
      variant: 'destructive',
    });
  } finally {
    setSavingPractice(false);
  }
};
  // NEW: AI Feedback Generator (Simulated)
  const generateAIFeedback = async () => {
    setAiFeedbackLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const feedback = isNL 
      ? `# AI Feedback
**Sterke punten:**
Duidelijke structuur en logische opbouw
Goede gebruik van projectmanagement terminologie
Realistische voorbeelden en scenario\'s
**Verbeterpunten:**
⚠️ Voeg meer concrete metrics toe voor succes criteria
⚠️ Overweeg alternatieve scenario\'s en risico mitigatie
⚠️ Verwijs naar specifieke PM frameworks (bijv. PRINCE2, Agile)
**Score: 8/10**
**Aanbeveling:** Uitstekend werk! Met wat meer diepgang in de risico analyse zou dit een 10 kunnen zijn.`
      : `# AI Feedback
**Strengths:**
Clear structure and logical flow
Good use of project management terminology  
Realistic examples and scenarios
**Areas for Improvement:**
⚠️ Add more concrete metrics for success criteria
⚠️ Consider alternative scenarios and risk mitigation
⚠️ Reference specific PM frameworks (e.g., PRINCE2, Agile)
**Score: 8/10**
**Recommendation:** Excellent work! With more depth in risk analysis this could be a perfect 10.`;
    
    setCurrentFeedback(feedback);
    setAiFeedbackLoading(false);
    setShowFeedbackDialog(true);
  };
  const content = {
    labels: {
      courseContent: isNL ? 'Cursusinhoud' : 'Course Content',
      completed: isNL ? 'voltooid' : 'completed',
      markComplete: isNL ? 'Markeer als voltooid' : 'Mark as complete',
      markedComplete: isNL ? 'Voltooid ✓' : 'Completed ✓',
      nextLesson: isNL ? 'Volgende Les' : 'Next Lesson',
      prevLesson: isNL ? 'Vorige Les' : 'Previous Lesson',
      backToCourse: isNL ? 'Terug naar Cursus' : 'Back to Course',
      congratulations: isNL ? 'Gefeliciteerd!' : 'Congratulations!',
      lessonCompleted: isNL ? 'Les voltooid!' : 'Lesson completed!',
      courseCompleted: isNL ? 'Cursus voltooid!' : 'Course completed!',
      getCertificate: isNL ? 'Download Certificaat' : 'Get Certificate',
      continueToNext: isNL ? 'Naar volgende les' : 'Continue to next lesson',
      notes: isNL ? 'Notities' : 'Notes',
      resources: isNL ? 'Resources' : 'Resources',
      saveNotes: isNL ? 'Notities Opslaan' : 'Save Notes',
      notesPlaceholder: isNL ? 'Schrijf hier je notities...' : 'Write your notes here...',
    },
    defaultResources: [
      { name: isNL ? 'Presentatie Slides' : 'Presentation Slides', type: 'PDF', size: '2.4 MB' },
      { name: isNL ? 'Werkblad Template' : 'Worksheet Template', type: 'XLSX', size: '156 KB' },
    ],
  };
// Visual Loading useEffect — fetches LessonVisual and merges into lesson data
useEffect(() => {
  const loadVisual = async () => {
    if (!currentLesson) return;

    try {
      // If lesson already has visual_data with preview_image_url from API, skip fetch
      const existingData = (currentLesson as any)?.visual_data;
      if (existingData?.preview_image_url) {
        console.log('✅ Lesson already has visual_data from API');
        setPrimaryKeyword(existingData.visual_id || 'lifecycle');
        setApprovedVisualData(existingData);
        return;
      }

      console.log('🎯 Checking LessonVisual for approved visual...');
      const numericId = typeof currentLesson.id === 'number'
        ? currentLesson.id
        : parseInt(String(currentLesson.id).replace(/\D/g, ''), 10);

      if (!isNaN(numericId)) {
        const approvedVisual = await visualService.getApprovedVisual(numericId.toString());

        if (approvedVisual && approvedVisual.visual_id) {
          console.log('✅ Found approved visual:', approvedVisual.visual_id);
          setPrimaryKeyword(approvedVisual.visual_id);
          // Merge into lesson's visual_data so contentSections picks it up
          setApprovedVisualData(approvedVisual);
          return;
        }
      }

      console.log('⚠️ No approved visual found, using auto-detect...');
      setPrimaryKeyword('auto');
      setApprovedVisualData(null);
    } catch (error) {
      console.error('Failed to load visual:', error);
      setPrimaryKeyword('auto');
      setApprovedVisualData(null);
    }
  };

  loadVisual();
}, [currentLessonId, currentLesson?.title]);
// Load saved notes and practice work
useEffect(() => {
  const savedNotes = getUserNotes(course.id, currentLessonId);
  setNotes(savedNotes);
  setCurrentSlideIndex(0);
  
  const lessonPractice = practiceWork.find(w => w.lessonId === currentLessonId);
  if (lessonPractice) {
    setCurrentPracticeContent(lessonPractice.content);
  } else {
    setCurrentPracticeContent('');
  }
}, [currentLessonId, course.id]);
    
  // Video event handlers (unchanged)
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);
  const handleEnded = () => {
    setIsPlaying(false);
    if (!isLessonCompleted(currentLessonId)) {
      setCompletionDialogOpen(true);
    }
  };
  // Video controls (unchanged)
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
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
  // Navigation
  const goToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
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
  // Mark as complete with achievement check + skill points
const markAsComplete = async () => {
  // Award skill points FIRST
  await awardSkillPoints(currentLessonId, 'lesson_complete');
  
  const newProgress = completeLesson(course.id, currentLessonId, allLessons.length);
  
  checkAndUnlockAchievements('lesson-complete');
  
  toast({
    title: content.labels.lessonCompleted,
    description: isNL ? 'Je voortgang is opgeslagen.' : 'Your progress has been saved.',
  });
  
  if (newProgress === 100) {
    setCertificateDialogOpen(true);
  } else {
    setCompletionDialogOpen(true);
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
  // Loading/Auth checks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user?.isLoggedIn) {
    navigate('/login');
    return null;
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/academy/course/${slug}`)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {content.labels.backToCourse}
          </Button>
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
          {/* NEW: Achievements Button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAchievementDialog(true)}
            className="relative"
          >
            <Trophy className="w-4 h-4 mr-1" />
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
            {achievements.some(a => a.unlocked && !a.id.includes('viewed')) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            )}
          </Button>
          
          {isSuperuser && (
            <Badge className="bg-red-500 text-white border-0">
              <Crown className="w-3 h-3 mr-1" /> Admin
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(!rightSidebarOpen)}>
            {rightSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </Button>
        </div>
      </nav>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CENTER - Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Video Player (if video lesson) */}
          {currentLesson.videoUrl && (
            <div 
              ref={playerContainerRef}
              className="relative w-full bg-black aspect-video group"
              onMouseEnter={() => setShowControls(true)}
            >
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
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              )}
              {/* Video Controls */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="mb-3">
                  <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <span className="text-white text-sm ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              {!isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Quiz (full width) */}
          {currentLesson.type === 'quiz' && (
            <div className="flex-1 overflow-auto bg-background">
              <QuizEngine
                lessonId={currentLesson.id}
                courseSlug={slug || ''}
                apiBase="/api/v1"
                language={isNL ? 'nl' : 'en'}
                onComplete={(passed) => {
                  if (passed) {
                    completeLesson(course.id, currentLessonId, allLessons.length);
                    toast({ title: isNL ? 'Quiz voltooid!' : 'Quiz completed!' });
                  }
                }}
              />
            </div>
          )}
          {/* Assignment */}
          {currentLesson.type === 'assignment' && (
            <ScrollArea className="flex-1">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                      {isNL ? 'Praktijkopdracht' : 'Practice Assignment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 mb-6">
                      <h3 className="font-bold mb-2">{isNL ? 'Opdracht' : 'Assignment'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentLesson.content || (isNL 
                          ? 'Pas je kennis toe in een echte case. Lees de instructies en werk je opdracht uit.'
                          : 'Apply your knowledge to a real case. Read the instructions and work on your assignment.')}
                      </p>
                    </div>
                    <Textarea 
                      placeholder={isNL ? 'Schrijf je antwoord hier...' : 'Write your answer here...'}
                      className="min-h-[400px] mb-4"
                    />
                    <Button 
                      onClick={() => {
                        completeLesson(course.id, currentLessonId, allLessons.length);
                        toast({
                          title: isNL ? 'Opdracht ingediend!' : 'Assignment submitted!',
                          description: isNL ? 'Je antwoord is opgeslagen.' : 'Your answer has been saved.',
                        });
                      }}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    >
                      {isNL ? 'Indienen' : 'Submit'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
          {/* Scrollable Content (for video/reading lessons) */}
          {(currentLesson.type === 'video' || currentLesson.type === 'reading' || !currentLesson.type) && (
            <ScrollArea className="flex-1">
              <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                
                {/* Lesson Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isLessonCompleted(currentLessonId) && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {isNL ? 'Voltooid' : 'Completed'}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-muted-foreground">
                    {currentModule?.title} • {isNL ? 'Les' : 'Lesson'} {getLessonGlobalIndex(course.modules, currentLessonId)} {isNL ? 'van' : 'of'} {allLessons.length}
                  </p>
                </div>
                {/* Tab Content Based on URL Param */}
                {(() => {
                  const activeTab = searchParams.get('tab') || 'content';
// 🚨 DEBUG: Check what tab is active
console.log('🚨🚨🚨 ACTIVE TAB:', activeTab);
console.log('🚨🚨🚨 SEARCH PARAMS:', searchParams.toString());
console.log('🚨🚨🚨 ENTERING SWITCH');
switch (activeTab) {
                    
                    case 'content':
                      // ============================================
                      // MULTI-LAYER CONTEXT-AWARE KEYWORD MATCHING
                      // ============================================
                      
                      // LAYER 1: Course/Methodology Context (from course data)
                      const courseSlug = slug || '';
                      const courseTitle = course.title.toLowerCase();
                      
                      // Get methodology from course metadata (if available)
                      const courseMethodology = (course as any).methodology || 
                                              courseSlug.split('-')[0]; // fallback to slug prefix
                      
                      const isAgile = courseMethodology === 'agile' || courseSlug.includes('agile');
                      const isScrum = courseMethodology === 'scrum' || courseSlug.includes('scrum');
                      const isPRINCE2 = courseMethodology === 'prince2' || courseSlug.includes('prince2');
                      const isWaterfall = courseMethodology === 'waterfall' || courseSlug.includes('waterfall');
                      const isLean = courseMethodology === 'lean' || courseSlug.includes('lean');
                      
                      console.log('📚 Methodology:', courseMethodology);
                      
                      // LAYER 2: Module Context
                      const moduleTitle = (currentModule?.title || '').toLowerCase();
                      
                      // LAYER 3: Lesson Context (most specific)
                      const titleLower = (currentLesson.title || '').toLowerCase();
                      const titleNLLower = (currentLesson.titleNL || '').toLowerCase();
                      const combinedTitle = titleLower + ' ' + titleNLLower;
                      
                      // LAYER 4: Content Keywords
                      const contentText = ((currentLesson.content || '') + ' ' + (currentLesson.transcript || '')).toLowerCase();
                      
                      console.log('🎯 CONTEXT:', { 
                        course: courseSlug, 
                        isAgile, 
                        isScrum, 
                        isPRINCE2,
                        module: currentModule?.title,
                        lesson: currentLesson.title 
                      });
                      
                      // Determine primary keyword with methodology context
                      
                      // ============================================
                      // PRECISE TITLE-FIRST KEYWORD MATCHING
                      // Strategy: Exact title match → Module → Content → Smart default
                      // ============================================
                      
                      // Question type detection
                      const isWhatIsQuestion = combinedTitle.includes('wat is') || combinedTitle.includes('what is');
                      const isRoleQuestion = combinedTitle.includes('rol van') || combinedTitle.includes('role of');
                      const isMethodologyQuestion = combinedTitle.includes('methodolog') || combinedTitle.includes('aanpak');
                      const isComparisonQuestion = combinedTitle.includes(' vs ') || combinedTitle.includes('versus') || combinedTitle.includes('verschil');
                      
                      // ============================================
                      // DEEP CONTENT ANALYSIS
                      // Understand WHAT is being taught, not just keywords
                      // ============================================
                      
                      // Project Definition Detection (tijdelijk, uniek, resultaatgericht)
                      const hasTijdelijk = contentText.includes('tijdelijk') || contentText.includes('temporary');
                      const hasUniek = contentText.includes('uniek') || contentText.includes('unique');
                      const hasResultaat = contentText.includes('resultaat') || contentText.includes('goal') || contentText.includes('outcome');
                      const hasProjectDefinition = hasTijdelijk && hasUniek && hasResultaat;
                      
                      console.log('📋 Content scan:', {
                        contentLength: contentText.length,
                        hasTijdelijk,
                        hasUniek,
                        hasResultaat,
                        hasProjectDefinition,
                        contentPreview: contentText.substring(0, 200)
                      });
                      
                      // Triple Constraint Detection (tijd, kosten, kwaliteit/scope)
                      const hasTripleConstraint = (
                        contentText.includes('tijd') && contentText.includes('kosten') && 
                        (contentText.includes('kwaliteit') || contentText.includes('scope'))
                      ) || contentText.includes('ijzeren driehoek') || contentText.includes('triple constraint');
                      
                      // Lifecycle Phases Detection (initiatie, planning, uitvoering, monitoring, afsluiting)
                      const hasLifecyclePhases = (
                        (contentText.includes('initiatie') || contentText.includes('initiation')) &&
                        (contentText.includes('planning')) &&
                        (contentText.includes('uitvoer') || contentText.includes('execution'))
                      );
                      
                      // Stakeholder Power/Interest Matrix Detection
                      const hasStakeholderMatrix = (
                        contentText.includes('power') || contentText.includes('invloed')
                      ) && (
                        contentText.includes('interest') || contentText.includes('belang')
                      ) && (contentText.includes('stakeholder') || contentText.includes('belanghebbend'));
                      
                      console.log('🧠 Content Understanding:', { 
                        hasProjectDefinition,
                        hasTripleConstraint,
                        hasLifecyclePhases,
                        hasStakeholderMatrix,
                        questionType: { isWhatIsQuestion, isRoleQuestion, isMethodologyQuestion }
                      });
                      
                      // ============================================
                      // METHODOLOGY-AWARE VISUAL MAPPING
                      // Each methodology has its own visual vocabulary
                      // ============================================
                      
                      const METHODOLOGY_VISUALS: Record<string, {
                        patterns: Array<{ keywords: string[], visual: string }>,
                        default: string
                      }> = {
                        'agile': {
                          patterns: [
                            { keywords: ['manifesto', 'waarden', 'values'], visual: 'manifesto' },
                            { keywords: ['princip', '12 ', 'twaalf'], visual: 'principles' },
                            { keywords: ['vs', 'versus', 'vergelijk', 'traditioneel', 'waterval'], visual: 'comparison' },
                            { keywords: ['schatten', 'estimat', 'planning poker'], visual: 'default' },
                          ],
                          default: 'manifesto'
                        },
                        'scrum': {
                          patterns: [
                            { keywords: ['sprint planning', 'sprint', 'iteratie'], visual: 'sprint' },
                            { keywords: ['backlog', 'user stor'], visual: 'backlog' },
                            { keywords: ['daily', 'standup', 'retrospective', 'retro', 'review', 'ceremony'], visual: 'scrum-events' },
                            { keywords: ['velocity', 'burn', 'metriek'], visual: 'velocity' },
                            { keywords: ['scrum master', 'product owner', 'role', 'rol'], visual: 'team' },
                            { keywords: ['impediment', 'blocker'], visual: 'default' },
                          ],
                          default: 'sprint'
                        },
                        'prince2': {
                          patterns: [
                            { keywords: ['business case', 'justification', 'rechtvaardig'], visual: 'business-case' },
                            { keywords: ['project charter', 'charter', 'brief'], visual: 'charter' },
                            { keywords: ['theme', 'thema'], visual: 'lifecycle' },
                            { keywords: ['process', 'proces', 'stage'], visual: 'lifecycle' },
                            { keywords: ['organisation', 'organisatie', 'board'], visual: 'team' },
                            { keywords: ['quality', 'kwaliteit'], visual: 'swot' },
                            { keywords: ['risk', 'risico'], visual: 'risk' },
                            { keywords: ['plan', 'planning'], visual: 'timeline' },
                          ],
                          default: 'lifecycle'
                        },
                        'waterfall': {
                          patterns: [
                            { keywords: ['requirements', 'requirement', 'specificatie'], visual: 'wbs' },
                            { keywords: ['design', 'ontwerp'], visual: 'wbs' },
                            { keywords: ['phase', 'fase', 'stage'], visual: 'lifecycle' },
                            { keywords: ['gate', 'review'], visual: 'timeline' },
                            { keywords: ['documentation', 'document'], visual: 'charter' },
                            { keywords: ['testing', 'test', 'qa'], visual: 'timeline' },
                          ],
                          default: 'lifecycle'
                        },
                        // Generic PM (no specific methodology)
                        'pm': {
                          patterns: [
                            { keywords: ['methodolog', 'aanpak', 'approach'], visual: 'methodologies' },
                            { keywords: ['levenscyclus', 'lifecycle'], visual: 'lifecycle' },
                            { keywords: ['stakeholder', 'belanghebbend'], visual: 'stakeholder' },
                            { keywords: ['risk', 'risico'], visual: 'risk' },
                            { keywords: ['wbs', 'work breakdown'], visual: 'wbs' },
                            { keywords: ['charter'], visual: 'charter' },
                            { keywords: ['business case'], visual: 'business-case' },
                            { keywords: ['initiatie', 'initiation'], visual: 'initiation' },
                            { keywords: ['wat is een project', 'tijdelijk', 'uniek'], visual: 'project-definition' },
                          ],
                          default: 'lifecycle'
                        },
                        'generic': {
                          patterns: [
                            { keywords: ['methodolog', 'aanpak', 'approach'], visual: 'methodologies' },
                            { keywords: ['levenscyclus', 'lifecycle'], visual: 'lifecycle' },
                            { keywords: ['stakeholder', 'belanghebbend'], visual: 'stakeholder' },
                            { keywords: ['risk', 'risico'], visual: 'risk' },
                            { keywords: ['wbs', 'work breakdown'], visual: 'wbs' },
                            { keywords: ['charter'], visual: 'charter' },
                            { keywords: ['business case'], visual: 'business-case' },
                          ],
                          default: 'lifecycle'
                        }
                      };
                      
                      // ============================================
                      // INTELLIGENT CONTENT ANALYZER
                      // Analyzes ALL context to determine best visual
                      // ============================================
                      
                      
                      // ============================================
                      // CURRICULUM-AWARE CONTEXT DETECTION
                      // Understands project phases and learning actions
                      // ============================================
                      
                      // Detect which project phase based on module title
                      const detectProjectPhase = (moduleTitle: string): string => {
                        const title = moduleTitle.toLowerCase();
                        
                        if (title.includes('introductie') || title.includes('wat is')) return 'initiation';
                        if (title.includes('planning') || title.includes('voorbereiding')) return 'planning';
                        if (title.includes('uitvoering') || title.includes('execution')) return 'execution';
                        if (title.includes('monitoring') || title.includes('control') || title.includes('beheersing')) return 'monitoring';
                        if (title.includes('afsluiting') || title.includes('closure') || title.includes('afronding')) return 'closure';
                        
                        return 'general';
                      };
                      
                      // Detect primary learning action (what are you doing?)
                      // PRIORITY: Check lesson TITLE first for strongest signal!
                      const detectLearningAction = (title: string, content: string): string => {
                        const titleLower = title.toLowerCase();
                        const contentLower = content.toLowerCase();
                        
                        // PRIORITY 1: Check TITLE for explicit action verbs (strongest signal)
                        
                        // COMMUNICATIE (Uitvoering fase)
                        if (titleLower.match(/communicatie|communiceren|rapportage|rapporteren/)) return 'communicate';
                        
                        // MONITORING (Control fase)
                        if (titleLower.match(/monitoren|monitoring|tracken|tracking|bewaken|beheersen/)) return 'monitor';
                        
                        // ANALYSE (Planning fase)
                        if (titleLower.match(/analyseren|analyse|identificeren|identificatie|in kaart/)) return 'analyze';
                        
                        // EVALUATIE (Afsluiting fase)
                        if (titleLower.match(/evalueren|evaluatie|beoordelen|lessons learned|review/)) return 'evaluate';
                        
                        // CREATIE (Planning fase)
                        if (titleLower.match(/opstellen|creëren|maken|ontwikkelen|definiëren/)) return 'create';
                        
                        // PRIORITY 2: Check CONTENT if title didn't match
                        const combined = (titleLower + ' ' + contentLower);
                        
                        if (combined.match(/communiceren|rapporteren|inform|report/)) return 'communicate';
                        if (combined.match(/monitoren|tracken|bijhouden|monitor|track|volgen/)) return 'monitor';
                        if (combined.match(/analyseren|identificeren|mapping|analyze/)) return 'analyze';
                        if (combined.match(/evalueren|beoordelen|evaluate|review/)) return 'evaluate';
                        if (combined.match(/opstellen|creëren|maken|develop|create|definiëren/)) return 'create';
                        
                        return 'learn';
                      };
                      
                      // Detect subject/topic
                      const detectSubject = (title: string, content: string): string => {
                        const combined = (title + ' ' + content).toLowerCase();
                        
                        if (combined.includes('stakeholder')) return 'stakeholder';
                        if (combined.includes('risico') || combined.includes('risk')) return 'risk';
                        if (combined.includes('timeline') || combined.includes('planning') || combined.includes('gantt')) return 'timeline';
                        if (combined.includes('wbs') || combined.includes('werk') || combined.includes('scope')) return 'scope';
                        if (combined.includes('team') || combined.includes('raci')) return 'team';
                        if (combined.includes('budget') || combined.includes('cost')) return 'budget';
                        if (combined.includes('kwaliteit') || combined.includes('quality')) return 'quality';
                        if (combined.includes('change') || combined.includes('wijziging')) return 'change';
                        if (combined.includes('communicatie') || combined.includes('communication')) return 'communication';
                        return "default";
                      };
                      // SCENARIO GENERATOR
                      const generateScenario = (keyword: string) => {
                        const scenarios: Record<string, {
                          simulation: { title: string; description: string; options: string[]; correctAnswer: number };
                          practice: { title: string; description: string; template: string };
                        }> = {
                          'charter': {
                            simulation: {
                              title: isNL ? 'Scenario: Charter Goedkeuring' : 'Scenario: Charter Approval',
                              description: isNL 
                                ? 'De sponsor wil het project charter goedkeuren, maar heeft bezwaren over de scope. Wat doe je?'
                                : 'The sponsor wants to approve the charter but has concerns about scope. What do you do?',
                              options: [
                                isNL ? 'A) Scope direct aanpassen volgens sponsor feedback' : 'A) Adjust scope immediately per sponsor feedback',
                                isNL ? 'B) Impact analyse maken en alternatieven voorstellen' : 'B) Create impact analysis and propose alternatives',
                                isNL ? 'C) Escaleren naar steering committee' : 'C) Escalate to steering committee'
                              ],
                              correctAnswer: 1
                            },
                            practice: {
                              title: isNL ? 'Praktijkopdracht: Project Charter Opstellen' : 'Practice: Draft Project Charter',
                              description: isNL
                                ? 'Je organisatie wil een nieuw CRM systeem implementeren. Maak een project charter met:\n- Projectdoel en rechtvaardiging\n- Scope (in en out of scope)\n- Belangrijkste stakeholders en hun rollen\n- Succes criteria\n- Budget en tijdlijn indicatie\n- Top 3 risico\'s'
                                : 'Your organization wants to implement a new CRM system. Create a project charter with:\n- Project purpose and justification\n- Scope (in and out of scope)\n- Key stakeholders and their roles\n- Success criteria\n- Budget and timeline indication\n- Top 3 risks',
                              template: isNL 
                                ? '# Project Charter: CRM Implementatie\n\n## 1. Projectdoel\n[Beschrijf waarom dit project wordt gestart]\n\n## 2. Scope\nIn scope:\n- \n\nOut of scope:\n- \n\n## 3. Stakeholders\n- Sponsor: \n- Project Manager: \n- Team: \n\n## 4. Succes Criteria\n- \n\n## 5. Planning & Budget\nDuur: \nBudget: \n\n## 6. Risico\'s\n1. \n2. \n3. '
                                : '# Project Charter: CRM Implementation\n\n## 1. Purpose\n[Describe why this project is being initiated]\n\n## 2. Scope\nIn scope:\n- \n\nOut of scope:\n- \n\n## 3. Stakeholders\n- Sponsor: \n- Project Manager: \n- Team: \n\n## 4. Success Criteria\n- \n\n## 5. Timeline & Budget\nDuration: \nBudget: \n\n## 6. Risks\n1. \n2. \n3. '
                            }
                          },
                          
                          'stakeholder': {
                            simulation: {
                              title: isNL ? 'Scenario: Conflicterende Stakeholders' : 'Scenario: Conflicting Stakeholders',
                              description: isNL
                                ? 'De sponsor wil snelle delivery, maar end-users vragen om meer functionaliteit. Beide hebben hoge invloed. Hoe handel je dit af?'
                                : 'The sponsor wants fast delivery, but end-users request more functionality. Both have high power. How do you handle this?',
                              options: [
                                isNL ? 'A) Prioriteit geven aan sponsor (budget owner)' : 'A) Prioritize sponsor (budget owner)',
                                isNL ? 'B) Compromis voorstellen: MVP nu, rest later' : 'B) Propose compromise: MVP now, rest later',
                                isNL ? 'C) Workshop organiseren om gezamenlijk te prioriteren' : 'C) Organize workshop to prioritize together'
                              ],
                              correctAnswer: 2
                            },
                            practice: {
                              title: isNL ? 'Praktijkopdracht: Stakeholder Analyse' : 'Practice: Stakeholder Analysis',
                              description: isNL
                                ? 'Maak een stakeholder analyse voor een digitale transformatie project. Identificeer minimaal 8 stakeholders en plaats ze in de Power/Interest matrix.'
                                : 'Create a stakeholder analysis for a digital transformation project. Identify at least 8 stakeholders and place them in the Power/Interest matrix.',
                              template: isNL
                                ? '# Stakeholder Analyse\n\n## Manage Closely (Hoge invloed, Hoge interesse)\n- Stakeholder 1: \n  - Rol: \n  - Belang: \n  - Strategie: \n\n## Keep Satisfied (Hoge invloed, Lage interesse)\n- \n\n## Keep Informed (Lage invloed, Hoge interesse)\n- \n\n## Monitor (Lage invloed, Lage interesse)\n- '
                                : '# Stakeholder Analysis\n\n## Manage Closely (High power, High interest)\n- Stakeholder 1: \n  - Role: \n  - Interest: \n  - Strategy: \n\n## Keep Satisfied (High power, Low interest)\n- \n\n## Keep Informed (Low power, High interest)\n- \n\n## Monitor (Low power, Low interest)\n- '
                            }
                          },
                          'risk': {
                            simulation: {
                              title: isNL ? 'Scenario: Kritiek Risico' : 'Scenario: Critical Risk',
                              description: isNL
                                ? 'Een key developer verlaat het team midden in de sprint. Dit stond in je risicoregister met hoge impact. Wat is je eerste actie?'
                                : 'A key developer leaves the team mid-sprint. This was in your risk register with high impact. What is your first action?',
                              options: [
                                isNL ? 'A) Activeer contingency plan: externe consultant' : 'A) Activate contingency plan: external consultant',
                                isNL ? 'B) Herplan sprint en verdeel werk' : 'B) Replan sprint and distribute work',
                                isNL ? 'C) Escaleer naar sponsor' : 'C) Escalate to sponsor'
                              ],
                              correctAnswer: 0
                            },
                            practice: {
                              title: isNL ? 'Praktijkopdracht: Risico Register' : 'Practice: Risk Register',
                              description: isNL
                                ? 'Maak een risico register voor een software implementatie. Identificeer 5 risico\'s, beoordeel kans × impact.'
                                : 'Create a risk register for software implementation. Identify 5 risks, assess probability × impact.',
                              template: isNL
                                ? '# Risico Register\n\n## Risico 1:\n- Beschrijving: \n- Kans: (L/M/H)\n- Impact: (L/M/H)\n- Mitigatie: \n- Owner: '
                                : '# Risk Register\n\n## Risk 1:\n- Description: \n- Probability: (L/M/H)\n- Impact: (L/M/H)\n- Mitigation: \n- Owner: '
                            }
                          },
                          'default': {
                            simulation: {
                              title: isNL ? 'Scenario: Budget Overschrijding' : 'Scenario: Budget Overrun',
                              description: isNL
                                ? 'Je project dreigt 15% over budget te gaan. De sponsor vraagt om een plan. Wat doe je?'
                                : 'Your project is about to go 15% over budget. The sponsor asks for a plan. What do you do?',
                              options: [
                                isNL ? 'A) Scope reduceren' : 'A) Reduce scope',
                                isNL ? 'B) Extra budget aanvragen' : 'B) Request additional budget',
                                isNL ? 'C) Resources optimaliseren' : 'C) Optimize resources'
                              ],
                              correctAnswer: 1
                            },
                            practice: {
                              title: isNL ? 'Praktijkopdracht: Project Analyse' : 'Practice: Project Analysis',
                              description: isNL
                                ? `Analyseer een scenario voor: ${currentLesson.title}`
                                : `Analyze a scenario for: ${currentLesson.title}`,
                              template: '# Analyse\n\n## Situatie\n\n## Aanpak\n\n## Risico\'s\n'
                            }
                          }
                        };
                        return scenarios[keyword] || scenarios['default'];
                      };
                      const generatedScenario = generateScenario(primaryKeyword);
// Store scenario in state for dialogs
if (!currentScenario || JSON.stringify(currentScenario) !== JSON.stringify(generatedScenario)) {
  setCurrentScenario(generatedScenario);
}
return (
  <>
    {/* Visual + Content are now unified inside contentSections via VisualTemplateRenderer */}
{/* ==================== INTERACTIVE LESSON CONTENT SLIDER ==================== */}
{(currentLesson?.content || currentLesson?.transcript) && (
  <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800 overflow-hidden shadow-xl">
    <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-purple-950/20 border-b-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{isNL ? 'Lesinhoud' : 'Lesson Content'}</h3>
            <p className="text-xs text-muted-foreground font-normal">
              {isNL ? `Sectie ${contentSlide + 1} van ${contentSections.length}` : `Section ${contentSlide + 1} of ${contentSections.length}`}
            </p>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContentSlide(Math.max(0, contentSlide - 1))}
            disabled={contentSlide === 0}
            className="border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
            {contentSlide + 1} / {contentSections.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContentSlide(Math.min(contentSections.length - 1, contentSlide + 1))}
            disabled={contentSlide === contentSections.length - 1}
            className="border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-500 shadow-sm"
          style={{ width: `${((contentSlide + 1) / contentSections.length) * 100}%` }}
        />
      </div>
      {/* Slider Content */}
<div className="relative min-h-[400px] p-8 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
  <div key={contentSlide} className="space-y-6"
          >
            {/* Section Icon & Title */}
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border-4 border-white dark:border-gray-900 ${contentSections[contentSlide].color}`}>
                {contentSections[contentSlide].icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {contentSections[contentSlide].title}
                </h3>
                {contentSections[contentSlide].subtitle && (
                  <p className="text-muted-foreground text-sm">
                    {contentSections[contentSlide].subtitle}
                  </p>
                )}
              </div>
            </div>
            {/* Section Content — React Visual Templates */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {(contentSections[contentSlide] as any).reactContent || (
                contentSections[contentSlide].content
                  ? <div dangerouslySetInnerHTML={{ __html: contentSections[contentSlide].content }} />
                  : null
              )}
            </div>
            {/* Interactive Elements */}
            {contentSections[contentSlide].interactive && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                {contentSections[contentSlide].interactive}
              </div>
            )}
            {/* Key Points */}
            {contentSections[contentSlide].keyPoints && contentSections[contentSlide].keyPoints.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {contentSections[contentSlide].keyPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {contentSections.map((_, i) => (
            <button
              key={i}
              onClick={() => setContentSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === contentSlide
                  ? 'w-10 bg-gradient-to-r from-purple-600 to-pink-600 shadow-md'
                  : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-purple-300 dark:hover:bg-purple-700'
              }`}
            />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)}
{/* ==================== KEY TAKEAWAYS ==================== */}
{currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
  <Card className="border-2 border-blue-200 dark:border-blue-800 mb-6 overflow-hidden shadow-xl">
    <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-blue-950/20 border-b-2 border-blue-200 dark:border-blue-800">
      <CardTitle className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{isNL ? 'Belangrijkste Punten' : 'Key Takeaways'}</h3>
          <p className="text-xs text-muted-foreground font-normal">{isNL ? 'Onthoud deze kernpunten' : 'Remember these key points'}</p>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLesson.keyTakeaways.map((point, i) => {
          const takeawayColors = [
            { bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', border: 'border-blue-200 dark:border-blue-800', icon: 'from-blue-500 to-cyan-500' },
            { bg: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20', border: 'border-purple-200 dark:border-purple-800', icon: 'from-purple-500 to-pink-500' },
            { bg: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20', border: 'border-green-200 dark:border-green-800', icon: 'from-green-500 to-emerald-500' },
            { bg: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20', border: 'border-orange-200 dark:border-orange-800', icon: 'from-orange-500 to-red-500' },
          ];
          const color = takeawayColors[i % 4];
          return (
            <div key={i} className={`flex items-start gap-3 p-4 bg-gradient-to-br ${color.bg} rounded-xl border-2 ${color.border} shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-8 h-8 bg-gradient-to-br ${color.icon} rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-md`}>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{point}</span>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}
    {/* ==================== INTERACTIVE SCENARIOS ==================== */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Simulation Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-xl group" onClick={() => setSimulationDialogOpen(true)}>
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform border-4 border-white dark:border-gray-900">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2">{isNL ? 'Simulatie' : 'Simulation'}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {isNL ? 'Test je kennis met een realistisch scenario' : 'Test your knowledge with a realistic scenario'}
          </p>
          <Button variant="outline" size="sm" className="w-full border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/30 font-semibold">
            <FlaskConical className="w-4 h-4 mr-2" />
            {isNL ? 'Start Simulatie' : 'Start Simulation'}
          </Button>
        </CardContent>
      </Card>
      {/* Practice Card */}
      <Card className="border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-xl group" onClick={() => setPracticeDialogOpen(true)}>
        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform border-4 border-white dark:border-gray-900">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2">{isNL ? 'Praktijkopdracht' : 'Practice'}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {isNL ? 'Pas je kennis toe in de praktijk' : 'Apply your knowledge in practice'}
          </p>
          <Button variant="outline" size="sm" className="w-full border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/30 font-semibold">
            <Briefcase className="w-4 h-4 mr-2" />
            {isNL ? 'Start Opdracht' : 'Start Assignment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  </>
);
                    
                    case 'notes':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {content.labels.notes}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea 
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder={content.labels.notesPlaceholder}
                              className="min-h-[400px] mb-3"
                            />
                            <Button onClick={handleSaveNotes} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              <Save className="w-4 h-4 mr-2" />
                              {content.labels.saveNotes}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    case 'resources':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Download className="w-5 h-5" />
                              {content.labels.resources}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {(currentLesson.resources || content.defaultResources).map((resource, i) => (
                              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{resource.name}</p>
                                    <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      );
                    case 'questions':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" />
                              {isNL ? 'Vragen & Antwoorden' : 'Q&A'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{isNL ? 'Stel je vraag over deze les...' : 'Ask your question about this lesson...'}</p>
                            <Textarea placeholder={isNL ? 'Typ je vraag hier...' : 'Type your question here...'} className="mb-3" />
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              <Send className="w-4 h-4 mr-2" />
                              {isNL ? 'Vraag Stellen' : 'Ask Question'}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    case 'skills':
                      return <SkillsTab isNL={isNL} />;
                    
                    case 'exam':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="w-5 h-5 text-purple-600" />
                              {isNL ? 'Module Examen' : 'Module Exam'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {progress < 100 ? (
                              <>
                                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-6 text-center">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 opacity-50">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                  </div>
                                  <h3 className="font-bold text-lg mb-2">{isNL ? 'Examen Vergrendeld' : 'Exam Locked'}</h3>
                                  <p className="text-muted-foreground mb-4">
                                    {isNL ? `Voltooi alle lessen om het examen te ontgrendelen. Voortgang: ${progress}%` : `Complete all lessons to unlock the exam. Progress: ${progress}%`}
                                  </p>
                                  <Progress value={progress} className="h-3 mb-2" />
                                </div>
                                <Button disabled className="w-full">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {isNL ? 'Examen Starten' : 'Start Exam'}
                                </Button>
                              </>
                            ) : (
                              <div className="space-y-4">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 text-center">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                  </div>
                                  <h3 className="font-bold text-lg mb-2">{isNL ? 'Examen Beschikbaar!' : 'Exam Available!'}</h3>
                                  <p className="text-muted-foreground mb-4">
                                    {isNL ? 'Je hebt alle lessen voltooid. Start het examen om je certificaat te behalen.' : 'You have completed all lessons. Start the exam to earn your certificate.'}
                                  </p>
                                </div>
                                <QuizEngine
                                  lessonId={`exam-${course.id}`}
                                  courseSlug={slug || ''}
                                  apiBase="/api/v1"
                                  language={isNL ? 'nl' : 'en'}
                                  timeLimit={60}
                                  onComplete={(passed) => {
                                    if (passed) {
                                      awardSkillPoints(currentLessonId, 'exam_pass', 2.0);
                                      toast({ title: isNL ? 'Examen gehaald! Je certificaat is beschikbaar.' : 'Exam passed! Your certificate is available.' });
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    
                    case 'certificate':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-yellow-600" />
                              {isNL ? 'Cursus Certificaat' : 'Course Certificate'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border">
                              <div className="flex items-center gap-3 mb-3">
                                <Progress value={progress} className="flex-1 h-3" />
                                <span className="text-sm font-bold">{progress}%</span>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                {progress === 100
                                  ? (isNL ? 'Je hebt de cursus voltooid! Download je certificaat hieronder.' : 'You have completed the course! Download your certificate below.')
                                  : (isNL ? 'Voltooi de cursus en slaag voor het examen om je certificaat te ontvangen.' : 'Complete the course and pass the exam to receive your certificate.')}
                              </p>
                            </div>
                            {progress === 100 && (
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-6 rounded-lg border-2 border-yellow-300 text-center">
                                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                                <h3 className="font-bold text-lg mb-1">{isNL ? 'Gefeliciteerd!' : 'Congratulations!'}</h3>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {isNL ? `Je hebt "${course.titleNL || course.title}" voltooid` : `You completed "${course.title}"`}
                                </p>
                                <p className="text-xs text-muted-foreground">{user?.name || user?.email || 'Student'}</p>
                              </div>
                            )}
                            <Button
                              disabled={progress < 100}
                              className={progress === 100 ? "w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : "w-full"}
                              onClick={() => {
                                if (progress < 100) return;
                                try {
                                  const token = localStorage.getItem('access_token');
                                  const certUrl = `${import.meta.env.VITE_BACKEND_URL || '/api/v1'}/academy/certificates/generate/?course_id=${course.id}`;
                                  fetch(certUrl, {
                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                  })
                                    .then(res => {
                                      if (res.ok) return res.blob();
                                      throw new Error('Certificate not available');
                                    })
                                    .then(blob => {
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `certificate-${course.id}.pdf`;
                                      a.click();
                                      URL.revokeObjectURL(url);
                                    })
                                    .catch(() => {
                                      toast({
                                        title: isNL ? 'Certificaat wordt gegenereerd' : 'Certificate being generated',
                                        description: isNL ? 'Je ontvangt je certificaat binnenkort per e-mail.' : 'You will receive your certificate by email shortly.',
                                      });
                                    });
                                } catch {
                                  toast({
                                    title: isNL ? 'Certificaat wordt gegenereerd' : 'Certificate being generated',
                                    description: isNL ? 'Je ontvangt je certificaat binnenkort per e-mail.' : 'You will receive your certificate by email shortly.',
                                  });
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {isNL ? 'Certificaat Downloaden' : 'Download Certificate'}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    case 'simulation':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FlaskConical className="w-5 h-5 text-blue-600" />
                              {isNL ? 'Simulatie' : 'Simulation'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 text-center">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                <FlaskConical className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="font-bold text-lg mb-2">{isNL ? 'Scenario Simulatie' : 'Scenario Simulation'}</h3>
                              <p className="text-muted-foreground mb-4">{isNL ? 'Oefen met realistische projectscenario\'s' : 'Practice with realistic project scenarios'}</p>
                              <Button 
                                onClick={() => setSimulationDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                              >
                                {isNL ? 'Start Simulatie' : 'Start Simulation'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    case 'practice':
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-orange-600" />
                              {isNL ? 'Praktijkopdracht' : 'Practice Assignment'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 text-center">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="font-bold text-lg mb-2">{isNL ? 'Praktijkopdracht' : 'Practice Assignment'}</h3>
                              <p className="text-muted-foreground mb-4">{isNL ? 'Pas je kennis toe in een echte case' : 'Apply your knowledge to a real case'}</p>
                              <Button 
                                onClick={() => setPracticeDialogOpen(true)}
                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                              >
                                {isNL ? 'Start Opdracht' : 'Start Assignment'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    case 'quiz':
                      return (
                        <div className="p-6">
                          <QuizEngine
                            lessonId={currentLessonId}
                            courseSlug={slug || ''}
                            apiBase="/api/v1"
                            language={isNL ? 'nl' : 'en'}
                            onComplete={(passed) => {
                              if (passed) {
                                awardSkillPoints(currentLessonId, 'quiz_pass');
                                completeLesson(course.id, currentLessonId, allLessons.length);
                                toast({ title: isNL ? 'Quiz voltooid!' : 'Quiz completed!' });
                              }
                            }}
                          />
                        </div>
                      );
                    
                    default:
                      return <div>Tab not found</div>;
                  }
                })()}
                {/* Complete Lesson Button */}
                <div className="flex justify-center pb-8">
                  {!isLessonCompleted(currentLessonId) ? (
                    <Button onClick={markAsComplete} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {content.labels.markComplete}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="text-green-600">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {content.labels.markedComplete}
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
       {/* RIGHT SIDEBAR - Modules + AI Coach */}
{rightSidebarOpen && (
  <aside className="hidden lg:flex lg:flex-col w-96 bg-card border-l border-border overflow-hidden">
    
    {/* Modules - Bovenaan (50%) */}
    <div className="h-1/2 border-b border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-gray-50 dark:bg-gray-900/50">
        <h2 className="font-bold text-sm mb-3">{content.labels.courseContent}</h2>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={[`module-${currentModuleIndex}`]} className="p-2">
          {course.modules.map((module, mIndex) => (
            <AccordionItem key={module.id} value={`module-${mIndex}`} className="border rounded-lg px-2 mb-1">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center gap-2 text-left">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isModuleCompleted(module.id) ? 'bg-green-100 text-green-600' : 'bg-muted'}`}>
                    {isModuleCompleted(module.id) ? <CheckCircle2 className="w-4 h-4" /> : mIndex + 1}
                  </div>
                  <span className="font-medium text-xs">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
              {(module?.lessons || []).map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => goToLesson(lesson.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded text-left text-xs transition-colors ${lesson.id === currentLessonId ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  >
                    <div className="shrink-0">
                      {isLessonCompleted(lesson.id) ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : lesson.id === currentLessonId ? (
                        <PlayCircle className="w-3 h-3 text-purple-600" />
                      ) : (
                        <Circle className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{lesson.title}</span>
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => navigate(`?lesson=${currentLessonId}&tab=exam`)}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 transition-colors border border-purple-200"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span className="flex-1 text-sm font-medium text-purple-700 dark:text-purple-300">
                    {isNL ? 'Module Examen' : 'Module Exam'}
                  </span>
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="p-2 mt-2">
          <button
            onClick={() => navigate(`?lesson=${currentLessonId}&tab=certificate`)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 transition-colors border-2 border-yellow-300"
          >
            <Award className="w-5 h-5 text-yellow-600" />
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm text-yellow-700 dark:text-yellow-300">
                {isNL ? 'Cursus Certificaat' : 'Course Certificate'}
              </div>
              <div className="text-xs text-yellow-600">
                {progress === 100 ? (isNL ? 'Download nu' : 'Download now') : (isNL ? 'Voltooi cursus' : 'Complete course')}
              </div>
            </div>
          </button>
        </div>
      </ScrollArea>
    </div>
    {/* AI Coach - Onderaan (50%) */}
    <div className="flex-1 overflow-hidden">
      <AiCoachPanel
        lessonId={currentLessonId}
        courseId={course.id}
        userContext={{
          sector: user?.sector,
          role: user?.role,
          methodology: course.title.includes('PRINCE2') ? 'PRINCE2' : 'Generic'
        }}
      />
    </div>
    
  </aside>
)}
  </div>
      {/* ========================================== */}
      {/* ALL DIALOGS */}
      {/* ========================================== */}
      {/* Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              {content.labels.congratulations}
            </DialogTitle>
            <DialogDescription>
              {content.labels.lessonCompleted}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600">
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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
              <Trophy className="w-5 h-5 text-orange-600" />
              {content.labels.courseCompleted}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-600 to-pink-600">
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
            <Button className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              {content.labels.getCertificate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: Simulation Dialog with Score Tracking */}
      <Dialog open={simulationDialogOpen} onOpenChange={setSimulationDialogOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              {isNL ? 'Project Scenario Simulatie' : 'Project Scenario Simulation'}
            </DialogTitle>
            <DialogDescription>
              {isNL ? 'Doorloop een realistische projectsituatie en maak beslissingen' : 'Walk through a realistic project situation and make decisions'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 mb-4 border-2 border-blue-200">
              <h3 className="font-bold mb-2">{currentScenario?.simulation.title || 'Loading...'}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {currentScenario?.simulation.description || ''}
              </p>
              <div className="space-y-2">
                {(currentScenario?.simulation.options || []).map((option, i) => (
                  <Button 
                    key={i} 
                    variant={currentSimulationAnswer === i ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start text-left h-auto py-3",
                      currentSimulationAnswer !== null && i === currentScenario?.simulation.correctAnswer && "bg-green-100 dark:bg-green-900/30 border-green-600",
                      currentSimulationAnswer === i && i !== currentScenario?.simulation.correctAnswer && "bg-red-100 dark:bg-red-900/30 border-red-600"
                    )}
                    onClick={() => handleSimulationAnswer(i, currentScenario.simulation.correctAnswer)}
                    disabled={currentSimulationAnswer !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              {/* Hint section */}
              <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">{isNL ? 'Denk aan:' : 'Consider:'}</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• {isNL ? 'Impact op triple constraint (tijd/scope/kosten)' : 'Impact on triple constraint (time/scope/cost)'}</li>
                      <li>• {isNL ? 'Stakeholder management: wie moet je informeren?' : 'Stakeholder management: who should you inform?'}</li>
                      <li>• {isNL ? 'Lange vs korte termijn gevolgen' : 'Short vs long term consequences'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSimulationDialogOpen(false);
              setCurrentSimulationAnswer(null);
            }}>
              {isNL ? 'Sluiten' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: Score Result Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentSimulationAnswer === currentScenario?.simulation.correctAnswer ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  {isNL ? 'Correct!' : 'Correct!'}
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  {isNL ? 'Helaas...' : 'Not quite...'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {currentSimulationAnswer === currentScenario?.simulation.correctAnswer ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-muted-foreground">
                  {isNL ? 'Uitstekend! Je hebt de beste beslissing genomen.' : 'Excellent! You made the best decision.'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {isNL ? 'De beste keuze was optie ' : 'The best choice was option '}
                  {String.fromCharCode(65 + (currentScenario?.simulation.correctAnswer || 0))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isNL ? 'Probeer het opnieuw en denk na over de gevolgen op lange termijn.' : 'Try again and think about long-term consequences.'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowScoreDialog(false)}>
              {isNL ? 'OK' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: Practice Dialog with Save & AI Feedback */}
      <Dialog open={practiceDialogOpen} onOpenChange={setPracticeDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              {currentScenario?.practice.title || 'Practice Assignment'}
            </DialogTitle>
            <DialogDescription>
              {isNL ? 'Pas je kennis toe in een realistische case' : 'Apply your knowledge to a realistic case'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 py-4">
            <div className="space-y-4 pr-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border-2 border-orange-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {isNL ? 'Opdracht' : 'Assignment'}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {currentScenario?.practice.description || ''}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {isNL ? 'Beoordelingscriteria:' : 'Grading Criteria:'}
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ {isNL ? 'Compleetheid: Alle gevraagde onderdelen behandeld' : 'Completeness: All requested parts covered'}</li>
                  <li>✓ {isNL ? 'Realisme: Praktisch toepasbare oplossingen' : 'Realism: Practically applicable solutions'}</li>
                  <li>✓ {isNL ? 'Structuur: Helder en logisch opgebouwd' : 'Structure: Clear and logical build-up'}</li>
                  <li>✓ {isNL ? 'Diepgang: Concrete details en overwegingen' : 'Depth: Concrete details and considerations'}</li>
                </ul>
              </div>
              
              <Textarea 
                value={currentPracticeContent}
                onChange={(e) => setCurrentPracticeContent(e.target.value)}
                placeholder={currentScenario?.practice.template || ''}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </ScrollArea>
          
          <DialogFooter className="border-t pt-4 flex-row gap-2">
            <Button variant="outline" onClick={() => setPracticeDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button 
              variant="outline"
              onClick={generateAIFeedback}
              disabled={aiFeedbackLoading || currentPracticeContent.length < 50}
            >
              {aiFeedbackLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isNL ? 'AI analyseert...' : 'AI analyzing...'}
                </>
              ) : (
                <>
                  <Sparkle className="w-4 h-4 mr-2" />
                  {isNL ? 'AI Feedback' : 'AI Feedback'}
                </>
              )}
            </Button>
            <Button 
              onClick={handleSavePracticeWork}
              disabled={savingPractice || currentPracticeContent.length < 50}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
            >
              {savingPractice ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isNL ? 'Opslaan...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isNL ? 'Opslaan & Indienen' : 'Save & Submit'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: AI Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              {isNL ? '🤖 AI Feedback' : '🤖 AI Feedback'}
            </DialogTitle>
            <DialogDescription>
              {isNL ? 'Automatische analyse van je opdracht' : 'Automated analysis of your assignment'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] py-4">
            <div className="prose dark:prose-invert max-w-none">
              {renderMarkdownBlock(currentFeedback)}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowFeedbackDialog(false)}>
              {isNL ? 'Sluiten' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: Achievement Unlocked Dialog */}
      <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              {isNL ? 'Achievement Unlocked!' : '🏆 Achievement Unlocked!'}
            </DialogTitle>
          </DialogHeader>
          {unlockedAchievement && (
            <div className="py-6 text-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${unlockedAchievement.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                <unlockedAchievement.icon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{unlockedAchievement.title}</h3>
              <p className="text-muted-foreground">{unlockedAchievement.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowAchievementDialog(false)} className="w-full">
              {isNL ? 'Geweldig!' : 'Awesome!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* NEW: All Achievements Dialog */}
      <Dialog open={showAchievementDialog && !unlockedAchievement} onOpenChange={setShowAchievementDialog}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              {isNL ? 'Jouw Achievements' : '🏆 Your Achievements'}
            </DialogTitle>
            <DialogDescription>
              {achievements.filter(a => a.unlocked).length}/{achievements.length} {isNL ? 'ontgrendeld' : 'unlocked'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={cn(
                  "border-2",
                  achievement.unlocked ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20" : "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center shrink-0 ${!achievement.unlocked && 'grayscale'}`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        {achievement.maxProgress && (
                          <div>
                            <Progress value={(achievement.progress || 0) / (achievement.maxProgress || 1) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.progress || 0}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}
                        {achievement.unlocked && (
                          <Badge className="bg-yellow-600 text-white mt-2">
                            <Check className="w-3 h-3 mr-1" />
                            {isNL ? 'Ontgrendeld' : 'Unlocked'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default CourseLearningPlayer;