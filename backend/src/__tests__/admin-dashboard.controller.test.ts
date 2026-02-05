import { 
  getDashboardOverview,
  getPaymentAnalytics,
  getUserAnalytics,
  getTopPerformers
} from '../controllers/admin-dashboard.controller';

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
  lte = jest.fn(() => this);
  or = jest.fn(() => this);
  in = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
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

describe('Admin Dashboard Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardOverview', () => {
    test('returns 403 if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      await getDashboardOverview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(403);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
    });

    test('returns 403 if not authenticated', async () => {
      const req: any = {};
      const res = createRes();
      const next = jest.fn();

      await getDashboardOverview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns dashboard overview for admin', async () => {
      // Mock multiple parallel queries
      fromMock.mockImplementation(() => new MockQuery({ 
        data: [{ id: '1', total_amount: 100000, platform_fee: 1000, status: 'paid' }],
        count: 10, 
        error: null 
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' } };
      const res = createRes();
      const next = jest.fn();

      await getDashboardOverview(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });

  describe('getPaymentAnalytics', () => {
    test('returns 403 if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getPaymentAnalytics(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns payment analytics for admin', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: [
            { 
              id: 'order-1', 
              total_amount: 100000, 
              platform_fee: 1000, 
              status: 'paid', 
              created_at: new Date().toISOString(),
              payment_method: 'credit_card'
            }
          ],
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [],
          error: null 
        }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { period: '30d' } };
      const res = createRes();
      const next = jest.fn();

      await getPaymentAnalytics(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.period).toBe('30d');
      expect(response.data.totals).toBeDefined();
    });

    test('supports different periods', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: [],
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [],
          error: null 
        }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { period: '7d' } };
      const res = createRes();
      const next = jest.fn();

      await getPaymentAnalytics(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.period).toBe('7d');
    });
  });

  describe('getUserAnalytics', () => {
    test('returns 403 if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'user' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getUserAnalytics(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns user analytics for admin', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: [
            { id: 'user-1', role: 'user', created_at: new Date().toISOString() },
            { id: 'user-2', role: 'creator', created_at: new Date().toISOString() }
          ],
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [
            { role: 'user' },
            { role: 'creator' },
            { role: 'admin' }
          ],
          error: null 
        }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: { period: '30d' } };
      const res = createRes();
      const next = jest.fn();

      await getUserAnalytics(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.period).toBe('30d');
      expect(response.data.new_users).toBeDefined();
    });
  });

  describe('getTopPerformers', () => {
    test('returns 403 if not admin', async () => {
      const req: any = { user: { id: 'user-1', role: 'creator' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getTopPerformers(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns top websites and creators for admin', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ 
          data: [
            { 
              website_id: 'web-1', 
              total_amount: 500000, 
              platform_fee: 5000, 
              website: { id: 'web-1', name: 'Website 1' } 
            }
          ],
          error: null 
        }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: [
            { 
              creator_id: 'creator-1', 
              total_amount: 1000000, 
              platform_fee: 10000, 
              creator: { id: 'creator-1', name: 'Creator 1' } 
            }
          ],
          error: null 
        }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, query: {} };
      const res = createRes();
      const next = jest.fn();

      await getTopPerformers(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.top_websites).toBeDefined();
      expect(response.data.top_creators).toBeDefined();
    });
  });
});
