export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'expired';
export type PaymentMethod = 'bank_transfer' | 'ewallet' | 'qris' | 'credit_card' | 'virtual_account';
export type PaymentProvider = 'midtrans' | 'xendit' | 'stripe' | 'manual';
export interface PricingTier {
    id: string;
    website_id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    duration_days?: number;
    features: string[];
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
export interface CreatePricingTierData {
    website_id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    duration_days?: number;
    features?: string[];
    sort_order?: number;
}
export interface Order {
    id: string;
    order_number: string;
    buyer_id: string;
    website_id: string;
    pricing_tier_id?: string;
    creator_id: string;
    item_name: string;
    item_price: number;
    platform_fee: number;
    total_amount: number;
    currency: string;
    status: OrderStatus;
    expires_at?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    website?: {
        name: string;
        slug: string;
        thumbnail: string;
    };
    buyer?: {
        name: string;
        email: string;
    };
    creator?: {
        name: string;
        email: string;
    };
}
export interface CreateOrderData {
    website_id: string;
    pricing_tier_id?: string;
    notes?: string;
}
export interface Transaction {
    id: string;
    order_id: string;
    transaction_id?: string;
    payment_method?: PaymentMethod;
    payment_provider: PaymentProvider;
    payment_channel?: string;
    amount: number;
    currency: string;
    status: string;
    status_message?: string;
    gateway_response?: Record<string, unknown>;
    payment_url?: string;
    paid_at?: string;
    expired_at?: string;
    created_at: string;
    updated_at: string;
}
export interface Invoice {
    id: string;
    invoice_number: string;
    order_id: string;
    buyer_name: string;
    buyer_email: string;
    creator_name: string;
    creator_email?: string;
    line_items: InvoiceLineItem[];
    subtotal: number;
    platform_fee: number;
    total: number;
    currency: string;
    status: 'draft' | 'issued' | 'paid' | 'cancelled';
    issued_at?: string;
    paid_at?: string;
    due_date?: string;
    pdf_url?: string;
    created_at: string;
    updated_at: string;
}
export interface InvoiceLineItem {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    total: number;
}
export interface UserAccess {
    id: string;
    user_id: string;
    website_id: string;
    order_id?: string;
    pricing_tier_id?: string;
    granted_at: string;
    expires_at?: string;
    is_active: boolean;
    revoked_at?: string;
    revoke_reason?: string;
    created_at: string;
    updated_at: string;
    website?: {
        name: string;
        slug: string;
        thumbnail: string;
    };
}
export interface CreatorPayout {
    id: string;
    creator_id: string;
    payout_number: string;
    gross_amount: number;
    platform_fee: number;
    net_amount: number;
    currency: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processed_at?: string;
    completed_at?: string;
    order_ids: string[];
    notes?: string;
    created_at: string;
    updated_at: string;
}
export interface PaymentWebhook {
    order_id: string;
    transaction_id: string;
    transaction_status: string;
    payment_type?: string;
    gross_amount?: string;
    signature_key?: string;
    fraud_status?: string;
}
export interface OrderWithDetails extends Order {
    transaction?: Transaction;
    invoice?: Invoice;
}
export interface PurchaseHistoryItem {
    order: Order;
    website: {
        id: string;
        name: string;
        slug: string;
        thumbnail: string;
    };
    access: UserAccess | null;
}
//# sourceMappingURL=billing.types.d.ts.map