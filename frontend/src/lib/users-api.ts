import { request } from "./api-client";
import { User, UsersResponse, BestInstructor } from "../types";

export const usersApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; filter?: string, order?: string }): Promise<UsersResponse> => {
    return request.get<UsersResponse>("/users", { params });
  },

  getBestInstructors: async (): Promise<BestInstructor[]> => {
    const data = await request.get<{ instructors: BestInstructor[] }>("/users/best-instructors");
    return data.instructors;
  },

  getUserById: async (id: number): Promise<User> => {
    return request.get<User>(`/users/${id}`);
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    return request.put<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: number): Promise<void> => {
    return request.delete<void>(`/users/${id}`);
  },
};
