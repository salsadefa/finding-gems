import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export declare const authorize: (...allowedRoles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map