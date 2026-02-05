import { Request, Response } from 'express';
/**
 * Get pricing tiers for a website
 * GET /api/v1/billing/websites/:websiteId/pricing
 */
export declare const getWebsitePricing: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Create pricing tier (Creator only)
 * POST /api/v1/billing/websites/:websiteId/pricing
 */
export declare const createPricingTier: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Update pricing tier (Creator only)
 * PATCH /api/v1/billing/pricing/:tierId
 */
export declare const updatePricingTier: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete pricing tier (Creator only)
 * DELETE /api/v1/billing/pricing/:tierId
 */
export declare const deletePricingTier: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Create order (initiate purchase)
 * POST /api/v1/billing/orders
 */
export declare const createOrder: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get order by ID
 * GET /api/v1/billing/orders/:orderId
 */
export declare const getOrder: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get my orders (purchase history)
 * GET /api/v1/billing/orders/my
 */
export declare const getMyOrders: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Cancel order (only pending orders)
 * POST /api/v1/billing/orders/:orderId/cancel
 */
export declare const cancelOrder: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get invoice by order ID
 * GET /api/v1/billing/orders/:orderId/invoice
 */
export declare const getOrderInvoice: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get my invoices
 * GET /api/v1/billing/invoices/my
 */
export declare const getMyInvoices: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get my access (purchased products)
 * GET /api/v1/billing/access/my
 */
export declare const getMyAccess: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Check if user has access to a website
 * GET /api/v1/billing/access/check/:websiteId
 */
export declare const checkAccess: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get creator sales
 * GET /api/v1/billing/creator/sales
 */
export declare const getCreatorSales: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=billing.controller.d.ts.map