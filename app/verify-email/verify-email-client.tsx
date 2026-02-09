'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResendVerificationOtp, useVerifyEmailOtp } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import axios from 'axios';

function onlyDigits(s: string) {
  return s.replace(/\D+/g, '').slice(0, 6);
}

function errorMessage(err: unknown, fallback: string) {
  let msg = fallback;
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const errorObj = record.error;
      const nested = errorObj && typeof errorObj === 'object' ? (errorObj as Record<string, unknown>).message : undefined;
      const top = record.message;
      const maybe = nested ?? top;
      if (typeof maybe === 'string' && maybe.trim()) msg = maybe;
    }
  } else if (err instanceof Error && err.message) {
    msg = err.message;
  }
  return msg;
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const emailFromQuery = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');

  const [canResend, setCanResend] = useState(true);

  const verify = useVerifyEmailOtp();
  const resend = useResendVerificationOtp();

  const maskedEmail = useMemo(() => {
    const e = email.trim();
    const [u, d] = e.split('@');
    if (!u || !d) return e;
    const maskedUser = u.length <= 2 ? `${u[0]}*` : `${u.slice(0, 2)}***`;
    return `${maskedUser}@${d}`;
  }, [email]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold text-gray-900">Verify your email</h1>
        <p className="text-gray-600 mt-2">
          We sent a 6-digit OTP to <span className="font-semibold">{maskedEmail || 'your email'}</span>.
        </p>

        <div className="mt-8 space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="text-sm font-semibold text-gray-900">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
            />

            <label className="text-sm font-semibold text-gray-900 mt-5 block">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(onlyDigits(e.target.value))}
              inputMode="numeric"
              placeholder="123456"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 tracking-[0.35em] text-center text-xl font-bold"
            />

            <button
              onClick={() => {
                if (!email.trim() || otp.length !== 6) {
                  showToast('Please enter your email and 6-digit OTP.', 'error');
                  return;
                }
                verify.mutate(
                  { email: email.trim(), otp },
                  {
                    onSuccess: () => {
                      showToast('Email verified. Welcome!', 'success');
                      router.push(redirectTo);
                    },
                    onError: (err: unknown) => {
                      showToast(errorMessage(err, 'Failed to verify OTP.'), 'error');
                    },
                  }
                );
              }}
              disabled={verify.isPending}
              className="mt-6 w-full px-6 py-3.5 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-40"
            >
              {verify.isPending ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <p className="text-sm font-semibold text-gray-900">Didn&apos;t receive the code?</p>
            <p className="text-sm text-gray-600 mt-1">You can resend an OTP. Please wait 60 seconds between resends.</p>
            <button
              onClick={() => {
                if (!email.trim()) {
                  showToast('Enter your email first.', 'error');
                  return;
                }
                if (!canResend) {
                  showToast('Please wait before resending.', 'error');
                  return;
                }
                resend.mutate(
                  { email: email.trim() },
                  {
                    onSuccess: () => {
                      showToast('OTP sent. Check your inbox.', 'success');
                      setCanResend(false);
                      setTimeout(() => setCanResend(true), 60_000);
                    },
                    onError: (err: unknown) => {
                      showToast(errorMessage(err, 'Failed to resend OTP.'), 'error');
                    },
                  }
                );
              }}
              disabled={resend.isPending || !canResend}
              className="mt-4 w-full px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-100 disabled:opacity-40"
            >
              {resend.isPending ? 'Sending...' : canResend ? 'Resend OTP' : 'Resend available soon'}
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            <Link href="/login" className="font-semibold text-gray-900 hover:text-gray-700">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
