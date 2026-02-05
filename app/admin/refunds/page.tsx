'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAdminRefunds, 
  useProcessRefund,
  type Refund,
  REFUND_REASONS 
} from '@/lib/api/refund';
import { useAuth } from '@/lib/store';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Input } from '@/components/Input';
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCcw,
  User,
  FileText,
  Check,
  X
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

  const labels = {
    requested: 'Requested',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Process Refund Modal
function ProcessRefundModal({
  isOpen,
  onClose,
  refund,
}: {
  isOpen: boolean;
  onClose: () => void;
  refund: (Refund & { requester?: { id: string; name: string; email: string } }) | null;
}) {
  const [action, setAction] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [refundAmount, setRefundAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  const processRefund = useProcessRefund();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refund) return;

    try {
      await processRefund.mutateAsync({
        id: refund.id,
        action,
        refund_amount: action === 'approve' ? parseInt(refundAmount) || undefined : undefined,
        status_message: statusMessage || undefined,
        admin_notes: adminNotes || undefined,
      });
      onClose();
      setAction('approve');
      setRefundAmount('');
      setStatusMessage('');
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  if (!refund) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Process Refund #${refund.refund_number}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Refund Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Requester</span>
            <span className="text-sm font-medium">{refund.requester?.name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Original Amount</span>
            <span className="text-sm font-medium">
              Rp {refund.original_amount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Requested Amount</span>
            <span className="text-sm font-medium">
              Rp {refund.refund_amount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Reason</span>
            <span className="text-sm font-medium">
              {REFUND_REASONS.find(r => r.value === refund.reason_category)?.label || refund.reason}
            </span>
          </div>
          {refund.reason && refund.reason !== refund.reason_category && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">{refund.reason}</p>
            </div>
          )}
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Action *</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                action === 'approve'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setAction('reject')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                action === 'reject'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <X className="w-4 h-4 inline mr-2" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setAction('complete')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                action === 'complete'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Complete
            </button>
          </div>
        </div>

        {action === 'approve' && (
          <Input
            label="Refund Amount (Optional - defaults to requested amount)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder={refund.refund_amount.toString()}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Message (Optional)</label>
          <input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="Message to display to the user..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Internal)</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes about this decision..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            loading={processRefund.isPending}
            variant={action === 'reject' ? 'danger' : 'primary'}
          >
            {action === 'approve' && 'Approve Refund'}
            {action === 'reject' && 'Reject Refund'}
            {action === 'complete' && 'Mark as Completed'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminRefundsPage() {
  const { user, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState('requested');
  const [page, setPage] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState<(Refund & { requester?: { id: string; name: string; email: string } }) | null>(null);

  const { data: refundsData, isLoading } = useAdminRefunds({
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link href="/login">
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.div
                whileHover={{ x: -4 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
              <p className="text-gray-600 mt-1">Review and process refund requests</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Pending', value: refundsData?.refunds.filter(r => r.status === 'requested').length || 0, color: 'yellow' },
            { label: 'Under Review', value: refundsData?.refunds.filter(r => r.status === 'under_review').length || 0, color: 'blue' },
            { label: 'Approved', value: refundsData?.refunds.filter(r => r.status === 'approved').length || 0, color: 'green' },
            { label: 'Completed', value: refundsData?.refunds.filter(r => r.status === 'completed').length || 0, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 border border-gray-200"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

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
            <option value="">All Status</option>
            <option value="requested">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </motion.div>

        {/* Refunds Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : refundsData?.refunds && refundsData.refunds.length > 0 ? (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {refundsData.refunds.map((refund, index) => (
                        <motion.tr
                          key={refund.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm">{refund.refund_number}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{refund.requester?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{refund.requester?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium">
                                Rp {refund.refund_amount.toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500">
                                of Rp {refund.original_amount.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">
                              {REFUND_REASONS.find(r => r.value === refund.reason_category)?.label || refund.reason}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={refund.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(refund.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {['requested', 'under_review', 'approved'].includes(refund.status) && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedRefund(refund)}
                              >
                                Process
                              </Button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>

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
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <RefreshCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No refunds found</h3>
            <p className="text-gray-600">There are no refund requests matching your criteria.</p>
          </motion.div>
        )}
      </main>

      {/* Process Modal */}
      <ProcessRefundModal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        refund={selectedRefund}
      />
    </motion.div>
  );
}
