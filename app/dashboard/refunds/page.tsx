'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useRefunds, 
  useCancelRefund,
  type Refund,
  REFUND_REASONS 
} from '@/lib/api/refund';
import { useAuth } from '@/lib/store';
import Button from '@/components/Button';
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

// Status badge component
function StatusBadge({ status }: { status: Refund['status'] }) {
  const styles = {
    requested: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    under_review: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const icons = {
    requested: Clock,
    under_review: AlertCircle,
    approved: CheckCircle2,
    rejected: XCircle,
    processing: RefreshCcw,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const labels = {
    requested: 'Requested',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {labels[status]}
    </span>
  );
}

// Refund Card Component
function RefundCard({ refund }: { refund: Refund }) {
  const cancelRefund = useCancelRefund();

  const canCancel = ['requested', 'under_review'].includes(refund.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={refund.status} />
            <span className="text-sm text-gray-400">
              {formatDate(refund.created_at)}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900">
            Refund #{refund.refund_number}
          </h3>
          
          {refund.order && (
            <p className="text-sm text-gray-500 mt-1">
              Order: {refund.order.order_number}
            </p>
          )}
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Reason: </span>
              {REFUND_REASONS.find(r => r.value === refund.reason_category)?.label || refund.reason}
            </p>
            {refund.reason && refund.reason !== refund.reason_category && (
              <p className="text-sm text-gray-500 mt-1">{refund.reason}</p>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div>
              <p className="text-xs text-gray-400">Original Amount</p>
              <p className="font-medium text-gray-900">
                Rp {refund.original_amount.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Refund Amount</p>
              <p className="font-medium text-green-600">
                Rp {refund.refund_amount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          
          {refund.status_message && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">{refund.status_message}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to cancel this refund request?')) {
                  cancelRefund.mutate(refund.id);
                }
              }}
              loading={cancelRefund.isPending}
            >
              Cancel Request
            </Button>
          )}
          <Link href={`/dashboard/purchases/${refund.order_id}`}>
            <Button variant="ghost" size="sm">
              View Order
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function RefundsPage() {
  const { user, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: refundsData, isLoading } = useRefunds({
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your refunds.</p>
          <Link href="/login?redirect=/dashboard/refunds">
            <Button>Log In</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/purchases">
              <motion.div
                whileHover={{ x: -4 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Refunds</h1>
              <p className="text-gray-600 mt-1">Track your refund requests</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-6"
        >
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Refunds</option>
            <option value="requested">Requested</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </motion.div>

        {/* Refunds List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : refundsData?.refunds && refundsData.refunds.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {refundsData.refunds.map((refund) => (
                <RefundCard key={refund.id} refund={refund} />
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {refundsData.pagination.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {refundsData.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= refundsData.pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <RefreshCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No refunds yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven&apos;t requested any refunds. If you need a refund for a purchase, you can request one from your order details.
            </p>
            <Link href="/dashboard/purchases">
              <Button>View My Purchases</Button>
            </Link>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
