export interface Course {
  course_id: number;
  category_id: number;
  instructor_id: number;
  title: string;
  description: string;
  price: number;
  original_price: number;
  thumbnail_url: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  is_available: boolean;
  rating: number;
  review_count?: number;
  duration: number;
  created_at: string;
  category_name?: string;
  instructor_name?: string;
  instructor_avatar?: string;
  students_count?: number;
  is_enrolled?: boolean;
}

export interface CourseContent {
  course_id: number;
  title: string;
  duration: number;
  is_enrolled: boolean;
  sections: SectionWithLessons[];
}

export interface SectionWithLessons {
  section_order: number;
  title: string;
  lessons: LessonWithStatus[];
}

export interface LessonWithStatus {
  lesson_order: number;
  title: string;
  duration: number;
  is_completed?: boolean;
  video_url?: string;
  description?: string;
}

export interface Section {
  course_id: number;
  section_order: number;
  title: string;
}

export interface Lesson {
  course_id: number;
  section_order: number;
  lesson_order: number;
  title: string;
  description?: string;
  video_url: string;
  duration: number;
}

export interface LessonForm {
  title: string;
  description: string;
  video: File | null;
  isNew?: boolean;
  video_url?: string;
  original_lesson_order?: number;
  original_section_order?: number;
}

export interface SectionForm {
  title: string;
  lessons: LessonForm[];
  isNew?: boolean;
  original_section_order?: number;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
}
