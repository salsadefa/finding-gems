// ============================================
// API Client Configuration - Finding Gems Frontend
// ============================================

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data?: object): Promise<T> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data?: object): Promise<T> => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};
