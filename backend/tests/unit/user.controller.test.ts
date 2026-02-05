import { Request, Response } from 'express';
import { getUsers, getUserById, updateUser } from '../../src/controllers/user.controller';
import { supabase } from '../../src/config/supabase';

jest.mock('../../src/config/supabase');

// Helper to wait for async catchAsync to propagate
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

// Helper to create chainable Supabase mock with final resolved value
const createSupabaseMock = (resolvedValue: { data: any; error: any; count?: number }) => {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue(resolvedValue),
    single: jest.fn().mockResolvedValue(resolvedValue),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  };
  return mockBuilder;
};

describe('User Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status, json } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      req.user = { id: 'admin-123', role: 'admin' } as any;
      req.query = { page: '1', limit: '10' };

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com', password: 'hash' },
        { id: '2', name: 'User 2', email: 'user2@test.com', password: 'hash' }
      ];

      const mockBuilder = createSupabaseMock({ 
        data: mockUsers, 
        error: null, 
        count: 2 
      });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      getUsers(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          users: expect.arrayContaining([
            expect.not.objectContaining({ password: expect.anything() })
          ]),
          pagination: expect.objectContaining({
            total: 2
          })
        })
      }));
    });

    it('should filter by role', async () => {
      req.user = { id: 'admin-123', role: 'admin' } as any;
      req.query = { role: 'creator' };

      const mockBuilder = createSupabaseMock({ data: [], error: null, count: 0 });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      getUsers(req as Request, res as Response, next);
      await waitForAsync();

      expect(mockBuilder.eq).toHaveBeenCalledWith('role', 'creator');
    });
  });

  describe('getUserById', () => {
    it('should return user details', async () => {
      req.params = { id: 'user-123' };
      req.user = { id: 'user-123', role: 'buyer' } as any;

      const mockUser = { 
        id: 'user-123', 
        name: 'Test User', 
        email: 'test@example.com',
        password: 'hashed',
        role: 'buyer',
        is_active: true
      };

      const mockBuilder = createSupabaseMock({ data: mockUser, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      getUserById(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.not.objectContaining({ password: expect.anything() })
        })
      }));
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: 'nonexistent' };
      req.user = { id: 'admin-123', role: 'admin' } as any;

      const mockBuilder = createSupabaseMock({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      getUserById(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404
      }));
    });

    it('should allow admin to view any user', async () => {
      req.params = { id: 'other-user' };
      req.user = { id: 'admin-123', role: 'admin' } as any;

      const mockUser = { 
        id: 'other-user', 
        name: 'Other User',
        role: 'buyer',
        is_active: true
      };

      const mockBuilder = createSupabaseMock({ data: mockUser, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      getUserById(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUser', () => {
    it('should update own profile', async () => {
      req.params = { id: 'user-123' };
      req.user = { id: 'user-123', role: 'buyer' } as any;
      req.body = { name: 'Updated Name' };

      // First call: find existing user
      // Second call: update user
      const mockExistingUser = { 
        id: 'user-123', 
        name: 'Old Name',
        email: 'test@example.com',
        role: 'buyer'
      };
      const mockUpdatedUser = { 
        ...mockExistingUser, 
        name: 'Updated Name' 
      };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Find existing user
          return createSupabaseMock({ data: mockExistingUser, error: null });
        }
        // Update user
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: mockUpdatedUser, 
                  error: null 
                })
              })
            })
          })
        };
      });

      updateUser(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'User updated successfully'
      }));
    });

    it('should forbid updating other users for non-admin', async () => {
      req.params = { id: 'other-user' };
      req.user = { id: 'user-123', role: 'buyer' } as any;
      req.body = { name: 'Hacked Name' };

      // Mock: find the target user (different from req.user)
      const mockTargetUser = { 
        id: 'other-user', 
        name: 'Original Name',
        role: 'buyer'
      };

      (supabase.from as jest.Mock).mockReturnValue(
        createSupabaseMock({ data: mockTargetUser, error: null })
      );

      updateUser(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403
      }));
    });

    it('should allow admin to update any user', async () => {
      req.params = { id: 'other-user' };
      req.user = { id: 'admin-123', role: 'admin' } as any;
      req.body = { name: 'Admin Updated' };

      const mockExistingUser = { id: 'other-user', name: 'Old Name' };
      const mockUpdatedUser = { ...mockExistingUser, name: 'Admin Updated' };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createSupabaseMock({ data: mockExistingUser, error: null });
        }
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: mockUpdatedUser, 
                  error: null 
                })
              })
            })
          })
        };
      });

      updateUser(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
    });
  });
});
