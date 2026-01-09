'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { mockWebsites, mockPurchases, mockCreatorProfiles } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

export default function CreatorDashboardPage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Creator Access Required</h1>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>Please log in as a creator to access this dashboard.</p>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Log In</Link>
            </div>
        );
    }

    // Mock data for demo
    const creatorProfile = mockCreatorProfiles[0];
    const creatorWebsites = mockWebsites.filter(w => w.creatorId === 'user-2');
    const pendingPurchases = mockPurchases.filter(p => p.status === 'pending');
    const totalRevenue = mockPurchases.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="creator-dashboard">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>Creator Dashboard</h1>
                        <p>Manage your listings, purchases, and analytics</p>
                    </div>
                    <Link href="/creator/listings/new" className="btn btn-primary">+ New Listing</Link>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Websites</span>
                        <span className="stat-value">{creatorProfile.totalWebsites}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Sales</span>
                        <span className="stat-value">{creatorProfile.totalSales}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{formatPrice(totalRevenue)}</span>
                    </div>
                    <div className="stat-card highlight">
                        <span className="stat-label">Pending Approvals</span>
                        <span className="stat-value">{pendingPurchases.length}</span>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <section className="section">
                        <div className="section-header">
                            <h2>My Listings</h2>
                            <Link href="/creator/listings">View All →</Link>
                        </div>
                        <div className="listings-list">
                            {creatorWebsites.slice(0, 3).map(website => (
                                <div key={website.id} className="listing-item">
                                    <div className="listing-thumb">{website.name.charAt(0)}</div>
                                    <div className="listing-info">
                                        <h3>{website.name}</h3>
                                        <span className="listing-meta">{website.category.name} • {website.reviewCount} reviews</span>
                                    </div>
                                    <div className="listing-stats">
                                        <span>{website.viewCount} views</span>
                                        <span className={`status status-${website.status}`}>{website.status}</span>
                                    </div>
                                    <Link href={`/creator/listings/${website.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Pending Purchases</h2>
                            <Link href="/creator/purchases">View All →</Link>
                        </div>
                        {pendingPurchases.length > 0 ? (
                            <div className="purchases-list">
                                {pendingPurchases.slice(0, 3).map(purchase => (
                                    <div key={purchase.id} className="purchase-item">
                                        <div className="purchase-info">
                                            <h3>{purchase.buyer.name}</h3>
                                            <span>{purchase.website.name} • {purchase.pricingOption.name}</span>
                                        </div>
                                        <span className="purchase-amount">{formatPrice(purchase.amount)}</span>
                                        <Link href="/creator/purchases" className="btn btn-primary btn-sm">Review</Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-section">No pending purchases</div>
                        )}
                    </section>
                </div>

                <section className="quick-links">
                    <Link href="/creator/listings" className="quick-link">📦 Manage Listings</Link>
                    <Link href="/creator/purchases" className="quick-link">💳 View Purchases</Link>
                    <Link href="/creator/messages" className="quick-link">💬 Messages</Link>
                </section>
            </div>

            <style jsx>{`
        .creator-dashboard { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .page-header h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; } @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat-card { padding: 24px; background: var(--gray-50); border-radius: 16px; }
        .stat-card.highlight { background: var(--foreground); color: var(--background); }
        .stat-label { font-size: 13px; color: var(--gray-500); display: block; } .stat-card.highlight .stat-label { color: rgba(255,255,255,0.7); }
        .stat-value { font-size: 2rem; font-weight: 700; display: block; margin-top: 4px; }
        .dashboard-grid { display: grid; gap: 32px; } @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }
        .section { background: var(--gray-50); border-radius: 16px; padding: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-header h2 { font-size: 1.125rem; font-weight: 600; }
        .section-header a { font-size: 14px; color: var(--gray-500); }
        .listings-list, .purchases-list { display: flex; flex-direction: column; gap: 12px; }
        .listing-item, .purchase-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--background); border-radius: 12px; }
        .listing-thumb { width: 48px; height: 48px; background: var(--gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; }
        .listing-info, .purchase-info { flex: 1; }
        .listing-info h3, .purchase-info h3 { font-size: 15px; font-weight: 600; }
        .listing-meta, .purchase-info span { font-size: 13px; color: var(--gray-500); }
        .listing-stats { text-align: right; font-size: 13px; color: var(--gray-500); }
        .status { display: block; margin-top: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
        .status-active { color: var(--success); }
        .purchase-amount { font-weight: 600; }
        .empty-section { padding: 32px; text-align: center; color: var(--gray-500); }
        .quick-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        .quick-link { padding: 24px; background: var(--background); border: 1px solid var(--gray-200); border-radius: 12px; text-align: center; font-weight: 500; transition: all 0.2s; }
        .quick-link:hover { border-color: var(--foreground); }
      `}</style>
        </div>
    );
}
