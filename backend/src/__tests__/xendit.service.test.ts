// Mock xendit-node at the top level
const mockCreateInvoice = jest.fn();
const mockGetInvoiceById = jest.fn();
const mockExpireInvoice = jest.fn();

jest.mock('xendit-node', () => {
  return jest.fn().mockImplementation(() => ({
    Invoice: {
      createInvoice: mockCreateInvoice,
      getInvoiceById: mockGetInvoiceById,
      expireInvoice: mockExpireInvoice,
    },
  }));
});

describe('Xendit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.XENDIT_API_KEY = '';
    process.env.XENDIT_WEBHOOK_TOKEN = '';
    process.env.APP_BASE_URL = 'http://localhost:3000';
  });

  test('isAvailable returns false when API key not configured', async () => {
    process.env.XENDIT_API_KEY = '';

    // Fresh import to get new singleton
    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    expect(xenditService.isAvailable()).toBe(false);
  });

  test('isAvailable returns true when API key is configured', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';

    // Fresh import to get new singleton
    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    expect(xenditService.isAvailable()).toBe(true);
  });

  test('createInvoice creates invoice with correct params', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';

    // Configure mock response
    mockCreateInvoice.mockResolvedValue({
      id: 'inv-123',
      invoiceUrl: 'https://xendit.co/inv-123',
      externalId: 'order-1',
      status: 'PENDING',
      amount: 200000,
      expiryDate: new Date('2024-01-01T00:00:00.000Z'),
    });

    // Fresh import to get new singleton with API key set
    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    const response = await xenditService.createInvoice({
      orderId: 'order-1',
      orderNumber: 'ORD-1',
      amount: 200000,
      currency: 'idr',
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer',
      description: 'Order payment',
      items: [{ name: 'Item A', quantity: 1, price: 200000 }],
    });

    expect(response.invoiceId).toBe('inv-123');
    expect(response.invoiceUrl).toBe('https://xendit.co/inv-123');
    expect(response.amount).toBe(200000);
    expect(mockCreateInvoice).toHaveBeenCalled();
  });

  test('createInvoice throws error for invalid response', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';

    // Mock returns invalid response (no id)
    mockCreateInvoice.mockResolvedValue({});

    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    await expect(
      xenditService.createInvoice({
        orderId: 'order-1',
        orderNumber: 'ORD-1',
        amount: 200000,
        currency: 'idr',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer',
        description: 'Order payment',
        items: [{ name: 'Item A', quantity: 1, price: 200000 }],
      })
    ).rejects.toThrow('Failed to create payment');
  });

  test('verifyWebhookToken returns false for invalid token', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';
    process.env.XENDIT_WEBHOOK_TOKEN = 'secret-token';

    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    expect(xenditService.verifyWebhookToken('invalid')).toBe(false);
    expect(xenditService.verifyWebhookToken('secret-token')).toBe(true);
  });

  test('verifyWebhookToken returns true when no token configured (development)', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';
    process.env.XENDIT_WEBHOOK_TOKEN = '';

    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    expect(xenditService.verifyWebhookToken('any-token')).toBe(true);
  });

  test('parseWebhookPayload maps numeric fields', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';

    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    const payload = xenditService.parseWebhookPayload({
      id: 'id1',
      external_id: 'order-1',
      user_id: 'user-1',
      status: 'PAID',
      merchant_name: 'FG',
      amount: '10000',
      paid_amount: '9000',
      currency: 'IDR',
      created: 'now',
      updated: 'now',
    });

    expect(payload.amount).toBe(10000);
    expect(payload.paid_amount).toBe(9000);
    expect(payload.status).toBe('PAID');
    expect(payload.external_id).toBe('order-1');
  });

  test('mapStatus maps Xendit statuses to internal', async () => {
    process.env.XENDIT_API_KEY = 'xnd_test_123';

    jest.resetModules();
    const { xenditService } = await import('../services/xendit.service');

    expect(xenditService.mapStatus('PAID')).toBe('completed');
    expect(xenditService.mapStatus('SETTLED')).toBe('completed');
    expect(xenditService.mapStatus('FAILED')).toBe('failed');
    expect(xenditService.mapStatus('EXPIRED')).toBe('expired');
    expect(xenditService.mapStatus('PENDING')).toBe('pending');
    expect(xenditService.mapStatus('UNKNOWN')).toBe('pending');
  });
});
