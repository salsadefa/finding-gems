// ============================================
// Admin API - Finding Gems Frontend
// ============================================

import { useQuery } from '@tanstack/react-query';
import { api } from './client';

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
