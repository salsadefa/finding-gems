import { 
  getAllCreatorApplications,
  getCreatorApplicationById,
  handleCreatorApplication,
  getCreatorApplicationStats
} from '../controllers/creator-application-admin.controller';
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
  gte = jest.fn(() => this);
  or = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
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

describe('Creator Application Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCreatorApplications', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = { query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if user is not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if user is not admin (creator role)', async () => {
      const req: any = { user: { id: 'creator-1', role: 'creator' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns applications with pagination for admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'app-1', status: 'pending' },
          { id: 'app-2', status: 'approved' }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.applications).toHaveLength(2);
      expect(response.data.pagination).toBeDefined();
    });

    test('filters by status', async () => {
      const query = new MockQuery({ data: [], error: null, count: 0 });
      fromMock.mockReturnValue(query);

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { status: 'pending' } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      expect(query.eq).toHaveBeenCalledWith('status', 'pending');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns empty array when no applications', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: [], error: null, count: 0 }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      const response = res.json.mock.calls[0][0];
      expect(response.data.applications).toEqual([]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('calculates pagination correctly', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: [], error: null, count: 50 }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 2, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      const response = res.json.mock.calls[0][0];
      expect(response.data.pagination.hasNext).toBe(true);
      expect(response.data.pagination.hasPrev).toBe(true);
    });

    test('handles last page correctly', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: [], error: null, count: 25 }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 2, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllCreatorApplications(req, res, next);
      await waitForAsync();

      const response = res.json.mock.calls[0][0];
      expect(response.data.pagination.hasNext).toBe(false);
    });
  });

  describe('getCreatorApplicationById', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, params: { id: 'app-1' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationById(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws NotFoundError if application not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'not found' } }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'missing-app' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationById(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test('returns application detail with user and reviewer', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({
        data: {
          id: 'app-1',
          status: 'pending',
          user: { id: 'user-1', name: 'User One', email: 'user@example.com' },
          reviewer: { id: 'admin-1', name: 'Admin' }
        },
        error: null
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'app-1' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationById(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.application.user).toBeDefined();
    });
  });

  describe('handleCreatorApplication', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, params: { id: 'app-1' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ValidationError if status is invalid', async () => {
      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'invalid' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(fromMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('throws ValidationError if status is empty', async () => {
      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: '' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(fromMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('throws ValidationError if rejecting without reason', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'rejected' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('throws NotFoundError if application not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'not found' } }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'missing-app' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test('throws ValidationError if application already processed', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'approved', userId: 'user-1' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('approves application successfully', async () => {
      const updateAppQuery = new MockQuery({ error: null });

      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }))
        .mockImplementationOnce(() => updateAppQuery)
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { bio: 'Bio', professionalBackground: 'BG', expertise: ['a'], portfolioUrl: 'url' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'approved', user: { id: 'user-1' } }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(updateAppQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'approved',
        reviewedBy: 'admin-1'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updates user role to creator when approved', async () => {
      const roleUpdateQuery = new MockQuery({ error: null });

      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => roleUpdateQuery)
        .mockImplementationOnce(() => new MockQuery({ data: { bio: 'Bio', professionalBackground: 'BG', expertise: [], portfolioUrl: null }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'approved' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(roleUpdateQuery.update).toHaveBeenCalledWith({ role: 'creator' });
    });

    test('creates creator_profile when approved', async () => {
      const profileUpsertQuery = new MockQuery({ error: null });

      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { bio: 'Bio', professionalBackground: 'BG', expertise: ['a'], portfolioUrl: 'url' }, error: null }))
        .mockImplementationOnce(() => profileUpsertQuery)
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'approved' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(profileUpsertQuery.upsert).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-1',
        bio: 'Bio',
        professionalBackground: 'BG',
        expertise: ['a'],
        portfolioUrl: 'url',
        isVerified: true
      }), { onConflict: 'userId' });
    });

    test('creates creator_balance when approved', async () => {
      const balanceUpsertQuery = new MockQuery({ error: null });

      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { bio: 'Bio', professionalBackground: 'BG', expertise: [], portfolioUrl: null }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ error: null }))
        .mockImplementationOnce(() => balanceUpsertQuery)
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'approved' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(balanceUpsertQuery.upsert).toHaveBeenCalledWith({
        creator_id: 'user-1',
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
      }, { onConflict: 'creator_id' });
    });

    test('rejects application successfully with reason', async () => {
      const updateAppQuery = new MockQuery({ error: null });

      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'pending', userId: 'user-1' }, error: null }))
        .mockImplementationOnce(() => updateAppQuery)
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'app-1', status: 'rejected' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'app-1' }, 
        body: { status: 'rejected', rejectionReason: 'Not qualified' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleCreatorApplication(req, res, next);
      await waitForAsync();

      expect(updateAppQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'rejected',
        rejectionReason: 'Not qualified',
        reviewedBy: 'admin-1'
      }));

      const calledTables = fromMock.mock.calls.map(call => call[0]);
      expect(calledTables).not.toContain('users');
      expect(calledTables).not.toContain('creator_profiles');
      expect(calledTables).not.toContain('creator_balances');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCreatorApplicationStats', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationStats(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns stats for all statuses', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ count: 10, error: null }))
        .mockImplementationOnce(() => new MockQuery({ count: 3, error: null }))
        .mockImplementationOnce(() => new MockQuery({ count: 5, error: null }))
        .mockImplementationOnce(() => new MockQuery({ count: 2, error: null }));

      const req: any = { user: { id: 'admin-1', role: 'admin' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationStats(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toEqual({ total: 10, pending: 3, approved: 5, rejected: 2 });
    });

    test('returns zeros when no applications exist', async () => {
      fromMock.mockImplementation(() => new MockQuery({ count: 0, error: null }));

      const req: any = { user: { id: 'admin-1', role: 'admin' } };
      const res = createRes();
      const next = jest.fn();

      await getCreatorApplicationStats(req, res, next);
      await waitForAsync();

      const response = res.json.mock.calls[0][0];
      expect(response.data).toEqual({ total: 0, pending: 0, approved: 0, rejected: 0 });
    });
  });
});
