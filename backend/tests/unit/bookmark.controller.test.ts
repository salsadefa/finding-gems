import { Request, Response } from 'express';
import { getMyBookmarks, createBookmark, deleteBookmark, checkBookmark } from '../../src/controllers/bookmark.controller';
import { supabase } from '../../src/config/supabase';

// Mock Supabase
jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Helper to wait for async catchAsync to propagate
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

// Helper to create chainable mock
const createSupabaseMock = (finalResult: { data?: any; error?: any }) => {
  const chainMock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(finalResult),
  };
  return chainMock;
};

describe('Bookmark Controller', () => {
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

  describe('getMyBookmarks', () => {
    it('should return user bookmarks', async () => {
      req.user = { id: 'user-123' } as any;

      const mockBookmarks = [
        { 
          id: 'b1', 
          website_id: 'w1', 
          website: { id: 'w1', name: 'Site 1', slug: 'site-1' } 
        },
        { 
          id: 'b2', 
          website_id: 'w2', 
          website: { id: 'w2', name: 'Site 2', slug: 'site-2' } 
        }
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockBookmarks, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      getMyBookmarks(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: { bookmarks: mockBookmarks }
      }));
    });

    it('should return empty array if no bookmarks', async () => {
      req.user = { id: 'user-123' } as any;

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      getMyBookmarks(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: { bookmarks: [] }
      }));
    });
  });

  describe('createBookmark', () => {
    it('should create bookmark successfully', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { websiteId: 'website-123' };

      const mockWebsite = { id: 'website-123', name: 'Test Site' };
      const mockBookmark = { 
        id: 'bookmark-123', 
        website_id: 'website-123', 
        user_id: 'user-123',
        website: mockWebsite
      };

      // Track call count
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'websites') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockWebsite, error: null }),
          };
        }
        if (table === 'bookmarks') {
          callCount++;
          if (callCount === 1) {
            // First call - check existing
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            };
          } else {
            // Second call - insert
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockBookmark, error: null }),
            };
          }
        }
        return createSupabaseMock({ data: null, error: null });
      });

      createBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Website bookmarked successfully'
      }));
    });

    it('should fail if already bookmarked', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { websiteId: 'website-123' };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'websites') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 'website-123' }, error: null }),
          };
        }
        if (table === 'bookmarks') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 'existing-bookmark' }, error: null }),
          };
        }
        return createSupabaseMock({ data: null, error: null });
      });

      createBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 409,
        message: 'Website already bookmarked'
      }));
    });

    it('should fail if website not found', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { websiteId: 'nonexistent' };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'websites') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          };
        }
        return createSupabaseMock({ data: null, error: null });
      });

      createBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Website not found'
      }));
    });

    it('should fail if websiteId not provided', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = {}; // No websiteId

      createBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });

  describe('deleteBookmark', () => {
    it('should remove bookmark successfully', async () => {
      req.user = { id: 'user-123' } as any;
      req.params = { websiteId: 'website-123' };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call - find bookmark
          const eqMock = jest.fn().mockReturnThis();
          return {
            select: jest.fn().mockReturnThis(),
            eq: eqMock,
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'bookmark-123', website_id: 'website-123', user_id: 'user-123' }, 
              error: null 
            }),
          };
        } else {
          // Second call - delete (chains: delete().eq().eq())
          const eqMock = jest.fn().mockImplementation(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }));
          return {
            delete: jest.fn().mockReturnValue({ eq: eqMock }),
          };
        }
      });

      deleteBookmark(req as Request, res as Response, next);
      await waitForAsync();
      await new Promise(resolve => setTimeout(resolve, 50)); // Extra wait

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Bookmark removed successfully'
      }));
    });

    it('should fail if bookmark not found', async () => {
      req.user = { id: 'user-123' } as any;
      req.params = { websiteId: 'website-123' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      deleteBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Bookmark not found'
      }));
    });
  });

  describe('checkBookmark', () => {
    it('should return true if bookmarked', async () => {
      req.user = { id: 'user-123' } as any;
      req.params = { websiteId: 'website-123' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'bookmark-123' }, error: null }),
      });

      checkBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: { isBookmarked: true }
      }));
    });

    it('should return false if not bookmarked', async () => {
      req.user = { id: 'user-123' } as any;
      req.params = { websiteId: 'website-123' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      checkBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: { isBookmarked: false }
      }));
    });
  });
});
