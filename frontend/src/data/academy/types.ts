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
  // Optional EN companion fields — Dutch is primary house style; EN is fallback for en locale
  questionEN?: string;
  optionsEN?: string[];
  explanationEN?: string;
  // Optional NL companion fields — used by EN-first courses (e.g. leadership) where
  // question/options/explanation are English and these hold the Dutch translation.
  questionNL?: string;
  optionsNL?: string[];
  explanationNL?: string;
  // Bloom taxonomy level for adaptive difficulty surfacing
  difficulty?: 'foundation' | 'application' | 'evaluation';
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
  // Dutch translation of the transcript for EN-first courses (e.g. leadership).
  transcriptNL?: string;
  keyTakeaways?: string[];
  keyTakeawaysNL?: string[];
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
  // Concepts-only: the course teaches the methodology, but the matching in-app
  // tooling is still in development (e.g. SAFe — no working PI board yet). The
  // UI surfaces a "Concepts only" badge so learners don't expect a live engine.
  conceptsOnly?: boolean;
  conceptsNote?: string;
  conceptsNoteNL?: string;
  
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