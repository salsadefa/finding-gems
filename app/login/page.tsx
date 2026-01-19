'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';

function LoginContent() {
        const router = useRouter();
        const { login } = useAuth();
        const { showToast } = useToast();
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setLoading(true);
                const success = await login(email, password);
                setLoading(false);
                if (success) {
                        showToast('Welcome back!', 'success');
                        router.push('/');
                }
        };

        // Quick login helpers for demo
        const quickLogin = async (role: 'buyer' | 'creator' | 'admin') => {
                setLoading(true);
                const emails: Record<string, string> = {
                        buyer: 'john@example.com',
                        creator: 'sarah@creator.com',
                        admin: 'admin@dualangka.com'
                };
                await login(emails[role], 'demo', role);
                setLoading(false);
                showToast(`Logged in as ${role}!`, 'success');
                router.push(role === 'admin' ? '/admin' : role === 'creator' ? '/creator' : '/dashboard');
        };

        return (
                <div className="auth-page">
                        <div className="auth-card">
                                <div className="auth-header">
                                        <Link href="/" className="auth-logo">Dualangka</Link>
                                        <h1>Welcome back</h1>
                                        <p>Sign in to your account</p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                                        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                                        <Button type="submit" fullWidth loading={loading}>Sign In</Button>
                                </form>

                                <div className="divider"><span>or try demo accounts</span></div>

                                <div className="demo-buttons">
                                        <button className="demo-btn" onClick={() => quickLogin('buyer')}>Login as Buyer</button>
                                        <button className="demo-btn" onClick={() => quickLogin('creator')}>Login as Creator</button>
                                        <button className="demo-btn" onClick={() => quickLogin('admin')}>Login as Admin</button>
                                </div>

                                <p className="auth-footer">Don&apos;t have an account? <Link href="/signup">Sign up</Link></p>
                        </div>

                        <style jsx>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px; background: var(--gray-50); }
        .auth-card { width: 100%; max-width: 400px; padding: 40px; background: var(--background); border-radius: 16px; border: 1px solid var(--gray-200); }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-logo { font-size: 1.5rem; font-weight: 700; }
        .auth-header h1 { font-size: 1.5rem; margin-top: 24px; }
        .auth-header p { color: var(--gray-500); margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .divider { display: flex; align-items: center; gap: 16px; margin: 24px 0; color: var(--gray-400); font-size: 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
        .demo-buttons { display: flex; flex-direction: column; gap: 8px; }
        .demo-btn { padding: 10px; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .demo-btn:hover { background: var(--gray-200); }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--gray-500); }
        .auth-footer a { color: var(--foreground); font-weight: 500; }
      `}</style>
                </div>
        );
}

export default function LoginPage() {
        return (
                <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                }>
                        <LoginContent />
                </Suspense>
        );
}
