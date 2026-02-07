'use client';

import { useState } from 'react';
import { 
  useCreatorApplicationsAdmin,
  useCreatorApplicationStats,
  useHandleCreatorApplication,
} from '@/lib/api/admin';
import { TableSkeleton } from '@/components/Skeleton';
import {
  Search,
  CheckCircle,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
      {Icon && <Icon size={48} className="mb-4 opacity-20" />}
      <p>{message}</p>
    </div>
  );
}

export default function CreatorsTab() {
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
