// ============================================
// Error Classes Unit Tests
// ============================================

import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
  RateLimitError,
  InternalServerError,
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 500, 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should set status based on status code', () => {
      const clientError = new AppError('Client error', 400);
      const serverError = new AppError('Server error', 500);

      expect(clientError.status).toBe('fail');
      expect(serverError.status).toBe('error');
    });
  });

  describe('ValidationError', () => {
    it('should have status code 400', () => {
      const error = new ValidationError('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should store field errors', () => {
      const fieldErrors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', fieldErrors);

      expect(error.errors).toEqual(fieldErrors);
    });
  });

  describe('NotFoundError', () => {
    it('should have status code 404', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status code 401', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('ForbiddenError', () => {
    it('should have status code 403', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('BadRequestError', () => {
    it('should have status code 400', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('ConflictError', () => {
    it('should have status code 409', () => {
      const error = new ConflictError('Already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('should have status code 429', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('InternalServerError', () => {
    it('should have status code 500', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Internal server error');
    });
  });
});
