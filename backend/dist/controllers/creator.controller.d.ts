import { Request, Response } from 'express';
/**
 * @desc    Get all creators (public listing)
 * @route   GET /api/v1/creators
 * @access  Public
 */
export declare const getCreators: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get creator profile by ID or username
 * @route   GET /api/v1/creators/:idOrUsername
 * @access  Public
 */
export declare const getCreatorProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get current creator's profile (authenticated)
 * @route   GET /api/v1/creators/me
 * @access  Private (Creator only)
 */
export declare const getMyCreatorProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update current creator's profile
 * @route   PATCH /api/v1/creators/me
 * @access  Private (Creator only)
 */
export declare const updateMyCreatorProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get creator's dashboard stats
 * @route   GET /api/v1/creators/me/stats
 * @access  Private (Creator only)
 */
export declare const getCreatorStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=creator.controller.d.ts.map