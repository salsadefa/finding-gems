import { Request, Response } from 'express';
/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export declare const refresh: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export declare const getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export declare const forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export declare const resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map