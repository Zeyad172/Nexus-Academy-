import { request, BACKEND_BASE_URL } from "./api-client";
import { User, AuthCredentials, ChangePasswordData } from "../types";

export const authApi = {
  login: async (credentials: AuthCredentials): Promise<User> => {
    return request.post<User>("/auth/login", credentials);
  },

  register: async (formData: FormData): Promise<null> => {
    return request.post<null>("/auth/register", formData);
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<null> => {
    return request.post<null>("/auth/verify-otp", data);
  },

  resendOtp: async (email: string): Promise<null> => {
    return request.post<null>("/auth/resend-otp", { email });
  },
  
  me: async (): Promise<User> => {
    return request.get<User>("/auth/me");
  },

  updateProfile: async (userId: number, formData: FormData): Promise<null> => {
    return request.put<null>(`/users/${userId}`, formData);
  },

  changePassword: async (data: ChangePasswordData): Promise<null> => {
    return request.put<null>("/auth/change-password", data);
  },

  logout: async (): Promise<null> => {
    return request.post<null>("/auth/logout");
  },

  forgotPassword: async (email: string): Promise<null> => {
    return request.post<null>("/auth/forgot-password", { email });
  },

  resetPassword: async (data: any): Promise<null> => {
    return request.post<null>("/auth/reset-password", data);
  },

  getGoogleAuthUrl: () => {
    return `${BACKEND_BASE_URL}/auth/google`;
  }
};
