import { Request, Response } from 'express';
/**
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
export declare const getPlatformStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get all pending websites for moderation
 * @route   GET /api/v1/admin/websites/pending
 * @access  Private (Admin only)
 */
export declare const getPendingWebsites: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Moderate a website (approve/reject/suspend)
 * @route   PATCH /api/v1/admin/websites/:id/moderate
 * @access  Private (Admin only)
 */
export declare const moderateWebsite: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get all users for admin management
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
export declare const getAllUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update user role or status (ban/unban)
 * @route   PATCH /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
export declare const updateUserAdmin: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get all reports
 * @route   GET /api/v1/admin/reports
 * @access  Private (Admin only)
 */
export declare const getReports: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Take action on a report
 * @route   PATCH /api/v1/admin/reports/:id
 * @access  Private (Admin only)
 */
export declare const handleReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get all websites with filters (admin view - includes all statuses)
 * @route   GET /api/v1/admin/websites
 * @access  Private (Admin only)
 */
export declare const getAllWebsitesAdmin: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=admin.controller.d.ts.map