"use strict";
// ============================================
// Password Utilities - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
/**
 * Hash a password
 */
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Compare a password with a hash
 */
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
/**
 * Validate password strength
 * Returns validation result with error message if invalid
 */
const validatePasswordStrength = (password) => {
    const errors = [];
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
exports.validatePasswordStrength = validatePasswordStrength;
//# sourceMappingURL=password.js.map