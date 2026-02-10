'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLogin } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations';

function getApiErrorCode(err: unknown): string | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const data = err.response?.data;
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  const errorObj = record.error;
  if (!errorObj || typeof errorObj !== 'object') return undefined;
  const code = (errorObj as Record<string, unknown>).code;
  return typeof code === 'string' ? code : undefined;
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const errorObj = record.error;
      if (errorObj && typeof errorObj === 'object') {
        const msg = (errorObj as Record<string, unknown>).message;
        if (typeof msg === 'string' && msg.trim()) return msg;
      }
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function safeRedirectPath(value: string | null, fallback: string) {
  if (!value) return fallback;
  const v = value.trim();
  // Only allow internal relative redirects.
  if (!v.startsWith('/')) return fallback;
  if (v.startsWith('//')) return fallback;
  if (v.includes('://')) return fallback;
  return v;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const loginMutation = useLogin();

  const redirectParam = searchParams.get('redirect');
  const defaultRedirect = safeRedirectPath(redirectParam, '/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const routeAfterLogin = (role: string) => {
    // If user intended a specific page (redirect), honor it.
    if (redirectParam) return defaultRedirect;
    if (role === 'admin') return '/admin';
    if (role === 'creator') return '/creator';
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      showToast('Welcome back!', 'success');
      const user = result.data.user;
      router.push(routeAfterLogin(user.role));
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 'EMAIL_NOT_VERIFIED') {
        showToast('Please verify your email. We sent you an OTP.', 'error');
        router.push(
          `/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(defaultRedirect)}`
        );
        return;
      }
      showToast(getApiErrorMessage(err, 'Login failed. Please check your credentials.'), 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div variants={fadeInUp}>
              <Link
                href="/"
                className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Dualangka
              </Link>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="mt-6 text-2xl font-bold text-slate-900">
              Welcome back
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-2 text-sm text-slate-500">
              Sign in to your account
            </motion.p>
          </motion.div>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={fadeInUp}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="you@example.com"
                required
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-900">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                required
                error={errors.password}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button type="submit" fullWidth loading={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.form>

          <p className="text-sm text-slate-500 mt-8 text-center">
            Don&apos;t have an account?{' '}
            <Link
              href={`/signup${redirectParam ? `?redirect=${encodeURIComponent(defaultRedirect)}` : ''}`}
              className="font-semibold text-slate-900 hover:text-slate-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
