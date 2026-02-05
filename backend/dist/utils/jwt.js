"use strict";
// ============================================
// JWT Utilities - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate access token
 */
const generateAccessToken = (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, secret, { expiresIn: expiresIn });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    return jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, secret, { expiresIn: expiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Generate both tokens
 */
const generateTokens = (user) => {
    return {
        accessToken: (0, exports.generateAccessToken)(user),
        refreshToken: (0, exports.generateRefreshToken)(user),
    };
};
exports.generateTokens = generateTokens;
//# sourceMappingURL=jwt.js.map