'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { mockPlatformStats, mockCreatorApplications, mockReports } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Admin Access Required</h1>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Please log in as an admin to access this dashboard.</p>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Log In</Link>
            </div>
        );
    }

    const stats = mockPlatformStats;

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="page-header">
                    <h1>Admin Dashboard</h1>
                    <p>Platform management and moderation</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Websites</span>
                        <span className="stat-value">{stats.totalWebsites}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Creators</span>
                        <span className="stat-value">{stats.totalCreators}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Buyers</span>
                        <span className="stat-value">{stats.totalBuyers}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatPrice(stats.totalRevenue)}</span>
                    </div>
                </div>

                <div className="alerts">
                    {stats.pendingVerifications > 0 && (
                        <div className="alert alert-warning">
                            <span>⚠️ {stats.pendingVerifications} pending creator verification(s)</span>
                            <Link href="/admin/creators">Review →</Link>
                        </div>
                    )}
                    {stats.pendingReports > 0 && (
                        <div className="alert alert-error">
                            <span>🚨 {stats.pendingReports} pending report(s)</span>
                            <Link href="/admin/reports">Review →</Link>
                        </div>
                    )}
                </div>

                <div className="dashboard-grid">
                    <section className="section">
                        <div className="section-header">
                            <h2>Pending Creator Applications</h2>
                            <Link href="/admin/creators">View All →</Link>
                        </div>
                        {mockCreatorApplications.filter(a => a.status === 'pending').map(app => (
                            <div key={app.id} className="list-item">
                                <div className="avatar">{app.user.name.charAt(0)}</div>
                                <div className="item-info">
                                    <strong>{app.user.name}</strong>
                                    <span>{app.professionalBackground}</span>
                                </div>
                                <Link href="/admin/creators" className="btn btn-primary btn-sm">Review</Link>
                            </div>
                        ))}
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Recent Reports</h2>
                            <Link href="/admin/reports">View All →</Link>
                        </div>
                        {mockReports.filter(r => r.status === 'pending').map(report => (
                            <div key={report.id} className="list-item">
                                <div className="item-info">
                                    <strong>{report.website.name}</strong>
                                    <span>{report.reason}</span>
                                </div>
                                <Link href="/admin/reports" className="btn btn-secondary btn-sm">Review</Link>
                            </div>
                        ))}
                    </section>
                </div>

                <section className="quick-links">
                    <Link href="/admin/creators" className="quick-link">👤 Manage Creators</Link>
                    <Link href="/admin/categories" className="quick-link">📁 Manage Categories</Link>
                    <Link href="/admin/reports" className="quick-link">🚨 Moderation Queue</Link>
                </section>
            </div>

            <style jsx>{`
        .admin-dashboard { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { margin-bottom: 32px; }
        .page-header h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; } @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat-card { padding: 24px; background: var(--gray-50); border-radius: 16px; }
        .stat-label { font-size: 13px; color: var(--gray-500); display: block; }
        .stat-value { font-size: 1.75rem; font-weight: 700; display: block; margin-top: 4px; }
        .alerts { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .alert { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-radius: 12px; font-size: 14px; }
        .alert-warning { background: rgba(202,138,4,0.1); border: 1px solid rgba(202,138,4,0.3); }
        .alert-error { background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.3); }
        .alert a { font-weight: 500; }
        .dashboard-grid { display: grid; gap: 24px; } @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }
        .section { background: var(--gray-50); border-radius: 16px; padding: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-header h2 { font-size: 1rem; font-weight: 600; }
        .section-header a { font-size: 14px; color: var(--gray-500); }
        .list-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--background); border-radius: 8px; margin-bottom: 8px; }
        .avatar { width: 40px; height: 40px; background: var(--gray-200); border-radius: 999px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .item-info { flex: 1; } .item-info strong { display: block; font-size: 14px; } .item-info span { font-size: 12px; color: var(--gray-500); }
        .quick-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        .quick-link { padding: 24px; background: var(--foreground); color: var(--background); border-radius: 12px; text-align: center; font-weight: 500; transition: opacity 0.2s; }
        .quick-link:hover { opacity: 0.9; color: var(--background); }
      `}</style>
        </div>
    );
}
