'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';

function SignupContent() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const initialRole = searchParams.get('role') === 'creator' ? 'creator' : 'buyer';
        const { login } = useAuth();
        const { showToast } = useToast();

        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [role, setRole] = useState<'buyer' | 'creator'>(initialRole);
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setLoading(true);
                await login(email, password, role);
                setLoading(false);
                showToast('Account created successfully!', 'success');
                router.push(role === 'creator' ? '/creator' : '/dashboard');
        };

        return (
                <div className="auth-page">
                        <div className="auth-card">
                                <div className="auth-header">
                                        <Link href="/" className="auth-logo">Dualangka</Link>
                                        <h1>Create an account</h1>
                                        <p>Join the marketplace</p>
                                </div>

                                <div className="role-selector">
                                        <button className={`role-btn ${role === 'buyer' ? 'active' : ''}`} onClick={() => setRole('buyer')}>
                                                <span className="role-icon">🛒</span>
                                                <span className="role-name">Buyer</span>
                                                <span className="role-desc">Discover & purchase</span>
                                        </button>
                                        <button className={`role-btn ${role === 'creator' ? 'active' : ''}`} onClick={() => setRole('creator')}>
                                                <span className="role-icon">🚀</span>
                                                <span className="role-name">Creator</span>
                                                <span className="role-desc">List & sell websites</span>
                                        </button>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                                        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                                        <Button type="submit" fullWidth loading={loading}>Create Account</Button>
                                </form>

                                {role === 'creator' && (
                                        <div className="creator-note">
                                                <strong>Note:</strong> Creator accounts require manual verification. You&apos;ll be notified once approved.
                                        </div>
                                )}

                                <p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p>
                        </div>

                        <style jsx>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px; background: var(--gray-50); }
        .auth-card { width: 100%; max-width: 440px; padding: 40px; background: var(--background); border-radius: 16px; border: 1px solid var(--gray-200); }
        .auth-header { text-align: center; margin-bottom: 24px; }
        .auth-logo { font-size: 1.5rem; font-weight: 700; }
        .auth-header h1 { font-size: 1.5rem; margin-top: 24px; }
        .auth-header p { color: var(--gray-500); margin-top: 4px; }
        .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .role-btn { padding: 16px; background: var(--gray-50); border: 2px solid var(--gray-200); border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s; }
        .role-btn.active { border-color: var(--foreground); background: var(--background); }
        .role-btn:hover { border-color: var(--gray-400); }
        .role-icon { display: block; font-size: 1.5rem; margin-bottom: 8px; }
        .role-name { display: block; font-weight: 600; }
        .role-desc { display: block; font-size: 12px; color: var(--gray-500); margin-top: 2px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .creator-note { margin-top: 16px; padding: 12px; background: var(--gray-100); border-radius: 8px; font-size: 13px; color: var(--gray-600); }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--gray-500); }
        .auth-footer a { color: var(--foreground); font-weight: 500; }
      `}</style>
                </div>
        );
}

export default function SignupPage() {
        return (
                <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                }>
                        <SignupContent />
                </Suspense>
        );
}
