// ============================================
// Authentication Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { sanitizeText } from '../utils/sanitize';
import { generateOtp, hashOtp } from '../utils/otp';
import { sendEmailVerificationOtpEmail, sendPasswordResetEmail } from '../services/email.service';
import {
  RegisterRequestBody,
  LoginRequestBody,
  RefreshTokenRequestBody,
  SanitizedUser,
} from '../types/auth.types';

/**
 * Sanitize user object by removing password
 */
const sanitizeUser = (user: any): SanitizedUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...sanitized } = user;
  return sanitized;
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name, username, role = 'buyer' } = req.body as RegisterRequestBody;

  // 1. Validate required fields
  if (!email || !password || !name || !username) {
    throw new ValidationError('All fields are required', [
      ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
      ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
      ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
      ...(!username ? [{ field: 'username', message: 'Username is required' }] : []),
    ]);
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', [
      { field: 'email', message: 'Please provide a valid email address' },
    ]);
  }

  // 3. Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password does not meet requirements', passwordValidation.errors.map(msg => ({
      field: 'password',
      message: msg,
    })));
  }

  // 4. Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw new ValidationError('Invalid username format', [
      { field: 'username', message: 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens' },
    ]);
  }

  // 4.5. Sanitize name (SEC-002 XSS fix) and validate max length (NEG-004 fix)
  const MAX_NAME_LENGTH = 100;
  const sanitizedName = sanitizeText(name);
  if (sanitizedName.length > MAX_NAME_LENGTH) {
    throw new ValidationError('Name is too long', [
      { field: 'name', message: `Name must not exceed ${MAX_NAME_LENGTH} characters` },
    ]);
  }
  if (sanitizedName.length < 2) {
    throw new ValidationError('Name is too short', [
      { field: 'name', message: 'Name must be at least 2 characters' },
    ]);
  }

  // 5. Check if email already exists
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existingEmail) {
    throw new ConflictError('User with this email already exists');
  }

  // 6. Check if username already exists
  const { data: existingUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.toLowerCase())
    .single();

  if (existingUsername) {
    throw new ConflictError('Username is already taken');
  }

  // 7. Hash password
  const hashedPassword = await hashPassword(password);

  // 8. Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: sanitizedName,
      username: username.toLowerCase(),
      role,
      isActive: true,
      emailVerified: false,
    })
    .select()
    .single();

  if (error) throw error;

  // 9. Create and send OTP for email verification
  const otp = generateOtp(6);
  const otpHash = hashOtp({ email, otp, purpose: 'verify_email' });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Remove any previous unconsumed codes for this user/email
  await supabase
    .from('email_verification_codes')
    .delete()
    .eq('userId', user.id)
    .eq('purpose', 'verify_email')
    .is('consumedAt', null);

  await supabase.from('email_verification_codes').insert({
    userId: user.id,
    email: email.toLowerCase(),
    purpose: 'verify_email',
    codeHash: otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Send email (best-effort)
  try {
    await sendEmailVerificationOtpEmail(email.toLowerCase(), { userName: sanitizedName, otp });
  } catch (err) {
    console.error('[Auth][Register] Failed to send OTP email:', err);
  }

  // 10. Return response (verification required, no tokens yet)
  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      verificationRequired: true,
    },
    message: 'Verification code sent to email',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Verify email with OTP
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const otp = String(req.body?.otp || '').trim();

  if (!email || !otp) {
    throw new ValidationError('Email and OTP are required', [
      ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
      ...(!otp ? [{ field: 'otp', message: 'OTP is required' }] : []),
    ]);
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (userError || !user) throw new NotFoundError('User not found');

  if (user.emailVerified) {
    const { accessToken, refreshToken } = generateTokens(user);
    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), accessToken, refreshToken },
      message: 'Email already verified',
      timestamp: new Date().toISOString(),
    });
  }

  const { data: codeRow, error: codeError } = await supabase
    .from('email_verification_codes')
    .select('*')
    .eq('userId', user.id)
    .eq('purpose', 'verify_email')
    .is('consumedAt', null)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (codeError) throw codeError;
  if (!codeRow) throw new ValidationError('No active verification code. Please resend OTP.');

  const now = Date.now();
  if (new Date(codeRow.expiresAt).getTime() < now) {
    throw new ValidationError('OTP expired. Please resend OTP.');
  }

  if ((codeRow.attempts || 0) >= 5) {
    throw new ValidationError('Too many attempts. Please resend OTP.');
  }

  const expectedHash = hashOtp({ email, otp, purpose: 'verify_email' });
  if (expectedHash !== codeRow.codeHash) {
    await supabase
      .from('email_verification_codes')
      .update({ attempts: (codeRow.attempts || 0) + 1, updatedAt: new Date().toISOString() })
      .eq('id', codeRow.id);
    throw new ValidationError('Invalid OTP');
  }

  const verifiedAt = new Date().toISOString();
  await supabase
    .from('users')
    .update({ emailVerified: true, emailVerifiedAt: verifiedAt, updatedAt: verifiedAt })
    .eq('id', user.id);

  await supabase
    .from('email_verification_codes')
    .update({ consumedAt: verifiedAt, updatedAt: verifiedAt })
    .eq('id', codeRow.id);

  const { accessToken, refreshToken } = generateTokens({ ...user, emailVerified: true, emailVerifiedAt: verifiedAt });

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser({ ...user, emailVerified: true, emailVerifiedAt: verifiedAt }),
      accessToken,
      refreshToken,
    },
    message: 'Email verified successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Resend verification OTP
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email) throw new ValidationError('Email is required', [{ field: 'email', message: 'Required' }]);

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (userError || !user) throw new NotFoundError('User not found');
  if (user.emailVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email already verified',
      timestamp: new Date().toISOString(),
    });
  }

  // Cooldown: 60 seconds
  const { data: lastCode } = await supabase
    .from('email_verification_codes')
    .select('id, lastSentAt:"lastSentAt"')
    .eq('userId', user.id)
    .eq('purpose', 'verify_email')
    .is('consumedAt', null)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastCode?.lastSentAt) {
    const last = new Date(lastCode.lastSentAt).getTime();
    if (Date.now() - last < 60_000) {
      throw new ValidationError('Please wait before requesting a new code');
    }
  }

  const otp = generateOtp(6);
  const otpHash = hashOtp({ email, otp, purpose: 'verify_email' });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase
    .from('email_verification_codes')
    .delete()
    .eq('userId', user.id)
    .eq('purpose', 'verify_email')
    .is('consumedAt', null);

  await supabase.from('email_verification_codes').insert({
    userId: user.id,
    email,
    purpose: 'verify_email',
    codeHash: otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  try {
    await sendEmailVerificationOtpEmail(email, { userName: user.name, otp });
  } catch (err) {
    console.error('[Auth][ResendVerification] Failed to send OTP email:', err);
  }

  res.status(200).json({
    success: true,
    message: 'Verification code sent',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequestBody;

  // 1. Validate required fields
  if (!email || !password) {
    throw new ValidationError('Email and password are required', [
      ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
      ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
    ]);
  }

  // 2. Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // 3. Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  // 4. Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Require email verification
  if (!user.emailVerified) {
    // best-effort: send OTP (with 60s cooldown)
    try {
      const { data: lastCode } = await supabase
        .from('email_verification_codes')
        .select('lastSentAt:"lastSentAt"')
        .eq('userId', user.id)
        .eq('purpose', 'verify_email')
        .is('consumedAt', null)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();

      const last = lastCode?.lastSentAt ? new Date(lastCode.lastSentAt).getTime() : 0;
      if (Date.now() - last >= 60_000) {
        const otp = generateOtp(6);
        const otpHash = hashOtp({ email, otp, purpose: 'verify_email' });
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabase
          .from('email_verification_codes')
          .delete()
          .eq('userId', user.id)
          .eq('purpose', 'verify_email')
          .is('consumedAt', null);

        await supabase.from('email_verification_codes').insert({
          userId: user.id,
          email: email.toLowerCase(),
          purpose: 'verify_email',
          codeHash: otpHash,
          expiresAt,
          attempts: 0,
          lastSentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await sendEmailVerificationOtpEmail(email.toLowerCase(), { userName: user.name, otp });
      }
    } catch (err) {
      console.error('[Auth][Login] Failed to send OTP email:', err);
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email to continue',
      },
      data: {
        verificationRequired: true,
        email: email.toLowerCase(),
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // 6. Return response
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
    message: 'Login successful',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenRequestBody;

  // 1. Validate refresh token presence
  if (!refreshToken) {
    throw new ValidationError('Refresh token is required', [
      { field: 'refreshToken', message: 'Please provide a refresh token' },
    ]);
  }

  // 2. Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // 3. Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.userId)
    .single();

  if (error || !user) {
    throw new NotFoundError('User not found');
  }

  // 4. Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated');
  }

  // 5. Generate new tokens
  const tokens = generateTokens(user);

  // 6. Return response
  res.status(200).json({
    success: true,
    data: tokens,
    message: 'Token refreshed successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*, creator_profile:creator_profiles(*)')
    .eq('id', req.user.id)
    .single();

  if (error || !user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  // 1. Validate email
  if (!email) {
    throw new ValidationError('Email is required', [
      { field: 'email', message: 'Please provide your email address' },
    ]);
  }

  // 2. Check if user exists
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', email.toLowerCase())
    .single();

  // Always return success to prevent email enumeration
  if (user) {
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in user record (with 1 hour expiry)
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
      })
      .eq('id', user.id);

    // Send password reset email
    const baseUrl = process.env.APP_BASE_URL || 'https://finding-gems.vercel.app';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(email.toLowerCase(), {
        userName: user.name,
        resetUrl,
      });
    } catch (err) {
      console.error('[Auth] Failed to send password reset email:', err);
    }
  }

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // 1. Validate inputs
  if (!token || !password) {
    throw new ValidationError('Token and password are required', [
      ...(!token ? [{ field: 'token', message: 'Reset token is required' }] : []),
      ...(!password ? [{ field: 'password', message: 'New password is required' }] : []),
    ]);
  }

  // 2. Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password does not meet requirements', passwordValidation.errors.map(msg => ({
      field: 'password',
      message: msg,
    })));
  }

  // 3. Find user with valid reset token
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, reset_token, reset_token_expiry')
    .eq('reset_token', token)
    .single();

  if (error || !user) {
    throw new ValidationError('Invalid or expired reset token');
  }

  // 4. Check if token is expired
  if (user.reset_token_expiry && new Date(user.reset_token_expiry) < new Date()) {
    throw new ValidationError('Reset token has expired. Please request a new one.');
  }

  // 5. Hash new password
  const hashedPassword = await hashPassword(password);

  // 6. Update password and clear reset token
  await supabase
    .from('users')
    .update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    })
    .eq('id', user.id);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.',
    timestamp: new Date().toISOString(),
  });
});
