// Define mock functions at top level BEFORE jest.mock
const mockSendMail = jest.fn();
const mockVerify = jest.fn();

// Mock nodemailer - this must happen before module import
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
}));

// Import after mock setup
import * as emailService from '../services/email.service';

describe('Email Service', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset env vars for each test
    process.env = { ...originalEnv };
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'smtp-user';
    process.env.SMTP_PASS = 'smtp-pass';
    process.env.EMAIL_FROM = 'noreply@findinggems.id';
    process.env.EMAIL_FROM_NAME = 'Finding Gems';
    process.env.APP_BASE_URL = 'http://localhost:3000';
    
    // Default mock behavior - success
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('sendEmail sends email with correct subject', async () => {
    const result = await emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>'
    });

    expect(result).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Test Subject'
      })
    );
  });

  test('sendEmail returns false if SMTP not configured', async () => {
    // Clear SMTP credentials
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';

    const result = await emailService.sendEmail({
      to: 'user@example.com',
      subject: 'No SMTP',
      html: '<p>Test</p>'
    });

    expect(result).toBe(false);
    // sendMail should not be called when SMTP not configured
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  test('sendPaymentSuccessEmail includes order number and amount', async () => {
    await emailService.sendPaymentSuccessEmail('buyer@example.com', {
      userName: 'Buyer',
      orderNumber: 'ORD-123',
      websiteName: 'Site A',
      amount: 150000,
      invoiceUrl: 'http://localhost:3000/invoice/ORD-123'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('ORD-123');
    expect(mailArgs.html).toContain('ORD-123');
    expect(mailArgs.html).toContain('150.000');
  });

  test('sendPaymentFailedEmail handles optional reason', async () => {
    await emailService.sendPaymentFailedEmail('buyer@example.com', {
      userName: 'Buyer',
      orderNumber: 'ORD-FAILED',
      websiteName: 'Site B',
      amount: 250000,
      retryUrl: 'http://localhost:3000/retry'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('ORD-FAILED');
    // When no reason provided, should not contain "Alasan:"
    expect(mailArgs.html).not.toContain('Alasan:');
  });

  test('sendInvoiceEmail includes invoice number and link', async () => {
    await emailService.sendInvoiceEmail('buyer@example.com', {
      userName: 'Buyer',
      invoiceNumber: 'INV-001',
      orderNumber: 'ORD-001',
      websiteName: 'Site C',
      amount: 100000,
      issueDate: '2024-01-01',
      invoiceUrl: 'http://localhost:3000/invoice/INV-001'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('INV-001');
    expect(mailArgs.html).toContain('INV-001');
    expect(mailArgs.html).toContain('Download Invoice');
  });

  test('sendNewSaleEmail includes creator earnings', async () => {
    await emailService.sendNewSaleEmail('creator@example.com', {
      creatorName: 'Creator',
      buyerName: 'Buyer',
      websiteName: 'Site D',
      tierName: 'Pro',
      amount: 200000,
      platformFee: 1000,
      creatorEarning: 199000,
      orderNumber: 'ORD-NEW-SALE'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('Site D');
    expect(mailArgs.html).toContain('199.000');
  });

  test('sendPayoutRequestedEmail includes payout number', async () => {
    await emailService.sendPayoutRequestedEmail('creator@example.com', {
      creatorName: 'Creator',
      payoutNumber: 'PO-123',
      amount: 50000,
      bankName: 'BCA',
      accountNumber: '****1234'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('PO-123');
    expect(mailArgs.html).toContain('PO-123');
  });

  test('sendPayoutProcessedEmail handles rejection reason', async () => {
    await emailService.sendPayoutProcessedEmail('creator@example.com', {
      creatorName: 'Creator',
      payoutNumber: 'PO-REJ',
      amount: 75000,
      status: 'rejected',
      rejectionReason: 'Invalid bank details'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('Ditolak');
    expect(mailArgs.html).toContain('Invalid bank details');
  });

  test('sendRefundStatusEmail includes status and order number', async () => {
    await emailService.sendRefundStatusEmail('buyer@example.com', {
      userName: 'Buyer',
      refundNumber: 'RF-123',
      orderNumber: 'ORD-123',
      amount: 100000,
      status: 'approved'
    });

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('RF-123');
    expect(mailArgs.html).toContain('ORD-123');
  });

  test('sendWelcomeEmail includes user name', async () => {
    await emailService.sendWelcomeEmail('newuser@example.com', 'New User');

    expect(mockSendMail).toHaveBeenCalled();
    const mailArgs = mockSendMail.mock.calls[0][0];
    expect(mailArgs.subject).toContain('Selamat Datang');
    expect(mailArgs.html).toContain('New User');
  });
});
