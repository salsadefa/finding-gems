/**
 * Sanitize HTML/XSS from user input
 * SEC-002 Fix: Prevent XSS attacks by escaping HTML entities
 */
export declare const sanitizeHtml: (input: string) => string;
/**
 * Sanitize text input - removes dangerous characters while preserving useful ones
 * Use for names, usernames, etc.
 */
export declare const sanitizeText: (input: string) => string;
/**
 * Validate and sanitize string length
 * NEG-004 Fix: Enforce max length on text inputs
 */
export declare const validateMaxLength: (input: string, maxLength: number, fieldName: string) => string;
/**
 * Comprehensive input sanitizer for user registration/profile
 */
export declare const sanitizeUserInput: (input: {
    name?: string;
    username?: string;
    email?: string;
}) => typeof input;
//# sourceMappingURL=sanitize.d.ts.map