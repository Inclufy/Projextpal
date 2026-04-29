// ============================================
// COURSES INDEX - UPDATED
// ============================================
// Only exports courses that have actual content (modules + lessons)
// Total: 11 courses, 35 modules, 166 lessons
// Use getCourseStats() to get real-time accurate stats
// ============================================

import { Course, Module } from '../types';

// ============================================
// IMPORT COURSES WITH FULL CONTENT
// ============================================
import { pmFundamentalsCourse, pmFundamentalsModules } from './pm-fundamentals';
import { prince2Course, prince2Modules } from './prince2';
import { scrumCourse, scrumModules } from './scrum';
import { waterfallCourse, waterfallModules } from './waterfall';
import { kanbanCourse, kanbanModules } from './kanban';
import { agileFundamentalsCourse, agileModules } from './agile';
import { leanSixSigmaCourse, leanSixSigmaModules } from './lean-six-sigma';
import { leadershipCourse, leadershipModules } from './leadership';
import { programManagementCourse, programManagementModules } from './program-management';
import { safeCourse, safeModules } from './safe';
import { msProjectCourse, msProjectModules } from './ms-project';
import { aiLiteracyCourse, aiLiteracyModules } from './ai-literacy';
import { stakeholderManagementCourse, stakeholderManagementModules } from './stakeholder-management';

// ============================================
// RE-EXPORT INDIVIDUAL COURSES & MODULES
// ============================================
export {
  // PM Fundamentals
  pmFundamentalsCourse,
  pmFundamentalsModules,
  // PRINCE2
  prince2Course,
  prince2Modules,
  // Scrum
  scrumCourse,
  scrumModules,
  // Waterfall
  waterfallCourse,
  waterfallModules,
  // Kanban
  kanbanCourse,
  kanbanModules,
  // Agile
  agileFundamentalsCourse,
  agileModules,
  // Lean Six Sigma
  leanSixSigmaCourse,
  leanSixSigmaModules,
  // Leadership PM
  leadershipCourse,
  leadershipModules,
  // Program Management
  programManagementCourse,
  programManagementModules,
  // SAFe
  safeCourse,
  safeModules,
  // MS Project
  msProjectCourse,
  msProjectModules,
  // AI Literacy
  aiLiteracyCourse,
  aiLiteracyModules,
  // Stakeholder Management
  stakeholderManagementCourse,
  stakeholderManagementModules,
};

// ============================================
// COURSES WITH CONTENT (for marketplace)
// ============================================
// These are the only courses shown in TrainingMarketplace
// Total: 12 courses, 39 modules, 182 lessons
// Use getCourseStats() to get real-time accurate stats
export const coursesWithContent: Course[] = [
  pmFundamentalsCourse,      // 5 modules, 26 lessons, ~8h
  prince2Course,             // 4 modules, 20 lessons, ~12h
  scrumCourse,               // 3 modules, 13 lessons, ~8h
  waterfallCourse,           // 2 modules, 10 lessons, ~6h
  kanbanCourse,              // 2 modules, 10 lessons, ~6h
  agileFundamentalsCourse,   // 2 modules, 10 lessons, ~8h
  leanSixSigmaCourse,        // 5 modules, 10 lessons, ~24h
  leadershipCourse,          // 3 modules, 16 lessons, ~12h
  programManagementCourse,   // 3 modules, 16 lessons, ~14h
  safeCourse,                // 3 modules, 17 lessons, ~16h
  msProjectCourse,           // 3 modules, 18 lessons, ~10h
  aiLiteracyCourse,          // 4 modules, 16 lessons, ~10h — NEW
  stakeholderManagementCourse, // 3 modules, 14 lessons, ~8h — NEW
];

// Main export - only courses with content
export const courses = coursesWithContent;

// Alias for backwards compatibility
export const academyCourses = courses;

// ============================================
// COURSE-MODULE MAPPING
// ============================================
const courseModulesMap: Record<string, Module[]> = {
  'pm-fundamentals': pmFundamentalsModules,
  'prince2-foundation': prince2Modules,
  'scrum-master': scrumModules,
  'waterfall-pm': waterfallModules,
  'kanban-practitioner': kanbanModules,
  'agile-fundamentals': agileModules,
  'lean-six-sigma': leanSixSigmaModules,
  'leadership-pm': leadershipModules,
  'program-management-pro': programManagementModules,
  'safe-scaling-agile': safeModules,
  'ms-project-masterclass': msProjectModules,
  'ai-literacy': aiLiteracyModules,
  'stakeholder-management': stakeholderManagementModules,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get course by ID
 */
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

/**
 * Get modules for a course
 */
export const getModulesByCourseId = (courseId: string): Module[] => {
  return courseModulesMap[courseId] || [];
};

/**
 * Check if a course has content (modules with lessons)
 */
export const courseHasContent = (courseId: string): boolean => {
  const modules = getModulesByCourseId(courseId);
  return modules.length > 0 && modules.some(m => m.lessons && m.lessons.length > 0);
};

/**
 * Get a specific lesson by ID
 */
export const getLessonById = (courseId: string, lessonId: string) => {
  const modules = getModulesByCourseId(courseId);
  for (const module of modules) {
    const lesson = module.lessons?.find(l => l.id === lessonId);
    if (lesson) return { lesson, module };
  }
  return null;
};

/**
 * Get featured courses (with content)
 */
export const getFeaturedCourses = (): Course[] => {
  return courses.filter(course => course.featured || course.bestseller);
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = (categoryId: string): Course[] => {
  if (categoryId === 'all') return courses;
  return courses.filter(course => course.category === categoryId);
};

/**
 * Get courses by methodology
 */
export const getCoursesByMethodology = (methodology: string): Course[] => {
  return courses.filter(course => course.methodology === methodology);
};

/**
 * Get bestseller courses
 */
export const getBestsellerCourses = (): Course[] => {
  return courses.filter(course => course.bestseller);
};

/**
 * Get new courses
 */
export const getNewCourses = (): Course[] => {
  return courses.filter(course => course.new);
};

/**
 * Get course statistics - REAL-TIME CALCULATION
 * This ensures stats are always accurate based on actual course data
 * Returns: { totalCourses: 11, totalModules: 35, totalLessons: 166, totalHours: ~124, totalStudents: ~50000 }
 */
export const getCourseStats = () => {
  const totalLessons = courses.reduce((acc, course) => {
    const modules = getModulesByCourseId(course.id);
    const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    return acc + lessonCount;
  }, 0);

  const totalModules = courses.reduce((acc, course) => {
    const modules = getModulesByCourseId(course.id);
    return acc + modules.length;
  }, 0);

  return {
    totalCourses: courses.length,
    totalModules,
    totalLessons,
    totalHours: courses.reduce((acc, c) => acc + (c.duration || 0), 0),
    totalStudents: courses.reduce((acc, c) => acc + (c.students || 0), 0),
  };
};

/**
 * Get total lesson count for a course
 */
export const getCourseLessonCount = (courseId: string): number => {
  const modules = getModulesByCourseId(courseId);
  return modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
};

/**
 * Get total module count for a course
 */
export const getCourseModuleCount = (courseId: string): number => {
  return getModulesByCourseId(courseId).length;
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default courses;