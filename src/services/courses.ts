import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  lessons_count?: number;
  enrolled_count?: number;
  rating?: number;
  progress?: number;
  thumbnail?: string;
  skills?: string[];
  is_free?: boolean;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  course: string;
  title: string;
  duration: string;
  order: number;
  completed: boolean;
  locked: boolean;
  content?: string;
  video_url?: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  instructor?: string;
  duration?: string;
  price?: number;
  is_free?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

class CoursesService {
  // READ - Get all courses
  async getCourses(): Promise<Course[]> {
    const response = await apiService.get<Course[] | { results: Course[] }>(API_CONFIG.ENDPOINTS.COURSES);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get single course
  async getCourse(id: string): Promise<Course> {
    const response = await apiService.get<Course>(`${API_CONFIG.ENDPOINTS.COURSES}${id}/`);
    return response;
  }

  // READ - Get course lessons
  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    const response = await apiService.get<Lesson[] | { results: Lesson[] }>(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/`);
    return Array.isArray(response) ? response : response.results || [];
  }

  // CREATE - Create new course (admin)
  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await apiService.post<Course>(API_CONFIG.ENDPOINTS.COURSES, data);
    return response;
  }

  // UPDATE - Update course (admin)
  async updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
    const response = await apiService.put<Course>(`${API_CONFIG.ENDPOINTS.COURSES}${id}/`, data);
    return response;
  }

  // DELETE - Delete course (admin)
  async deleteCourse(id: string): Promise<void> {
    await apiService.delete(`${API_CONFIG.ENDPOINTS.COURSES}${id}/`);
  }

  // Enroll in course
  async enrollCourse(courseId: string): Promise<void> {
    await apiService.post(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/enroll/`);
  }

  // Mark lesson as complete
  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    await apiService.post(`${API_CONFIG.ENDPOINTS.COURSES}${courseId}/lessons/${lessonId}/complete/`);
  }

  // Get enrolled courses
  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiService.get<Course[] | { results: Course[] }>(`${API_CONFIG.ENDPOINTS.COURSES}enrolled/`);
    return Array.isArray(response) ? response : response.results || [];
  }
}

export const coursesService = new CoursesService();
