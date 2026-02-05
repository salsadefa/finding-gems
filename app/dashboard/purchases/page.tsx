'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/store';
import { 
  useMyOrders, 
  useMyAccess,
  formatPrice, 
  getOrderStatusColor, 
  getOrderStatusLabel,
  Order,
  UserAccess
} from '@/lib/api/billing';
import { useRequestRefund, REFUND_REASONS } from '@/lib/api/refund';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Input } from '@/components/Input';
import { 
  Package, 
  ExternalLink, 
  Clock, 
  Check, 
  Loader2,
  ShoppingBag,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCcw,
  ArrowLeft
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

type Tab = 'purchases' | 'access';

// Refund Request Modal
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
  
  const requestRefund = useRequestRefund();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      await requestRefund.mutateAsync({
        order_id: order.id,
        reason,
        reason_category: reasonCategory,
      });
      onClose();
      setReason('');
      setReasonCategory('');
    } catch (error) {
      console.error('Failed to request refund:', error);
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
              loading={requestRefund.isPending}
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

function PurchasesContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('purchases');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);

  const { 
    data: ordersData, 
    isLoading: ordersLoading 
  } = useMyOrders(statusFilter || undefined, page, 10);

  const { 
    data: accessData, 
    isLoading: accessLoading 
  } = useMyAccess();

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your purchases.</p>
          <Link href="/login?redirect=/dashboard/purchases">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
              <p className="text-gray-600 mt-1">View your purchase history and access your products</p>
            </div>
            <Link href="/dashboard/refunds">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  My Refunds
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-6 border-b border-gray-200"
        >
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'purchases'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Purchase History
            {activeTab === 'purchases' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab('access')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'access'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            My Access
            {activeTab === 'access' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'purchases' && (
            <motion.div
              key="purchases"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : ordersData?.orders && ordersData.orders.length > 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {ordersData.orders.map((order: Order, index: number) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onRequestRefund={setRefundOrder}
                      index={index}
                    />
                  ))}

                  {/* Pagination */}
                  {ordersData.pagination.totalPages > 1 && (
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
                        Page {page} of {ordersData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= ordersData.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<ShoppingBag className="w-16 h-16" />}
                  title="No purchases yet"
                  description="You haven't made any purchases yet. Browse our catalog to find something you like!"
                  action={
                    <Link href="/search">
                      <Button>Browse Products</Button>
                    </Link>
                  }
                />
              )}
            </motion.div>
          )}

          {activeTab === 'access' && (
            <motion.div
              key="access"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {accessLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : accessData && accessData.length > 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {accessData.map((access: UserAccess, index: number) => (
                    <AccessCard key={access.id} access={access} index={index} />
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<Package className="w-16 h-16" />}
                  title="No active access"
                  description="You don't have access to any products yet. Complete a purchase to get access!"
                  action={
                    <Link href="/search">
                      <Button>Browse Products</Button>
                    </Link>
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Refund Modal */}
      <RefundRequestModal
        isOpen={!!refundOrder}
        onClose={() => setRefundOrder(null)}
        order={refundOrder}
      />
    </motion.div>
  );
}

// Order Card Component
function OrderCard({ 
  order, 
  onRequestRefund,
  index 
}: { 
  order: Order; 
  onRequestRefund: (order: Order) => void;
  index: number;
}) {
  const canRequestRefund = order.status === 'paid';

  return (
    <motion.div 
      variants={fadeInUp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={order.website?.thumbnail || '/placeholder-website.png'}
            alt={order.item_name}
            fill
            className="object-cover"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{order.item_name}</h3>
              <p className="text-sm text-gray-500">Order #{order.order_number}</p>
              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getOrderStatusColor(order.status)}`}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
        {order.website?.slug && (
          <Link href={`/website/${order.website.slug}`}>
            <Button variant="outline" size="sm">
              View Product
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
        
        {order.status === 'paid' && (
          <>
            <Link href={`/dashboard/purchases/${order.id}/invoice`}>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Invoice
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRequestRefund(order)}
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Request Refund
            </Button>
          </>
        )}
        
        {order.status === 'pending' && (
          <Link href={`/checkout?website=${order.website_id}&resume=${order.id}`}>
            <Button size="sm">
              Complete Payment
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// Access Card Component
function AccessCard({ access, index }: { access: UserAccess; index: number }) {
  const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
  const website = access.website;

  return (
    <motion.div 
      variants={fadeInUp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isExpired ? 'opacity-60' : ''}`}
    >
      {/* Product Image */}
      <div className="relative h-40">
        <Image
          src={website?.thumbnail || '/placeholder-website.png'}
          alt={website?.name || 'Product'}
          fill
          className="object-cover"
        />
        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Expired
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{website?.name}</h3>
        
        {access.expires_at ? (
          <p className="text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4 inline mr-1" />
            {isExpired ? 'Expired' : `Expires ${formatDate(access.expires_at)}`}
          </p>
        ) : (
          <p className="text-sm text-green-600 mt-1">
            <Check className="w-4 h-4 inline mr-1" />
            Lifetime Access
          </p>
        )}

        {/* Access Button */}
        {!isExpired && website?.externalUrl && (
          <a
            href={website.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block"
          >
            <Button className="w-full" size="sm">
              Access Product
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </a>
        )}
        
        {!isExpired && website?.slug && (
          <Link href={`/website/${website.slug}`} className="mt-2 block">
            <Button variant="outline" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
        )}

        {isExpired && (
          <Link href={`/website/${website?.slug}`} className="mt-4 block">
            <Button className="w-full" size="sm">
              Renew Access
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}

export default function PurchasesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <PurchasesContent />
    </Suspense>
  );
}
