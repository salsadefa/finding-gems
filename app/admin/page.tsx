'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { 
  useAdminDashboard, 
  usePaymentAnalytics, 
  useUserAnalytics, 
  useAdminWebsites,
  usePendingWebsites,
  useModerateWebsite,
  useCreatorApplicationsAdmin,
  useCreatorApplicationStats,
  useHandleCreatorApplication,
  useReports,
  useHandleReport,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '@/lib/api/admin';
import { TableSkeleton, DashboardStatsSkeleton } from '@/components/Skeleton';
import {
    TrendingUp,
    MoreHorizontal,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    X,
    ExternalLink,
    Globe,
    AlertTriangle,
    Users,
    FileText,
    Save,
    Plus,
    Settings,
    Loader2
} from 'lucide-react';

// Loading States
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );
}

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            {Icon && <Icon size={48} className="mb-4 opacity-20" />}
            <p>{message}</p>
        </div>
    );
}

// ============================================
// CREATORS TAB COMPONENT
// ============================================
function CreatorsTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('');
    
    const { data, isLoading, error } = useCreatorApplicationsAdmin({ 
        page, 
        limit: 10, 
        status: statusFilter || undefined 
    });
    const { data: stats } = useCreatorApplicationStats();
    const handleApplication = useHandleCreatorApplication();
    const [selectedApplication, setSelectedApplication] = useState<NonNullable<typeof data>['applications'][0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async (id: string) => {
        await handleApplication.mutateAsync({ id, status: 'approved' });
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) return;
        await handleApplication.mutateAsync({ id, status: 'rejected', rejectionReason });
        setIsModalOpen(false);
        setSelectedApplication(null);
        setRejectionReason('');
    };

    const filteredApplications = data?.applications?.filter(app => 
        app.user.name.toLowerCase().includes(search.toLowerCase()) ||
        app.user.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="max-w-7xl relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Creator Applications</h2>
                    <p className="text-sm text-gray-500 mt-1">Review and manage creator applications</p>
                </div>
                <div className="flex gap-3">
                    <div className="inline-flex rounded-md shadow-sm">
                        {(['', 'pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status || 'all'}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-sm font-medium border ${
                                    statusFilter === status 
                                        ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } ${
                                    status === '' ? 'rounded-l-lg' : ''
                                } ${
                                    status === 'rejected' ? 'rounded-r-lg' : 'border-r-0'
                                }`}
                            >
                                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                                {stats && status && (
                                    <span className="ml-1.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                                        {status === 'pending' ? stats.pending : status === 'approved' ? stats.approved : status === 'rejected' ? stats.rejected : stats.total}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : error ? (
                    <EmptyState message="Error loading applications" />
                ) : filteredApplications.length === 0 ? (
                    <EmptyState message="No applications found" icon={CheckCircle} />
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Applicant</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Expertise</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Applied</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-right font-semibold text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm">
                                                    {app.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{app.user.name}</div>
                                                    <div className="text-xs text-gray-500">{app.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {app.expertise.slice(0, 3).map((exp, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                        {exp}
                                                    </span>
                                                ))}
                                                {app.expertise.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                        +{app.expertise.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                app.status === 'approved'
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : app.status === 'rejected'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    app.status === 'approved' ? 'bg-green-500' : 
                                                    app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`}></span>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(app);
                                                    setIsModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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

            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-blue-600">
                                        {selectedApplication.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedApplication.user.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedApplication.user.email}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                                            selectedApplication.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : selectedApplication.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Bio</h4>
                                <p className="text-sm text-gray-600">{selectedApplication.bio}</p>
                            </div>

                            {selectedApplication.professionalBackground && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Professional Background</h4>
                                    <p className="text-sm text-gray-600">{selectedApplication.professionalBackground}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplication.expertise.map((exp, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Motivation</h4>
                                <p className="text-sm text-gray-600">{selectedApplication.motivation}</p>
                            </div>

                            {selectedApplication.portfolioUrl && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Portfolio</h4>
                                    <a 
                                        href={selectedApplication.portfolioUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        {selectedApplication.portfolioUrl}
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}

                            {selectedApplication.rejectionReason && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className="text-sm font-bold text-red-900 mb-1">Rejection Reason</h4>
                                    <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        {selectedApplication.status === 'pending' && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (required for rejection)</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Enter reason for rejection..."
                                            className="w-full rounded-lg border-gray-300 border p-2.5 text-sm"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReject(selectedApplication.id)}
                                            disabled={handleApplication.isPending || !rejectionReason.trim()}
                                            className="flex-1 py-2.5 px-4 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {handleApplication.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedApplication.id)}
                                            disabled={handleApplication.isPending}
                                            className="flex-1 py-2.5 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {handleApplication.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// WEBSITES TAB COMPONENT
// ============================================
function WebsitesTab() {
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
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : error ? (
                    <EmptyState message="Error loading websites" />
                ) : data?.websites?.length === 0 ? (
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
                                    {data?.websites?.map((website) => (
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

// ============================================
// REPORTS TAB COMPONENT
// ============================================
function ReportsTab() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed' | ''>('pending');
    
    const { data, isLoading, error } = useReports({ 
        page, 
        limit: 10, 
        status: statusFilter || undefined 
    });
    const handleReport = useHandleReport();
    const [selectedReport, setSelectedReport] = useState<NonNullable<typeof data>['reports'][0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    const handleResolve = async (id: string, status: 'resolved' | 'dismissed') => {
        await handleReport.mutateAsync({ id, status, adminNote });
        setIsModalOpen(false);
        setSelectedReport(null);
        setAdminNote('');
    };

    return (
        <div className="max-w-7xl relative min-h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Moderation Queue</h2>
                    <p className="text-sm text-gray-500 mt-1">Review submissions and user reports</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {(['pending', 'resolved', 'dismissed'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                            statusFilter === status 
                                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" />
                                User Reports
                            </h3>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {data?.pagination?.total || 0} Total
                            </span>
                        </div>
                        
                        {isLoading ? (
                            <TableSkeleton rows={5} />
                        ) : error ? (
                            <EmptyState message="Error loading reports" />
                        ) : data?.reports?.length === 0 ? (
                            <EmptyState message="No reports found" icon={CheckCircle} />
                        ) : (
                            <>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Reported Website</th>
                                            <th className="px-6 py-3 font-medium">Reason</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data?.reports?.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{report.reportedWebsite?.name}</div>
                                                    <div className="text-xs text-gray-500">Reported by {report.reporter?.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                                                        {report.reason}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                        report.status === 'resolved'
                                                            ? 'bg-green-50 text-green-700'
                                                            : report.status === 'dismissed'
                                                            ? 'bg-gray-50 text-gray-700'
                                                            : 'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                        {report.status === 'resolved' && <CheckCircle size={12} />}
                                                        {report.status === 'dismissed' && <XCircle size={12} />}
                                                        {report.status === 'pending' && <Clock size={12} />}
                                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                                                    >
                                                        {report.status === 'pending' ? 'Review' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {data?.pagination && data.pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                        <div className="text-sm text-gray-500">
                                            Page {page} of {data.pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={!data.pagination.hasPrev}
                                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
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

                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Review Guidelines</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 block text-blue-500">•</span>
                                Ensure the website actually works and loads within 5 seconds.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 block text-blue-500">•</span>
                                Check for high quality UI/UX design.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 block text-blue-500">•</span>
                                Verify no offensive or illegal content.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">Report Details</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Website</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="font-medium text-gray-900">{selectedReport.reportedWebsite?.name}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-red-50 text-red-700">
                                    {selectedReport.reason}
                                </span>
                            </div>

                            {selectedReport.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                                <div className="text-sm text-gray-600">{selectedReport.reporter?.name} ({selectedReport.reporter?.email})</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div className="text-sm text-gray-600">{new Date(selectedReport.createdAt).toLocaleString()}</div>
                            </div>

                            {selectedReport.status === 'pending' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Add a note about this report..."
                                        className="w-full rounded-lg border-gray-300 border p-2.5 text-sm"
                                        rows={3}
                                    />
                                </div>
                            )}

                            {selectedReport.adminNote && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedReport.adminNote}</p>
                                </div>
                            )}
                        </div>

                        {selectedReport.status === 'pending' && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => handleResolve(selectedReport.id, 'dismissed')}
                                    disabled={handleReport.isPending}
                                    className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {handleReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Dismiss'}
                                </button>
                                <button
                                    onClick={() => handleResolve(selectedReport.id, 'resolved')}
                                    disabled={handleReport.isPending}
                                    className="flex-1 py-2.5 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {handleReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Resolve'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// SETTINGS TAB COMPONENT
// ============================================
function SettingsTab() {
    const [settingsTab, setSettingsTab] = useState<'general' | 'team' | 'audit'>('general');
    const [generalSettings, setGeneralSettings] = useState({
        platformName: 'Finding Gems',
        supportEmail: 'support@findinggems.com',
        maintenanceMode: false
    });
    const [adminTeam, setAdminTeam] = useState([
        { id: 1, name: 'Admin User', email: 'admin@findinggems.com', role: 'Superadmin', status: 'Active' }
    ]);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Admin' | 'Superadmin'>('Admin');
    const [isSuperAdmin] = useState(true);

    const handleInviteAdmin = () => {
        const newId = adminTeam.length + 1;
        setAdminTeam([...adminTeam, { id: newId, name: 'New Admin', email: inviteEmail, role: inviteRole, status: 'Pending' }]);
        setInviteModalOpen(false);
        setInviteEmail('');
    };

    return (
        <div className="max-w-5xl mx-auto min-h-[80vh]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage platform configuration and access</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    <Shield size={12} />
                    {isSuperAdmin ? 'Superadmin' : 'Admin'} Mode
                </span>
            </div>

            <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {(['general', 'team', 'audit'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSettingsTab(tab)}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                settingsTab === tab 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab === 'general' && <Settings size={16} className={`mr-2 ${settingsTab === tab ? 'text-blue-500' : 'text-gray-400'}`} />}
                            {tab === 'team' && <Users size={16} className={`mr-2 ${settingsTab === tab ? 'text-blue-500' : 'text-gray-400'}`} />}
                            {tab === 'audit' && <FileText size={16} className={`mr-2 ${settingsTab === tab ? 'text-blue-500' : 'text-gray-400'}`} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                {settingsTab === 'general' && (
                    <div className="p-8 max-w-2xl">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                <input
                                    type="text"
                                    value={generalSettings.platformName}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                <input
                                    type="email"
                                    value={generalSettings.supportEmail}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                                        <p className="text-xs text-gray-500 mt-1">Prevents public access during updates.</p>
                                    </div>
                                    <button
                                        onClick={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })}
                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            generalSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                            generalSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {settingsTab === 'team' && (
                    <div>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900">Admin Management</h3>
                            <button 
                                onClick={() => setInviteModalOpen(true)} 
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-colors"
                            >
                                <Plus size={16} /> Invite New Admin
                            </button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">User</th>
                                    <th className="px-6 py-3 font-medium">Role</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {adminTeam.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{admin.name}</div>
                                            <div className="text-xs text-gray-500">{admin.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                admin.role === 'Superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {admin.role === 'Superadmin' && <Shield size={10} />}
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-xs font-medium">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-600 hover:text-red-800">Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {settingsTab === 'audit' && (
                    <div>
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Security Audit Log</h3>
                        </div>
                        <div className="p-8 text-center text-gray-400">
                            Audit logs will be available in a future update.
                        </div>
                    </div>
                )}
            </div>

            {inviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Invite New Admin</h3>
                            <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={inviteEmail} 
                                    onChange={(e) => setInviteEmail(e.target.value)} 
                                    className="w-full rounded-lg border-gray-300 border p-2.5" 
                                    placeholder="colleague@findinggems.com" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['Admin', 'Superadmin'] as const).map((role) => (
                                        <button 
                                            key={role}
                                            onClick={() => setInviteRole(role)} 
                                            className={`p-3 rounded-lg border text-left ${
                                                inviteRole === role 
                                                    ? role === 'Superadmin' 
                                                        ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                                                        : 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="font-bold text-sm text-gray-900">{role}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {role === 'Superadmin' ? 'Full access control' : 'Can manage content'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={handleInviteAdmin} 
                                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 mt-2"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN DASHBOARD CONTENT
// ============================================
function AdminDashboardContent() {
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const tab = searchParams.get('tab');

    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboard();
    const { data: paymentAnalytics, isLoading: paymentLoading } = usePaymentAnalytics('30d');
    const { data: userAnalytics, isLoading: userLoading } = useUserAnalytics('30d');

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-6">You don&apos;t have permission to access this page.</p>
                <a href="/" className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                    Go Home
                </a>
            </div>
        );
    }

    if (tab === 'creators') return <CreatorsTab />;
    if (tab === 'websites') return <WebsitesTab />;
    if (tab === 'reports') return <ReportsTab />;
    if (tab === 'settings') return <SettingsTab />;

    return (
        <div className="max-w-6xl space-y-8">
            {dashboardLoading ? (
                <DashboardStatsSkeleton />
            ) : dashboardError ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    Error loading dashboard data. Please try again.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            label: 'Total Users', 
                            value: formatNumber(dashboardData?.overview?.total_users || 0), 
                            trend: dashboardData?.revenue?.growth_percent || 0, 
                            color: 'blue' 
                        },
                        { 
                            label: 'Total Creators', 
                            value: formatNumber(dashboardData?.overview?.total_creators || 0), 
                            trend: '+12%', 
                            color: 'purple' 
                        },
                        { 
                            label: 'Active Websites', 
                            value: formatNumber(dashboardData?.overview?.total_websites || 0), 
                            trend: '+5%', 
                            color: 'green' 
                        },
                        { 
                            label: 'Total Revenue', 
                            value: formatCompactCurrency(dashboardData?.revenue?.this_month || 0), 
                            trend: formatPercent(dashboardData?.revenue?.growth_percent || 0), 
                            color: 'orange' 
                        }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                <MoreHorizontal size={16} className="text-gray-300" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className={`text-xs font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <TrendingUp size={12} /> {stat.trend}
                                </div>
                                <span className="text-xs text-gray-400 ml-2">vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Revenue Growth</h3>
                        <select className="text-xs border-gray-200 rounded-lg text-gray-500 bg-gray-50 px-2 py-1">
                            <option>This Month</option>
                        </select>
                    </div>
                    {paymentLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : paymentAnalytics?.chart_data ? (
                        <div className="h-64 flex items-end justify-between gap-2 px-2 pb-2">
                            {paymentAnalytics.chart_data.map((data, i) => {
                                const maxRevenue = Math.max(...paymentAnalytics.chart_data.map(d => d.revenue));
                                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={i} className="w-full bg-blue-50 rounded-t-sm relative group">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all duration-500"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        />
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                                            {formatCompactCurrency(data.revenue)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState message="No revenue data available" />
                    )}
                    <div className="flex justify-between mt-4 text-xs text-gray-400 uppercase tracking-wide px-2">
                        {paymentAnalytics?.chart_data?.map((data, i) => (
                            <span key={i}>{new Date(data.date).getDate()}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">User Growth</h3>
                    {userLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : userAnalytics?.daily_signups ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">New Users (30d)</span>
                                <span className="text-lg font-bold text-gray-900">{userAnalytics.new_users}</span>
                            </div>
                            <div className="h-32 flex items-end justify-between gap-1">
                                {userAnalytics.daily_signups.map((day, i) => {
                                    const maxCount = Math.max(...userAnalytics.daily_signups.map(d => d.count));
                                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                    return (
                                        <div key={i} className="flex-1 bg-green-100 rounded-t-sm relative group">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-sm"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            />
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1 py-0.5 rounded pointer-events-none">
                                                {day.count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Users</span>
                                    <span className="font-medium">
                                        {Object.values(userAnalytics.total_by_role || {}).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState message="No user data available" />
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Pending Actions</h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {dashboardData?.pending?.creator_applications || 0} Applications
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                            {dashboardData?.pending?.refunds_count || 0} Refunds
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {dashboardLoading ? (
                        <TableSkeleton rows={3} />
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(dashboardData?.pending?.creator_applications || 0) === 0 && 
                                 (dashboardData?.pending?.refunds_count || 0) === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            No pending actions required. Good job!
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {(dashboardData?.pending?.creator_applications || 0) > 0 && (
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                        Application
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {dashboardData?.pending?.creator_applications} creator applications pending
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <a href="/admin?tab=creators" className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                        Review
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                        {(dashboardData?.pending?.refunds_count || 0) > 0 && (
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                        Refund
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {dashboardData?.pending?.refunds_count} refund requests pending
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <a href="/admin/refunds" className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                                        Review
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
