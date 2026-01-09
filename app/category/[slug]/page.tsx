'use client';

import { use } from 'react';
import Link from 'next/link';
import WebsiteCard from '@/components/WebsiteCard';
import { mockWebsites, mockCategories } from '@/lib/mockData';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
    const { slug } = use(params);
    const category = mockCategories.find((c) => c.slug === slug);
    const websites = mockWebsites.filter((w) => w.category.slug === slug);

    if (!category) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Category not found</h1>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Go Home</Link>
            </div>
        );
    }

    return (
        <div className="category-page">
            <div className="container">
                <div className="page-header">
                    <Link href="/" className="back-link">← Back to Home</Link>
                    <h1>{category.name}</h1>
                    <p className="category-description">{category.description}</p>
                    <span className="website-count">{websites.length} websites</span>
                </div>

                {websites.length > 0 ? (
                    <div className="grid-cards">
                        {websites.map((website) => (
                            <WebsiteCard key={website.id} website={website} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No websites in this category yet.</p>
                        <Link href="/">Browse all websites</Link>
                    </div>
                )}
            </div>

            <style jsx>{`
        .category-page { padding: 32px 0 64px; min-height: 80vh; }
        .page-header { margin-bottom: 32px; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        .back-link:hover { color: var(--foreground); }
        h1 { font-size: 2rem; font-weight: 700; }
        .category-description { margin-top: 8px; color: var(--gray-600); }
        .website-count { display: inline-block; margin-top: 12px; padding: 4px 12px; background: var(--gray-100); border-radius: 999px; font-size: 13px; }
        .empty-state { text-align: center; padding: 64px; color: var(--gray-500); }
      `}</style>
        </div>
    );
}
