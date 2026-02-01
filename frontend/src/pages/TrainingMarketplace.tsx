import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Clock,
  BookOpen,
  Award,
  Play,
  Star,
  Users,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Trophy,
  Flame,
  Sparkles,
  Heart,
  Share2,
  Filter,
  BarChart3,
  Target,
  Zap,
  Shield,
  Layers,
  GitBranch,
  Settings,
  Brain,
  TrendingUp,
  PlayCircle,
  Check,
  Globe,
  Moon,
  Sun,
  LogIn,
  Rocket,
  Menu,
  X,
  Building2,
  FolderKanban,
  Crown,
  RefreshCw,
  Trello,
  Compass,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import courses data - only courses with content
import { 
  courses, 
  categories, 
  getFeaturedCourses,
  getModulesByCourseId,
  BRAND,
  Course,
} from "@/data/academy";

// ============================================
// SAFE HELPER FUNCTIONS
// ============================================
const iconMap: Record<string, LucideIcon> = {
  Rocket, Zap, TrendingUp, Crown, Users, Target, RefreshCw,
  Trello, Layers, Shield, Building2, GitBranch, FolderKanban,
  Award, Compass, BookOpen, GraduationCap, Trophy, Brain,
  Settings, Play, PlayCircle, Star, Heart, Flame, Sparkles,
  Clock, Search, Filter, BarChart3, Check, CheckCircle2,
};

const getIconComponent = (icon: unknown): LucideIcon => {
  if (!icon) return Target;
  if (typeof icon === 'string') return iconMap[icon] || Target;
  if (typeof icon === 'function') return icon as LucideIcon;
  return Target;
};

// Get module count from course
const getModuleCount = (course: Course): number => {
  // Try to get actual modules from courseModules
  const modules = getModulesByCourseId(course.id);
  if (modules && modules.length > 0) return modules.length;
  // Fallback to modules property
  if (typeof course.modules === 'number') return course.modules;
  if (Array.isArray(course.modules)) return course.modules.length;
  return 0;
};

// Get lesson count from course modules
const getLessonCount = (course: Course): number => {
  const modules = getModulesByCourseId(course.id);
  if (modules && modules.length > 0) {
    return modules.reduce((total, mod) => total + (mod.lessons?.length || 0), 0);
  }
  return 0;
};

const safeStringArray = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item): item is string => typeof item === 'string');
};

const safeString = (val: unknown, fallback = ''): string => {
  if (typeof val === 'string') return val;
  return fallback;
};

const safeNumber = (val: unknown, fallback = 0): number => {
  if (typeof val === 'number') return val;
  return fallback;
};

// ============================================
// LEARNING PATHS (only courses with content)
// ============================================
const learningPaths = [
  {
    id: 'pm-starter',
    title: 'PM Starter',
    titleNL: 'PM Starter',
    description: 'Start your PM journey with fundamentals',
    descriptionNL: 'Start je PM reis met de basis',
    icon: Rocket,
    gradient: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
    courses: ['pm-fundamentals', 'agile-fundamentals'],
    duration: 24,
  },
  {
    id: 'agile-expert',
    title: 'Agile Expert',
    titleNL: 'Agile Expert',
    description: 'Master Agile methodologies',
    descriptionNL: 'Beheers Agile methodologieën',
    icon: Target,
    gradient: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.emerald})`,
    courses: ['agile-fundamentals', 'scrum-master', 'kanban-practitioner'],
    duration: 30,
  },
  {
    id: 'traditional-pm',
    title: 'Traditional PM',
    titleNL: 'Traditioneel PM',
    description: 'Master structured methodologies',
    descriptionNL: 'Beheers gestructureerde methodologieën',
    icon: Award,
    gradient: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.orange})`,
    courses: ['pm-fundamentals', 'waterfall-pm', 'prince2-foundation'],
    duration: 40,
  },
  {
    id: 'process-excellence',
    title: 'Process Excellence',
    titleNL: 'Process Excellence',
    description: 'Optimize with Lean Six Sigma',
    descriptionNL: 'Optimaliseer met Lean Six Sigma',
    icon: TrendingUp,
    gradient: `linear-gradient(135deg, ${BRAND.cyan}, ${BRAND.blue})`,
    courses: ['lean-six-sigma', 'kanban-practitioner'],
    duration: 32,
  },
  {
    id: 'complete-pm',
    title: 'Complete PM',
    titleNL: 'Complete PM',
    description: 'Full PM certification path',
    descriptionNL: 'Volledig PM certificeringstraject',
    icon: Crown,
    gradient: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`,
    courses: ['pm-fundamentals', 'prince2-foundation', 'scrum-master', 'lean-six-sigma'],
    duration: 80,
  },
];

// ============================================
// LOGO COMPONENT
// ============================================
const ProjeXtPalLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
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
          <linearGradient id={`xGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <polygon fill={`url(#xGrad-${size})`} points="1656 586 1235 1008 915 1008 1337 586 973 222 1292 222 1656 586" />
      </svg>
      <span className={`font-bold ${text}`}>
        Proje<span style={{ color: BRAND.pink }}>X</span>tPal
      </span>
    </div>
  );
};

