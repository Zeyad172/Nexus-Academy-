import { request } from "./api-client";
import { 
  Course, 
  CoursesResponse, 
  CourseContent, 
  Section, 
  Lesson 
} from "../types";

export const coursesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    level?: string;
    sortBy?: string;
    order?: string;
    is_available?: boolean;
  }): Promise<CoursesResponse> => {
    return request.get<CoursesResponse>("/courses", { params });
  },

  getRecentCourses: async (limit = 5): Promise<Course[]> => {
    const data = await request.get<{ courses: Course[] }>(`/courses/recent?limit=${limit}`);
    return data.courses;
  } ,
  
  create: async (formData: FormData): Promise<Course> => {
    return request.post<Course>("/courses", formData);
  },

  update: async (id: number, formData: FormData): Promise<Course> => {
    return request.put<Course>(`/courses/${id}`, formData);
  },

  delete: async (id: number): Promise<void> => {
    return request.delete<void>(`/courses/${id}`);
  },

  getById: async (id: number): Promise<Course> => {
    return request.get<Course>(`/courses/${id}`);
  },

  getMyCourses: async (page = 1, limit = 10, params?: { search?: string; category_id?: number; is_available?: boolean }): Promise<CoursesResponse> => {
    return request.get<CoursesResponse>(`/courses/my`, { 
      params: { page, limit, ...params } 
    });
  },

  getCoursesByInstructorId: async (instructorId: number, page = 1, limit = 10, params?: { search?: string; category_id?: number; is_available?: boolean }): Promise<CoursesResponse> => {
    return request.get<CoursesResponse>(`/courses/instructor/${instructorId}`, { 
      params: { page, limit, ...params } 
    });
  },

  getStats: async (id: number): Promise<{ students: number; revenue: number; rating: number }> => {
    return request.get<{ students: number; revenue: number; rating: number }>(`/courses/${id}/stats`);
  },

  getCourseContent: async (id: number): Promise<CourseContent> => {
    return request.get<CourseContent>(`/courses/${id}/content`);
  },
};

export const sectionsApi = {
  create: async (data: { course_id: number; section_order: number; title: string }): Promise<Section> => {
    return request.post<Section>("/sections", data);
  },

  update: async (courseId: number, sectionOrder: number, data: { section_order?: number; title?: string }): Promise<void> => {
    return request.put<void>(`/sections/${courseId}/${sectionOrder}`, data);
  },

  delete: async (courseId: number, sectionOrder: number): Promise<void> => {
    return request.delete<void>(`/sections/${courseId}/${sectionOrder}`);
  },
};

export const lessonsApi = {
  create: async (formData: FormData): Promise<Lesson> => {
    return request.post<Lesson>("/lessons", formData);
  },

  update: async (courseId: number, sectionOrder: number, lessonOrder: number, formData: FormData): Promise<void> => {
    return request.put<void>(`/lessons/${courseId}/${sectionOrder}/${lessonOrder}`, formData);
  },

  delete: async (courseId: number, sectionOrder: number, lessonOrder: number): Promise<void> => {
    return request.delete<void>(`/lessons/${courseId}/${sectionOrder}/${lessonOrder}`);
  },

  complete: async (courseId: number, sectionOrder: number, lessonOrder: number): Promise<void> => {
    return request.post<void>(`/lessons/${courseId}/${sectionOrder}/${lessonOrder}/complete`);
  },
};
