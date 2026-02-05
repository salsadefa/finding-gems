import { Request, Response } from 'express';
/**
 * Request a refund
 * POST /api/v1/refunds
 */
export declare const requestRefund: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get user's refund requests
 * GET /api/v1/refunds
 */
export declare const getRefunds: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get refund detail
 * GET /api/v1/refunds/:id
 */
export declare const getRefundDetail: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Cancel refund request
 * POST /api/v1/refunds/:id/cancel
 */
export declare const cancelRefund: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get all refunds (Admin)
 * GET /api/v1/refunds/admin/all
 */
export declare const getAllRefunds: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Process refund (Admin)
 * POST /api/v1/refunds/admin/:id/process
 */
export declare const processRefund: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=refund.controller.d.ts.map