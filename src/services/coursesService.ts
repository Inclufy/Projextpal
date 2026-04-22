import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration: string;
  duration_minutes?: number;
  order: number;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url?: string;
  completed?: boolean;
  locked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructor_id?: string;
  instructor_name?: string;
  instructor_image?: string;
  category?: string;
  methodology?: string;
  duration: string;
  duration_hours?: number;
  total_lessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_free?: boolean;
  bestseller?: boolean;
  rating?: number;
  reviews_count?: number;
  enrolled_count?: number;
  thumbnail?: string;
  skills?: string[];
  lessons?: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress: number;
  completed_lessons: string[];
  started_at: string;
  completed_at?: string;
  last_accessed_at: string;
  certificate_id?: string;
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  progress_percent: number;
  time_spent_minutes: number;
  last_position?: number;
  completed_at?: string;
}

class CoursesService {
  // ==================== COURSES CRUD ====================

  /**
   * Get all courses
   */
  async getCourses(): Promise<Course[]> {
    try {
      console.log('📚 Fetching courses...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.COURSES);
      console.log('📚 Courses response:', response);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  }

  /**
   * Get courses by category
   */
  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.COURSES}?category=${category}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch courses by category:', error);
      throw error;
    }
  }

  /**
   * Get free courses
   */
  async getFreeCourses(): Promise<Course[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.COURSES}?is_free=true`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch free courses:', error);
      throw error;
    }
  }

  /**
   * Get a single course by ID
   */
  async getCourse(id: string): Promise<Course> {
    try {
      const response = await apiService.get<Course>(`${API_CONFIG.ENDPOINTS.COURSES}${id}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch course:', error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.COURSES}?search=${encodeURIComponent(query)}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to search courses:', error);
      throw error;
    }
  }

  // ==================== LESSONS ====================

  /**
   * Get lessons for a course
   */
  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      throw error;
    }
  }

  /**
   * Get a single lesson
   */
  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    try {
      const response = await apiService.get<Lesson>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/${lessonId}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      throw error;
    }
  }

  // ==================== ENROLLMENT ====================

  /**
   * Get user's enrolled courses
   */
  async getEnrolledCourses(): Promise<(Course & { enrollment: Enrollment })[]> {
    try {
      console.log('📚 Fetching enrolled courses...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.ENROLLMENTS);
      console.log('📚 Enrolled response:', response);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      throw error;
    }
  }

  /**
   * Get enrollment for a specific course
   */
  async getEnrollment(courseId: string): Promise<Enrollment | null> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.ENROLLMENTS}?course_id=${courseId}`);
      const enrollments = response.results || response || [];
      return enrollments.length > 0 ? enrollments[0] : null;
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
      return null;
    }
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<Enrollment> {
    try {
      const response = await apiService.post<Enrollment>(API_CONFIG.ENDPOINTS.ENROLLMENTS, { course_id: courseId });
      return response;
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      throw error;
    }
  }

  /**
   * Unenroll from a course
   */
  async unenrollFromCourse(courseId: string): Promise<void> {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.ENROLLMENTS}${courseId}/`);
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      throw error;
    }
  }

  // ==================== PROGRESS TRACKING ====================

  /**
   * Get course progress
   */
  async getCourseProgress(courseId: string): Promise<{
    progress: number;
    completed_lessons: number;
    total_lessons: number;
    time_spent_minutes: number;
  }> {
    try {
      const response = await apiService.get<{ progress: number; completed_lessons: number; total_lessons: number; time_spent_minutes: number }>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/progress/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
      // Return default progress
      return {
        progress: 0,
        completed_lessons: 0,
        total_lessons: 0,
        time_spent_minutes: 0,
      };
    }
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(courseId: string, lessonId: string): Promise<LessonProgress> {
    try {
      const response = await apiService.post<LessonProgress>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/${lessonId}/complete/`);
      return response;
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(
    courseId: string, 
    lessonId: string, 
    progress: { progress_percent?: number; time_spent_minutes?: number; last_position?: number }
  ): Promise<LessonProgress> {
    try {
      const response = await apiService.patch<LessonProgress>(
        `${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/${lessonId}/progress/`,
        progress
      );
      return response;
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
      throw error;
    }
  }

  /**
   * Get next lesson to continue
   */
  async getNextLesson(courseId: string): Promise<Lesson | null> {
    try {
      const response = await apiService.get<Lesson | null>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/next-lesson/`);
      return response;
    } catch (error) {
      console.error('Failed to get next lesson:', error);
      return null;
    }
  }

  // ==================== CERTIFICATES ====================

  /**
   * Get certificate for completed course
   */
  async getCertificate(courseId: string): Promise<{
    id: string;
    course_id: string;
    issued_at: string;
    certificate_url: string;
  } | null> {
    try {
      const response = await apiService.get<{ id: string; course_id: string; issued_at: string; certificate_url: string } | null>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/certificate/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      return null;
    }
  }

  /**
   * Request certificate generation
   */
  async requestCertificate(courseId: string): Promise<void> {
    try {
      await apiService.post(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/certificate/`);
    } catch (error) {
      console.error('Failed to request certificate:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get difficulty label in Dutch
   */
  getDifficultyLabel(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Gemiddeld';
      case 'advanced': return 'Gevorderd';
      default: return difficulty || 'Onbekend';
    }
  }

  /**
   * Get difficulty color
   */
  getDifficultyColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(duration: string | number): string {
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (hours === 0) return `${minutes}m`;
      if (minutes === 0) return `${hours}u`;
      return `${hours}u ${minutes}m`;
    }
    return duration;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  /**
   * Calculate estimated completion time
   */
  getEstimatedCompletionTime(course: Course, currentProgress: number): string {
    if (!course.duration_hours) return 'Onbekend';
    const remainingHours = course.duration_hours * ((100 - currentProgress) / 100);
    if (remainingHours < 1) return `${Math.round(remainingHours * 60)}m`;
    return `${Math.round(remainingHours)}u`;
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'project-management': 'briefcase',
      'agile': 'flash',
      'leadership': 'trophy',
      'technical': 'code',
      'soft-skills': 'people',
      'finance': 'wallet',
      'marketing': 'megaphone',
      default: 'school',
    };
    return icons[category?.toLowerCase()] || icons.default;
  }
}

export const coursesService = new CoursesService();