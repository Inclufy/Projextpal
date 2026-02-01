// src/hooks/useAcademyUser.ts
// ============================================
// ACADEMY USER HOOK - Met Superuser Ondersteuning
// ============================================

import { useState, useEffect } from 'react';

// Superuser emails - volledige toegang tot alle cursussen
const SUPERUSER_EMAILS = [
  'sami@inclufy.com',
  'admin@inclufy.com',
  'test@inclufy.com',
];

export interface AcademyUser {
  isLoggedIn: boolean;
  email?: string;
  name?: string;
  hasSubscription: boolean;
  subscriptionType?: 'basic' | 'pro' | 'enterprise';
  isSuperuser: boolean;
  enrolledCourses: string[];
  completedLessons: Record<string, string[]>; // courseId -> lessonIds[]
  courseProgress: Record<string, number>; // courseId -> progress %
  notes: Record<string, Record<string, string>>; // courseId -> lessonId -> notes
}

const DEFAULT_USER: AcademyUser = {
  isLoggedIn: false,
  hasSubscription: false,
  isSuperuser: false,
  enrolledCourses: [],
  completedLessons: {},
  courseProgress: {},
  notes: {},
};

export const useAcademyUser = () => {
  const [user, setUser] = useState<AcademyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem('academy_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Check superuser status based on email
        const isSuperuser = parsed.email ? SUPERUSER_EMAILS.includes(parsed.email.toLowerCase()) : false;
        
        setUser({
          ...DEFAULT_USER,
          ...parsed,
          isSuperuser,
          // Superusers automatically have subscription benefits
          hasSubscription: isSuperuser ? true : parsed.hasSubscription,
        });
      } else {
        setUser(DEFAULT_USER);
      }
    } catch (error) {
      console.error('Error loading academy user:', error);
      setUser(DEFAULT_USER);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates: Partial<AcademyUser>) => {
    if (user) {
      const newUser = { ...user, ...updates };
      // Recalculate superuser status if email changed
      if (updates.email) {
        newUser.isSuperuser = SUPERUSER_EMAILS.includes(updates.email.toLowerCase());
        if (newUser.isSuperuser) {
          newUser.hasSubscription = true;
        }
      }
      setUser(newUser);
      localStorage.setItem('academy_user', JSON.stringify(newUser));
    }
  };

  const login = (email: string, name?: string) => {
    const isSuperuser = SUPERUSER_EMAILS.includes(email.toLowerCase());
    const newUser: AcademyUser = {
      ...DEFAULT_USER,
      isLoggedIn: true,
      email,
      name,
      isSuperuser,
      hasSubscription: isSuperuser, // Superusers get subscription automatically
    };
    setUser(newUser);
    localStorage.setItem('academy_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem('academy_user');
  };

  // Check if user has access to a specific course
  const hasAccessToCourse = (courseId: string, freeForCustomers?: boolean): boolean => {
    if (!user?.isLoggedIn) return false;
    
    // Superusers have access to everything
    if (user.isSuperuser) return true;
    
    // Check if enrolled
    if (user.enrolledCourses.includes(courseId)) return true;
    
    // Check if free for subscribers
    if (user.hasSubscription && freeForCustomers) return true;
    
    return false;
  };

  // Enroll user in a course
  const enrollInCourse = (courseId: string) => {
    if (!user) return false;
    
    if (!user.enrolledCourses.includes(courseId)) {
      updateUser({
        enrolledCourses: [...user.enrolledCourses, courseId],
      });
    }
    return true;
  };

  // Mark lesson as complete
  const completeLesson = (courseId: string, lessonId: string, totalLessons: number) => {
    if (!user) return;
    
    const courseCompletedLessons = user.completedLessons[courseId] || [];
    if (!courseCompletedLessons.includes(lessonId)) {
      const newCompletedLessons = [...courseCompletedLessons, lessonId];
      const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);
      
      updateUser({
        completedLessons: {
          ...user.completedLessons,
          [courseId]: newCompletedLessons,
        },
        courseProgress: {
          ...user.courseProgress,
          [courseId]: newProgress,
        },
      });
      
      return newProgress;
    }
    return user.courseProgress[courseId] || 0;
  };

  // Get lesson completion status
  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    if (!user) return false;
    return (user.completedLessons[courseId] || []).includes(lessonId);
  };

  // Get course progress
  const getCourseProgress = (courseId: string): number => {
    if (!user) return 0;
    return user.courseProgress[courseId] || 0;
  };

  // Save notes
  const saveNotes = (courseId: string, lessonId: string, notes: string) => {
    if (!user) return;
    
    updateUser({
      notes: {
        ...user.notes,
        [courseId]: {
          ...(user.notes[courseId] || {}),
          [lessonId]: notes,
        },
      },
    });
  };

  // Get notes
  const getNotes = (courseId: string, lessonId: string): string => {
    if (!user) return '';
    return user.notes?.[courseId]?.[lessonId] || '';
  };

  return {
    user,
    loading,
    updateUser,
    login,
    logout,
    hasAccessToCourse,
    enrollInCourse,
    completeLesson,
    isLessonCompleted,
    getCourseProgress,
    saveNotes,
    getNotes,
    isSuperuser: user?.isSuperuser || false,
  };
};

export default useAcademyUser;