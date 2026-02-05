import { Request, Response } from 'express';
import { getCategories, getCategoryById, createCategory } from '../../src/controllers/category.controller';
import { supabase } from '../../src/config/supabase';

jest.mock('../../src/config/supabase');

describe('Category Controller', () => {
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

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'AI Tools', slug: 'ai-tools', websiteCount: 10 },
        { id: '2', name: 'Productivity', slug: 'productivity', websiteCount: 5 }
      ];

      // Controller uses: .from('categories').select('*').eq('isActive', true).order('name', ...)
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockCategories, error: null })
          })
        })
      });

      await getCategories(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          categories: mockCategories
        })
      }));
    });

    it('should handle empty categories', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      await getCategories(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          categories: []
        })
      }));
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', async () => {
      req.params = { id: 'category-123' };

      const mockCategory = { 
        id: 'category-123', 
        name: 'AI Tools', 
        slug: 'ai-tools',
        description: 'Artificial Intelligence Tools'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockCategory, error: null })
          })
        })
      });

      await getCategoryById(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          category: mockCategory
        })
      }));
    });

    it('should return 404 if category not found', async () => {
      req.params = { id: 'nonexistent' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
          })
        })
      });

      // Call the controller (it's wrapped in catchAsync, so returns void immediately)
      getCategoryById(req as Request, res as Response, next);
      
      // Wait for async error handling to propagate to next()
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404
      }));
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      // Note: Role check is handled by middleware, not controller
      req.body = { 
        name: 'New Category',
        slug: 'new-category', 
        description: 'A new category' 
      };

      const mockCreated = { 
        id: 'new-category-123',
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreated,
              error: null
            })
          })
        })
      });

      await createCategory(req as Request, res as Response, next);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Category created successfully'
      }));
    });

    it('should validate required fields (name and slug)', async () => {
      req.body = { name: 'Missing Slug' }; // No slug

      await createCategory(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });

    it('should validate slug is required', async () => {
      req.body = {}; // No name or slug

      await createCategory(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: 'Name and slug are required'
      }));
    });

    it('should handle database insert errors', async () => {
      req.body = { 
        name: 'New Category', 
        slug: 'duplicate-slug'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Duplicate key violation' }
            })
          })
        })
      });

      // Call the controller (it's wrapped in catchAsync)
      createCategory(req as Request, res as Response, next);
      
      // Wait for async error handling to propagate to next()
      await new Promise(resolve => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });
});
