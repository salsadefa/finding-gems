// ============================================
// Authentication Middleware - Finding Gems Backend
// Using Supabase Client (IPv4 Compatible)
// ============================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = catchAsync(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // 1. Get token from header
  const token = extractToken(req);
  
  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }
  
  // 2. Verify token
  let decoded: JwtPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
  
  // 3. Check if user still exists using Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.userId)
    .single();
  
  if (error || !user) {
    throw new UnauthorizedError('User associated with this token no longer exists');
  }
  
  // 4. Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated');
  }
  
  // 5. Attach user to request
  req.user = user;
  
  next();
});

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      );
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = catchAsync(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = verifyAccessToken(token);
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Invalid token - continue without user
  }
  
  next();
});
