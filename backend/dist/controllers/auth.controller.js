"use strict";
// ============================================
// Authentication Controller - Finding Gems Backend
// ============================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
/**
 * Sanitize user object by removing password
 */
const sanitizeUser = (user) => {
    const { password, ...sanitized } = user;
    return sanitized;
};
/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password, name, username, role = 'buyer' } = req.body;
    // 1. Validate required fields
    if (!email || !password || !name || !username) {
        throw new errors_1.ValidationError('All fields are required', [
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
            ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
            ...(!username ? [{ field: 'username', message: 'Username is required' }] : []),
        ]);
    }
    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new errors_1.ValidationError('Invalid email format', [
            { field: 'email', message: 'Please provide a valid email address' },
        ]);
    }
    // 3. Validate password strength
    const passwordValidation = (0, password_1.validatePasswordStrength)(password);
    if (!passwordValidation.isValid) {
        throw new errors_1.ValidationError('Password does not meet requirements', passwordValidation.errors.map(msg => ({
            field: 'password',
            message: msg,
        })));
    }
    // 4. Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
        throw new errors_1.ValidationError('Invalid username format', [
            { field: 'username', message: 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens' },
        ]);
    }
    // 5. Check if email already exists
    const { data: existingEmail } = await supabase_1.supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
    if (existingEmail) {
        throw new errors_1.ConflictError('User with this email already exists');
    }
    // 6. Check if username already exists
    const { data: existingUsername } = await supabase_1.supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();
    if (existingUsername) {
        throw new errors_1.ConflictError('Username is already taken');
    }
    // 7. Hash password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // 8. Create user
    const { data: user, error } = await supabase_1.supabase
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
    if (error)
        throw error;
    // 9. Generate tokens
    const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user);
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
exports.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    // 1. Validate required fields
    if (!email || !password) {
        throw new errors_1.ValidationError('Email and password are required', [
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ]);
    }
    // 2. Find user by email
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
    if (error || !user) {
        throw new errors_1.UnauthorizedError('Invalid email or password');
    }
    // 3. Check if user is active
    if (!user.isActive) {
        throw new errors_1.UnauthorizedError('Your account has been deactivated. Please contact support.');
    }
    // 4. Verify password
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.UnauthorizedError('Invalid email or password');
    }
    // 5. Generate tokens
    const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user);
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
exports.logout = (0, catchAsync_1.catchAsync)(async (_req, res) => {
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
exports.refresh = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    // 1. Validate refresh token presence
    if (!refreshToken) {
        throw new errors_1.ValidationError('Refresh token is required', [
            { field: 'refreshToken', message: 'Please provide a refresh token' },
        ]);
    }
    // 2. Verify refresh token
    let decoded;
    try {
        decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
    }
    // 3. Find user
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();
    if (error || !user) {
        throw new errors_1.NotFoundError('User not found');
    }
    // 4. Check if user is active
    if (!user.isActive) {
        throw new errors_1.UnauthorizedError('Your account has been deactivated');
    }
    // 5. Generate new tokens
    const tokens = (0, jwt_1.generateTokens)(user);
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
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.UnauthorizedError('Authentication required');
    }
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*, creator_profile:creator_profiles(*)')
        .eq('id', req.user.id)
        .single();
    if (error || !user) {
        throw new errors_1.NotFoundError('User not found');
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
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email } = req.body;
    // 1. Validate email
    if (!email) {
        throw new errors_1.ValidationError('Email is required', [
            { field: 'email', message: 'Please provide your email address' },
        ]);
    }
    // 2. Check if user exists
    const { data: user } = await supabase_1.supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email.toLowerCase())
        .single();
    // Always return success to prevent email enumeration
    // In production, this would send an email with a reset token
    if (user) {
        // Generate reset token (in production, store this in DB with expiry)
        const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Store reset token in user record (with 1 hour expiry)
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase_1.supabase
            .from('users')
            .update({
            reset_token: resetToken,
            reset_token_expiry: resetExpiry,
        })
            .eq('id', user.id);
        // TODO: In production, send email with reset link
        // For now, we just log it (remove in production)
        console.log(`Password reset requested for ${email}. Token: ${resetToken}`);
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
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, password } = req.body;
    // 1. Validate inputs
    if (!token || !password) {
        throw new errors_1.ValidationError('Token and password are required', [
            ...(!token ? [{ field: 'token', message: 'Reset token is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'New password is required' }] : []),
        ]);
    }
    // 2. Validate password strength
    const passwordValidation = (0, password_1.validatePasswordStrength)(password);
    if (!passwordValidation.isValid) {
        throw new errors_1.ValidationError('Password does not meet requirements', passwordValidation.errors.map(msg => ({
            field: 'password',
            message: msg,
        })));
    }
    // 3. Find user with valid reset token
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('id, email, reset_token, reset_token_expiry')
        .eq('reset_token', token)
        .single();
    if (error || !user) {
        throw new errors_1.ValidationError('Invalid or expired reset token');
    }
    // 4. Check if token is expired
    if (user.reset_token_expiry && new Date(user.reset_token_expiry) < new Date()) {
        throw new errors_1.ValidationError('Reset token has expired. Please request a new one.');
    }
    // 5. Hash new password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // 6. Update password and clear reset token
    await supabase_1.supabase
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
//# sourceMappingURL=auth.controller.js.map