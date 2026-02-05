import { Request, Response } from 'express';
import { register, login } from '../../src/controllers/auth.controller';
import { supabase } from '../../src/config/supabase';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../src/utils/password';
import * as jwtUtils from '../../src/utils/jwt';

// Mock all dependencies
jest.mock('../../src/config/supabase');
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/jwt');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    req = { body: {} };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status, json } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();

    // Default mock for password validation - always valid
    (validatePasswordStrength as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
  });

  // Helper to wait for async catchAsync to propagate errors
  const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

  describe('Register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      username: 'testuser'
    };

    it('should register a user successfully', async () => {
      req.body = validRegisterData;

      // Mock password hashing
      (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      
      // Mock token generation
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue({ 
        accessToken: 'access-token', 
        refreshToken: 'refresh-token' 
      });

      // Create a mock chain builder that handles different table operations
      let callIndex = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callIndex++;
        
        if (callIndex === 1) {
          // First call: check email existence - should return null (email not taken)
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              })
            })
          };
        } else if (callIndex === 2) {
          // Second call: check username existence - should return null (username not taken)
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              })
            })
          };
        } else {
          // Third call: insert user
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: { id: 'user-123', ...validRegisterData, role: 'buyer', isActive: true },
                  error: null 
                })
              })
            })
          };
        }
      });

      // Call controller and wait for async
      register(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'User registered successfully'
      }));
    });

    it('should fail with weak password', async () => {
      req.body = { ...validRegisterData, password: 'weak' };

      (validatePasswordStrength as jest.Mock).mockReturnValue({ 
        isValid: false, 
        errors: ['Password must be at least 8 characters'] 
      });

      // Call controller and wait for async
      register(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });

    it('should fail with missing required fields', async () => {
      req.body = { email: 'test@example.com' }; // Missing other fields

      // Call controller and wait for async
      register(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });

    it('should fail with invalid email format', async () => {
      req.body = { ...validRegisterData, email: 'invalid-email' };

      // Call controller and wait for async
      register(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      req.body = { email: 'test@example.com', password: 'Password123!' };
      
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com', 
        password: 'hashedpassword', 
        isActive: true,
        role: 'buyer',
        name: 'Test User'
      };

      // Mock user lookup
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });
      
      // Mock password comparison - success
      (comparePassword as jest.Mock).mockResolvedValue(true);
      
      // Mock token generation
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue({ 
        accessToken: 'access-token', 
        refreshToken: 'refresh-token' 
      });

      // Call controller and wait for async
      login(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Login successful'
      }));
    });

    it('should fail if user not found', async () => {
      req.body = { email: 'notfound@example.com', password: 'Password123!' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          })
        })
      });

      // Call controller and wait for async
      login(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401
      }));
    });

    it('should fail with wrong password', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };

      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com', 
        password: 'hashedpassword', 
        isActive: true
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });
      
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Call controller and wait for async
      login(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401
      }));
    });

    it('should fail if account is deactivated', async () => {
      req.body = { email: 'test@example.com', password: 'Password123!' };

      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com', 
        password: 'hashedpassword', 
        isActive: false
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });
      
      (comparePassword as jest.Mock).mockResolvedValue(true);

      // Call controller and wait for async
      login(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401
      }));
    });

    it('should fail with missing credentials', async () => {
      req.body = {}; // No email or password

      // Call controller and wait for async
      login(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });
});
