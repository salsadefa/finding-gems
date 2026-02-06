"use strict";
// ================================================
// Xendit Payment Gateway Service
// Finding Gems - Payment Integration
// ================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xenditService = void 0;
const xendit_node_1 = __importDefault(require("xendit-node"));
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
    constructor() {
        this.client = null;
        this.initialized = false;
    }
    /**
     * Initialize Xendit client
     */
    initialize() {
        if (this.initialized)
            return;
        if (!XENDIT_API_KEY) {
            console.warn('[Xendit] API key not configured. Payment features will be disabled.');
            return;
        }
        try {
            this.client = new xendit_node_1.default({
                secretKey: XENDIT_API_KEY,
            });
            this.initialized = true;
            console.log('[Xendit] Client initialized successfully');
        }
        catch (error) {
            console.error('[Xendit] Failed to initialize client:', error);
        }
    }
    /**
     * Check if Xendit is configured and available
     */
    isAvailable() {
        this.initialize();
        return this.client !== null;
    }
    /**
     * Create a payment invoice
     */
    async createInvoice(params) {
        this.initialize();
        if (!this.client) {
            throw new Error('Xendit is not configured. Please set XENDIT_SECRET_KEY.');
        }
        const { orderId, orderNumber, amount, currency, customerEmail, customerName, description, items, successRedirectUrl, failureRedirectUrl, } = params;
        try {
            const invoiceData = {
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
        }
        catch (error) {
            console.error('[Xendit] Failed to create invoice:', error);
            throw new Error(`Failed to create payment: ${error.message || 'Unknown error'}`);
        }
    }
    /**
     * Get invoice status
     */
    async getInvoiceStatus(invoiceId) {
        this.initialize();
        if (!this.client) {
            throw new Error('Xendit is not configured');
        }
        try {
            const invoice = await this.client.Invoice.getInvoiceById({ invoiceId });
            return {
                status: invoice.status,
                paidAt: invoice.paidAt?.toISOString() || invoice.paid_at,
                paymentMethod: invoice.paymentMethod || invoice.payment_method,
            };
        }
        catch (error) {
            console.error('[Xendit] Failed to get invoice status:', error);
            throw new Error(`Failed to get payment status: ${error.message || 'Unknown error'}`);
        }
    }
    /**
     * Expire an invoice (cancel payment)
     */
    async expireInvoice(invoiceId) {
        this.initialize();
        if (!this.client) {
            throw new Error('Xendit is not configured');
        }
        try {
            await this.client.Invoice.expireInvoice({ invoiceId });
        }
        catch (error) {
            console.error('[Xendit] Failed to expire invoice:', error);
            throw new Error(`Failed to cancel payment: ${error.message || 'Unknown error'}`);
        }
    }
    /**
     * Verify webhook callback token
     */
    verifyWebhookToken(token) {
        if (!XENDIT_WEBHOOK_TOKEN) {
            console.warn('[Xendit] Webhook token not configured. Skipping verification.');
            return true; // Allow in development
        }
        return token === XENDIT_WEBHOOK_TOKEN;
    }
    /**
     * Parse webhook payload
     */
    parseWebhookPayload(body) {
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
    mapStatus(xenditStatus) {
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
exports.xenditService = new XenditService();
//# sourceMappingURL=xendit.service.js.map