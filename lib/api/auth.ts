// ============================================
// Auth API Hooks - Finding Gems Frontend
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  username: string;
  role?: 'buyer' | 'creator';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      avatar?: string;
      role: string;
      isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Keys for caching
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Helper to dispatch auth update event for same-tab synchronization
const dispatchAuthUpdate = (user: AuthResponse['data']['user'] | null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('auth-update', { detail: { user } })
    );
  }
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response; // Returns full AuthResponse { success, data: { user, accessToken, refreshToken }, message }
    },
    onSuccess: (response) => {
      // Access nested data from AuthResponse structure
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update cache
      queryClient.setQueryData(authKeys.user(), user);

      // Dispatch custom event to update AuthContext in same tab
      dispatchAuthUpdate(user);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response; // Returns full AuthResponse { success, data: { user, accessToken, refreshToken }, message }
    },
    onSuccess: (response) => {
      // Access nested data from AuthResponse structure
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update cache
      queryClient.setQueryData(authKeys.user(), user);

      // Dispatch custom event to update AuthContext in same tab
      dispatchAuthUpdate(user);
    },
  });
};

// Get current user query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { user: UserProfile } }>('/auth/me');
      return response.data.user;
    },
    enabled: !!localStorage.getItem('accessToken'), // Only run if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Logout function
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get user from localStorage (for initial state)
export const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Password Reset Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Forgot Password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
      return response;
    },
  });
};

// Reset Password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
      return response;
    },
  });
};
