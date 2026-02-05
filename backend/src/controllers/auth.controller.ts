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
  const { password, ...sanitized } = user;
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
      name: name.trim(),
      username: username.toLowerCase(),
      role,
      isActive: true,
    })
    .select()
    .single();

  if (error) throw error;

  // 9. Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // 10. Return response
  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
    message: 'User registered successfully',
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
