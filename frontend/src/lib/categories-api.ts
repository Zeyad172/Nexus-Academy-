import { request } from "./api-client";
import { Category } from '../types';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    return request.get<Category[]>("/categories");
  },

  create: async (name: string): Promise<Category> => {
    return request.post<Category>("/categories", { name });
  },

  update: async (id: number, name: string): Promise<void> => {
    return request.put<void>(`/categories/${id}`, { name });
  },

  delete: async (id: number): Promise<void> => {
    return request.delete<void>(`/categories/${id}`);
  },
};
