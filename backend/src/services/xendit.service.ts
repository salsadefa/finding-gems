// ================================================
// Xendit Payment Gateway Service
// Finding Gems - Payment Integration
// ================================================

import Xendit from 'xendit-node';
import type { CreateInvoiceRequest, Invoice as XenditInvoice } from 'xendit-node/invoice/models';
import type { 
  PaymentRequestParameters,
  VirtualAccountChannelCode,
} from 'xendit-node/payment_request/models';

// ============================================
// Types - Invoice (existing)
// ============================================
export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface XenditPaymentResponse {
  invoiceId: string;
  invoiceUrl: string;
  externalId: string;
  status: string;
  amount: number;
  expiryDate: string;
}

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  user_id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  merchant_name: string;
  amount: number;
  paid_amount?: number;
  payer_email?: string;
  description?: string;
  paid_at?: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
  currency: string;
  created: string;
  updated: string;
}

// ============================================
// Types - Payment Request API (Custom Display)
// ============================================

/**
 * Supported Virtual Account bank codes
 */
export type VABankCode = 'BCA' | 'BNI' | 'BRI' | 'MANDIRI' | 'PERMATA' | 'BSI' | 'BJB' | 'SAHABAT_SAMPOERNA' | 'CIMB';

/**
 * Common params for direct payment requests (QRIS/VA)
 */
export interface DirectPaymentParams {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail?: string;
  description?: string;
  expiresAt?: Date;
}

/**
 * QRIS-specific params
 */
export interface QRISPaymentParams extends DirectPaymentParams {
  // QRIS doesn't need additional params
}

/**
 * Virtual Account-specific params  
 */
export interface VAPaymentParams extends DirectPaymentParams {
  bankCode: VABankCode;
}

/**
 * QRIS payment response with QR string for custom display
 */
export interface QRISPaymentResponse {
  paymentRequestId: string;
  referenceId: string;
  status: string;
  amount: number;
  currency: string;
  qrString: string;  // Main data: QR code string to display in custom UI
  expiresAt: string;
  created: string;
}

/**
 * Virtual Account payment response for custom display
 */
export interface VAPaymentResponse {
  paymentRequestId: string;
  referenceId: string;
  status: string;
  amount: number;
  currency: string;
  bankCode: string;
  bankName: string;            // Human-readable bank name
  virtualAccountNumber: string; // Main data: VA number to display in custom UI
  customerName: string;
  expiresAt: string;
  created: string;
}

// Configuration
const XENDIT_API_KEY = process.env.XENDIT_API_KEY || '';
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || '';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// Invoice duration in seconds (24 hours)
const DEFAULT_INVOICE_DURATION = 24 * 60 * 60;

// Default payment expiry (15 minutes for QRIS, 24 hours for VA)
const DEFAULT_QRIS_EXPIRY_MINUTES = 15;
const DEFAULT_VA_EXPIRY_HOURS = 24;

// Bank name mapping for display
const BANK_NAMES: Record<VABankCode, string> = {
  BCA: 'Bank Central Asia (BCA)',
  BNI: 'Bank Negara Indonesia (BNI)',
  BRI: 'Bank Rakyat Indonesia (BRI)',
  MANDIRI: 'Bank Mandiri',
  PERMATA: 'Bank Permata',
  BSI: 'Bank Syariah Indonesia (BSI)',
  BJB: 'Bank BJB',
  SAHABAT_SAMPOERNA: 'Bank Sahabat Sampoerna',
  CIMB: 'CIMB Niaga',
};

/**
 * XenditService - Handles all Xendit payment operations
 */
class XenditService {
  private client: Xendit | null = null;
  private initialized = false;

  /**
   * Initialize Xendit client
   */
  private initialize(): void {
    if (this.initialized) return;

    if (!XENDIT_API_KEY) {
      console.warn('[Xendit] API key not configured. Payment features will be disabled.');
      return;
    }

    try {
      this.client = new Xendit({
        secretKey: XENDIT_API_KEY,
      });
      this.initialized = true;
      console.log('[Xendit] Client initialized successfully');
    } catch (error) {
      console.error('[Xendit] Failed to initialize client:', error);
    }
  }

  /**
   * Check if Xendit is configured and available
   */
  isAvailable(): boolean {
    this.initialize();
    return this.client !== null;
  }

