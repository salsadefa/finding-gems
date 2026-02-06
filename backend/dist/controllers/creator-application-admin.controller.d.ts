import { Request, Response } from 'express';
/**
 * @desc    Get all creator applications
 * @route   GET /api/v1/admin/creator-applications
 * @access  Private (Admin only)
 */
export declare const getAllCreatorApplications: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get single creator application details
 * @route   GET /api/v1/admin/creator-applications/:id
 * @access  Private (Admin only)
 */
export declare const getCreatorApplicationById: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Approve or reject creator application
 * @route   PATCH /api/v1/admin/creator-applications/:id
 * @access  Private (Admin only)
 */
export declare const handleCreatorApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get creator application statistics
 * @route   GET /api/v1/admin/creator-applications/stats
 * @access  Private (Admin only)
 */
export declare const getCreatorApplicationStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=creator-application-admin.controller.d.ts.map