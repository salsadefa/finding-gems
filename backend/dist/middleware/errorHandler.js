"use strict";
// ============================================
// Global Error Handler - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../config/logger");
/**
 * Global error handling middleware
 * Catches all errors and sends consistent response format
 */
const errorHandler = (err, req, res, _next) => {
    const timestamp = new Date().toISOString();
    // Default error values
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'Something went wrong';
    let details;
    let stack;
    // Handle operational errors (our custom AppError classes)
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        errorCode = err.code;
        message = err.message;
        if ('errors' in err) {
            details = err.errors;
        }
        // Log operational errors
        logger_1.logger.warn(`Operational Error: ${err.code} - ${err.message}`, {
            statusCode,
            path: req.path,
            method: req.method,
        });
    }
    else {
        // Programming or unknown errors
        logger_1.logger.error('Unexpected Error:', {
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
    const errorResponse = {
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
exports.errorHandler = errorHandler;
/**
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`,
        },
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map