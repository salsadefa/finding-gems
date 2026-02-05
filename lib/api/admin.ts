// ============================================
// Admin API - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { normalizeKeys } from './normalize';
import type { Website, User } from '@/lib/types';

// ============================================
// TYPES
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface DashboardOverview {
  overview: {
    total_users: number;
    total_creators: number;
    total_websites: number;
    total_orders: number;
  };
  revenue: {
    this_month: number;
    platform_fees: number;
    last_month: number;
    growth_percent: number;
  };
  pending: {
    payouts_count: number;
    payouts_amount: number;
    refunds_count: number;
    creator_applications: number;
  };
  recent_orders: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    buyer?: { id: string; name: string; email: string };
    website?: { id: string; name: string };
  }[];
}

export interface PaymentAnalytics {
  period: string;
  chart_data: {
    date: string;
    revenue: number;
    orders: number;
    fees: number;
  }[];
  totals: {
    total_revenue: number;
    total_fees: number;
    total_orders: number;
    average_order_value: number;
  };
  payment_methods: {
    method: string;
    count: number;
    amount: number;
  }[];
}

export interface UserAnalytics {
  period: string;
  new_users: number;
  daily_signups: { date: string; count: number }[];
  new_users_by_role: { user: number; creator: number; admin: number };
  total_by_role: { user: number; creator: number; admin: number };
}

export interface TopPerformers {
  top_websites: {
    website: { id: string; name: string; slug: string };
    revenue: number;
    orders: number;
  }[];
  top_creators: {
    creator: { id: string; name: string; email: string; avatar?: string };
    revenue: number;
    earnings: number;
    orders: number;
  }[];
}

// ============================================
// HOOKS
// ============================================

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardOverview>>('/admin/dashboard');
      return response.data;
    },
  });
};

export const usePaymentAnalytics = (period: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: ['admin-payment-analytics', period],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaymentAnalytics>>(`/admin/analytics/payments?period=${period}`);
      return response.data;
    },
  });
};

export const useUserAnalytics = (period: '7d' | '30d' | '90d' = '30d') => {
  return useQuery({
    queryKey: ['admin-user-analytics', period],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UserAnalytics>>(`/admin/analytics/users?period=${period}`);
      return response.data;
    },
  });
};

export const useTopPerformers = () => {
  return useQuery({
    queryKey: ['admin-top-performers'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<TopPerformers>>('/admin/analytics/top');
      return response.data;
    },
  });
};

