import type { Invoice as XenditInvoice } from 'xendit-node/invoice/models';
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
/**
 * XenditService - Handles all Xendit payment operations
 */
declare class XenditService {
    private client;
    private initialized;
    /**
     * Initialize Xendit client
     */
    private initialize;
    /**
     * Check if Xendit is configured and available
     */
    isAvailable(): boolean;
    /**
     * Create a payment invoice
     */
    createInvoice(params: CreatePaymentParams): Promise<XenditPaymentResponse>;
    /**
     * Get invoice status
     */
    getInvoiceStatus(invoiceId: string): Promise<{
        status: string;
        paidAt?: string;
        paymentMethod?: string;
    }>;
    /**
     * Expire an invoice (cancel payment)
     */
    expireInvoice(invoiceId: string): Promise<void>;
    /**
     * Verify webhook callback token
     */
    verifyWebhookToken(token: string): boolean;
    /**
     * Parse webhook payload
     */
    parseWebhookPayload(body: any): XenditWebhookPayload;
    /**
     * Map Xendit status to our transaction status
     */
    mapStatus(xenditStatus: string): 'pending' | 'completed' | 'failed' | 'expired';
}
export declare const xenditService: XenditService;
export type { XenditInvoice };
//# sourceMappingURL=xendit.service.d.ts.map