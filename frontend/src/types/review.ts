export interface Review {
  user_id: number;
  course_id: number;
  rating: number;
  comment: string;
  reviewed_at: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export interface InstructorReview extends Review {
  course_title: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
}

export interface InstructorReviewsResponse {
  reviews: InstructorReview[];
  total: number;
}
