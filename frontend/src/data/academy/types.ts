// ============================================
// ACADEMY TYPES
// ============================================

import { LucideIcon } from 'lucide-react';

// ============================================
// INSTRUCTOR
// ============================================
export interface Instructor {
  name: string;
  title: string;
  avatar: string;
  bio?: string;
  expertise?: string[];
  students?: number;
  courses?: number;
  rating?: number;
}

// ============================================
// RESOURCE
// ============================================
export interface Resource {
  name: string;
  type: 'PDF' | 'XLSX' | 'DOCX' | 'PPTX' | 'ZIP' | 'VIDEO';
  size: string;
  description?: string;
  url?: string;
}

// ============================================
// QUIZ QUESTION
// ============================================
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// ============================================
// LESSON
// ============================================
export interface Lesson {
  id: string;
  title: string;
  titleNL?: string;
  duration: string;
  type: 'video' | 'quiz' | 'exam' | 'assignment' | 'certificate' | 'reading';
  videoUrl?: string;
  transcript?: string;
  keyTakeaways?: string[];
  resources?: Resource[];
  quiz?: QuizQuestion[];
  completed?: boolean;
}

// ============================================
// MODULE
// ============================================
export interface Module {
  id: string;
  title: string;
  titleNL?: string;
  description: string;
  descriptionNL?: string;
  lessons: Lesson[];
  expanded?: boolean;
}

// ============================================
// COURSE
// ============================================
export interface Course {
  id: string;
  title: string;
  titleNL?: string;
  description: string;
  descriptionNL?: string;
  
  // Visual
  icon: LucideIcon;
  color: string;
  gradient: string;
  
  // Classification
  category: string;
  methodology: string;
  
  // Stats
  levels: number;
  modules: number;
  duration: number;
  rating: number;
  students: number;
  
  // Tags
  tags: string[];
  tagsNL?: string[];
  
  // Instructor
  instructor: Instructor;
  
  // Flags
  featured?: boolean;
  bestseller?: boolean;
  new?: boolean;
  freeForCustomers?: boolean;
  certificate?: boolean;
  
  // Learning outcomes
  whatYouLearn?: string[];
  whatYouLearnNL?: string[];
  requirements?: string[];
  requirementsNL?: string[];
  targetAudience?: string[];
  targetAudienceNL?: string[];
  
  // Content (modules with lessons)
  courseModules?: Module[];
}

// ============================================
// CATEGORY
// ============================================
export interface Category {
  id: string;
  name: string;
  nameNL?: string;
  icon: LucideIcon;
  count?: number;
}

// ============================================
// USER PROGRESS
// ============================================
export interface UserProgress {
  odatacontext?: string;
  userId?: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  progress?: number;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

// ============================================
// ENROLLMENT
// ============================================
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  certificateUrl?: string;
}

export default Course;