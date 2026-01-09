'use client';

import Link from 'next/link';
import { useAuth, usePurchases, useToast } from '@/lib/store';
import { mockPurchases } from '@/lib/mockData';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/Button';

export default function CreatorPurchasesPage() {
    const { user, isAuthenticated } = useAuth();
    const { approvePurchase, rejectPurchase } = usePurchases();
    const { showToast } = useToast();

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Creator Access Required</h1></div>;
    }

    const handleApprove = (id: string) => {
        approvePurchase(id, 'Access credentials sent to buyer email.');
        showToast('Purchase approved!', 'success');
    };

    const handleReject = (id: string) => {
        rejectPurchase(id);
        showToast('Purchase rejected', 'info');
    };

    return (
        <div className="purchases-page">
            <div className="container">
                <div className="page-header">
                    <Link href="/creator" className="back-link">← Back to Dashboard</Link>
                    <h1>Manage Purchases</h1>
                    <p>Review and approve buyer access requests</p>
                </div>

                <div className="purchases-table">
                    <div className="table-header">
                        <span>Buyer</span>
                        <span>Website</span>
                        <span>Plan</span>
                        <span>Amount</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {mockPurchases.map(purchase => (
                        <div key={purchase.id} className="table-row">
                            <span className="buyer-cell">
                                <div className="avatar">{purchase.buyer.name.charAt(0)}</div>
                                {purchase.buyer.name}
                            </span>
                            <span>{purchase.website.name}</span>
                            <span>{purchase.pricingOption.name}</span>
                            <span className="amount">{formatPrice(purchase.amount)}</span>
                            <span className="date">{formatDate(purchase.createdAt)}</span>
                            <span className={`status status-${purchase.status}`}>{purchase.status}</span>
                            <span className="actions">
                                {purchase.status === 'pending' ? (
                                    <>
                                        <Button size="sm" onClick={() => handleApprove(purchase.id)}>Approve</Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleReject(purchase.id)}>Reject</Button>
                                    </>
                                ) : (
                                    <span className="action-done">—</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .purchases-page { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { margin-bottom: 32px; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .purchases-table { background: var(--gray-50); border-radius: 16px; overflow: hidden; }
        .table-header, .table-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 0.8fr 1.5fr; gap: 16px; padding: 16px 24px; align-items: center; }
        .table-header { background: var(--gray-100); font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--gray-500); }
        .table-row { border-bottom: 1px solid var(--gray-200); font-size: 14px; }
        .table-row:last-child { border-bottom: none; }
        .buyer-cell { display: flex; align-items: center; gap: 8px; }
        .avatar { width: 32px; height: 32px; background: var(--gray-200); border-radius: 999px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; }
        .amount { font-weight: 600; }
        .date { color: var(--gray-500); }
        .status { font-size: 12px; font-weight: 500; text-transform: uppercase; }
        .status-approved { color: var(--success); }
        .status-pending { color: var(--warning); }
        .status-rejected { color: var(--error); }
        .actions { display: flex; gap: 8px; }
        .action-done { color: var(--gray-400); }
      `}</style>
        </div>
    );
}
