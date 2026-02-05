import { 
  getPlatformStats,
  getPendingWebsites,
  moderateWebsite,
  getAllUsers,
  updateUserAdmin,
  getReports,
  handleReport
} from '../controllers/admin.controller';
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
  ilike = jest.fn(() => this);
  in = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
  insert = jest.fn(() => this);
  update = jest.fn(() => this);
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

describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlatformStats', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      await getPlatformStats(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = {};
      const res = createRes();
      const next = jest.fn();

      await getPlatformStats(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns platform stats for admin', async () => {
      // Mock 9 parallel queries
      fromMock.mockImplementation(() => new MockQuery({ count: 10, error: null }));

      const req: any = { user: { id: 'admin-1', role: 'admin' } };
      const res = createRes();
      const next = jest.fn();

      await getPlatformStats(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.stats).toBeDefined();
    });
  });

  describe('getPendingWebsites', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getPendingWebsites(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns pending websites for admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'web-1', name: 'Website 1', status: 'pending' },
          { id: 'web-2', name: 'Website 2', status: 'pending' }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getPendingWebsites(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.websites).toHaveLength(2);
    });
  });

  describe('moderateWebsite', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, params: { id: 'web-1' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await moderateWebsite(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ValidationError if status is invalid', async () => {
      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'web-1' }, 
        body: { status: 'invalid-status' } 
      };
      const res = createRes();
      const next = jest.fn();

      await moderateWebsite(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('approves website successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', status: 'pending' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', status: 'active' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'web-1' }, 
        body: { status: 'active', adminNote: 'Approved' } 
      };
      const res = createRes();
      const next = jest.fn();

      await moderateWebsite(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.message).toContain('approved');
    });

    test('rejects website successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', status: 'pending' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', status: 'rejected' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'web-1' }, 
        body: { status: 'rejected', adminNote: 'Not appropriate' } 
      };
      const res = createRes();
      const next = jest.fn();

      await moderateWebsite(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllUsers', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getAllUsers(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns users with pagination for admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'user-1', name: 'User 1', email: 'user1@example.com', role: 'user' },
          { id: 'user-2', name: 'User 2', email: 'user2@example.com', role: 'creator' }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getAllUsers(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.users).toHaveLength(2);
    });

    test('filters by role', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [{ id: 'creator-1', name: 'Creator', role: 'creator' }], 
        error: null,
        count: 1
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { role: 'creator' } };
      const res = createRes();
      const next = jest.fn();

      await getAllUsers(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUserAdmin', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, params: { id: 'user-2' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await updateUserAdmin(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws NotFoundError if user not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'Not found' } }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'user-999' }, 
        body: { role: 'creator' } 
      };
      const res = createRes();
      const next = jest.fn();

      await updateUserAdmin(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test('updates user role successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'user-1', role: 'user' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'user-1', role: 'creator' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'user-1' }, 
        body: { role: 'creator' } 
      };
      const res = createRes();
      const next = jest.fn();

      await updateUserAdmin(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.message).toBe('User updated successfully');
    });

    test('bans user successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'user-1', is_active: true }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'user-1', is_active: false }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'user-1' }, 
        body: { isActive: false, adminNote: 'Violation of TOS' } 
      };
      const res = createRes();
      const next = jest.fn();

      await updateUserAdmin(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getReports', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getReports(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns reports with pagination for admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'report-1', reason: 'spam', status: 'pending' },
          { id: 'report-2', reason: 'scam', status: 'pending' }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { page: 1, limit: 20 } };
      const res = createRes();
      const next = jest.fn();

      await getReports(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.reports).toHaveLength(2);
    });

    test('filters by status', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [{ id: 'report-1', status: 'pending' }], 
        error: null,
        count: 1
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { status: 'pending' } };
      const res = createRes();
      const next = jest.fn();

      await getReports(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('handleReport', () => {
    test('throws ForbiddenError if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, params: { id: 'report-1' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await handleReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ValidationError if status is invalid', async () => {
      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'report-1' }, 
        body: { status: 'invalid-status' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('resolves report successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'report-1', status: 'pending' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'report-1', status: 'resolved' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'report-1' }, 
        body: { status: 'resolved', resolution: 'Content removed' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleReport(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.message).toContain('resolved');
    });

    test('dismisses report successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'report-1', status: 'pending' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'report-1', status: 'dismissed' }, error: null }));

      const req: any = { 
        user: { id: 'admin-1', role: 'admin' }, 
        params: { id: 'report-1' }, 
        body: { status: 'dismissed', resolution: 'No violation found' } 
      };
      const res = createRes();
      const next = jest.fn();

      await handleReport(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
