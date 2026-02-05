import { Request, Response } from 'express';
/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
export declare const getUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export declare const getUserById: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/v1/users
 * @access  Private (Admin)
 */
export declare const createUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Own profile or Admin)
 */
export declare const updateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Delete user (soft delete - set isActive to false)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin or own profile)
 */
export declare const deleteUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export declare const getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
export declare const updateMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map