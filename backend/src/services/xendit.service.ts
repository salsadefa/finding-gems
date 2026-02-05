// ================================================
// Xendit Payment Gateway Service
// Finding Gems - Payment Integration
// ================================================

import Xendit from 'xendit-node';
import type { CreateInvoiceRequest, Invoice as XenditInvoice } from 'xendit-node/invoice/models';

// Types
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

// Configuration
const XENDIT_API_KEY = process.env.XENDIT_API_KEY || '';
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || '';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// Invoice duration in seconds (24 hours)
const DEFAULT_INVOICE_DURATION = 24 * 60 * 60;

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
        return 'completed';
      case 'EXPIRED':
        return 'expired';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
      default:
        return 'pending';
    }
  }
}

// Export singleton instance
export const xenditService = new XenditService();

// Export types
export type { XenditInvoice };
