// ============================================
// COURSES INDEX
// ============================================
// Only exports courses that have actual content (modules + lessons)
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
};

// ============================================
// COURSES WITH CONTENT (for marketplace)
// ============================================
// These are the only courses shown in TrainingMarketplace
// Total: 7 courses, 23 modules, 99 lessons
export const coursesWithContent: Course[] = [
  pmFundamentalsCourse,      // 5 modules, 26 lessons
  prince2Course,             // 4 modules, 20 lessons
  scrumCourse,               // 3 modules, 13 lessons
  waterfallCourse,           // 2 modules, 10 lessons
  kanbanCourse,              // 2 modules, 10 lessons
  agileFundamentalsCourse,   // 2 modules, 10 lessons
  leanSixSigmaCourse,        // 5 modules, 10 lessons
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
 * Get course statistics
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