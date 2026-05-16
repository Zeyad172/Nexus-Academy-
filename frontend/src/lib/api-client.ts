import axios, { AxiosRequestConfig } from "axios";

export const BACKEND_BASE_URL = 
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    // If the response follows our ApiResponse structure, return the data part
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'success')) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

/**
 * Clean API request helper
 */
export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<any, T>(url, config),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const isFormData = data instanceof FormData;
    return api.post<any, T>(url, data, {
      ...config,
      headers: {
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...config?.headers,
      },
    });
  },

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const isFormData = data instanceof FormData;
    return api.put<any, T>(url, data, {
      ...config,
      headers: {
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...config?.headers,
      },
    });
  },

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const isFormData = data instanceof FormData;
    return api.patch<any, T>(url, data, {
      ...config,
      headers: {
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...config?.headers,
      },
    });
  },

  delete: <T>(url: string, config?: AxiosRequestConfig) => api.delete<any, T>(url, config),
};