// ============================================
// UTILS
// ============================================

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `Rp${(amount / 1000000000).toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    return `Rp${(amount / 1000000).toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    return `Rp${(amount / 1000).toFixed(0)}rb`;
  }
  return `Rp${amount}`;
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatPercent = (num: number, showSign = true) => {
  const formatted = Math.abs(num).toFixed(1);
  if (showSign) {
    return num >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${formatted}%`;
};

// ============================================
// ADMIN WEBSITES
// ============================================

export interface AdminWebsite {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  category: { id: string; name: string; slug: string };
  creator: { id: string; name: string; email: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface AdminWebsitesResponse {
  websites: AdminWebsite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminWebsiteKeys = {
  all: ['admin', 'websites'] as const,
  lists: () => [...adminWebsiteKeys.all, 'list'] as const,
  list: (filters: object) => [...adminWebsiteKeys.lists(), filters] as const,
  pending: () => [...adminWebsiteKeys.all, 'pending'] as const,
};

export const useAdminWebsites = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: adminWebsiteKeys.list(params || {}),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);
      
      const response = await api.get<ApiResponse<AdminWebsitesResponse>>(
        `/admin/websites?${searchParams.toString()}`
      );
      return {
        ...response.data,
        websites: response.data.websites.map(w => normalizeKeys<AdminWebsite>(w)),
      };
    },
  });
};

export const usePendingWebsites = () => {
  return useQuery({
    queryKey: adminWebsiteKeys.pending(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ websites: AdminWebsite[] }>>(
        '/admin/websites/pending'
      );
      return response.data.websites.map(w => normalizeKeys<AdminWebsite>(w));
    },
  });
};

export const useModerateWebsite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'active' | 'rejected'; reason?: string }) => {
      const response = await api.patch<ApiResponse<{ website: AdminWebsite }>>(
        `/admin/websites/${id}/moderate`,
        { status, reason }
      );
      return normalizeKeys<AdminWebsite>(response.data.website);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminWebsiteKeys.all });
    },
  });
};

// ============================================
// ADMIN USERS
// ============================================

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    websites: number;
    orders: number;
  };
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: object) => [...adminUserKeys.lists(), filters] as const,
};

export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: adminUserKeys.list(params || {}),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.role) searchParams.append('role', params.role);
      if (params?.search) searchParams.append('search', params.search);
      
      const response = await api.get<ApiResponse<AdminUsersResponse>>(
        `/admin/users?${searchParams.toString()}`
      );
      return {
        ...response.data,
        users: response.data.users.map(u => normalizeKeys<AdminUser>(u)),
      };
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { role?: 'user' | 'creator' | 'admin'; isActive?: boolean } }) => {
      const response = await api.patch<ApiResponse<{ user: AdminUser }>>(
        `/admin/users/${id}`,
        data
      );
      return normalizeKeys<AdminUser>(response.data.user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

// ============================================
// CREATOR APPLICATIONS
// ============================================

export interface CreatorApplicationDetail {
  id: string;
  userId: string;
  bio: string;
  professionalBackground?: string;
  expertise: string[];
  portfolioUrl?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    role: string;
    createdAt: string;
  };
}

export interface CreatorApplicationsResponse {
  applications: CreatorApplicationDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreatorApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const adminApplicationKeys = {
  all: ['admin', 'creator-applications'] as const,
  lists: () => [...adminApplicationKeys.all, 'list'] as const,
  list: (filters: object) => [...adminApplicationKeys.lists(), filters] as const,
  stats: () => [...adminApplicationKeys.all, 'stats'] as const,
  detail: (id: string) => [...adminApplicationKeys.all, 'detail', id] as const,
};

export const useCreatorApplicationsAdmin = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}) => {
  return useQuery({
    queryKey: adminApplicationKeys.list(params || {}),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      
      const response = await api.get<ApiResponse<CreatorApplicationsResponse>>(
        `/admin/creator-applications?${searchParams.toString()}`
      );
      return {
        ...response.data,
        applications: response.data.applications.map(a => normalizeKeys<CreatorApplicationDetail>(a)),
      };
    },
  });
};

export const useCreatorApplicationDetail = (id: string) => {
  return useQuery({
    queryKey: adminApplicationKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ application: CreatorApplicationDetail }>>(
        `/admin/creator-applications/${id}`
      );
      return normalizeKeys<CreatorApplicationDetail>(response.data.application);
    },
    enabled: !!id,
  });
};

export const useCreatorApplicationStats = () => {
  return useQuery({
    queryKey: adminApplicationKeys.stats(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<CreatorApplicationStats>>(
        '/admin/creator-applications/stats'
      );
      return response.data;
    },
  });
};

export const useHandleCreatorApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: 'approved' | 'rejected'; rejectionReason?: string }) => {
      const response = await api.patch<ApiResponse<{ application: CreatorApplicationDetail }>>(
        `/admin/creator-applications/${id}`,
        { status, rejectionReason }
      );
      return normalizeKeys<CreatorApplicationDetail>(response.data.application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.all });
    },
  });
};

// ============================================
// REPORTS
// ============================================

export interface Report {
  id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reporter: { id: string; name: string; email: string };
  reportedWebsite: { id: string; name: string; slug: string };
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNote?: string;
}

export interface ReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminReportKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...adminReportKeys.all, 'list'] as const,
  list: (filters: object) => [...adminReportKeys.lists(), filters] as const,
};

export const useReports = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'resolved' | 'dismissed';
}) => {
  return useQuery({
    queryKey: adminReportKeys.list(params || {}),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      
      const response = await api.get<ApiResponse<ReportsResponse>>(
        `/admin/reports?${searchParams.toString()}`
      );
      return {
        ...response.data,
        reports: response.data.reports.map(r => normalizeKeys<Report>(r)),
      };
    },
  });
};

export const useHandleReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: 'resolved' | 'dismissed'; adminNote?: string }) => {
      const response = await api.patch<ApiResponse<{ report: Report }>>(
        `/admin/reports/${id}`,
        { status, adminNote }
      );
      return normalizeKeys<Report>(response.data.report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
    },
  });
};
