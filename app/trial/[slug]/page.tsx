'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockWebsites } from '@/lib/mockData';
import { useAuth, usePurchases, useToast } from '@/lib/store';
import Button from '@/components/Button';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function TrialPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { startTrial, hasTrial } = usePurchases();
    const { showToast } = useToast();

    const website = mockWebsites.find((w) => w.slug === slug);

    if (!website || !website.hasFreeTrial) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Free trial not available</h1></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Please log in</h1>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Log In</Link>
            </div>
        );
    }

    const alreadyHasTrial = hasTrial(website.id);

    const handleStartTrial = () => {
        startTrial({
            websiteId: website.id,
            website: website,
            userId: 'user-1',
            user: { id: 'user-1', email: '', name: 'Demo User', role: 'buyer', createdAt: '' },
            status: 'active',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            accessDetails: 'Trial credentials will be sent to your email.',
        });
        showToast('Trial started successfully!', 'success');
        router.push('/dashboard');
    };

    return (
        <div className="trial-page">
            <div className="container">
                <div className="trial-card">
                    <div className="trial-icon">🎉</div>
                    <h1>Start Your Free Trial</h1>
                    <p className="website-name">{website.name}</p>
                    <div className="trial-details">
                        <p>{website.freeTrialDetails}</p>
                    </div>
                    <ul className="trial-features">
                        <li>✓ Full access to all features</li>
                        <li>✓ No credit card required</li>
                        <li>✓ Cancel anytime</li>
                    </ul>
                    {alreadyHasTrial ? (
                        <div className="already-active">You already have an active trial for this website.</div>
                    ) : (
                        <Button size="lg" onClick={handleStartTrial}>Start Free Trial</Button>
                    )}
                    <Link href={`/website/${website.slug}`} className="back-link">← Back to {website.name}</Link>
                </div>
            </div>

            <style jsx>{`
        .trial-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 32px; }
        .trial-card { max-width: 480px; text-align: center; padding: 48px; background: var(--gray-50); border-radius: 24px; }
        .trial-icon { font-size: 3rem; margin-bottom: 16px; }
        h1 { font-size: 1.75rem; font-weight: 700; }
        .website-name { color: var(--gray-500); margin-top: 4px; }
        .trial-details { margin: 24px 0; padding: 16px; background: var(--background); border-radius: 12px; }
        .trial-features { list-style: none; padding: 0; text-align: left; margin: 24px 0; }
        .trial-features li { padding: 8px 0; color: var(--gray-600); }
        .already-active { padding: 12px; background: var(--info); color: white; border-radius: 8px; font-size: 14px; }
        .back-link { display: block; margin-top: 24px; font-size: 14px; color: var(--gray-500); }
      `}</style>
        </div>
    );
}
