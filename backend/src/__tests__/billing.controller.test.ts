import {
  createOrder,
  getMyOrders,
  getOrder,
  getMyInvoices
} from '../controllers/billing.controller';

const fromMock = jest.fn();
const rpcMock = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    rpc: (...args: any[]) => rpcMock(...args),
  },
}));

class MockQuery {
  response: any;
  constructor(response: any) {
    this.response = response;
  }
  select = jest.fn(() => this);
  eq = jest.fn(() => this);
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

const flushPromises = () => new Promise(setImmediate);

describe('Billing Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/billing/orders returns 401 if not authenticated', async () => {
    const req: any = { body: {} };
    const res = createRes();

    createOrder(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('POST /api/v1/billing/orders returns 400 if website_id missing', async () => {
    const req: any = { body: {}, user: { id: 'user-1' } };
    const res = createRes();

    createOrder(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/billing/orders creates order for website', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'website-1', name: 'Site A', creatorId: 'creator-1', status: 'active' }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: null, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'tier-1', price: 100000, name: 'Pro', is_active: true }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'order-1' }, error: null }));

    rpcMock.mockResolvedValue({ data: 'ORD-123' });

    const req: any = { user: { id: 'user-1' }, body: { website_id: 'website-1', pricing_tier_id: 'tier-1' } };
    const res = createRes();

    createOrder(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('GET /api/v1/billing/orders/my returns user orders', async () => {
    fromMock.mockImplementationOnce(() => new MockQuery({ data: [{ id: 'order-1' }], count: 1, error: null }));

    const req: any = { user: { id: 'user-1' }, query: {} };
    const res = createRes();

    getMyOrders(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.data.orders.length).toBe(1);
  });

  test('GET /api/v1/billing/orders/:id returns order detail with transactions', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'order-1', buyer_id: 'user-1', creator_id: 'creator-1' }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'tx-1' }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'inv-1' }, error: null }));

    const req: any = { user: { id: 'user-1' }, params: { orderId: 'order-1' } };
    const res = createRes();

    getOrder(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('GET /api/v1/billing/invoices/my returns user invoices', async () => {
    fromMock.mockImplementationOnce(() => new MockQuery({ data: [{ id: 'inv-1' }], count: 1, error: null }));

    const req: any = { user: { id: 'user-1' }, query: {} };
    const res = createRes();

    getMyInvoices(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
