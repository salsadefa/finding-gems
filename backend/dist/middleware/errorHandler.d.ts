import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Array<{
            field: string;
            message: string;
        }>;
        stack?: string;
    };
    timestamp: string;
}
/**
 * Global error handling middleware
 * Catches all errors and sends consistent response format
 */
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => void;
/**
 * Handle 404 errors for undefined routes
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map