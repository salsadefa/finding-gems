import { Request, Response } from 'express';
/**
 * Initiate payment for an order
 * POST /api/v1/payments/initiate
 */
export declare const initiatePayment: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get payment status
 * GET /api/v1/payments/:transactionId/status
 */
export declare const getPaymentStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Handle Xendit webhook callback
 * POST /api/v1/payments/webhook/xendit
 */
export declare const handleXenditWebhook: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Handle legacy payment webhook (for backward compatibility)
 * POST /api/v1/payments/webhook
 */
export declare const handlePaymentWebhook: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Manual payment confirmation (Admin only)
 * POST /api/v1/payments/:transactionId/confirm
 */
export declare const confirmPayment: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=payment.controller.d.ts.map