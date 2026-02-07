import { getReviews, createReview, deleteReview } from '../../src/controllers/review.controller';

const fromMock = jest.fn();

jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
  },
}));

class MockQuery {
  response: any;
  constructor(response: any) {
    this.response = response;
  }
  select = jest.fn(() => this);
  eq = jest.fn(() => this);
  neq = jest.fn(() => this);
  or = jest.fn(() => this);
  gte = jest.fn(() => this);
  ilike = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
  insert = jest.fn(() => this);
  update = jest.fn(() => this);
  delete = jest.fn(() => this);
  single = jest.fn(async () => this.response);
  then = (resolve: any, reject?: any) => Promise.resolve(this.response).then(resolve, reject);
}

// Helper to wait for async catchAsync to propagate
const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 50));

const createRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Review Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [
        { id: 'r1', title: 'Great!', rating: 5, user: { name: 'John' }, website: { name: 'Site1' } },
        { id: 'r2', title: 'Good', rating: 4, user: { name: 'Jane' }, website: { name: 'Site2' } }
      ];

      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: mockReviews, 
        error: null,
        count: 2 
      }));

      const req: any = { query: { page: '1', limit: '10' } };
      const res = createRes();
      const next = jest.fn();

      await getReviews(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
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
      fromMock.mockImplementationOnce(() => {
        const mockQuery = new MockQuery({ data: [], error: null, count: 0 });
        return mockQuery;
      });

      const req: any = { query: { websiteId: 'website-123' } };
      const res = createRes();
      const next = jest.fn();

      await getReviews(req, res, next);
      await waitForAsync();

      expect(fromMock).toHaveBeenCalledWith('reviews');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const mockCreatedReview = { 
        id: 'review-123', 
        websiteId: 'website-123',
        userId: 'user-123',
        rating: 5,
        title: 'Amazing Website!',
        content: 'This is a really great website that I found very useful for my needs.',
        user: { id: 'user-123', name: 'Test User' },
        website: { id: 'website-123', name: 'Test Site' }
      };

      // Mock sequence: 
      // 1. Check website exists
      // 2. Check existing review  
      // 3. Insert review
      // 4. Get website reviews for average
      // 5. Update website rating
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'website-123' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: null, error: { code: 'PGRST116' } }))
        .mockImplementationOnce(() => new MockQuery({ data: mockCreatedReview, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: [{ rating: 5 }], error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: {}, error: null }));

      const req: any = { 
        user: { id: 'user-123' },
        body: { 
          websiteId: 'website-123', 
          rating: 5, 
          title: 'Amazing Website!', 
          content: 'This is a really great website that I found very useful for my needs.'
        }
      };
      const res = createRes();
      const next = jest.fn();

      await createReview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Review created successfully'
      }));
    });

    it('should prevent duplicate reviews from same user', async () => {
      // Mock: website exists, then existing review found
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'website-123' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'existing-review' }, error: null }));

      const req: any = { 
        user: { id: 'user-123' },
        body: { 
          websiteId: 'website-123', 
          rating: 5, 
          title: 'Another Review', 
          content: 'Trying to review the same website again which should fail.'
        }
      };
      const res = createRes();
      const next = jest.fn();

      await createReview(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 409,
        message: 'You have already reviewed this website'
      }));
    });

    it('should fail if website not found', async () => {
      // Mock: website doesn't exist
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { code: 'PGRST116' } }));

      const req: any = { 
        user: { id: 'user-123' },
        body: { 
          websiteId: 'nonexistent-id', 
          rating: 5, 
          title: 'Great Site!', 
          content: 'This is my review content for testing purposes.'
        }
      };
      const res = createRes();
      const next = jest.fn();

      await createReview(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        message: 'Website not found'
      }));
    });

    it('should validate review content length', async () => {
      const req: any = { 
        user: { id: 'user-123' },
        body: { 
          websiteId: 'website-123', 
          rating: 5, 
          title: 'Great!', 
          content: 'Short' // Less than 10 characters
        }
      };
      const res = createRes();
      const next = jest.fn();

      await createReview(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400
      }));
    });
  });

  describe('deleteReview', () => {
    it('should delete own review', async () => {
      // Mock: find review, delete review, get remaining reviews, update website
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: 'review-123', userId: 'user-123', websiteId: 'website-123' }, 
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ data: {}, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: [], error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: {}, error: null }));

      const req: any = { 
        params: { id: 'review-123' },
        user: { id: 'user-123', role: 'buyer' }
      };
      const res = createRes();
      const next = jest.fn();

      await deleteReview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Review deleted successfully'
      }));
    });

    it('should forbid deleting other users review', async () => {
      // Mock: find review with different owner
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'review-123', userId: 'other-user', websiteId: 'website-123' }, 
        error: null 
      }));

      const req: any = { 
        params: { id: 'review-123' },
        user: { id: 'different-user', role: 'buyer' }
      };
      const res = createRes();
      const next = jest.fn();

      await deleteReview(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403
      }));
    });

    it('should allow admin to delete any review', async () => {
      // Mock: find review, delete review, get remaining reviews, update website
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: 'review-123', userId: 'other-user', websiteId: 'website-123' }, 
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ data: {}, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: [], error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: {}, error: null }));

      const req: any = { 
        params: { id: 'review-123' },
        user: { id: 'admin-user', role: 'admin' }
      };
      const res = createRes();
      const next = jest.fn();

      await deleteReview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
