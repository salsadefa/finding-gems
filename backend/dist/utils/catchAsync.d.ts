import { Request, Response, NextFunction } from 'express';
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * Wraps async route handlers to catch errors and pass them to next()
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }))
 */
export declare const catchAsync: (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=catchAsync.d.ts.map