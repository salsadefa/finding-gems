'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api as apiHttp } from '@/lib/api/client';
import {
  useOrder,
  billingKeys,
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
  type Order,
} from '@/lib/api/billing';
import { useRequestRefund, REFUND_REASONS } from '@/lib/api/refund';
import { useAuth, useToast } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import EscrowStatusBadge, { type EscrowStatus } from '@/components/EscrowStatusBadge';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCcw,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

type OrderWithEscrow = Order & {
  escrow_status?: string;
  escrowStatus?: string;
  paid_at?: string;
  paidAt?: string;
};

function getEscrowStatus(order: Order): EscrowStatus | undefined {
  const o = order as OrderWithEscrow;
  const raw = o.escrow_status ?? o.escrowStatus;
  if (typeof raw !== 'string') return undefined;
  const normalized = raw.toLowerCase();
  if (normalized === 'held' || normalized === 'released' || normalized === 'refunded' || normalized === 'disputed') {
    return normalized;
  }
  return undefined;
}

function getPaidAtISO(order: Order): string | undefined {
  const o = order as OrderWithEscrow;
  const raw = o.paid_at ?? o.paidAt;
  return typeof raw === 'string' ? raw : undefined;
}

function daysUntil(dateIso: string) {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function RefundRequestModal({
  isOpen,
  onClose,
  order,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}) {
  const [reasonCategory, setReasonCategory] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const requestRefund = useRequestRefund();

  const requestEscrowRefund = useMutation({
    mutationFn: async (payload: {
      order_id: string;
      reason: string;
      reason_category?: string;
      evidence_urls?: string[];
    }) => {
      return await apiHttp.post(`/orders/${payload.order_id}/request-refund`, {
        reason: payload.reason,
        reason_category: payload.reason_category,
        evidence_urls: payload.evidence_urls,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      const escrowStatus = getEscrowStatus(order);
      try {
        if (escrowStatus) {
          await requestEscrowRefund.mutateAsync({
            order_id: order.id,
            reason,
            reason_category: reasonCategory,
          });
        } else {
          await requestRefund.mutateAsync({
            order_id: order.id,
            reason,
            reason_category: reasonCategory,
          });
        }
      } catch (err: any) {
        if (escrowStatus && err?.response?.status === 404) {
          await requestRefund.mutateAsync({
            order_id: order.id,
            reason,
            reason_category: reasonCategory,
          });
        } else {
          throw err;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: billingKeys.myOrders() }),
        queryClient.invalidateQueries({ queryKey: billingKeys.order(order.id) }),
      ]);

      showToast('Refund request submitted. We will review it soon.', 'success');
      onClose();
      setReason('');
      setReasonCategory('');
    } catch (error) {
      console.error('Failed to request refund:', error);
      showToast('Failed to submit refund request. Please try again.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Refund">
      {order && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-semibold text-gray-900">{order.order_number}</p>
            <p className="text-sm text-gray-600 mt-1">{order.item_name}</p>
            <p className="font-medium text-gray-900 mt-2">{formatPrice(order.total_amount)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason Category *</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              <option value="">Select a reason</option>
              {REFUND_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide more details about your refund request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Refund requests are typically processed within 3-5 business days.
              You will be notified once your request has been reviewed.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={requestRefund.isPending || requestEscrowRefund.isPending}
              disabled={!reasonCategory || !reason}
            >
              Submit Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ConfirmDeliveryModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  isConfirming,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string) => void;
  isConfirming: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delivery">
      {order && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-semibold text-gray-900">{order.order_number}</p>
            <p className="text-sm text-gray-600 mt-1">{order.item_name}</p>
            <p className="font-medium text-gray-900 mt-2">{formatPrice(order.total_amount)}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-900 font-medium">What happens when you confirm?</p>
            <p className="text-sm text-yellow-800 mt-1">
              Your payment will be released to the creator. If there is an issue with the delivery, request a refund before confirming.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              loading={isConfirming}
              onClick={() => onConfirm(order.id)}
            >
              Yes, I received it
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function PurchaseDetailPage({ params }: PageProps) {
  const { orderId } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);

  const { data, isLoading, error } = useOrder(orderId);
  const order = data?.order;

  const escrowStatus = order ? getEscrowStatus(order) : undefined;
  const escrowEnabled = !!escrowStatus;
  const canConfirmDelivery = !!order && order.status === 'paid' && escrowStatus === 'held';

  const refundEligibility = useMemo(() => {
    if (!order || order.status !== 'paid') return { canRequestRefund: false, eligibleUntilIso: undefined as string | undefined };
    if (!escrowEnabled) return { canRequestRefund: true, eligibleUntilIso: undefined as string | undefined };
    if (escrowStatus !== 'held') return { canRequestRefund: false, eligibleUntilIso: undefined as string | undefined };

    const paidAt = getPaidAtISO(order) ?? order.created_at;
    const paidMs = new Date(paidAt).getTime();
    if (Number.isNaN(paidMs)) return { canRequestRefund: true, eligibleUntilIso: undefined as string | undefined };
    const eligibleUntilMs = paidMs + 14 * 24 * 60 * 60 * 1000;
    return {
      canRequestRefund: Date.now() <= eligibleUntilMs,
      eligibleUntilIso: new Date(eligibleUntilMs).toISOString(),
    };
  }, [escrowEnabled, escrowStatus, order]);

  const confirmDelivery = useMutation({
    mutationFn: async (id: string) => {
      return await apiHttp.post(`/orders/${id}/confirm-delivery`, { confirmed: true });
    },
    onSuccess: async (_data, id) => {
      showToast('Delivery confirmed. Funds will be processed for the creator.', 'success');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: billingKeys.myOrders() }),
        queryClient.invalidateQueries({ queryKey: billingKeys.order(id) }),
        queryClient.invalidateQueries({ queryKey: ['creator-balance'] }),
      ]);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 404) return showToast('Confirm delivery is not available yet on this environment.', 'info');
      if (status === 401) return showToast('Please log in to confirm delivery.', 'info');
      if (status === 403) return showToast('You are not allowed to confirm this order.', 'error');
      return showToast('Failed to confirm delivery. Please try again.', 'error');
    },
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view this purchase.</p>
          <Link href={`/login?redirect=/dashboard/purchases/${orderId}`}>
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you’re looking for doesn’t exist or you don’t have access.</p>
          <Link href="/dashboard/purchases">
            <Button>Back to Purchases</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/purchases" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.order_number}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={order.website?.thumbnail || '/placeholder-website.png'}
                alt={order.item_name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{order.item_name}</h2>
                  <p className="text-sm text-gray-500">Purchased {formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                  {escrowEnabled && order.status === 'paid' && (
                    <div className="mt-2">
                      <EscrowStatusBadge status={escrowStatus} />
                    </div>
                  )}
                </div>
              </div>

              {escrowEnabled && order.status === 'paid' && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {escrowStatus === 'held' && (
                      <>Your payment is being held until you confirm delivery (or it auto-releases after 7 days).</>
                    )}
                    {escrowStatus === 'released' && <>Funds have been released to the creator.</>}
                    {escrowStatus === 'disputed' && <>Refund requested. Our team will review your case before funds are released.</>}
                    {escrowStatus === 'refunded' && <>This order has been refunded.</>}
                  </p>

                  <details className="mt-2">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer select-none">What happens next?</summary>
                    <div className="mt-2 text-sm text-gray-600">
                      {escrowStatus === 'held' && (
                        <>Confirm delivery to release funds. If you don’t confirm, the system may auto-release after a short holding period.</>
                      )}
                      {escrowStatus === 'released' && <>The creator can now withdraw their earnings through the payout flow.</>}
                      {escrowStatus === 'disputed' && <>We’ll review your refund request and keep you updated on the result.</>}
                      {escrowStatus === 'refunded' && <>Refund processing time depends on your payment provider.</>}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
            {order.website?.slug && (
              <Link href={`/website/${order.website.slug}`}>
                <Button variant="outline" size="sm">
                  View Product
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}

            {order.status === 'paid' && (
              <Link href={`/dashboard/purchases/${order.id}/invoice`}>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Invoice
                </Button>
              </Link>
            )}

            {canConfirmDelivery && (
              <Button size="sm" onClick={() => setConfirmOrder(order)}>
                <Check className="w-4 h-4 mr-1" />
                Confirm Delivery
              </Button>
            )}

            {refundEligibility.canRequestRefund && (
              <Button variant="outline" size="sm" onClick={() => setRefundOrder(order)}>
                <RefreshCcw className="w-4 h-4 mr-1" />
                Request Refund
              </Button>
            )}

            {escrowEnabled && refundEligibility.eligibleUntilIso && (
              <p className="text-xs text-gray-500 self-center">
                Refund window: {Math.max(0, daysUntil(refundEligibility.eligibleUntilIso))} day(s) left
              </p>
            )}
          </div>
        </div>
      </main>

      <RefundRequestModal isOpen={!!refundOrder} onClose={() => setRefundOrder(null)} order={refundOrder} />
      <ConfirmDeliveryModal
        isOpen={!!confirmOrder}
        onClose={() => setConfirmOrder(null)}
        order={confirmOrder}
        isConfirming={confirmDelivery.isPending}
        onConfirm={async (id) => {
          try {
            await confirmDelivery.mutateAsync(id);
            setConfirmOrder(null);
          } catch {
            // handled by onError
          }
        }}
      />
    </motion.div>
  );
}
