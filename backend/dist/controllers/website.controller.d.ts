import { Request, Response } from 'express';
/**
 * @desc    Get all websites with filters, pagination, and sorting
 * @route   GET /api/v1/websites
 * @access  Public
 */
export declare const getWebsites: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get website by ID or slug
 * @route   GET /api/v1/websites/:id
 * @access  Public
 */
export declare const getWebsiteById: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Create new website (creators only)
 * @route   POST /api/v1/websites
 * @access  Private (Creator)
 */
export declare const createWebsite: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update website (creator or admin)
 * @route   PATCH /api/v1/websites/:id
 * @access  Private (Creator/Admin)
 */
export declare const updateWebsite: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Delete website (creator or admin)
 * @route   DELETE /api/v1/websites/:id
 * @access  Private (Creator/Admin)
 */
export declare const deleteWebsite: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get current user's websites (creator only)
 * @route   GET /api/v1/websites/my-websites
 * @access  Private (Creator)
 */
export declare const getMyWebsites: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=website.controller.d.ts.map