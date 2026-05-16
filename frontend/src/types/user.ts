export interface User {
  user_id: number;
  id: number; // Backend sometimes returns 'id' for the current user
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "instructor" | "user";
  avatar_url?: string;
  bio?: string;
  title?: string;
  created_at: string;
  is_verified?: boolean;
}

export interface BestInstructor extends User {
  average_rating: number;
  course_count?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}
