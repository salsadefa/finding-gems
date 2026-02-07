"use strict";
// ============================================
// Input Sanitization Utility - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUserInput = exports.validateMaxLength = exports.sanitizeText = exports.sanitizeHtml = void 0;
/**
 * Sanitize HTML/XSS from user input
 * SEC-002 Fix: Prevent XSS attacks by escaping HTML entities
 */
const sanitizeHtml = (input) => {
    if (typeof input !== 'string')
        return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};
exports.sanitizeHtml = sanitizeHtml;
/**
 * Sanitize text input - removes dangerous characters while preserving useful ones
 * Use for names, usernames, etc.
 */
const sanitizeText = (input) => {
    if (typeof input !== 'string')
        return input;
    // Remove script tags completely
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove other dangerous HTML tags
    sanitized = sanitized.replace(/<[^>]+>/g, '');
    // Trim whitespace
    return sanitized.trim();
};
exports.sanitizeText = sanitizeText;
/**
 * Validate and sanitize string length
 * NEG-004 Fix: Enforce max length on text inputs
 */
const validateMaxLength = (input, maxLength, fieldName) => {
    if (typeof input !== 'string')
        return input;
    if (input.length > maxLength) {
        throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
    }
    return input;
};
exports.validateMaxLength = validateMaxLength;
/**
 * Comprehensive input sanitizer for user registration/profile
 */
const sanitizeUserInput = (input) => {
    const sanitized = {};
    if (input.name) {
        sanitized.name = (0, exports.sanitizeText)(input.name).slice(0, 100); // Max 100 chars
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
exports.sanitizeUserInput = sanitizeUserInput;
//# sourceMappingURL=sanitize.js.map