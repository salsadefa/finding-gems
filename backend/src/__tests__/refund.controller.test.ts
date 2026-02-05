import {
  requestRefund,
  cancelRefund,
  processRefund
} from '../controllers/refund.controller';

const fromMock = jest.fn();
const rpcMock = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    rpc: (...args: any[]) => rpcMock(...args),
  },
}));

const sendRefundStatusEmailMock = jest.fn().mockResolvedValue(true);

jest.mock('../services/email.service', () => ({
  sendRefundStatusEmail: (...args: any[]) => sendRefundStatusEmailMock(...args),
}));

class MockQuery {
  response: any;
  constructor(response: any) {
    this.response = response;
  }
  select = jest.fn(() => this);
  eq = jest.fn(() => this);
  neq = jest.fn(() => this);
  in = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  limit = jest.fn(() => this);
  insert = jest.fn(() => this);
  update = jest.fn(() => this);
  upsert = jest.fn(() => this);
  delete = jest.fn(() => this);
  single = jest.fn(async () => this.response);
  then = (resolve: any, reject?: any) => Promise.resolve(this.response).then(resolve, reject);
}

const createRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

// Helper function to wait for all async operations
const waitForAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setTimeout(resolve, 50));
};

describe('Refund Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/refunds returns 401 if not authenticated', async () => {
    const req: any = { body: {} };
    const res = createRes();

    await requestRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('POST /api/v1/refunds creates refund request for paid order', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: {
        id: 'order-1',
        buyer_id: 'user-1',
        creator_id: 'creator-1',
        status: 'paid',
        refund_status: 'none',
        total_amount: 100000,
        transactions: [{ id: 'tx-1' }]
      }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'refund-1' }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ error: null }));

    rpcMock.mockResolvedValue({ data: 'RF-123' });

    const req: any = { user: { id: 'user-1' }, body: { order_id: 'order-1', reason: 'Issue' } };
    const res = createRes();

    await requestRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('POST /api/v1/refunds rejects if order not paid', async () => {
    fromMock.mockImplementationOnce(() => new MockQuery({ data: { status: 'pending', buyer_id: 'user-1', creator_id: 'creator-1' }, error: null }));

    const req: any = { user: { id: 'user-1' }, body: { order_id: 'order-1', reason: 'Issue' } };
    const res = createRes();

    await requestRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/refunds rejects if refund already exists', async () => {
    fromMock.mockImplementationOnce(() => new MockQuery({ data: { status: 'paid', refund_status: 'requested', buyer_id: 'user-1', creator_id: 'creator-1' }, error: null }));

    const req: any = { user: { id: 'user-1' }, body: { order_id: 'order-1', reason: 'Issue' } };
    const res = createRes();

    await requestRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/refunds/:id/cancel cancels pending refund', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'refund-1', status: 'requested', order_id: 'order-1' }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      .mockImplementationOnce(() => new MockQuery({ error: null }));

    const req: any = { user: { id: 'user-1' }, params: { id: 'refund-1' } };
    const res = createRes();

    await cancelRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('POST /api/v1/refunds/admin/:id/process approves refund', async () => {
    fromMock
      // 1. Get refund with order
      .mockImplementationOnce(() => new MockQuery({ 
        data: { 
          id: 'refund-1', 
          status: 'requested', 
          requested_by: 'user-1', 
          refund_number: 'RF-123',
          refund_amount: 100000, 
          order_id: 'order-1',
          order: { id: 'order-1', order_number: 'ORD-1', total_amount: 100000 } 
        }, 
        error: null 
      }))
      // 2. Update refund status
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Get requester email
      .mockImplementationOnce(() => new MockQuery({ 
        data: { email: 'buyer@example.com', name: 'Buyer' }, 
        error: null 
      }));

    const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'refund-1' }, body: { action: 'approve' } };
    const res = createRes();

    await processRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendRefundStatusEmailMock).toHaveBeenCalled();
  });

  test('POST /api/v1/refunds/admin/:id/process rejects refund with reason', async () => {
    fromMock
      // 1. Get refund with order
      .mockImplementationOnce(() => new MockQuery({ 
        data: { 
          id: 'refund-1', 
          status: 'requested', 
          requested_by: 'user-1', 
          refund_number: 'RF-123',
          order_id: 'order-1', 
          refund_amount: 100000, 
          order: { id: 'order-1', order_number: 'ORD-1', total_amount: 100000 } 
        }, 
        error: null 
      }))
      // 2. Update refund status
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Update order refund_status
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 4. Get requester email
      .mockImplementationOnce(() => new MockQuery({ 
        data: { email: 'buyer@example.com', name: 'Buyer' }, 
        error: null 
      }));

    const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'refund-1' }, body: { action: 'reject', status_message: 'Not eligible' } };
    const res = createRes();

    await processRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendRefundStatusEmailMock).toHaveBeenCalled();
  });

  test('POST /api/v1/refunds/admin/:id/process completes refund and revokes access', async () => {
    fromMock
      // 1. Get refund with order
      .mockImplementationOnce(() => new MockQuery({ 
        data: { 
          id: 'refund-1', 
          status: 'approved', 
          requested_by: 'user-1', 
          refund_number: 'RF-123',
          refund_amount: 100000, 
          order_id: 'order-1', 
          order: { id: 'order-1', order_number: 'ORD-1', total_amount: 100000, refunded_amount: 0, buyer_id: 'user-1', website_id: 'website-1' } 
        }, 
        error: null 
      }))
      // 2. Update refund status to completed
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Update order refunded_amount
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 4. Revoke user access
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 5. Get requester email
      .mockImplementationOnce(() => new MockQuery({ 
        data: { email: 'buyer@example.com', name: 'Buyer' }, 
        error: null 
      }));

    const req: any = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'refund-1' }, body: { action: 'complete' } };
    const res = createRes();

    await processRefund(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendRefundStatusEmailMock).toHaveBeenCalled();
  });
});
