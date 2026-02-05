// ============================================
// Refund API - Finding Gems Frontend
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// ============================================
// TYPES
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface Refund {
  id: string;
  refund_number: string;
  order_id: string;
  transaction_id?: string;
  requested_by: string;
  requester_type: 'buyer' | 'creator' | 'admin';
  original_amount: number;
  refund_amount: number;
  currency: string;
  reason: string;
  reason_category?: string;
  evidence_urls?: string[];
  status: 'requested' | 'under_review' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  status_message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  processed_by?: string;
  processed_at?: string;
  refund_method?: string;
  refund_details?: Record<string, unknown>;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
  };
}

export const REFUND_REASONS = [
  { value: 'product_issue', label: 'Masalah dengan produk' },
  { value: 'not_as_described', label: 'Produk tidak sesuai deskripsi' },
  { value: 'duplicate_payment', label: 'Pembayaran ganda' },
  { value: 'unauthorized_transaction', label: 'Transaksi tidak sah' },
  { value: 'buyer_request', label: 'Permintaan pembeli' },
  { value: 'creator_request', label: 'Permintaan creator' },
  { value: 'other', label: 'Lainnya' },
];

// ============================================
// USER REFUNDS
// ============================================

export const useRefunds = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['refunds', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get<ApiResponse<{
        refunds: Refund[];
        pagination: { page: number; limit: number; total: number; total_pages: number };
      }>>(`/refunds?${searchParams.toString()}`);
      
      return response.data;
    },
  });
};

export const useRefundDetail = (id: string) => {
  return useQuery({
    queryKey: ['refund', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ refund: Refund }>>(`/refunds/${id}`);
      return response.data.refund;
    },
    enabled: !!id,
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      order_id: string;
      reason: string;
      reason_category?: string;
      evidence_urls?: string[];
    }) => {
      const response = await api.post<ApiResponse<{ refund: Refund }>>('/refunds', data);
      return response.data.refund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCancelRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/refunds/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// ============================================
// ADMIN REFUNDS
// ============================================

export const useAdminRefunds = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-refunds', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get<ApiResponse<{
        refunds: (Refund & { requester?: { id: string; name: string; email: string } })[];
        pagination: { page: number; limit: number; total: number; total_pages: number };
      }>>(`/refunds/admin/all?${searchParams.toString()}`);
      
      return response.data;
    },
  });
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      action: 'approve' | 'reject' | 'complete';
      refund_amount?: number;
      refund_method?: string;
      refund_details?: Record<string, unknown>;
      status_message?: string;
      admin_notes?: string;
    }) => {
      const { id, ...payload } = data;
      await api.post(`/refunds/admin/${id}/process`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
    },
  });
};
