// ============================================
// Billing API Hooks - Finding Gems Frontend
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// ============================================
// Types
// ============================================

export interface PricingTier {
  id: string;
  website_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration_days?: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  website_id: string;
  pricing_tier_id?: string;
  creator_id: string;
  item_name: string;
  item_price: number;
  platform_fee: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'expired';
  expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  website?: {
    name: string;
    slug: string;
    thumbnail: string;
  };
}

export interface Transaction {
  id: string;
  order_id: string;
  transaction_id: string;
  payment_method?: string;
  payment_provider: string;
  amount: number;
  currency: string;
  status: string;
  payment_url?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  buyer_name: string;
  buyer_email: string;
  creator_name: string;
  line_items: Array<{
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  platform_fee: number;
  total: number;
  currency: string;
  status: string;
  issued_at?: string;
  paid_at?: string;
  created_at: string;
}

export interface UserAccess {
  id: string;
  user_id: string;
  website_id: string;
  order_id?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  website?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    externalUrl?: string;
  };
}

export interface PaymentInstructions {
  transaction_id: string;
  amount: number;
  formatted_amount: string;
  expires_in: string;
  type: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  qr_url?: string;
  instructions: string[];
}

// ============================================
// Query Keys
// ============================================

export const billingKeys = {
  all: ['billing'] as const,
  pricing: (websiteId: string) => [...billingKeys.all, 'pricing', websiteId] as const,
  orders: () => [...billingKeys.all, 'orders'] as const,
  order: (orderId: string) => [...billingKeys.orders(), orderId] as const,
  myOrders: (status?: string) => [...billingKeys.orders(), 'my', status] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  myInvoices: () => [...billingKeys.invoices(), 'my'] as const,
  access: () => [...billingKeys.all, 'access'] as const,
  myAccess: () => [...billingKeys.access(), 'my'] as const,
  checkAccess: (websiteId: string) => [...billingKeys.access(), 'check', websiteId] as const,
  creatorSales: () => [...billingKeys.all, 'creator', 'sales'] as const,
};

// ============================================
// Pricing Tier Hooks
// ============================================

export const useWebsitePricing = (websiteId: string) => {
  return useQuery({
    queryKey: billingKeys.pricing(websiteId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { tiers: PricingTier[] };
      }>(`/billing/websites/${websiteId}/pricing`);
      return response.data.tiers;
    },
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePricingTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      websiteId: string;
      name: string;
      description?: string;
      price: number;
      currency?: string;
      duration_days?: number;
      features?: string[];
    }) => {
      const { websiteId, ...tierData } = data;
      const response = await api.post<{
        success: boolean;
        data: { tier: PricingTier };
      }>(`/billing/websites/${websiteId}/pricing`, tierData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.pricing(variables.websiteId) });
    },
  });
};

// ============================================
// Order Hooks
// ============================================

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { website_id: string; pricing_tier_id?: string; notes?: string }) => {
      const response = await api.post<{
        success: boolean;
        data: { order: Order; pricing_tier: PricingTier };
        message: string;
      }>('/billing/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.myOrders() });
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: billingKeys.order(orderId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { order: Order; transaction?: Transaction; invoice?: Invoice };
      }>(`/billing/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useMyOrders = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...billingKeys.myOrders(status), page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get<{
        success: boolean;
        data: {
          orders: Order[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      }>(`/billing/orders/my?${params.toString()}`);
      return response.data;
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post<{
        success: boolean;
        message: string;
      }>(`/billing/orders/${orderId}/cancel`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.orders() });
    },
  });
};

// ============================================
// Invoice Hooks
// ============================================

export const useOrderInvoice = (orderId: string) => {
  return useQuery({
    queryKey: [...billingKeys.order(orderId), 'invoice'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { invoice: Invoice };
      }>(`/billing/orders/${orderId}/invoice`);
      return response.data.invoice;
    },
    enabled: !!orderId,
  });
};

export const useMyInvoices = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...billingKeys.myInvoices(), status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get<{
        success: boolean;
        data: {
          invoices: Invoice[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      }>(`/billing/invoices/my?${params.toString()}`);
      return response.data;
    },
  });
};

// ============================================
// Access Hooks
// ============================================

export const useMyAccess = () => {
  return useQuery({
    queryKey: billingKeys.myAccess(),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { access: UserAccess[] };
      }>('/billing/access/my');
      return response.data.access;
    },
  });
};

export const useCheckAccess = (websiteId: string) => {
  return useQuery({
    queryKey: billingKeys.checkAccess(websiteId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { has_access: boolean; access: UserAccess | null };
      }>(`/billing/access/check/${websiteId}`);
      return response.data;
    },
    enabled: !!websiteId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ============================================
// Payment Hooks
// ============================================

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async (data: { order_id: string; payment_method?: string }) => {
      const response = await api.post<{
        success: boolean;
        data: {
          transaction: Transaction;
          payment_instructions: PaymentInstructions;
        };
        message: string;
      }>('/payments/initiate', data);
      return response.data;
    },
  });
};

export const usePaymentStatus = (transactionId: string, enabled = true) => {
  return useQuery({
    queryKey: ['payment', 'status', transactionId],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: { transaction: Transaction };
      }>(`/payments/${transactionId}/status`);
      return response.data.transaction;
    },
    enabled: enabled && !!transactionId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
};

// ============================================
// Creator Sales Hooks
// ============================================

export const useCreatorSales = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...billingKeys.creatorSales(), status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get<{
        success: boolean;
        data: {
          sales: Order[];
          stats: {
            total_orders: number;
            total_revenue: number;
            platform_fees: number;
            net_revenue: number;
          };
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      }>(`/billing/creator/sales?${params.toString()}`);
      return response.data;
    },
  });
};

// ============================================
// Utility Functions
// ============================================

export const formatPrice = (amount: number, currency = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getOrderStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'expired':
      return 'text-gray-600 bg-gray-100';
    case 'refunded':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getOrderStatusLabel = (status: Order['status']): string => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending Payment';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'expired':
      return 'Expired';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
};
