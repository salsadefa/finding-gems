'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockWebsites } from '@/lib/mockData';
import { useAuth, usePurchases, useToast } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/Button';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function CheckoutPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { addPurchase } = usePurchases();
    const { showToast } = useToast();
    const [selectedPricing, setSelectedPricing] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'native' | 'external'>('native');
    const [loading, setLoading] = useState(false);

    const website = mockWebsites.find((w) => w.slug === slug);

    if (!website) {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Website not found</h1></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>Please log in</h1>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>Log In</Link>
            </div>
        );
    }

    const activePricing = website.pricing.find(p => p.id === selectedPricing) || website.pricing[0];

    const handleCheckout = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500)); // Simulate payment
        addPurchase({
            websiteId: website.id,
            website: website,
            buyerId: 'user-1',
            buyer: { id: 'user-1', email: '', name: 'Demo User', role: 'buyer', createdAt: '' },
            pricingOptionId: activePricing.id,
            pricingOption: activePricing,
            amount: activePricing.price,
            platformFee: 1000,
            status: 'pending',
            paymentMethod,
        });
        setLoading(false);
        showToast('Purchase submitted! Awaiting creator approval.', 'success');
        router.push('/dashboard');
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-grid">
                    <div className="checkout-main">
                        <Link href={`/website/${website.slug}`} className="back-link">← Back to {website.name}</Link>
                        <h1>Checkout</h1>

                        <div className="section">
                            <h2>Select Plan</h2>
                            <div className="pricing-options">
                                {website.pricing.map(option => (
                                    <label key={option.id} className={`pricing-radio ${selectedPricing === option.id || (!selectedPricing && option.id === website.pricing[0].id) ? 'selected' : ''}`}>
                                        <input type="radio" name="pricing" value={option.id} checked={selectedPricing === option.id || (!selectedPricing && option.id === website.pricing[0].id)} onChange={() => setSelectedPricing(option.id)} />
                                        <div className="pricing-content">
                                            <span className="pricing-name">{option.name}</span>
                                            <span className="pricing-price">{formatPrice(option.price)}</span>
                                            <span className="pricing-type">{option.type === 'lifetime' ? 'One-time' : option.period}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                            <h2>Payment Method</h2>
                            <div className="payment-options">
                                <label className={`payment-radio ${paymentMethod === 'native' ? 'selected' : ''}`}>
                                    <input type="radio" name="payment" value="native" checked={paymentMethod === 'native'} onChange={() => setPaymentMethod('native')} />
                                    <span>Dualangka Checkout</span>
                                    <small>Pay securely with local payment methods</small>
                                </label>
                                <label className={`payment-radio ${paymentMethod === 'external' ? 'selected' : ''}`}>
                                    <input type="radio" name="payment" value="external" checked={paymentMethod === 'external'} onChange={() => setPaymentMethod('external')} />
                                    <span>External (Shopee/Tokopedia)</span>
                                    <small>Redirect to marketplace</small>
                                </label>
                            </div>
                        </div>
                    </div>

                    <aside className="checkout-sidebar">
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-item">
                                <div className="item-thumb">{website.name.charAt(0)}</div>
                                <div className="item-info">
                                    <strong>{website.name}</strong>
                                    <span>{activePricing.name}</span>
                                </div>
                            </div>
                            <div className="summary-line"><span>Subtotal</span><span>{formatPrice(activePricing.price)}</span></div>
                            <div className="summary-line"><span>Platform Fee</span><span>{formatPrice(1000)}</span></div>
                            <div className="summary-total"><span>Total</span><span>{formatPrice(activePricing.price + 1000)}</span></div>
                            <Button fullWidth size="lg" onClick={handleCheckout} loading={loading}>Complete Purchase</Button>
                            <p className="note">Creator will manually approve access after payment confirmation.</p>
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx>{`
        .checkout-page { padding: 32px 0 64px; min-height: 80vh; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        h1 { font-size: 2rem; font-weight: 700; margin-bottom: 32px; }
        .checkout-grid { display: grid; gap: 32px; } @media (min-width: 1024px) { .checkout-grid { grid-template-columns: 1fr 380px; } }
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; }
        .pricing-options, .payment-options { display: flex; flex-direction: column; gap: 12px; }
        .pricing-radio, .payment-radio { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--gray-50); border: 2px solid var(--gray-200); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .pricing-radio.selected, .payment-radio.selected { border-color: var(--foreground); background: var(--background); }
        .pricing-radio input, .payment-radio input { width: 18px; height: 18px; accent-color: var(--foreground); }
        .pricing-content { flex: 1; display: flex; align-items: center; gap: 16px; }
        .pricing-name { font-weight: 500; }
        .pricing-price { font-weight: 700; margin-left: auto; }
        .pricing-type { font-size: 12px; color: var(--gray-500); }
        .payment-radio { flex-direction: column; align-items: flex-start; } .payment-radio span { font-weight: 500; } .payment-radio small { font-size: 12px; color: var(--gray-500); }
        .order-summary { padding: 24px; background: var(--gray-50); border-radius: 16px; position: sticky; top: 88px; }
        .order-summary h3 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; }
        .summary-item { display: flex; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--gray-200); margin-bottom: 16px; }
        .item-thumb { width: 48px; height: 48px; background: var(--gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .item-info { display: flex; flex-direction: column; } .item-info span { font-size: 13px; color: var(--gray-500); }
        .summary-line { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
        .summary-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin: 16px 0 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); }
        .note { margin-top: 12px; font-size: 12px; color: var(--gray-500); text-align: center; }
      `}</style>
        </div>
    );
}
