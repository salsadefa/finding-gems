// ============================================
// Global Error Handler - Finding Gems Backend
// ============================================

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
    stack?: string;
  };
  timestamp: string;
}

/**
 * Global error handling middleware
 * Catches all errors and sends consistent response format
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // Default error values
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details: Array<{ field: string; message: string }> | undefined;
  let stack: string | undefined;

  // Handle operational errors (our custom AppError classes)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    
    if ('errors' in err) {
      details = (err as any).errors;
    }

    // Log operational errors
    logger.warn(`Operational Error: ${err.code} - ${err.message}`, {
      statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    // Programming or unknown errors
    logger.error('Unexpected Error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Development mode: include stack trace
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
    message = err.message; // Show actual error message in dev
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
      ...(stack && { stack }),
    },
    timestamp,
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
    timestamp: new Date().toISOString(),
  });
};
