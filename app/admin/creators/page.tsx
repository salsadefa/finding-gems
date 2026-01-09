'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useToast } from '@/lib/store';
import { mockCreatorApplications, mockCreatorProfiles, mockUsers } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import Button from '@/components/Button';

export default function AdminCreatorsPage() {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [applications, setApplications] = useState(mockCreatorApplications);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Admin Access Required</h1></div>;
    }

    const handleApprove = (id: string) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
        showToast('Creator approved!', 'success');
    };

    const handleReject = (id: string) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as const } : a));
        showToast('Application rejected', 'info');
    };

    const verifiedCreators = mockUsers.filter(u => u.role === 'creator');

    return (
        <div className="creators-page">
            <div className="container">
                <Link href="/admin" className="back-link">← Back to Dashboard</Link>
                <h1>Creator Management</h1>
                <p className="subtitle">Verify creator applications and manage existing creators</p>

                <section className="section">
                    <h2>Pending Applications ({applications.filter(a => a.status === 'pending').length})</h2>
                    {applications.filter(a => a.status === 'pending').length > 0 ? (
                        <div className="applications-list">
                            {applications.filter(a => a.status === 'pending').map(app => (
                                <div key={app.id} className="application-card">
                                    <div className="app-header">
                                        <div className="avatar">{app.user.name.charAt(0)}</div>
                                        <div>
                                            <strong>{app.user.name}</strong>
                                            <span>{app.user.email}</span>
                                        </div>
                                        <span className="app-date">Applied {formatDate(app.createdAt)}</span>
                                    </div>
                                    <div className="app-details">
                                        <div className="detail"><label>Background</label><span>{app.professionalBackground}</span></div>
                                        <div className="detail"><label>Expertise</label><span>{app.expertise.join(', ')}</span></div>
                                        <div className="detail"><label>Motivation</label><p>{app.motivation}</p></div>
                                        {app.portfolioUrl && <div className="detail"><label>Portfolio</label><a href={app.portfolioUrl} target="_blank">{app.portfolioUrl}</a></div>}
                                    </div>
                                    <div className="app-actions">
                                        <Button onClick={() => handleApprove(app.id)}>Approve</Button>
                                        <Button variant="ghost" onClick={() => handleReject(app.id)}>Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty">No pending applications</p>
                    )}
                </section>

                <section className="section">
                    <h2>Verified Creators ({verifiedCreators.length})</h2>
                    <div className="creators-table">
                        <div className="table-header">
                            <span>Creator</span>
                            <span>Background</span>
                            <span>Websites</span>
                            <span>Rating</span>
                        </div>
                        {mockCreatorProfiles.map(profile => {
                            const creator = mockUsers.find(u => u.id === profile.userId);
                            return (
                                <div key={profile.userId} className="table-row">
                                    <span className="creator-cell">
                                        <div className="avatar">{creator?.name.charAt(0)}</div>
                                        <div>
                                            <strong>{creator?.name}</strong>
                                            <small>{creator?.email}</small>
                                        </div>
                                    </span>
                                    <span>{profile.professionalBackground}</span>
                                    <span>{profile.totalWebsites}</span>
                                    <span>⭐ {profile.rating}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <style jsx>{`
        .creators-page { padding: 32px 0 64px; min-height: 80vh; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .subtitle { color: var(--gray-500); margin-bottom: 32px; }
        .section { margin-bottom: 40px; }
        .section h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; }
        .applications-list { display: flex; flex-direction: column; gap: 16px; }
        .application-card { background: var(--gray-50); border-radius: 16px; padding: 24px; }
        .app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .avatar { width: 48px; height: 48px; background: var(--gray-200); border-radius: 999px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .app-header strong { display: block; } .app-header span { font-size: 13px; color: var(--gray-500); }
        .app-date { margin-left: auto; font-size: 12px; color: var(--gray-400); }
        .app-details { display: grid; gap: 12px; margin-bottom: 20px; padding: 16px; background: var(--background); border-radius: 12px; }
        .detail label { font-size: 12px; font-weight: 500; color: var(--gray-500); display: block; margin-bottom: 4px; }
        .detail span, .detail p { font-size: 14px; } .detail a { font-size: 14px; color: var(--info); }
        .app-actions { display: flex; gap: 12px; }
        .empty { color: var(--gray-500); padding: 32px; text-align: center; background: var(--gray-50); border-radius: 12px; }
        .creators-table { background: var(--gray-50); border-radius: 16px; overflow: hidden; }
        .table-header, .table-row { display: grid; grid-template-columns: 2fr 1.5fr 0.8fr 0.8fr; gap: 16px; padding: 16px 24px; align-items: center; }
        .table-header { background: var(--gray-100); font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--gray-500); }
        .table-row { border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table-row:last-child { border-bottom: none; }
        .creator-cell { display: flex; align-items: center; gap: 12px; } .creator-cell strong { display: block; } .creator-cell small { color: var(--gray-500); font-size: 12px; }
      `}</style>
        </div>
    );
}
