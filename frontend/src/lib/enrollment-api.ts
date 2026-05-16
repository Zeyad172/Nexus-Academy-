import { request } from "./api-client";
import { 
  InstructorStudentsResponse, 
  EnrollmentsResponse,  
} from "../types";

export const enrollmentApi = {
  getInstructorStudents: async (page = 1, limit = 100, search?: string, courseId?: number): Promise<InstructorStudentsResponse> => {
    return request.get<InstructorStudentsResponse>(`/enrollments/instructor/students`, {
      params: { page, limit, search, course_id: courseId }
    });
  },

  getInstructorEnrollments: async (page = 1, limit = 10, courseId?: number): Promise<EnrollmentsResponse> => {
    return request.get<EnrollmentsResponse>(`/enrollments/instructor`, {
      params: { page, limit, course_id: courseId }
    });
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string; course_id?: number; payment_status?: string }): Promise<EnrollmentsResponse> => {
    return request.get<EnrollmentsResponse>("/enrollments/", { params });
  },

  getMyEnrollments: async (page = 1, limit = 10, params?: { search?: string; status?: string }): Promise<EnrollmentsResponse> => {
    return request.get<EnrollmentsResponse>(`/enrollments/my`, { 
        params: { page, limit, ...params } 
    });
  },

  enroll: async (courseId: number, paymentMethod = "card"): Promise<void> => {
    return request.post<void>("/enrollments", {
      course_id: courseId,
      payment_method: paymentMethod,
    });
  },

  unenroll: async (courseId: number, userId?: number): Promise<void> => {
    return request.delete<void>("/enrollments", {
      data: { course_id: courseId, user_id: userId },
    });
  },

  getProgress: async (courseId: number): Promise<{ progress: number }> => {
    return request.get<{ progress: number }>(`/enrollments/progress/${courseId}`);
  },
};
