export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  courses?: T[];
  users?: T[];
  data?: T[];
  total: number;
}
