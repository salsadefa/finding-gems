import { Request, Response } from 'express';
import { getMyBookmarks, createBookmark, deleteBookmark, checkBookmark } from '../../src/controllers/bookmark.controller';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    bookmark: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    website: {
      findUnique: jest.fn(),
    }
  }
}));

// Helper to wait for async catchAsync to propagate
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

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
          websiteId: 'w1', 
          website: { id: 'w1', name: 'Site 1', slug: 'site-1' } 
        },
        { 
          id: 'b2', 
          websiteId: 'w2', 
          website: { id: 'w2', name: 'Site 2', slug: 'site-2' } 
        }
      ];

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue(mockBookmarks);

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

      (prisma.bookmark.findMany as jest.Mock).mockResolvedValue([]);

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
        websiteId: 'website-123', 
        userId: 'user-123',
        website: mockWebsite
      };

      // Mock: website exists
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(mockWebsite);
      // Mock: no existing bookmark
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);
      // Mock: bookmark creation
      (prisma.bookmark.create as jest.Mock).mockResolvedValue(mockBookmark);

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

      // Mock: website exists
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({ id: 'website-123' });
      // Mock: bookmark already exists
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-bookmark' });

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

      // Mock: website doesn't exist
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(null);

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

      // Mock: bookmark exists
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue({ 
        id: 'bookmark-123',
        websiteId: 'website-123',
        userId: 'user-123'
      });
      // Mock: delete
      (prisma.bookmark.delete as jest.Mock).mockResolvedValue({});

      deleteBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Bookmark removed successfully'
      }));
    });

    it('should fail if bookmark not found', async () => {
      req.user = { id: 'user-123' } as any;
      req.params = { websiteId: 'website-123' };

      // Mock: bookmark doesn't exist
      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);

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

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue({ id: 'bookmark-123' });

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

      (prisma.bookmark.findUnique as jest.Mock).mockResolvedValue(null);

      checkBookmark(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: { isBookmarked: false }
      }));
    });
  });
});
