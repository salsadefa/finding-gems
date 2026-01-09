'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/lib/store';
import { mockCategories } from '@/lib/mockData';
import { Input, Textarea, Select } from '@/components/Input';
import Button from '@/components/Button';

export default function NewListingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Creator Access Required</h1></div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        showToast('Listing created successfully!', 'success');
        router.push('/creator/listings');
    };

    return (
        <div className="new-listing-page">
            <div className="container">
                <Link href="/creator/listings" className="back-link">← Back to Listings</Link>
                <h1>Create New Listing</h1>
                <p className="subtitle">Add a new website to the marketplace</p>

                <form onSubmit={handleSubmit} className="listing-form">
                    <div className="form-section">
                        <h2>Basic Information</h2>
                        <div className="form-grid">
                            <Input label="Website Name" placeholder="e.g., DocuGen Pro" required />
                            <Select label="Category">
                                {mockCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </Select>
                        </div>
                        <Input label="Short Description" placeholder="Brief one-line description" required />
                        <Textarea label="Full Description" placeholder="Detailed description of your website..." required />
                        <Input label="External URL" type="url" placeholder="https://your-website.com" required />
                    </div>

                    <div className="form-section">
                        <h2>Details</h2>
                        <Input label="Tech Stack" placeholder="React, Node.js, PostgreSQL (comma separated)" />
                        <Textarea label="Use Cases" placeholder="List real-world scenarios where your website is useful..." />
                    </div>

                    <div className="form-section">
                        <h2>Pricing</h2>
                        <div className="form-grid">
                            <Select label="Pricing Type">
                                <option value="lifetime">Lifetime Access</option>
                                <option value="subscription">Subscription</option>
                            </Select>
                            <Input label="Price (IDR)" type="number" placeholder="199000" required />
                        </div>
                        <label className="checkbox-label">
                            <input type="checkbox" /> Enable Free Trial
                        </label>
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" loading={loading}>Create Listing</Button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .new-listing-page { padding: 32px 0 64px; min-height: 80vh; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .subtitle { color: var(--gray-500); margin-top: 4px; margin-bottom: 32px; }
        .listing-form { max-width: 720px; }
        .form-section { background: var(--gray-50); padding: 24px; border-radius: 16px; margin-bottom: 24px; }
        .form-section h2 { font-size: 1rem; font-weight: 600; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--gray-200); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; margin-top: 12px; }
        .checkbox-label input { width: 16px; height: 16px; accent-color: var(--foreground); }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; }
      `}</style>
        </div>
    );
}
