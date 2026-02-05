import { createReport, getMyReports, getReportById } from '../controllers/report.controller';
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
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
  insert = jest.fn(() => this);
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

describe('Report Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = { body: {} };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws ValidationError if websiteId or reason missing', async () => {
      const req: any = { user: { id: 'user-1' }, body: {} };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('throws ValidationError if reason is invalid', async () => {
      const req: any = { 
        user: { id: 'user-1' }, 
        body: { websiteId: 'web-1', reason: 'invalid-reason' } 
      };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('throws NotFoundError if website not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'Not found' } }));

      const req: any = { 
        user: { id: 'user-1' }, 
        body: { websiteId: 'web-1', reason: 'spam' } 
      };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test('throws ValidationError if already reported', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', name: 'Website' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'existing-report' }, error: null }));

      const req: any = { 
        user: { id: 'user-1' }, 
        body: { websiteId: 'web-1', reason: 'spam' } 
      };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    test('creates report successfully', async () => {
      fromMock
        .mockImplementationOnce(() => new MockQuery({ data: { id: 'web-1', name: 'Website' }, error: null }))
        .mockImplementationOnce(() => new MockQuery({ data: null, error: null }))
        .mockImplementationOnce(() => new MockQuery({ 
          data: { 
            id: 'report-1', 
            website_id: 'web-1', 
            reason: 'spam',
            status: 'pending',
            website: { id: 'web-1', name: 'Website', slug: 'website' }
          }, 
          error: null 
        }));

      const req: any = { 
        user: { id: 'user-1' }, 
        body: { websiteId: 'web-1', reason: 'spam', description: 'This is spam' } 
      };
      const res = createRes();
      const next = jest.fn();

      await createReport(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.report.reason).toBe('spam');
    });
  });

  describe('getMyReports', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = { query: {} };
      const res = createRes();
      const next = jest.fn();

      await getMyReports(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns user reports with pagination', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: [
          { id: 'report-1', reason: 'spam', status: 'pending' },
          { id: 'report-2', reason: 'scam', status: 'resolved' }
        ], 
        error: null,
        count: 2
      }));

      const req: any = { user: { id: 'user-1' }, query: { page: 1, limit: 10 } };
      const res = createRes();
      const next = jest.fn();

      await getMyReports(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.reports).toHaveLength(2);
    });
  });

  describe('getReportById', () => {
    test('throws ForbiddenError if not authenticated', async () => {
      const req: any = { params: { id: 'report-1' } };
      const res = createRes();
      const next = jest.fn();

      await getReportById(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('throws NotFoundError if report not found', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ data: null, error: { message: 'Not found' } }));

      const req: any = { user: { id: 'user-1' }, params: { id: 'report-1' } };
      const res = createRes();
      const next = jest.fn();

      await getReportById(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    test('throws ForbiddenError if not owner and not admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'report-1', reporter_id: 'other-user', reason: 'spam' }, 
        error: null 
      }));

      const req: any = { user: { id: 'user-1', role: 'user' }, params: { id: 'report-1' } };
      const res = createRes();
      const next = jest.fn();

      await getReportById(req, res, next);
      await waitForAsync();

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    test('returns report for owner', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'report-1', reporter_id: 'user-1', reason: 'spam', status: 'pending' }, 
        error: null 
      }));

      const req: any = { user: { id: 'user-1', role: 'user' }, params: { id: 'report-1' } };
      const res = createRes();
      const next = jest.fn();

      await getReportById(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.report.reason).toBe('spam');
    });

    test('returns report for admin', async () => {
      fromMock.mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'report-1', reporter_id: 'other-user', reason: 'spam', status: 'pending' }, 
        error: null 
      }));

      const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'report-1' } };
      const res = createRes();
      const next = jest.fn();

      await getReportById(req, res, next);
      await waitForAsync();

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
