'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useBookmarks, usePurchases } from '@/lib/store';
import { formatPrice, formatDate } from '@/lib/utils';
import WebsiteCard from '@/components/WebsiteCard';
import EmptyState, { EmptyBookmarksIcon, EmptyPurchasesIcon } from '@/components/EmptyState';
import Button from '@/components/Button';

type Tab = 'purchases' | 'bookmarks' | 'reviews';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const { bookmarks } = useBookmarks();
    const { purchases, trials } = usePurchases();
    const [activeTab, setActiveTab] = useState<Tab>('purchases');

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Please log in</h1>
                <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>You need to be logged in to view your dashboard.</p>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Log In</Link>
            </div>
        );
    }

    const userPurchases = purchases.filter(p => p.buyerId === user?.id || p.buyerId === 'user-1');
    const userTrials = trials.filter(t => t.userId === user?.id || t.userId === 'user-1');

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Dashboard</h1>
                    <p>Manage your purchases, bookmarks, and reviews</p>
                </div>

                <div className="tabs">
                    <button className={activeTab === 'purchases' ? 'active' : ''} onClick={() => setActiveTab('purchases')}>
                        Purchases ({userPurchases.length})
                    </button>
                    <button className={activeTab === 'bookmarks' ? 'active' : ''} onClick={() => setActiveTab('bookmarks')}>
                        Bookmarks ({bookmarks.length})
                    </button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
                        My Reviews
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'purchases' && (
                        <>
                            {userTrials.length > 0 && (
                                <div className="section">
                                    <h2>Active Trials</h2>
                                    <div className="trials-list">
                                        {userTrials.filter(t => t.status === 'active').map(trial => (
                                            <div key={trial.id} className="trial-card">
                                                <div className="trial-info">
                                                    <h3>{trial.website.name}</h3>
                                                    <p>Trial expires: {trial.expiresAt ? formatDate(trial.expiresAt) : 'N/A'}</p>
                                                </div>
                                                <Link href={`/website/${trial.website.slug}`}><Button size="sm">View Website</Button></Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {userPurchases.length > 0 ? (
                                <div className="purchases-list">
                                    {userPurchases.map(purchase => (
                                        <div key={purchase.id} className="purchase-card">
                                            <div className="purchase-thumb">{purchase.website.name.charAt(0)}</div>
                                            <div className="purchase-info">
                                                <h3>{purchase.website.name}</h3>
                                                <p>{purchase.pricingOption.name} • {formatPrice(purchase.amount)}</p>
                                                <span className={`status status-${purchase.status}`}>{purchase.status}</span>
                                            </div>
                                            <div className="purchase-date">{formatDate(purchase.createdAt)}</div>
                                            <div className="purchase-actions">
                                                {purchase.status === 'approved' && purchase.accessDetails && (
                                                    <div className="access-details">{purchase.accessDetails}</div>
                                                )}
                                                <Link href={`/website/${purchase.website.slug}`}><Button variant="secondary" size="sm">View</Button></Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<EmptyPurchasesIcon />} title="No purchases yet" description="Start exploring and find the perfect tools for your needs." action={<Link href="/"><Button>Explore Websites</Button></Link>} />
                            )}
                        </>
                    )}

                    {activeTab === 'bookmarks' && (
                        bookmarks.length > 0 ? (
                            <div className="grid-cards">
                                {bookmarks.map(bookmark => (
                                    <WebsiteCard key={bookmark.id} website={bookmark.website} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<EmptyBookmarksIcon />} title="No bookmarks yet" description="Save websites you're interested in for later." action={<Link href="/"><Button>Explore Websites</Button></Link>} />
                        )
                    )}

                    {activeTab === 'reviews' && (
                        <EmptyState title="No reviews yet" description="After making a purchase, you can leave a review to help others." />
                    )}
                </div>
            </div>

            <style jsx>{`
        .dashboard-page { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { margin-bottom: 32px; }
        .page-header h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--gray-200); margin-bottom: 32px; }
        .tabs button { padding: 12px 20px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 15px; color: var(--gray-500); }
        .tabs button.active { border-bottom-color: var(--foreground); color: var(--foreground); font-weight: 500; }
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; }
        .trials-list { display: flex; flex-direction: column; gap: 12px; }
        .trial-card { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--info); background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.05)); border: 1px solid rgba(37,99,235,0.2); border-radius: 12px; }
        .trial-info h3 { font-size: 15px; font-weight: 600; }
        .trial-info p { font-size: 13px; color: var(--gray-600); }
        .purchases-list { display: flex; flex-direction: column; gap: 12px; }
        .purchase-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--gray-50); border-radius: 12px; }
        .purchase-thumb { width: 48px; height: 48px; border-radius: 8px; background: var(--gray-200); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; }
        .purchase-info { flex: 1; }
        .purchase-info h3 { font-size: 15px; font-weight: 600; }
        .purchase-info p { font-size: 13px; color: var(--gray-500); margin-top: 2px; }
        .status { display: inline-block; margin-top: 4px; padding: 2px 8px; font-size: 11px; font-weight: 500; text-transform: uppercase; border-radius: 4px; }
        .status-approved { background: rgba(22,163,74,0.1); color: var(--success); }
        .status-pending { background: rgba(202,138,4,0.1); color: var(--warning); }
        .status-rejected { background: rgba(220,38,38,0.1); color: var(--error); }
        .purchase-date { font-size: 13px; color: var(--gray-400); }
        .purchase-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .access-details { font-size: 12px; color: var(--gray-600); background: var(--background); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--gray-200); }
      `}</style>
        </div>
    );
}
