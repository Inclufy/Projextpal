// src/hooks/useAcademyUser.ts
// ============================================
// ACADEMY USER HOOK - Met Superuser Ondersteuning
// ============================================

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

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
  const [serverProgressLoaded, setServerProgressLoaded] = useState(false);

  // Sync with main auth context. Read the context directly (unconditional
  // hook) instead of useAuth(), which throws outside an AuthProvider —
  // useContext returns undefined there, preserving the defensive behaviour
  // without violating the Rules of Hooks.
  const mainUser = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  // Hydrate completed lessons from the backend so progress survives
  // devices/browsers. localStorage stays the fast local cache; the server
  // list is merged in (union) once per mount after login.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || serverProgressLoaded || loading) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/academy/enrollments/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const enrollments = await res.json();
        const rows: Array<{ course_slug?: string; completed_lesson_ids?: string[]; progress?: number | string }> =
          Array.isArray(enrollments) ? enrollments : enrollments?.results || [];
        if (cancelled || rows.length === 0) return;
        setUser(prev => {
          if (!prev) return prev;
          const merged: Record<string, string[]> = { ...prev.completedLessons };
          const progressMerged: Record<string, number> = { ...prev.courseProgress };
          for (const row of rows) {
            if (!row.course_slug) continue;
            if (row.completed_lesson_ids?.length) {
              merged[row.course_slug] = Array.from(
                new Set([...(merged[row.course_slug] || []), ...row.completed_lesson_ids])
              );
            }
            const serverPct = Number(row.progress) || 0;
            if (serverPct > (progressMerged[row.course_slug] || 0)) {
              progressMerged[row.course_slug] = serverPct;
            }
          }
          const next = { ...prev, completedLessons: merged, courseProgress: progressMerged };
          localStorage.setItem('academy_user', JSON.stringify(next));
          return next;
        });
      } catch {
        // Offline or backend unreachable — local progress remains usable.
      } finally {
        if (!cancelled) setServerProgressLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, serverProgressLoaded]);

  // Auto-login academy user from main auth
  useEffect(() => {
    if (mainUser?.user && (!user || !user.isLoggedIn)) {
      const email = mainUser.user.email || mainUser.user.username || '';
      if (email) {
        login(email, mainUser.user.first_name || mainUser.user.username || '');
      }
    }
  }, [mainUser?.user, user?.isLoggedIn]);

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
    serverProgressLoaded,
    isSuperuser: user?.isSuperuser || false,
  };
};

export default useAcademyUser;