  /**
   * Create a payment invoice
   */
  async createInvoice(params: CreatePaymentParams): Promise<XenditPaymentResponse> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured. Please set XENDIT_SECRET_KEY.');
    }

    const {
      orderId,
      orderNumber,
      amount,
      currency,
      customerEmail,
      customerName,
      description,
      items,
      successRedirectUrl,
      failureRedirectUrl,
    } = params;

    try {
      const invoiceData: CreateInvoiceRequest = {
        externalId: orderId, // Use our order ID as external reference
        amount,
        currency: currency.toUpperCase(),
        payerEmail: customerEmail,
        description: description || `Payment for Order ${orderNumber}`,
        invoiceDuration: DEFAULT_INVOICE_DURATION,
        successRedirectUrl: successRedirectUrl || `${APP_BASE_URL}/checkout/success?order=${orderId}`,
        failureRedirectUrl: failureRedirectUrl || `${APP_BASE_URL}/checkout/failed?order=${orderId}`,
        customer: {
          givenNames: customerName,
          email: customerEmail,
        },
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        // Enable all available payment methods for Indonesia
        paymentMethods: [
          'BCA',
          'BNI',
          'BSI', 
          'BRI',
          'MANDIRI',
          'PERMATA',
          'SAHABAT_SAMPOERNA',
          'BNC',
          'OVO',
          'DANA',
          'SHOPEEPAY',
          'LINKAJA',
          'QRIS',
          'CREDIT_CARD',
          'ALFAMART',
          'INDOMARET',
        ],
      };

      const response = await this.client.Invoice.createInvoice({ data: invoiceData });

      // Validate response
      if (!response || !response.id) {
        throw new Error('Invalid response from Xendit API');
      }

      return {
        invoiceId: response.id,
        invoiceUrl: response.invoiceUrl || '',
        externalId: response.externalId,
        status: response.status || 'PENDING',
        amount: Number(response.amount),
        expiryDate: response.expiryDate?.toISOString() || new Date(Date.now() + DEFAULT_INVOICE_DURATION * 1000).toISOString(),
      };
    } catch (error: any) {
      console.error('[Xendit] Failed to create invoice:', error);
      throw new Error(`Failed to create payment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId: string): Promise<{ status: string; paidAt?: string; paymentMethod?: string }> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured');
    }

    try {
      const invoice = await this.client.Invoice.getInvoiceById({ invoiceId });
      
      return {
        status: invoice.status!,
        paidAt: (invoice as any).paidAt?.toISOString() || (invoice as any).paid_at,
        paymentMethod: (invoice as any).paymentMethod || (invoice as any).payment_method,
      };
    } catch (error: any) {
      console.error('[Xendit] Failed to get invoice status:', error);
      throw new Error(`Failed to get payment status: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Expire an invoice (cancel payment)
   */
  async expireInvoice(invoiceId: string): Promise<void> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured');
    }

    try {
      await this.client.Invoice.expireInvoice({ invoiceId });
    } catch (error: any) {
      console.error('[Xendit] Failed to expire invoice:', error);
      throw new Error(`Failed to cancel payment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify webhook callback token
   */
  verifyWebhookToken(token: string): boolean {
    if (!XENDIT_WEBHOOK_TOKEN) {
      console.warn('[Xendit] Webhook token not configured. Skipping verification.');
      return true; // Allow in development
    }
    return token === XENDIT_WEBHOOK_TOKEN;
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(body: any): XenditWebhookPayload {
    return {
      id: body.id,
      external_id: body.external_id,
      user_id: body.user_id,
      status: body.status,
      merchant_name: body.merchant_name,
      amount: Number(body.amount),
      paid_amount: body.paid_amount ? Number(body.paid_amount) : undefined,
      payer_email: body.payer_email,
      description: body.description,
      paid_at: body.paid_at,
      payment_method: body.payment_method,
      payment_channel: body.payment_channel,
      payment_destination: body.payment_destination,
      currency: body.currency,
      created: body.created,
      updated: body.updated,
    };
  }

  /**
   * Map Xendit status to our transaction status
   */
  mapStatus(xenditStatus: string): 'pending' | 'completed' | 'failed' | 'expired' {
    switch (xenditStatus.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
      case 'SUCCEEDED':
        return 'completed';
      case 'EXPIRED':
        return 'expired';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
      case 'REQUIRES_ACTION':
      default:
        return 'pending';
    }
  }

  // ============================================
  // Payment Request API - Custom Display Methods
  // ============================================

  /**
   * Create QRIS payment with QR string for custom UI display
   * Instead of redirecting to Xendit checkout, returns QR code data
   * that can be displayed directly in our application
   */
  async createQRISPayment(params: QRISPaymentParams): Promise<QRISPaymentResponse> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured. Please set XENDIT_API_KEY.');
    }

    const {
      orderId,
      amount,
      currency = 'IDR',
      customerName,
      description,
      expiresAt,
    } = params;

    // Calculate expiry (default 15 minutes for QRIS)
    const expiryDate = expiresAt || new Date(Date.now() + DEFAULT_QRIS_EXPIRY_MINUTES * 60 * 1000);

    try {
      const paymentRequestData: PaymentRequestParameters = {
        amount,
        currency: currency.toUpperCase() as any,
        referenceId: orderId,
        description: description || `QRIS Payment for Order ${orderId}`,
        paymentMethod: {
          type: 'QR_CODE',
          reusability: 'ONE_TIME_USE',
          qrCode: {
            channelCode: 'QRIS',
          },
        },
        metadata: {
          orderId,
          customerName,
        },
      };

      const response = await this.client.PaymentRequest.createPaymentRequest({
        data: paymentRequestData,
      });

      // Extract QR string from response
      const qrString = response.paymentMethod?.qrCode?.channelProperties?.qrString;
      
      if (!qrString) {
        console.error('[Xendit] QRIS response missing qrString:', JSON.stringify(response, null, 2));
        throw new Error('QRIS payment created but QR string not available in response');
      }

      console.log('[Xendit] QRIS payment created:', response.id);

      return {
        paymentRequestId: response.id,
        referenceId: response.referenceId,
        status: response.status,
        amount: response.amount || amount,
        currency: response.currency,
        qrString,
        expiresAt: expiryDate.toISOString(),
        created: response.created,
      };
    } catch (error: any) {
      console.error('[Xendit] Failed to create QRIS payment:', error);
      throw new Error(`Failed to create QRIS payment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create Virtual Account payment with VA number for custom UI display
   * Instead of redirecting to Xendit checkout, returns VA details
   * that can be displayed directly in our application
   */
  async createVAPayment(params: VAPaymentParams): Promise<VAPaymentResponse> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured. Please set XENDIT_API_KEY.');
    }

    const {
      orderId,
      amount,
      currency = 'IDR',
      customerName,
      bankCode,
      description,
      expiresAt,
    } = params;

    // Calculate expiry (default 24 hours for VA)
    const expiryDate = expiresAt || new Date(Date.now() + DEFAULT_VA_EXPIRY_HOURS * 60 * 60 * 1000);

    try {
      const paymentRequestData: PaymentRequestParameters = {
        amount,
        currency: currency.toUpperCase() as any,
        referenceId: orderId,
        description: description || `Virtual Account Payment for Order ${orderId}`,
        paymentMethod: {
          type: 'VIRTUAL_ACCOUNT',
          reusability: 'ONE_TIME_USE',
          virtualAccount: {
            channelCode: bankCode as VirtualAccountChannelCode,
            channelProperties: {
              customerName,
              expiresAt: expiryDate,
              suggestedAmount: amount,
            },
          },
        },
        metadata: {
          orderId,
          customerName,
          bankCode,
        },
      };

      const response = await this.client.PaymentRequest.createPaymentRequest({
        data: paymentRequestData,
      });

      // Extract VA number from response
      const virtualAccount = response.paymentMethod?.virtualAccount;
      const vaNumber = virtualAccount?.channelProperties?.virtualAccountNumber;
      
      if (!vaNumber) {
        console.error('[Xendit] VA response missing virtualAccountNumber:', JSON.stringify(response, null, 2));
        throw new Error('Virtual Account payment created but VA number not available in response');
      }

      console.log('[Xendit] VA payment created:', response.id, 'VA:', vaNumber);

      return {
        paymentRequestId: response.id,
        referenceId: response.referenceId,
        status: response.status,
        amount: response.amount || amount,
        currency: response.currency,
        bankCode,
        bankName: BANK_NAMES[bankCode] || bankCode,
        virtualAccountNumber: vaNumber,
        customerName,
        expiresAt: expiryDate.toISOString(),
        created: response.created,
      };
    } catch (error: any) {
      console.error('[Xendit] Failed to create VA payment:', error);
      throw new Error(`Failed to create Virtual Account payment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get payment request status (for QRIS/VA payments)
   */
  async getPaymentRequestStatus(paymentRequestId: string): Promise<{
    status: string;
    paymentMethod?: string;
    paidAt?: string;
  }> {
    this.initialize();

    if (!this.client) {
      throw new Error('Xendit is not configured');
    }

    try {
      const response = await this.client.PaymentRequest.getPaymentRequestByID({
        paymentRequestId,
      });

      return {
        status: response.status,
        paymentMethod: response.paymentMethod?.type,
        // paidAt would be in metadata or from webhook
      };
    } catch (error: any) {
      console.error('[Xendit] Failed to get payment request status:', error);
      throw new Error(`Failed to get payment status: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get available VA bank codes
   */
  getAvailableVABanks(): Array<{ code: VABankCode; name: string }> {
    return Object.entries(BANK_NAMES).map(([code, name]) => ({
      code: code as VABankCode,
      name,
    }));
  }
}

// Export singleton instance
export const xenditService = new XenditService();

// Export types
export type { XenditInvoice };
