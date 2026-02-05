// ============================================
// Payout API - Finding Gems Frontend
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

export interface CreatorBalance {
  id: string;
  creator_id: string;
  total_earnings: number;
  pending_balance: number;
  available_balance: number;
  withdrawn_balance: number;
  pending_withdrawal: number;
  withdrawable: number;
  last_calculated_at: string;
}

export interface BankAccount {
  id: string;
  creator_id: string;
  bank_name: string;
  bank_code?: string;
  account_number: string;
  account_name: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Payout {
  id: string;
  payout_number: string;
  creator_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  status_message?: string;
  transfer_reference?: string;
  transfer_proof_url?: string;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// BALANCE
// ============================================

export const useCreatorBalance = () => {
  return useQuery({
    queryKey: ['creator-balance'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ balance: CreatorBalance }>>('/payouts/balance');
      return response.data.balance;
    },
  });
};

export const useRecalculateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<{ balance: CreatorBalance }>>('/payouts/balance/recalculate');
      return response.data.balance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-balance'] });
    },
  });
};

// ============================================
// BANK ACCOUNTS
// ============================================

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ accounts: BankAccount[] }>>('/payouts/bank-accounts');
      return response.data.accounts;
    },
  });
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bank_name: string;
      bank_code?: string;
      account_number: string;
      account_name: string;
      is_primary?: boolean;
    }) => {
      const response = await api.post<ApiResponse<{ account: BankAccount }>>('/payouts/bank-accounts', data);
      return response.data.account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payouts/bank-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
};

// ============================================
// PAYOUTS
// ============================================

export const usePayouts = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['payouts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get<ApiResponse<{
        payouts: Payout[];
        pagination: { page: number; limit: number; total: number; total_pages: number };
      }>>(`/payouts?${searchParams.toString()}`);
      
      return response.data;
    },
  });
};

export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      bank_account_id?: string;
      notes?: string;
    }) => {
      const response = await api.post<ApiResponse<{ payout: Payout }>>('/payouts', data);
      return response.data.payout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['creator-balance'] });
    },
  });
};

export const useCancelPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/payouts/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['creator-balance'] });
    },
  });
};

// ============================================
// ADMIN
// ============================================

export const useAdminPayouts = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-payouts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get<ApiResponse<{
        payouts: (Payout & { creator?: { id: string; name: string; email: string } })[];
        pagination: { page: number; limit: number; total: number; total_pages: number };
      }>>(`/payouts/admin/all?${searchParams.toString()}`);
      
      return response.data;
    },
  });
};

export const useProcessPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      action: 'approve' | 'reject';
      transfer_reference?: string;
      transfer_proof_url?: string;
      status_message?: string;
    }) => {
      const { id, ...payload } = data;
      await api.post(`/payouts/admin/${id}/process`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
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

export const INDONESIAN_BANKS = [
  { code: 'BCA', name: 'Bank Central Asia (BCA)' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
  { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
  { code: 'MANDIRI', name: 'Bank Mandiri' },
  { code: 'CIMB', name: 'CIMB Niaga' },
  { code: 'PERMATA', name: 'Bank Permata' },
  { code: 'DANAMON', name: 'Bank Danamon' },
  { code: 'BTN', name: 'Bank Tabungan Negara (BTN)' },
  { code: 'JAGO', name: 'Bank Jago' },
  { code: 'SEABANK', name: 'SeaBank' },
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
  { code: 'DANA', name: 'DANA' },
  { code: 'SHOPEEPAY', name: 'ShopeePay' },
];
