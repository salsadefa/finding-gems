import { initiatePayment, handleXenditWebhook } from '../controllers/payment.controller';

const fromMock = jest.fn();
const rpcMock = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    rpc: (...args: any[]) => rpcMock(...args),
  },
}));

const isAvailableMock = jest.fn();
const createInvoiceMock = jest.fn();
const getInvoiceStatusMock = jest.fn();
const mapStatusMock = jest.fn();
const verifyWebhookTokenMock = jest.fn();
const parseWebhookPayloadMock = jest.fn();

jest.mock('../services/xendit.service', () => ({
  xenditService: {
    isAvailable: (...args: any[]) => isAvailableMock(...args),
    createInvoice: (...args: any[]) => createInvoiceMock(...args),
    getInvoiceStatus: (...args: any[]) => getInvoiceStatusMock(...args),
    mapStatus: (...args: any[]) => mapStatusMock(...args),
    verifyWebhookToken: (...args: any[]) => verifyWebhookTokenMock(...args),
    parseWebhookPayload: (...args: any[]) => parseWebhookPayloadMock(...args),
  }
}));

const sendPaymentSuccessEmailMock = jest.fn().mockResolvedValue(true);
const sendNewSaleEmailMock = jest.fn().mockResolvedValue(true);
const sendInvoiceEmailMock = jest.fn().mockResolvedValue(true);

jest.mock('../services/email.service', () => ({
  sendPaymentSuccessEmail: (...args: any[]) => sendPaymentSuccessEmailMock(...args),
  sendNewSaleEmail: (...args: any[]) => sendNewSaleEmailMock(...args),
  sendInvoiceEmail: (...args: any[]) => sendInvoiceEmailMock(...args),
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

// Helper function to wait for all async operations
const waitForAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setTimeout(resolve, 50));
};

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/payments/initiate returns 401 if not authenticated', async () => {
    const req: any = { body: {} };
    const res = createRes();

    await initiatePayment(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('POST /api/v1/payments/initiate returns 400 if order_id missing', async () => {
    const req: any = { body: {}, user: { id: 'user-1' } };
    const res = createRes();

    await initiatePayment(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/payments/initiate creates payment and returns checkout URL', async () => {
    const order = {
      id: 'order-1',
      buyer_id: 'user-1',
      status: 'pending',
      order_number: 'ORD-1',
      item_name: 'Item A',
      total_amount: 100000,
      currency: 'IDR',
      buyer: { email: 'buyer@example.com', name: 'Buyer' },
    };

    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: order, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'tx-1' }, error: null }));

    isAvailableMock.mockReturnValue(true);
    createInvoiceMock.mockResolvedValue({
      invoiceId: 'inv-1',
      invoiceUrl: 'https://checkout',
      externalId: 'order-1',
      status: 'PENDING',
      amount: 100000,
      expiryDate: new Date().toISOString(),
    });

    const req: any = { body: { order_id: 'order-1' }, user: { id: 'user-1', email: 'buyer@example.com', name: 'Buyer' } };
    const res = createRes();

    await initiatePayment(req, res, jest.fn());
    await waitForAsync();

    const response = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(response.data.payment_instructions.checkout_url).toBe('https://checkout');
  });

  test('POST /api/v1/payments/webhook/xendit updates order and grants access', async () => {
    verifyWebhookTokenMock.mockReturnValue(true);
    parseWebhookPayloadMock.mockReturnValue({
      id: 'xendit-1',
      external_id: 'order-1',
      status: 'PAID',
      paid_at: new Date().toISOString(),
      payment_method: 'CREDIT_CARD'
    });
    mapStatusMock.mockReturnValue('completed');

    // Mock chain for webhook handler + grantAccessAndCreateInvoice:
    // 1. Find transaction (handleXenditWebhook)
    // 2. Update transaction (handleXenditWebhook)
    // 3. Update order (handleXenditWebhook)
    // 4. Get order with details (grantAccessAndCreateInvoice)
    // 5. Upsert user_access (grantAccessAndCreateInvoice)
    // 6. Insert invoice (grantAccessAndCreateInvoice)
    fromMock
      // 1. Find transaction
      .mockImplementationOnce(() => new MockQuery({ data: { id: 'tx-1', order_id: 'order-1', status: 'pending', orders: { status: 'pending' } }, error: null }))
      // 2. Update transaction
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Update order 
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 4. Get order with details for grantAccessAndCreateInvoice
      .mockImplementationOnce(() => new MockQuery({ data: {
        id: 'order-1',
        buyer_id: 'user-1',
        creator_id: 'creator-1',
        website_id: 'website-1',
        pricing_tier_id: 'tier-1',
        order_number: 'ORD-1',
        item_name: 'Item A',
        item_price: 100000,
        platform_fee: 1000,
        total_amount: 101000,
        currency: 'IDR',
        buyer: { id: 'user-1', name: 'Buyer', email: 'buyer@example.com' },
        creator: { id: 'creator-1', name: 'Creator', email: 'creator@example.com' },
        pricing_tiers: { duration_days: 30 },
        tier_name: 'Pro'
      }, error: null }))
      // 5. Upsert user_access
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 6. Insert invoice
      .mockImplementationOnce(() => new MockQuery({ data: { invoice_number: 'INV-1' }, error: null }));

    rpcMock.mockResolvedValue({ data: 'INV-1' });

    const req: any = { headers: { 'x-callback-token': 'token' }, body: {} };
    const res = createRes();

    await handleXenditWebhook(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendPaymentSuccessEmailMock).toHaveBeenCalled();
    expect(sendNewSaleEmailMock).toHaveBeenCalled();
  });
});
