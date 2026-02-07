'use client';

import { useState } from 'react';
import { 
  useReports,
  useHandleReport,
} from '@/lib/api/admin';
import { TableSkeleton } from '@/components/Skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
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

export default function ReportsTab() {
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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
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
