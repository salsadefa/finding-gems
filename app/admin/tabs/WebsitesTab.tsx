'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { 
  useAdminWebsites,
  usePendingWebsites,
  useModerateWebsite,
  formatNumber,
} from '@/lib/api/admin';
import { TableSkeleton } from '@/components/Skeleton';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
} from 'lucide-react';

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
      {Icon && <Icon size={48} className="mb-4 opacity-20" />}
      <p>{message}</p>
    </div>
  );
}

export default function WebsitesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'pending' | 'rejected' | 'suspended' | ''>('');
  
  const { data, isLoading, error } = useAdminWebsites({ 
    page, 
    limit: 10, 
    status: statusFilter || undefined,
    search: search || undefined
  });
  const { data: pendingWebsites } = usePendingWebsites();
  const moderateWebsite = useModerateWebsite();

  const handleModerate = async (id: string, status: 'active' | 'rejected', reason?: string) => {
    await moderateWebsite.mutateAsync({ id, status, reason });
  };

  const displayWebsites = statusFilter === 'pending' && pendingWebsites && pendingWebsites.length > 0
    ? pendingWebsites
    : data?.websites || [];
  
  const displayLoading = statusFilter === 'pending' 
    ? false
    : isLoading && !data;

  if (displayLoading) {
    return (
      <div className="max-w-7xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading websites...</p>
        </div>
      </div>
    );
  }

  if (error && !displayWebsites.length) {
    return (
      <div className="max-w-7xl p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Websites</h3>
        <p className="text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all websites listed on the platform</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Total Websites</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(data?.pagination?.total || 0)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatNumber(data?.websites?.filter(w => w.status === 'active').length || 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Pending</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {formatNumber(pendingWebsites?.length || 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase">Avg Rating</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {data?.websites?.length && data.websites.length > 0 
              ? (data.websites.reduce((acc, w) => acc + (w.rating || 0), 0) / data.websites.length).toFixed(1)
              : '0.0'
            }
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['', 'active', 'pending', 'suspended', 'rejected'] as const).map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border ${
              statusFilter === status 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {displayLoading ? (
          <TableSkeleton rows={5} />
        ) : displayWebsites.length === 0 ? (
          <EmptyState message="No websites found" icon={Globe} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayWebsites.map((website) => (
                    <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 overflow-hidden flex-shrink-0 relative">
                            {website.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{website.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{website.description?.substring(0, 60)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{website.creator?.name}</div>
                        <div className="text-xs text-gray-500">{website.creator?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {website.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatPrice(website.price)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          website.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : website.status === 'pending'
                            ? 'bg-orange-50 text-orange-700 border border-orange-100'
                            : website.status === 'suspended'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-gray-50 text-gray-700 border border-gray-100'
                        }`}>
                          {website.status === 'active' && <CheckCircle size={12} />}
                          {website.status === 'pending' && <Clock size={12} />}
                          {(website.status === 'suspended' || website.status === 'rejected') && <XCircle size={12} />}
                          {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`/website/${website.slug}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </a>
                          {website.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleModerate(website.id, 'active')}
                                disabled={moderateWebsite.isPending}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleModerate(website.id, 'rejected', 'Does not meet quality standards')}
                                disabled={moderateWebsite.isPending}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 10, data.pagination.total)}</span> of{' '}
                  <span className="font-medium">{data.pagination.total}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!data.pagination.hasPrev}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data.pagination.hasNext}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
