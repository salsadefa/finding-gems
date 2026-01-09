'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockWebsites, mockReviews } from '@/lib/mockData';
import { useAuth, useBookmarks, usePurchases, useToast } from '@/lib/store';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';
import Rating from '@/components/Rating';
import Button from '@/components/Button';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function WebsiteDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { hasPurchased, hasTrial } = usePurchases();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const website = mockWebsites.find((w) => w.slug === slug);
    if (!website) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Website not found</h1>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Go Home</Link>
            </div>
        );
    }

    const websiteReviews = mockReviews.filter((r) => r.websiteId === website.id);
    const bookmarked = isBookmarked(website.id);
    const purchased = hasPurchased(website.id);
    const hasTrialActive = hasTrial(website.id);

    const handleBookmark = () => {
        if (!isAuthenticated) { router.push('/login'); return; }
        toggleBookmark(website);
        showToast(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'success');
    };

    const handleBuyClick = (pricingId: string) => {
        if (!isAuthenticated) { router.push('/login'); return; }
        router.push(`/checkout/${website.slug}?pricing=${pricingId}`);
    };

    return (
        <div className="detail-page">
            <section className="detail-hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="screenshots-area">
                            <div className="main-screenshot">
                                <div className="screenshot-placeholder">{website.name.charAt(0)}</div>
                            </div>
                        </div>
                        <div className="info-area">
                            <div className="breadcrumb">
                                <Link href="/">Home</Link> / <Link href={`/category/${website.category.slug}`}>{website.category.name}</Link>
                            </div>
                            <h1 className="website-title">{website.name}</h1>
                            <div className="website-meta">
                                <Rating value={website.rating} showValue />
                                <span>({website.reviewCount} reviews)</span>
                                <span className="category-badge">{website.category.name}</span>
                            </div>
                            <p className="website-description">{website.shortDescription}</p>
                            <div className="creator-info">
                                <div className="creator-avatar">{getInitials(website.creator.name)}</div>
                                <div><strong>{website.creator.name}</strong><br /><small>{website.creatorProfile.professionalBackground}</small></div>
                            </div>
                            <div className="action-buttons">
                                {purchased ? (
                                    <div className="purchased-badge">✓ Purchased</div>
                                ) : (
                                    <>
                                        <Button variant="primary" size="lg" onClick={() => handleBuyClick(website.pricing[0].id)}>
                                            Buy Access — {formatPrice(website.pricing[0].price)}
                                        </Button>
                                        {website.hasFreeTrial && !hasTrialActive && (
                                            <Button variant="secondary" size="lg" onClick={() => router.push(`/trial/${website.slug}`)}>Free Trial</Button>
                                        )}
                                    </>
                                )}
                                <a href={website.externalUrl} target="_blank" rel="noopener noreferrer" className="visit-btn">Visit Website ↗</a>
                            </div>
                            <div className="quick-actions">
                                <button onClick={handleBookmark}>{bookmarked ? '♥ Saved' : '♡ Save'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section">
                <div className="container">
                    <div className="tabs">
                        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
                        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({website.reviewCount})</button>
                    </div>
                    <div className="content-grid">
                        <div className="main-content">
                            {activeTab === 'overview' ? (
                                <>
                                    <div className="content-block">
                                        <h2>About</h2>
                                        {website.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                                    </div>
                                    <div className="content-block">
                                        <h2>Use Cases</h2>
                                        <ul>{website.useCases.map((uc, i) => <li key={i}>✓ {uc}</li>)}</ul>
                                    </div>
                                    <div className="content-block">
                                        <h2>Tech Stack</h2>
                                        <div className="tech-tags">{website.techStack.map((t) => <span key={t} className="tech-tag">{t}</span>)}</div>
                                    </div>
                                    {website.faq.length > 0 && (
                                        <div className="content-block">
                                            <h2>FAQ</h2>
                                            {website.faq.map((item, i) => (
                                                <div key={i} className="faq-item">
                                                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>{item.question}</button>
                                                    {expandedFaq === i && <p>{item.answer}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="reviews-list">
                                    {websiteReviews.map((review) => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-header">
                                                <span>{review.user.name}</span>
                                                <Rating value={review.rating} size="sm" />
                                            </div>
                                            <h4>{review.title}</h4>
                                            <p>{review.content}</p>
                                            <small>{formatDate(review.createdAt)}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <aside className="pricing-sidebar">
                            <div className="pricing-card">
                                <h3>Pricing</h3>
                                {website.pricing.map((option) => (
                                    <div key={option.id} className={`pricing-option ${option.isPopular ? 'popular' : ''}`}>
                                        {option.isPopular && <span className="popular-badge">Popular</span>}
                                        <strong>{option.name}</strong>
                                        <div className="option-price">{formatPrice(option.price)}</div>
                                        <ul>{option.features.map((f, i) => <li key={i}>✓ {f}</li>)}</ul>
                                        <Button fullWidth variant={option.isPopular ? 'primary' : 'secondary'} onClick={() => handleBuyClick(option.id)} disabled={purchased}>
                                            {purchased ? 'Purchased' : 'Select'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
            <style jsx>{`
        .detail-page { min-height: 100vh; }
        .detail-hero { padding: 32px 0; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
        .hero-grid { display: grid; gap: 32px; } @media (min-width: 1024px) { .hero-grid { grid-template-columns: 1fr 1fr; } }
        .main-screenshot { aspect-ratio: 16/10; background: var(--gray-200); border-radius: 12px; }
        .screenshot-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: var(--gray-300); }
        .breadcrumb { font-size: 13px; color: var(--gray-500); margin-bottom: 16px; }
        .website-title { font-size: 2rem; font-weight: 700; }
        .website-meta { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .category-badge { padding: 4px 12px; font-size: 12px; background: var(--gray-200); border-radius: 999px; }
        .website-description { margin-top: 16px; color: var(--gray-600); }
        .creator-info { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding: 16px; background: var(--background); border-radius: 12px; border: 1px solid var(--gray-200); }
        .creator-avatar { width: 48px; height: 48px; border-radius: 999px; background: var(--gray-200); display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .action-buttons { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
        .purchased-badge { padding: 12px 20px; background: var(--success); color: white; border-radius: 8px; font-weight: 500; }
        .visit-btn { padding: 12px 20px; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 14px; }
        .quick-actions { margin-top: 16px; } .quick-actions button { background: none; border: none; cursor: pointer; }
        .content-section { padding: 32px 0; }
        .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--gray-200); margin-bottom: 32px; }
        .tabs button { padding: 12px 16px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; }
        .tabs button.active { border-bottom-color: var(--foreground); font-weight: 500; }
        .content-grid { display: grid; gap: 32px; } @media (min-width: 1024px) { .content-grid { grid-template-columns: 1fr 360px; } }
        .content-block { margin-bottom: 32px; } .content-block h2 { font-size: 1.25rem; margin-bottom: 16px; } .content-block p { color: var(--gray-600); line-height: 1.7; margin-bottom: 12px; }
        .content-block ul { list-style: none; padding: 0; } .content-block li { margin-bottom: 8px; }
        .tech-tags { display: flex; flex-wrap: wrap; gap: 8px; } .tech-tag { padding: 8px 12px; background: var(--gray-100); border-radius: 8px; font-size: 13px; }
        .faq-item button { display: block; width: 100%; text-align: left; padding: 16px; background: var(--gray-50); border: none; border-bottom: 1px solid var(--gray-200); cursor: pointer; font-weight: 500; }
        .faq-item p { padding: 16px; color: var(--gray-600); }
        .reviews-list { display: flex; flex-direction: column; gap: 16px; }
        .review-card { padding: 20px; background: var(--gray-50); border-radius: 12px; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .review-card h4 { font-size: 15px; margin-bottom: 8px; } .review-card p { color: var(--gray-600); }
        .pricing-sidebar { position: sticky; top: 88px; }
        .pricing-card { padding: 24px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 16px; }
        .pricing-card h3 { margin-bottom: 16px; }
        .pricing-option { padding: 20px; background: var(--background); border: 1px solid var(--gray-200); border-radius: 12px; margin-bottom: 16px; position: relative; }
        .pricing-option.popular { border-color: var(--foreground); }
        .popular-badge { position: absolute; top: -10px; right: 16px; padding: 4px 8px; background: var(--foreground); color: var(--background); font-size: 11px; border-radius: 4px; }
        .option-price { font-size: 1.5rem; font-weight: 700; margin: 8px 0 12px; }
        .pricing-option ul { list-style: none; padding: 0; margin-bottom: 16px; } .pricing-option li { font-size: 13px; color: var(--gray-600); margin-bottom: 4px; }
      `}</style>
        </div>
    );
}
