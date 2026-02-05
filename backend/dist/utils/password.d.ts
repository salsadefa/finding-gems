/**
 * Hash a password
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare a password with a hash
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Validate password strength
 * Returns validation result with error message if invalid
 */
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.d.ts.map