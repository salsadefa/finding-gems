import { 
  getCreators, 
  getCreatorProfile, 
  getMyCreatorProfile, 
  updateMyCreatorProfile, 
  getCreatorStats 
} from '../controllers/creator.controller';
import { ForbiddenError, ValidationError, NotFoundError } from '../utils/errors';

const fromMock = jest.fn();

jest.mock('../config/supabase', () => ({
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
  ilike = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
  insert = jest.fn(() => this);
  update = jest.fn(() => this);
  upsert = jest.fn(() => this);
  single = jest.fn(async () => this.response);
  then = (resolve: any, reject?: any) => Promise.resolve(this.response).then(resolve, reject);
}

const createRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const waitForAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
};

describe('Creator Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCreators', () => {
    test('returns list of creators with pagination', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'creator-1', name: 'Creator 1', role: 'creator', average_rating: 4.5 },
          { id: 'creator-2', name: 'Creator 2', role: 'creator', average_rating: 4.0 }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { query: { page: 1, limit: 20, sortBy: 'rating', sortOrder: 'desc' } };
      const res = createRes();
      const next = jest.fn();

      await getCreators(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.creators).toHaveLength(2);
      expect(response.data.pagination.total).toBe(2);
    });

    test('supports search filter', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [{ id: 'creator-1', name: 'John Doe', role: 'creator' }], 
        error: null,
        count: 1
      }));

      const req: any = { query: { search: 'john' } };
      const res = createRes();
      const next = jest.fn();

      await getCreators(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.creators).toHaveLength(1);
    });
  });

  describe('getCreatorProfile', () => {
    test('returns creator by username', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: 'creator-1', name: 'Creator', username: 'johndoe', role: 'creator' }, 
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [{ id: 'web-1', name: 'Website 1' }], 
          error: null 
        }));

      const req: any = { params: { idOrUsername: 'johndoe' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorProfile(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.creator.username).toBe('johndoe');
    });

    test('returns creator by UUID', async () => {
      const uuid = '12345678-1234-1234-1234-123456789012';
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: uuid, name: 'Creator', role: 'creator' }, 
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [], 
          error: null 
        }));

      const req: any = { params: { idOrUsername: uuid } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorProfile(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('throws NotFoundError if creator not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'Not found' } }));

      const req: any = { params: { idOrUsername: 'nonexistent' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('getMyCreatorProfile', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = {};
      const res = createRes();
      const next = jest.fn();

      await getMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if not creator or admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      await getMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns creator profile for creator', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'profile-1', user_id: 'creator-1', bio: 'My bio' }, 
        error: null 
      }));

      const req: any = { user: { id: 'creator-1', role: 'creator' } };
      const res = createRes();
      const next = jest.fn();

      await getMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.profile.bio).toBe('My bio');
    });
  });

  describe('updateMyCreatorProfile', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = { body: {} };
      const res = createRes();
      const next = jest.fn();

      await updateMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if not creator', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, body: { bio: 'test' } };
      const res = createRes();
      const next = jest.fn();

      await updateMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ValidationError if no valid fields to update', async () => {
      const req: any = { user: { id: 'creator-1', role: 'creator' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await updateMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('updates existing profile', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'profile-1' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: 'profile-1', bio: 'Updated bio' }, 
          error: null 
        }));

      const req: any = { 
        user: { id: 'creator-1', role: 'creator' }, 
        body: { bio: 'Updated bio' } 
      };
      const res = createRes();
      const next = jest.fn();

      await updateMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.profile.bio).toBe('Updated bio');
    });

    test('creates new profile if not exists', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: null, error: null }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: { id: 'profile-new', bio: 'New bio' }, 
          error: null 
        }));

      const req: any = { 
        user: { id: 'creator-1', role: 'creator' }, 
        body: { bio: 'New bio' } 
      };
      const res = createRes();
      const next = jest.fn();

      await updateMyCreatorProfile(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCreatorStats', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = {};
      const res = createRes();
      const next = jest.fn();

      await getCreatorStats(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if not creator', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorStats(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns creator stats', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'web-1', status: 'active', viewCount: 100, clickCount: 50, rating: 4.5, reviewCount: 10 },
          { id: 'web-2', status: 'active', viewCount: 50, clickCount: 25, rating: 4.0, reviewCount: 5 }
        ], 
        error: null 
      }));

      const req: any = { user: { id: 'creator-1', role: 'creator' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorStats(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.stats.totalWebsites).toBe(2);
      expect(response.data.stats.totalViews).toBe(150);
      expect(response.data.stats.totalReviews).toBe(15);
    });
  });
});
