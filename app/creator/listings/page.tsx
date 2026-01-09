'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { mockWebsites } from '@/lib/mockData';
import Button from '@/components/Button';
import EmptyState, { EmptyListingsIcon } from '@/components/EmptyState';

export default function CreatorListingsPage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Creator Access Required</h1></div>;
    }

    const creatorWebsites = mockWebsites.filter(w => w.creatorId === 'user-2');

    return (
        <div className="listings-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <Link href="/creator" className="back-link">← Back to Dashboard</Link>
                        <h1>My Listings</h1>
                        <p>Manage your website listings</p>
                    </div>
                    <Link href="/creator/listings/new"><Button>+ New Listing</Button></Link>
                </div>

                {creatorWebsites.length > 0 ? (
                    <div className="listings-table">
                        <div className="table-header">
                            <span>Website</span>
                            <span>Category</span>
                            <span>Views</span>
                            <span>Rating</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        {creatorWebsites.map(website => (
                            <div key={website.id} className="table-row">
                                <span className="website-cell">
                                    <div className="thumb">{website.name.charAt(0)}</div>
                                    <div>
                                        <strong>{website.name}</strong>
                                        <small>{website.shortDescription.slice(0, 50)}...</small>
                                    </div>
                                </span>
                                <span>{website.category.name}</span>
                                <span>{website.viewCount}</span>
                                <span>⭐ {website.rating}</span>
                                <span className={`status status-${website.status}`}>{website.status}</span>
                                <span className="actions">
                                    <Link href={`/website/${website.slug}`}><Button size="sm" variant="ghost">View</Button></Link>
                                    <Link href={`/creator/listings/${website.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={<EmptyListingsIcon />} title="No listings yet" description="Create your first website listing to start selling." action={<Link href="/creator/listings/new"><Button>Create Listing</Button></Link>} />
                )}
            </div>

            <style jsx>{`
        .listings-page { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 8px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .listings-table { background: var(--gray-50); border-radius: 16px; overflow: hidden; }
        .table-header, .table-row { display: grid; grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.8fr 1.2fr; gap: 16px; padding: 16px 24px; align-items: center; }
        .table-header { background: var(--gray-100); font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--gray-500); }
        .table-row { border-bottom: 1px solid var(--gray-200); font-size: 14px; }
        .table-row:last-child { border-bottom: none; }
        .website-cell { display: flex; align-items: center; gap: 12px; }
        .thumb { width: 48px; height: 48px; background: var(--gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; }
        .website-cell strong { display: block; } .website-cell small { color: var(--gray-500); font-size: 12px; }
        .status { font-size: 12px; font-weight: 500; text-transform: uppercase; }
        .status-active { color: var(--success); }
        .status-pending { color: var(--warning); }
        .status-draft { color: var(--gray-500); }
        .actions { display: flex; gap: 8px; }
      `}</style>
        </div>
    );
}
