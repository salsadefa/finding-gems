"use strict";
// ============================================
// Custom Error Classes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.BadRequestError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, code = 'ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400, 'BAD_REQUEST');
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'INTERNAL_ERROR');
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map