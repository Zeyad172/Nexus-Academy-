import { request } from "./api-client";
import { Review, InstructorReview, ReviewsResponse, InstructorReviewsResponse } from "../types";

export const reviewApi = {
  create: async (courseId: number, data: { rating: number; comment: string }): Promise<null> => {
    return request.post<null>(`/reviews/${courseId}`, data);
  },

  getByCourse: async (courseId: number, params?: { page?: number; limit?: number; sortBy?: string; order?: string }): Promise<ReviewsResponse> => {
    return request.get<ReviewsResponse>(`/reviews/${courseId}`, { params });
  },

  getUserReview: async (courseId: number): Promise<Review> => {
    return request.get<Review>(`/reviews/${courseId}/me`);
  },

  getInstructorReviews: async (params?: { page?: number; limit?: number; course_id?: number | string; rating?: number | string; search?: string }): Promise<InstructorReviewsResponse> => {
    return request.get<InstructorReviewsResponse>(`/reviews/instructor`, { params });
  },

  getAllReviews: async (params?: { page?: number; limit?: number; course_id?: number | string; rating?: number | string; search?: string }): Promise<InstructorReviewsResponse> => {
    return request.get<InstructorReviewsResponse>(`/reviews/`, { params });
  },

  getBestReviews: async (): Promise<InstructorReviewsResponse> => {
    return request.get<InstructorReviewsResponse>(`/reviews/best`);
  },

  update: async (courseId: number, data: { rating: number; comment: string }): Promise<null> => {
    return request.put<null>(`/reviews/${courseId}`, data);
  },

  delete: async (courseId: number, params?: { user_id?: number }): Promise<null> => {
    return request.delete<null>(`/reviews/${courseId}`, { params });
  },
};
