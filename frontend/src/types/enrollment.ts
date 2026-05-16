export interface Enrollment {
  course_id: number;
  user_id: number;
  enrolled_at: string;
  payment_method: string;
  payment_status: string;
  enrollment_cost: number;
  title: string;
  thumbnail_url?: string;
  instructor_id: number;
  instructor_first_name: string;
  instructor_last_name: string;
  progress: number;
}

export interface InstructorStudent {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  joined_at: string;
  courses_enrolled: number;
  avg_progress: number;
  courses?: {
    course_id: number;
    title: string;
    enrolled_at: string;
    progress: number;
  }[];
}

export interface InstructorStudentsResponse {
  students: InstructorStudent[];
  total: number;
}

export interface EnrollmentsResponse {
  enrollments: any[];
  total: number;
}
