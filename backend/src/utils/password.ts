// ============================================
// Password Utilities - Finding Gems Backend
// ============================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * Returns validation result with error message if invalid
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Contains number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Contains special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
