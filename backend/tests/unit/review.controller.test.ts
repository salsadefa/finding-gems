import { Request, Response } from 'express';
import { getReviews, createReview, deleteReview } from '../../src/controllers/review.controller';
import { prisma } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    website: {
      findUnique: jest.fn(),
      update: jest.fn(),
    }
  }
}));

// Helper to wait for async catchAsync to propagate
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

describe('Review Controller', () => {
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
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [
        { id: 'r1', title: 'Great!', rating: 5, user: { name: 'John' }, website: { name: 'Site1' } },
        { id: 'r2', title: 'Good', rating: 4, user: { name: 'Jane' }, website: { name: 'Site2' } }
      ];

      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (prisma.review.count as jest.Mock).mockResolvedValue(2);

      req.query = { page: '1', limit: '10' };

      getReviews(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          reviews: mockReviews,
          pagination: expect.objectContaining({
            total: 2
          })
        })
      }));
    });

    it('should filter by websiteId', async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.review.count as jest.Mock).mockResolvedValue(0);

      req.query = { websiteId: 'website-123' };

      getReviews(req as Request, res as Response, next);
      await waitForAsync();

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ websiteId: 'website-123' })
        })
      );
    });
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { 
        websiteId: 'website-123', 
        rating: 5, 
        title: 'Amazing Website!', 
        content: 'This is a really great website that I found very useful for my needs.'
      };

      const mockWebsite = { id: 'website-123', name: 'Test Site' };
      const mockCreatedReview = { 
        id: 'review-123', 
        ...req.body, 
        userId: 'user-123',
        user: { id: 'user-123', name: 'Test User' },
        website: { id: 'website-123', name: 'Test Site' }
      };

      // Mock: website exists
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(mockWebsite);
      // Mock: no existing review (user hasn't reviewed this website yet)
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      // Mock: review creation
      (prisma.review.create as jest.Mock).mockResolvedValue(mockCreatedReview);
      // Mock: get all reviews for average calculation
      (prisma.review.findMany as jest.Mock).mockResolvedValue([{ rating: 5 }]);
      // Mock: website update
      (prisma.website.update as jest.Mock).mockResolvedValue({});

      createReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Review created successfully'
      }));
    });

    it('should prevent duplicate reviews from same user', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { 
        websiteId: 'website-123', 
        rating: 5, 
        title: 'Another Review', 
        content: 'Trying to review the same website again which should fail.'
      };

      // Mock: website exists
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({ id: 'website-123' });
      // Mock: existing review found (duplicate)
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-review' });

      createReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 409,
        message: 'You have already reviewed this website'
      }));
    });

    it('should fail if website not found', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { 
        websiteId: 'nonexistent-id', 
        rating: 5, 
        title: 'Great Site!', 
        content: 'This is my review content for testing purposes.'
      };

      // Mock: website doesn't exist
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(null);

      createReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Website not found'
      }));
    });

    it('should validate review content length', async () => {
      req.user = { id: 'user-123' } as any;
      req.body = { 
        websiteId: 'website-123', 
        rating: 5, 
        title: 'Great!', 
        content: 'Short' // Less than 10 characters
      };

      createReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });

  describe('deleteReview', () => {
    it('should delete own review', async () => {
      req.params = { id: 'review-123' };
      req.user = { id: 'user-123', role: 'buyer' } as any;

      const mockReview = { 
        id: 'review-123', 
        userId: 'user-123', 
        websiteId: 'website-123' 
      };

      // Mock: find the review
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      // Mock: delete review
      (prisma.review.delete as jest.Mock).mockResolvedValue({});
      // Mock: get remaining reviews for recalculation
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      // Mock: update website stats
      (prisma.website.update as jest.Mock).mockResolvedValue({});

      deleteReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Review deleted successfully'
      }));
    });

    it('should forbid deleting other users review', async () => {
      req.params = { id: 'review-123' };
      req.user = { id: 'different-user', role: 'buyer' } as any;

      const mockReview = { 
        id: 'review-123', 
        userId: 'user-123', // Different owner
        websiteId: 'website-123' 
      };

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      deleteReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403
      }));
    });

    it('should allow admin to delete any review', async () => {
      req.params = { id: 'review-123' };
      req.user = { id: 'admin-user', role: 'admin' } as any;

      const mockReview = { 
        id: 'review-123', 
        userId: 'other-user', 
        websiteId: 'website-123' 
      };

      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (prisma.review.delete as jest.Mock).mockResolvedValue({});
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.website.update as jest.Mock).mockResolvedValue({});

      deleteReview(req as Request, res as Response, next);
      await waitForAsync();

      expect(status).toHaveBeenCalledWith(200);
    });
  });
});
