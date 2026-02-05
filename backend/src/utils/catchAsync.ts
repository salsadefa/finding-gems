// ============================================
// Async Error Handler - Finding Gems Backend
// ============================================

import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps async route handlers to catch errors and pass them to next()
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }))
 */
export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
