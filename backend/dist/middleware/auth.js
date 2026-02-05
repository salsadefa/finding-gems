"use strict";
// ============================================
// Authentication Middleware - Finding Gems Backend
// Using Supabase Client (IPv4 Compatible)
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
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
exports.authenticate = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    // 1. Get token from header
    const token = extractToken(req);
    if (!token) {
        throw new errors_1.UnauthorizedError('No authentication token provided');
    }
    // 2. Verify token
    let decoded;
    try {
        decoded = (0, jwt_1.verifyAccessToken)(token);
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired token');
    }
    // 3. Check if user still exists using Supabase
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();
    if (error || !user) {
        throw new errors_1.UnauthorizedError('User associated with this token no longer exists');
    }
    // 4. Check if user is active
    if (!user.isActive) {
        throw new errors_1.UnauthorizedError('Your account has been deactivated');
    }
    // 5. Attach user to request
    req.user = user;
    next();
});
/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError(`Access denied. Required role(s): ${allowedRoles.join(', ')}`);
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
exports.optionalAuth = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next();
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const { data: user } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();
        if (user && user.isActive) {
            req.user = user;
        }
    }
    catch {
        // Invalid token - continue without user
    }
    next();
});
//# sourceMappingURL=auth.js.map