// ============================================
// LANGUAGE SELECTOR
// ============================================
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-primary/10' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const TrainingMarketplace = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMethodology, setSelectedMethodology] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isNL = language === 'nl';

  // ============================================
  // TRANSLATIONS - Updated with real stats
  // ============================================
  const content = {
    nav: {
      home: 'Home',
      courses: isNL ? 'Cursussen' : 'Courses',
      paths: isNL ? 'Leertrajecten' : 'Learning Paths',
      certificates: isNL ? 'Certificaten' : 'Certificates',
      pricing: isNL ? 'Prijzen' : 'Pricing',
      login: isNL ? 'Inloggen' : 'Login',
      startFree: isNL ? 'Start Gratis' : 'Start Free',
    },
    hero: {
      badge: isNL ? '🎓 ProjectPal Learning Academy' : '🎓 ProjectPal Learning Academy',
      title1: isNL ? 'Word Een Expert In' : 'Become An Expert In',
      title2: isNL ? 'Project Management' : 'Project Management',
      subtitle: isNL 
        ? 'Ontdek professionele cursussen van industrie-experts. Van beginner tot expert met praktische opdrachten, quizzes en officiële certificaten.'
        : 'Discover professional courses from industry experts. From beginner to expert with hands-on assignments, quizzes and official certificates.',
      searchPlaceholder: isNL ? 'Zoek cursussen, onderwerpen of skills...' : 'Search courses, topics or skills...',
      trustedBy: isNL ? 'Vertrouwd door 10.000+ professionals wereldwijd' : 'Trusted by 10,000+ professionals worldwide',
    },
    // Real stats: 23 modules, 99 lessons, ~95 hours, 7 certificates
    stats: [
      { value: '23', label: isNL ? 'Modules' : 'Modules', icon: BookOpen },
      { value: '99', label: isNL ? 'Lessen' : 'Lessons', icon: PlayCircle },
      { value: '95+', label: isNL ? 'Uur Video' : 'Hours Video', icon: Clock },
      { value: '7', label: isNL ? 'Certificaten' : 'Certificates', icon: Award },
    ],
    sections: {
      featured: isNL ? 'Uitgelichte Cursussen' : 'Featured Courses',
      popular: isNL ? 'Meest Populair' : 'Most Popular',
      paths: isNL ? 'Leertrajecten' : 'Learning Paths',
      allCourses: isNL ? 'Alle Cursussen' : 'All Courses',
      methodologies: isNL ? 'Per Methodologie' : 'By Methodology',
    },
    labels: {
      levels: isNL ? 'Levels' : 'Levels',
      modules: isNL ? 'Modules' : 'Modules',
      lessons: isNL ? 'Lessen' : 'Lessons',
      hours: isNL ? 'uur' : 'hours',
      students: isNL ? 'studenten' : 'students',
      startTraining: isNL ? 'Start Training' : 'Start Training',
      viewCourse: isNL ? 'Bekijk Cursus' : 'View Course',
      certificate: isNL ? 'Certificaat inbegrepen' : 'Certificate included',
      new: isNL ? 'Nieuw' : 'New',
      bestseller: isNL ? 'Bestseller' : 'Bestseller',
      free: isNL ? 'Gratis' : 'Free',
      freeForCustomers: isNL ? 'Gratis voor klanten' : 'Free for customers',
      courses: isNL ? 'cursussen' : 'courses',
      viewAll: isNL ? 'Bekijk Alle' : 'View All',
    },
    cta: {
      title: isNL ? 'Klaar Om Te Beginnen?' : 'Ready To Get Started?',
      subtitle: isNL ? 'Start vandaag nog met je eerste cursus' : 'Start your first course today',
      button: isNL ? 'Start Gratis Proefles' : 'Start Free Trial Lesson',
    },
    methodologies: {
      agile: 'Agile',
      scrum: 'Scrum',
      kanban: 'Kanban',
      prince2: 'PRINCE2',
      waterfall: 'Waterfall',
      lean_six_sigma: 'Lean Six Sigma',
      fundamentals: 'Fundamentals',
    } as Record<string, string>,
  };

  // Get category counts
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return courses.length;
    return courses.filter(c => c.category === categoryId).length;
  };

  // Methodology filter options - only methodologies with courses
  const methodologyFilters = [
    { id: 'fundamentals', label: 'Fundamentals', color: BRAND.purple },
    { id: 'agile', label: 'Agile', color: BRAND.blue },
    { id: 'scrum', label: 'Scrum', color: BRAND.green },
    { id: 'kanban', label: 'Kanban', color: BRAND.purple },
    { id: 'prince2', label: 'PRINCE2', color: BRAND.amber },
    { id: 'waterfall', label: 'Waterfall', color: BRAND.cyan },
    { id: 'lean_six_sigma', label: 'Lean Six Sigma', color: BRAND.emerald },
  ];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const title = safeString(course.title);
    const titleNL = safeString(course.titleNL);
    const desc = safeString(course.description);
    const descNL = safeString(course.descriptionNL);
    const tags = safeStringArray(course.tags);
    const tagsNL = safeStringArray(course.tagsNL);
    
    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tagsNL.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesMethodology = !selectedMethodology || course.methodology === selectedMethodology;
    return matchesSearch && matchesCategory && matchesMethodology;
  });

  const featuredCourses = getFeaturedCourses();

  // ============================================
  // LEVEL DOTS COMPONENT
  // ============================================
  const LevelDots = ({ levels, color }: { levels: number; color: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((dot) => (
        <div 
          key={dot}
          className="w-2 h-2 rounded-full transition-all"
          style={{ 
            backgroundColor: dot <= levels ? color : 'transparent',
            border: `1.5px solid ${dot <= levels ? color : '#d1d5db'}`
          }}
        />
      ))}
    </div>
  );

  // ============================================
  // COURSE CARD COMPONENT
  // ============================================
  const CourseCard = ({ course }: { course: Course }) => {
    const title = safeString(isNL ? course.titleNL : course.title, course.title);
    const description = safeString(isNL ? course.descriptionNL : course.description, course.description);
    const tags = safeStringArray(isNL ? course.tagsNL : course.tags);
    const IconComponent = getIconComponent(course.icon);
    const moduleCount = getModuleCount(course);
    const lessonCount = getLessonCount(course);
    const levelCount = safeNumber(course.levels, 1);
    const duration = safeNumber(course.duration, 0);

    return (
      <Card 
        className="group relative bg-card border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer"
        onClick={() => navigate(`/academy/course/${course.id}`)}
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {course.new && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.green }}>
              <Sparkles className="h-3 w-3 mr-1" />
              {content.labels.new}
            </Badge>
          )}
          {course.bestseller && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.orange }}>
              <Flame className="h-3 w-3 mr-1" />
              {content.labels.bestseller}
            </Badge>
          )}
          {course.freeForCustomers && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.purple }}>
              <Award className="h-3 w-3 mr-1" />
              {content.labels.freeForCustomers}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 pt-12">
          {/* Top Row: Icon + Level Dots */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
              style={{ background: course.gradient }}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <LevelDots levels={levelCount} color={course.color || BRAND.purple} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Course Stats - Now showing lessons */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{moduleCount} {content.labels.modules}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4" />
              <span>{lessonCount} {content.labels.lessons}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>~{duration} {content.labels.hours}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.slice(0, 4).map((tag, i) => (
              <span 
                key={i} 
                className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full rounded-xl h-11 shadow-md group-hover:shadow-lg transition-all text-white font-medium"
            style={{ background: course.gradient }}
            onClick={(e) => { e.stopPropagation(); navigate(`/academy/course/${course.id}`); }}
          >
            {content.labels.startTraining}
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // FEATURED COURSE CARD COMPONENT
  // ============================================
  const FeaturedCourseCard = ({ course }: { course: Course }) => {
    const title = safeString(isNL ? course.titleNL : course.title, course.title);
    const description = safeString(isNL ? course.descriptionNL : course.description, course.description);
    const tags = safeStringArray(isNL ? course.tagsNL : course.tags);
    const IconComponent = getIconComponent(course.icon);
    const moduleCount = getModuleCount(course);
    const lessonCount = getLessonCount(course);
    const levelCount = safeNumber(course.levels, 1);
    const duration = safeNumber(course.duration, 0);
    const rating = safeNumber(course.rating, 4.5);
    const students = safeNumber(course.students, 0);

    return (
      <Card 
        className="group relative bg-card border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl cursor-pointer"
        onClick={() => navigate(`/academy/course/${course.id}`)}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
          style={{ background: course.gradient }}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {course.new && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.green }}>
              <Sparkles className="h-3 w-3 mr-1" />
              {content.labels.new}
            </Badge>
          )}
          {course.bestseller && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.orange }}>
              <Flame className="h-3 w-3 mr-1" />
              {content.labels.bestseller}
            </Badge>
          )}
          {course.freeForCustomers && (
            <Badge className="text-white border-0 shadow-lg" style={{ backgroundColor: BRAND.purple }}>
              <Award className="h-3 w-3 mr-1" />
              {content.labels.freeForCustomers}
            </Badge>
          )}
        </div>

        {/* Wishlist & Share */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button 
            className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
          <button 
            className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <CardHeader className="pt-14 pb-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ background: course.gradient }}
            >
              <IconComponent className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{rating}</span>
                </div>
                <span>•</span>
                <span>{students.toLocaleString()} {content.labels.students}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Course Stats - Now showing lessons */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{moduleCount} {content.labels.modules}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4" />
              <span>{lessonCount} {content.labels.lessons}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>~{duration} {content.labels.hours}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i} 
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: course.gradient }}
              >
                {safeString(course.instructor.avatar, '??')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{safeString(course.instructor.name)}</p>
                <p className="text-xs text-muted-foreground truncate">{safeString(course.instructor.title)}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-4 border-t border-border/50">
            <Button 
              className="w-full rounded-xl h-11 shadow-lg group-hover:shadow-xl transition-all text-white"
              style={{ background: course.gradient }}
              onClick={(e) => { e.stopPropagation(); navigate(`/academy/course/${course.id}`); }}
            >
              {content.labels.viewCourse}
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Certificate Badge */}
          {course.certificate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
              <Award className="h-4 w-4" style={{ color: BRAND.orange }} />
              <span>{content.labels.certificate}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // TESTIMONIALS
  // ============================================
  const testimonials = [
    {
      quote: isNL ? 'Deze training heeft mijn carrière getransformeerd. Nu werk ik als Senior PM bij een Fortune 500 bedrijf.' : 'This training transformed my career. Now I work as a Senior PM at a Fortune 500 company.',
      author: 'Jennifer K.',
      role: 'Senior Project Manager',
      avatar: 'JK',
    },
    {
      quote: isNL ? 'De praktische aanpak en AI-ondersteuning maken het leren zo veel effectiever.' : 'The hands-on approach and AI support make learning so much more effective.',
      author: 'Michael R.',
      role: 'Scrum Master',
      avatar: 'MR',
    },
    {
      quote: isNL ? 'Eindelijk een platform dat theorie en praktijk perfect combineert.' : 'Finally a platform that perfectly combines theory and practice.',
      author: 'Sophie L.',
      role: 'Program Director',
      avatar: 'SL',
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse" style={{ backgroundColor: `${BRAND.purple}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: `${BRAND.pink}08`, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: `${BRAND.green}08`, animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <button onClick={() => navigate('/landing')} className="flex items-center gap-2">
                <ProjeXtPalLogo size="sm" />
              </button>
              
              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => navigate('/landing')} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {content.nav.home}
                </button>
                <button className="text-foreground font-medium flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" style={{ color: BRAND.purple }} />
                  {content.nav.courses}
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {content.nav.paths}
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {content.nav.certificates}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" className="hidden md:inline-flex gap-2" onClick={() => navigate('/login')}>
                <LogIn className="h-4 w-4" />{content.nav.login}
              </Button>
              <Button 
                className="hidden md:inline-flex gap-2 rounded-full text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})`, boxShadow: `0 4px 20px ${BRAND.purple}40` }}
                onClick={() => navigate('/login')}
              >
                <Rocket className="h-4 w-4" />{content.nav.startFree}
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-4 space-y-3">
            <button onClick={() => navigate('/landing')} className="block w-full text-left py-2">{content.nav.home}</button>
            <button className="block w-full text-left py-2 text-primary font-medium">{content.nav.courses}</button>
            <button className="block w-full text-left py-2">{content.nav.paths}</button>
            <button className="block w-full text-left py-2">{content.nav.certificates}</button>
            <div className="pt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>{content.nav.login}</Button>
              <Button className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }} onClick={() => navigate('/login')}>{content.nav.startFree}</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(180deg, ${BRAND.purple}10 0%, transparent 50%, ${BRAND.green}05 100%)` }} />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge - Updated to show 7 courses */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
              style={{ backgroundColor: `${BRAND.purple}15`, color: BRAND.purple }}
            >
              <GraduationCap className="w-4 h-4" />
              {content.hero.badge}
              <Badge className="ml-1 text-white" style={{ backgroundColor: BRAND.green }}>{courses.length} COURSES</Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {content.hero.title1}
              <br />
              <span style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink}, ${BRAND.green})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {content.hero.title2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {content.hero.subtitle}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={content.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-5 rounded-full border-2 border-border/50 focus:border-primary shadow-lg text-base bg-background/80 backdrop-blur-sm"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              >
                <Search className="h-4 w-4 mr-2" />
                {isNL ? 'Zoeken' : 'Search'}
              </Button>
            </div>

            {/* Trust */}
            <p className="text-sm text-muted-foreground mb-6">{content.hero.trustedBy}</p>

            {/* Stats - Real numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {content.stats.map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="p-2 rounded-xl w-fit mx-auto mb-2" style={{ backgroundColor: `${BRAND.purple}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: BRAND.purple }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: BRAND.purple }}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {/* Learning Paths */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{content.sections.paths}</h2>
              <p className="text-muted-foreground">{isNL ? 'Gestructureerde leertrajecten naar certificering' : 'Structured learning paths to certification'}</p>
            </div>
            <Button variant="ghost" className="gap-2" style={{ color: BRAND.purple }}>
              {content.labels.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {learningPaths.map((path, i) => {
              const pathTitle = safeString(isNL ? path.titleNL : path.title, path.title);
              const pathDesc = safeString(isNL ? path.descriptionNL : path.description, path.description);
              const pathCourses = Array.isArray(path.courses) ? path.courses : [];
              const PathIcon = path.icon;
              const pathDuration = safeNumber(path.duration, 0);
              
              return (
                <Card 
                  key={i} 
                  className="relative overflow-hidden text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group rounded-2xl"
                  style={{ background: path.gradient }}
                >
                  <CardContent className="p-6 relative z-10">
                    <div className="p-3 rounded-xl bg-white/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                      <PathIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{pathTitle}</h3>
                    <p className="text-white/80 text-xs mb-4 line-clamp-2">{pathDesc}</p>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {pathCourses.length} {content.labels.courses}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pathDuration} {content.labels.hours}
                      </span>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="w-24 h-24 -mr-6 -mb-6" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Methodology Filters */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{content.sections.methodologies}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedMethodology(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedMethodology
                  ? 'text-white shadow-lg'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
              }`}
              style={!selectedMethodology ? { background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` } : {}}
            >
              {isNL ? 'Alle' : 'All'}
            </button>
            {methodologyFilters.map((method) => {
              const count = courses.filter(c => c.methodology === method.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethodology(selectedMethodology === method.id ? null : method.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedMethodology === method.id
                      ? 'text-white shadow-lg'
                      : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                  }`}
                  style={selectedMethodology === method.id ? { backgroundColor: method.color } : {}}
                >
                  {method.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedMethodology === method.id ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => {
              const label = safeString(isNL ? cat.labelNL : cat.labelEN, cat.labelEN);
              const count = getCategoryCount(cat.id);
              if (count === 0 && cat.id !== 'all') return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'text-white shadow-lg'
                      : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                  }`}
                  style={selectedCategory === cat.id ? { background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` } : {}}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Courses */}
        {selectedCategory === 'all' && !searchQuery && !selectedMethodology && featuredCourses.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">{content.sections.featured}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 6).map((course) => (
                <FeaturedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* All Courses */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {searchQuery 
                ? `${isNL ? 'Resultaten voor' : 'Results for'} "${searchQuery}"` 
                : selectedMethodology 
                  ? `${content.methodologies[selectedMethodology] || selectedMethodology} ${isNL ? 'Cursussen' : 'Courses'}`
                  : content.sections.allCourses}
            </h2>
            <span className="text-muted-foreground">{filteredCourses.length} {content.labels.courses}</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isNL ? 'Geen cursussen gevonden' : 'No courses found'}
              </h3>
              <p className="text-muted-foreground">
                {isNL ? 'Probeer andere zoektermen of filters' : 'Try different search terms or filters'}
              </p>
            </div>
          )}
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isNL ? 'Wat Onze Studenten Zeggen' : 'What Our Students Say'}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card 
            className="relative overflow-hidden border-0 rounded-3xl"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>
            <CardContent className="relative p-12 md:p-16 text-center text-white">
              <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.cta.title}
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {content.cta.subtitle}
              </p>
              <Button 
                size="lg"
                className="bg-white hover:bg-white/90 rounded-full px-10 h-14 text-lg font-semibold shadow-xl"
                style={{ color: BRAND.purple }}
                onClick={() => navigate('/login')}
              >
                {content.cta.button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ProjeXtPalLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2025 ProjeXtPal Academy. {isNL ? 'Alle rechten voorbehouden.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrainingMarketplace;