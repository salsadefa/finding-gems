// ============================================
// JWT Utilities - Finding Gems Backend
// ============================================

import jwt from 'jsonwebtoken';
import { User } from '../types/auth.types';

export type UserRole = 'buyer' | 'creator' | 'admin';

// JWT Payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extended Request interface (will be used in middleware)
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Generate access token
 */
export const generateAccessToken = (user: User): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user: User): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Generate both tokens
 */
export const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
