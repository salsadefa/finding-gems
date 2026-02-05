'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/store';
import { 
  useCreatorSales,
  formatPrice, 
  getOrderStatusColor, 
  getOrderStatusLabel,
  Order
} from '@/lib/api/billing';
import Button from '@/components/Button';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Eye,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CreatorSalesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { 
    data: salesData, 
    isLoading: salesLoading 
  } = useCreatorSales(statusFilter || undefined, page, 10);

  // Check permissions
  if (!authLoading && (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Creator Access Required</h2>
          <p className="text-gray-600 mb-4">This page is only available for creators.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your earnings and sales performance</p>
            </div>
            <Link href="/dashboard/sales/payout">
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {salesData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Package className="w-6 h-6" />}
              label="Total Orders"
              value={salesData.stats.total_orders.toString()}
              color="blue"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="Total Revenue"
              value={formatPrice(salesData.stats.total_revenue)}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Platform Fees"
              value={formatPrice(salesData.stats.platform_fees)}
              color="yellow"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="Net Revenue"
              value={formatPrice(salesData.stats.net_revenue)}
              color="purple"
              highlight
            />
          </div>
        )}

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
          </select>
        </div>

        {/* Sales Table */}
        {salesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : salesData?.sales && salesData.sales.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Buyer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesData.sales.map((sale: Order & { buyer?: { name: string; email: string } }) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            {sale.website?.thumbnail && (
                              <Image
                                src={sale.website.thumbnail}
                                alt={sale.item_name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{sale.item_name}</p>
                            <p className="text-sm text-gray-500">#{sale.order_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{sale.buyer?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{sale.buyer?.email || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(sale.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(sale.total_amount)}</p>
                        <p className="text-sm text-gray-500">Fee: {formatPrice(sale.platform_fee)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(sale.status)}`}>
                          {getOrderStatusLabel(sale.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/sales/${sale.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {salesData.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {salesData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= salesData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  highlight = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'blue' | 'green' | 'yellow' | 'purple';
  highlight?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${highlight ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl">
      <div className="text-gray-300 mb-4 flex justify-center">
        <Package className="w-16 h-16" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        When customers purchase your products, they'll appear here.
      </p>
      <Link href="/dashboard/websites">
        <Button>
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Manage Products
        </Button>
      </Link>
    </div>
  );
}
