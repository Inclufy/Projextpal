// ============================================
// ACADEMY DATA INDEX
// ============================================
// Main export file for all academy data
// Only exports courses that have actual content
// ============================================

// ============================================
// TYPES
// ============================================
export type { 
  Course, 
  Module, 
  Lesson, 
  Instructor, 
  Category,
  Resource,
  QuizQuestion,
  UserProgress,
  CourseProgress,
  Enrollment,
} from './types';

// ============================================
// BRAND COLORS
// ============================================
export { BRAND } from './brand';

// ============================================
// CATEGORIES
// ============================================
export { categories } from './categories';

// ============================================
// INSTRUCTORS
// ============================================
export { instructors } from './instructors';

// ============================================
// COURSES - Only courses with content
// ============================================
export { 
  // Main exports
  courses,
  coursesWithContent,
  academyCourses,
  
  // Individual courses
  pmFundamentalsCourse,
  pmFundamentalsModules,
  prince2Course,
  prince2Modules,
  scrumCourse,
  scrumModules,
  waterfallCourse,
  waterfallModules,
  kanbanCourse,
  kanbanModules,
  agileFundamentalsCourse,
  agileModules,
  leanSixSigmaCourse,
  leanSixSigmaModules,
  
  // Helper functions
  getCourseById,
  getModulesByCourseId,
  courseHasContent,
  getLessonById,
  getFeaturedCourses,
  getCoursesByCategory,
  getCoursesByMethodology,
  getBestsellerCourses,
  getNewCourses,
  getCourseStats,
  getCourseLessonCount,
  getCourseModuleCount,
} from './courses';

// ============================================
// LEARNING PATHS
// ============================================
import { BRAND } from './brand';
import { 
  Target, Award, TrendingUp, Rocket, Crown,
  LucideIcon
} from 'lucide-react';

export interface LearningPath {
  id: string;
  title: string;
  titleNL: string;
  description: string;
  descriptionNL: string;
  icon: LucideIcon;
  gradient: string;
  courses: string[];
  duration: number;
  certificate: boolean;
}

export const learningPaths: LearningPath[] = [
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
    certificate: true,
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
    certificate: true,
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
    certificate: true,
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
    certificate: true,
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
    certificate: true,
  },
];

export const getLearningPathById = (id: string): LearningPath | undefined => {
  return learningPaths.find(path => path.id === id);
};