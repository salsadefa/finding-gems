import { Request, Response } from 'express';
/**
 * Get creator's balance summary
 * GET /api/v1/payouts/balance
 */
export declare const getCreatorBalance: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Recalculate creator balance (from orders)
 * POST /api/v1/payouts/balance/recalculate
 */
export declare const recalculateBalance: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get creator's bank accounts
 * GET /api/v1/payouts/bank-accounts
 */
export declare const getBankAccounts: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Add bank account
 * POST /api/v1/payouts/bank-accounts
 */
export declare const addBankAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete bank account
 * DELETE /api/v1/payouts/bank-accounts/:id
 */
export declare const deleteBankAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get creator's payout history
 * GET /api/v1/payouts
 */
export declare const getPayouts: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Request a payout
 * POST /api/v1/payouts
 */
export declare const requestPayout: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Cancel payout request (only if pending)
 * POST /api/v1/payouts/:id/cancel
 */
export declare const cancelPayout: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get all payout requests (Admin)
 * GET /api/v1/payouts/admin/all
 */
export declare const getAllPayouts: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Process payout (Admin)
 * POST /api/v1/payouts/admin/:id/process
 */
export declare const processPayout: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=payout.controller.d.ts.map