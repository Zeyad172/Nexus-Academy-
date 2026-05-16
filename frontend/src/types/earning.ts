export interface InstructorEarningDetail {
  course_id: number;
  title: string;
  total_students: number;
  earning: number;
}

export interface AdminEarningDetail {
  user_id: number;
  first_name: string;
  last_name: string;
  earning: number;
  instructor_earning: number;
}

export interface EarningsSummary<T = any> {
  total_revenue: number;
  details: T[];
  total: number;
}

export interface EarningsAnalytics {
  month: string;
  revenue: number;
}
