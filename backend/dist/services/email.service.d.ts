interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
interface PaymentSuccessData {
    userName: string;
    orderNumber: string;
    websiteName: string;
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
    invoiceUrl: string;
}
export declare function sendPaymentSuccessEmail(to: string, data: PaymentSuccessData): Promise<boolean>;
interface PaymentFailedData {
    userName: string;
    orderNumber: string;
    websiteName: string;
    amount: number;
    reason?: string;
    retryUrl: string;
}
export declare function sendPaymentFailedEmail(to: string, data: PaymentFailedData): Promise<boolean>;
interface InvoiceData {
    userName: string;
    invoiceNumber: string;
    orderNumber: string;
    websiteName: string;
    amount: number;
    issueDate: string;
    invoiceUrl: string;
}
export declare function sendInvoiceEmail(to: string, data: InvoiceData): Promise<boolean>;
interface PayoutRequestedData {
    creatorName: string;
    payoutNumber: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    estimatedDate?: string;
}
export declare function sendPayoutRequestedEmail(to: string, data: PayoutRequestedData): Promise<boolean>;
interface PayoutCompletedData {
    userName: string;
    payoutNumber: string;
    netAmount: number;
    bankName: string;
    accountNumber: string;
    transferReference?: string;
}
export declare function sendPayoutCompletedEmail(to: string, data: PayoutCompletedData): Promise<boolean>;
interface PayoutProcessedData {
    creatorName: string;
    payoutNumber: string;
    amount: number;
    status: 'completed' | 'rejected';
    rejectionReason?: string;
    transferReference?: string;
}
export declare function sendPayoutProcessedEmail(to: string, data: PayoutProcessedData): Promise<boolean>;
interface RefundStatusData {
    userName: string;
    refundNumber: string;
    orderNumber: string;
    amount: number;
    status: 'approved' | 'rejected' | 'completed';
    message?: string;
}
export declare function sendRefundStatusEmail(to: string, data: RefundStatusData): Promise<boolean>;
interface NewSaleData {
    creatorName: string;
    buyerName: string;
    websiteName: string;
    tierName: string;
    amount: number;
    platformFee: number;
    creatorEarning: number;
    orderNumber: string;
}
export declare function sendNewSaleEmail(to: string, data: NewSaleData): Promise<boolean>;
export declare function sendWelcomeEmail(to: string, userName: string): Promise<boolean>;
export {};
//# sourceMappingURL=email.service.d.ts.map