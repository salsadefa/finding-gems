import { Request, Response } from 'express';
/**
 * Get current user's creator application
 */
export declare const getMyApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Submit a new creator application
 */
export declare const createApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get all creator applications (admin only)
 */
export declare const getApplications: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Approve a creator application (admin only)
 */
export declare const approveApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Reject a creator application (admin only)
 */
export declare const rejectApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=creator-application.controller.d.ts.map