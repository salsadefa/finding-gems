// ============================================
// Input Sanitization Utility - Finding Gems Backend
// ============================================

/**
 * Sanitize HTML/XSS from user input
 * SEC-002 Fix: Prevent XSS attacks by escaping HTML entities
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize text input - removes dangerous characters while preserving useful ones
 * Use for names, usernames, etc.
 */
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Remove script tags completely
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove other dangerous HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // Trim whitespace
  return sanitized.trim();
};

/**
 * Validate and sanitize string length
 * NEG-004 Fix: Enforce max length on text inputs
 */
export const validateMaxLength = (input: string, maxLength: number, fieldName: string): string => {
  if (typeof input !== 'string') return input;
  
  if (input.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
  
  return input;
};

/**
 * Comprehensive input sanitizer for user registration/profile
 */
export const sanitizeUserInput = (input: {
  name?: string;
  username?: string;
  email?: string;
}): typeof input => {
  const sanitized: typeof input = {};
  
  if (input.name) {
    sanitized.name = sanitizeText(input.name).slice(0, 100); // Max 100 chars
  }
  
  if (input.username) {
    // Username: alphanumeric, underscore, hyphen only
    sanitized.username = input.username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
  }
  
  if (input.email) {
    sanitized.email = input.email.toLowerCase().trim();
  }
  
  return sanitized;
};
