// ============================================
// OTP Utilities - Finding Gems Backend
// ============================================

import crypto from 'crypto';

export function generateOtp(length = 6): string {
  const digits = '0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += digits[Math.floor(Math.random() * digits.length)];
  }
  return out;
}

export function hashOtp(params: { email: string; otp: string; purpose: string }) {
  const secret = process.env.OTP_SECRET || '';
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('OTP_SECRET is required in production');
  }

  return crypto
    .createHmac('sha256', secret || 'dev-secret')
    .update(`${params.purpose}:${params.email.toLowerCase()}:${params.otp}`)
    .digest('hex');
}
