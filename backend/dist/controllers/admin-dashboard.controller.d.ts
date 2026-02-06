import { Request, Response } from 'express';
/**
 * Get admin dashboard overview
 * GET /api/v1/admin/dashboard
 */
export declare const getDashboardOverview: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get payment analytics
 * GET /api/v1/admin/analytics/payments
 */
export declare const getPaymentAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get user analytics
 * GET /api/v1/admin/analytics/users
 */
export declare const getUserAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get top performers (websites, creators)
 * GET /api/v1/admin/analytics/top
 */
export declare const getTopPerformers: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=admin-dashboard.controller.d.ts.map