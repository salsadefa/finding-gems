import {
  getCreatorBalance,
  addBankAccount,
  requestPayout,
  processPayout
} from '../controllers/payout.controller';

const fromMock = jest.fn();
const rpcMock = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
    rpc: (...args: any[]) => rpcMock(...args),
  },
}));

const sendPayoutRequestedEmailMock = jest.fn().mockResolvedValue(true);
const sendPayoutProcessedEmailMock = jest.fn().mockResolvedValue(true);

jest.mock('../services/email.service', () => ({
  sendPayoutRequestedEmail: (...args: any[]) => sendPayoutRequestedEmailMock(...args),
  sendPayoutProcessedEmail: (...args: any[]) => sendPayoutProcessedEmailMock(...args),
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

describe('Payout Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/v1/payouts/balance returns 401 if not authenticated', async () => {
    const req: any = {};
    const res = createRes();

    await getCreatorBalance(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('GET /api/v1/payouts/balance returns balance for creator', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: { available_balance: 100000 }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: [{ amount: 10000 }], error: null }));

    const req: any = { user: { id: 'creator-1' } };
    const res = createRes();

    await getCreatorBalance(req, res, jest.fn());
    await waitForAsync();

    const response = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(response.data.balance.withdrawable).toBe(90000);
  });

  test('POST /api/v1/payouts/bank-accounts adds bank account', async () => {
    fromMock.mockImplementationOnce(() => new MockQuery({ data: { id: 'bank-1' }, error: null }));

    const req: any = {
      user: { id: 'creator-1' },
      body: { bank_name: 'BCA', account_number: '123', account_name: 'Creator' }
    };
    const res = createRes();

    await addBankAccount(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('POST /api/v1/payouts rejects if insufficient balance', async () => {
    fromMock
      .mockImplementationOnce(() => new MockQuery({ data: { available_balance: 10000 }, error: null }))
      .mockImplementationOnce(() => new MockQuery({ data: [], error: null }));

    const req: any = { user: { id: 'creator-1', role: 'creator' }, body: { amount: 50000 } };
    const res = createRes();

    await requestPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/payouts returns 403 if not creator', async () => {
    const req: any = { user: { id: 'user-1', role: 'buyer' }, body: { amount: 60000 } };
    const res = createRes();

    await requestPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('POST /api/v1/payouts rejects if no bank account', async () => {
    fromMock
      // 1. Get creator balance
      .mockImplementationOnce(() => new MockQuery({ data: { available_balance: 200000 }, error: null }))
      // 2. Get pending payouts
      .mockImplementationOnce(() => new MockQuery({ data: [], error: null }))
      // 3. Get primary bank account - returns null
      .mockImplementationOnce(() => new MockQuery({ data: null, error: null }));

    const req: any = { user: { id: 'creator-1', role: 'creator' }, body: { amount: 60000 } };
    const res = createRes();

    await requestPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('POST /api/v1/payouts creates payout and sends email', async () => {
    fromMock
      // 1. Get creator balance
      .mockImplementationOnce(() => new MockQuery({ data: { available_balance: 200000 }, error: null }))
      // 2. Get pending payouts
      .mockImplementationOnce(() => new MockQuery({ data: [], error: null }))
      // 3. Get primary bank account
      .mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'bank-1', bank_name: 'BCA', account_number: '1234567890', account_name: 'Creator' }, 
        error: null 
      }))
      // 4. Insert payout
      .mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'payout-1', payout_number: 'PO-123', amount: 60000, net_amount: 57500 }, 
        error: null 
      }));

    // Mock generate_payout_number RPC
    rpcMock.mockResolvedValue({ data: 'PO-123' });

    const req: any = {
      user: { id: 'creator-1', role: 'creator', email: 'creator@example.com', name: 'Creator' },
      body: { amount: 60000 }
    };
    const res = createRes();

    await requestPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(sendPayoutRequestedEmailMock).toHaveBeenCalled();
  });

  test('POST /api/v1/payouts/admin/:id/process rejects when not admin', async () => {
    const req: any = { user: { id: 'user-1', role: 'buyer' }, params: { id: 'payout-1' }, body: { action: 'approve' } };
    const res = createRes();

    await processPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('POST /api/v1/payouts/admin/:id/process approves payout and sends email', async () => {
    fromMock
      // 1. Get payout
      .mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'payout-1', status: 'pending', creator_id: 'creator-1', payout_number: 'PO-123', net_amount: 50000, amount: 60000 }, 
        error: null 
      }))
      // 2. Update payout status
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Get creator balance (for approve path)
      .mockImplementationOnce(() => new MockQuery({ 
        data: { withdrawn_balance: 0, available_balance: 200000 }, 
        error: null 
      }))
      // 4. Update creator balance
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 5. Get creator email
      .mockImplementationOnce(() => new MockQuery({ 
        data: { email: 'creator@example.com', name: 'Creator' }, 
        error: null 
      }));

    const req: any = {
      user: { id: 'admin-1', role: 'admin' },
      params: { id: 'payout-1' },
      body: { action: 'approve', transfer_reference: 'TRX-1' }
    };
    const res = createRes();

    await processPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendPayoutProcessedEmailMock).toHaveBeenCalled();
  });

  test('POST /api/v1/payouts/admin/:id/process rejects payout with reason', async () => {
    fromMock
      // 1. Get payout
      .mockImplementationOnce(() => new MockQuery({ 
        data: { id: 'payout-1', status: 'pending', creator_id: 'creator-1', payout_number: 'PO-123', net_amount: 50000, amount: 60000 }, 
        error: null 
      }))
      // 2. Update payout status
      .mockImplementationOnce(() => new MockQuery({ error: null }))
      // 3. Get creator email (reject path skips balance update)
      .mockImplementationOnce(() => new MockQuery({ 
        data: { email: 'creator@example.com', name: 'Creator' }, 
        error: null 
      }));

    const req: any = {
      user: { id: 'admin-1', role: 'admin' },
      params: { id: 'payout-1' },
      body: { action: 'reject', status_message: 'Invalid account' }
    };
    const res = createRes();

    await processPayout(req, res, jest.fn());
    await waitForAsync();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendPayoutProcessedEmailMock).toHaveBeenCalled();
  });
});
