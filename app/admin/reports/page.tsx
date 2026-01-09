'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useToast } from '@/lib/store';
import { mockReports } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import Button from '@/components/Button';

export default function AdminReportsPage() {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [reports, setReports] = useState(mockReports);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Admin Access Required</h1></div>;
    }

    const handleResolve = (id: string) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' as const } : r));
        showToast('Report resolved', 'success');
    };

    const handleDismiss = (id: string) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' as const } : r));
        showToast('Report dismissed', 'info');
    };

    return (
        <div className="reports-page">
            <div className="container">
                <Link href="/admin" className="back-link">← Back to Dashboard</Link>
                <h1>Moderation Queue</h1>
                <p className="subtitle">Review reported listings and take action</p>

                <div className="reports-list">
                    {reports.map(report => (
                        <div key={report.id} className={`report-card status-${report.status}`}>
                            <div className="report-header">
                                <div className="website-info">
                                    <div className="thumb">{report.website.name.charAt(0)}</div>
                                    <div>
                                        <strong>{report.website.name}</strong>
                                        <Link href={`/website/${report.website.slug}`}>View Website →</Link>
                                    </div>
                                </div>
                                <span className={`status-badge ${report.status}`}>{report.status}</span>
                            </div>
                            <div className="report-body">
                                <div className="detail"><label>Reason</label><span>{report.reason}</span></div>
                                <div className="detail"><label>Description</label><p>{report.description}</p></div>
                                <div className="detail"><label>Reported by</label><span>{report.reporter.name} on {formatDate(report.createdAt)}</span></div>
                            </div>
                            {report.status === 'pending' && (
                                <div className="report-actions">
                                    <Button onClick={() => handleResolve(report.id)}>Mark Resolved</Button>
                                    <Button variant="ghost" onClick={() => handleDismiss(report.id)}>Dismiss</Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .reports-page { padding: 32px 0 64px; min-height: 80vh; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .subtitle { color: var(--gray-500); margin-bottom: 32px; }
        .reports-list { display: flex; flex-direction: column; gap: 16px; }
        .report-card { background: var(--gray-50); border-radius: 16px; padding: 24px; border-left: 4px solid var(--warning); }
        .report-card.status-resolved { border-left-color: var(--success); opacity: 0.7; }
        .report-card.status-dismissed { border-left-color: var(--gray-400); opacity: 0.7; }
        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .website-info { display: flex; align-items: center; gap: 12px; }
        .thumb { width: 48px; height: 48px; background: var(--gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; }
        .website-info strong { display: block; }
        .website-info a { font-size: 13px; color: var(--info); }
        .status-badge { padding: 4px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; }
        .status-badge.pending { background: rgba(202,138,4,0.1); color: var(--warning); }
        .status-badge.resolved { background: rgba(22,163,74,0.1); color: var(--success); }
        .status-badge.dismissed { background: var(--gray-200); color: var(--gray-500); }
        .report-body { padding: 16px; background: var(--background); border-radius: 12px; margin-bottom: 16px; }
        .detail { margin-bottom: 12px; } .detail:last-child { margin-bottom: 0; }
        .detail label { font-size: 12px; font-weight: 500; color: var(--gray-500); display: block; margin-bottom: 4px; }
        .detail span, .detail p { font-size: 14px; }
        .report-actions { display: flex; gap: 12px; }
      `}</style>
        </div>
    );
}
