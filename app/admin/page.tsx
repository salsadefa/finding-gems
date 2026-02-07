'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { 
  useAdminDashboard, 
  usePaymentAnalytics, 
  useUserAnalytics, 
  useTopPerformers,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '@/lib/api/admin';
import { TableSkeleton, DashboardStatsSkeleton } from '@/components/Skeleton';
import { TrendingUp, MoreHorizontal, Globe, Clock, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

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

// Dynamic imports for heavy tabs - each loads on demand
const CreatorsTab = dynamic(() => import('./tabs/CreatorsTab'), {
  loading: () => <TableSkeleton rows={5} />,
  ssr: false
});

const WebsitesTab = dynamic(() => import('./tabs/WebsitesTab'), {
  loading: () => <TableSkeleton rows={5} />,
  ssr: false
});

const ReportsTab = dynamic(() => import('./tabs/ReportsTab'), {
  loading: () => <TableSkeleton rows={5} />,
  ssr: false
});

const UsersTab = dynamic(() => import('./tabs/UsersTab'), {
  loading: () => <TableSkeleton rows={5} />,
  ssr: false
});

const SettingsTab = dynamic(() => import('./tabs/SettingsTab'), {
  loading: () => <div className="p-12 text-center text-gray-400">Loading settings...</div>,
  ssr: false
});

// ============================================
// MAIN DASHBOARD CONTENT - Only loads overview data
// ============================================
function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const tab = searchParams.get('tab');
  
  // Load dashboard data immediately (critical)
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboard();
  
  // Load analytics data
  const { data: paymentAnalytics, isLoading: paymentLoading } = usePaymentAnalytics('30d');
  const { data: userAnalytics, isLoading: userLoading } = useUserAnalytics('30d');
  const { data: topPerformers, isLoading: topPerformersLoading } = useTopPerformers();

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

  // Render tab based on URL
  if (tab === 'creators') return <CreatorsTab />;
  if (tab === 'websites') return <WebsitesTab />;
  if (tab === 'reports') return <ReportsTab />;
  if (tab === 'users') return <UsersTab />;
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

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Websites */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">Top Performing Websites</h3>
            <span className="text-xs text-gray-500">By Revenue</span>
          </div>
          {topPerformersLoading ? (
            <div className="p-8">
              <TableSkeleton rows={5} />
            </div>
          ) : topPerformers?.top_websites?.length === 0 ? (
            <EmptyState message="No website data available" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Website</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topPerformers?.top_websites?.slice(0, 5).map((item, index) => (
                    <tr key={item.website.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{item.website.name}</div>
                            <div className="text-xs text-gray-500">{item.website.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">
                        {formatCompactCurrency(item.revenue)}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">
                        {item.orders} orders
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Creators */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">Top Creators</h3>
            <span className="text-xs text-gray-500">By Earnings</span>
          </div>
          {topPerformersLoading ? (
            <div className="p-8">
              <TableSkeleton rows={5} />
            </div>
          ) : topPerformers?.top_creators?.length === 0 ? (
            <EmptyState message="No creator data available" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Creator</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Earnings</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topPerformers?.top_creators?.slice(0, 5).map((item, index) => (
                    <tr key={item.creator.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{item.creator.name}</div>
                            <div className="text-xs text-gray-500">{item.creator.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-green-600">
                        {formatCompactCurrency(item.earnings)}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">
                        {item.orders} orders
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
