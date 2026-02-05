// ============================================
// Custom Error Classes - Finding Gems Backend
// ============================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
