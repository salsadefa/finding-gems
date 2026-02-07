"use strict";
// ============================================
// Payment Controller - Finding Gems Backend
// Payment Gateway Integration & Webhooks
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPayment = exports.handlePaymentWebhook = exports.handleXenditWebhook = exports.getPaymentStatus = exports.initiatePayment = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const xendit_service_1 = require("../services/xendit.service");
const email_service_1 = require("../services/email.service");
const crypto_1 = __importDefault(require("crypto"));
// ============================================
// PAYMENT INITIATION
// ============================================
/**
 * Initiate payment for an order
 * POST /api/v1/payments/initiate
 */
exports.initiatePayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { order_id, payment_method } = req.body;
    if (!order_id) {
        return res.status(400).json({ success: false, error: { message: 'order_id is required' } });
    }
    // Get order
    const { data: order, error: orderError } = await supabase_1.supabase
        .from('orders')
        .select(`
      *,
      buyer:users!orders_buyer_id_fkey(id, name, email),
      websites!inner(id, name)
    `)
        .eq('id', order_id)
        .single();
    if (orderError || !order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }
    if (order.buyer_id !== user.id) {
        return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
    }
    if (order.status !== 'pending') {
        return res.status(400).json({ success: false, error: { message: `Order is ${order.status}, cannot initiate payment` } });
    }
    // Check if order expired
    if (order.expires_at && new Date(order.expires_at) < new Date()) {
        await supabase_1.supabase.from('orders').update({ status: 'expired' }).eq('id', order_id);
        return res.status(400).json({ success: false, error: { message: 'Order has expired' } });
    }
    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
    // Create transaction record
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);
    // Check if Xendit is available
    const useXendit = xendit_service_1.xenditService.isAvailable() && payment_method !== 'manual';
    let xenditResponse = null;
    let paymentInstructions = null;
    if (useXendit) {
        try {
            // Create Xendit invoice
            xenditResponse = await xendit_service_1.xenditService.createInvoice({
                orderId: order_id,
                orderNumber: order.order_number,
                amount: order.total_amount,
                currency: order.currency,
                customerEmail: order.buyer?.email || user.email,
                customerName: order.buyer?.name || user.name,
                description: `Payment for ${order.item_name}`,
                items: [{
                        name: order.item_name,
                        quantity: 1,
                        price: order.total_amount
                    }]
            });
            console.log('[Payment] Xendit invoice created:', xenditResponse.invoiceId);
        }
        catch (xenditError) {
            console.error('[Payment] Xendit error, falling back to manual:', xenditError.message);
            // Fall back to manual payment if Xendit fails
            paymentInstructions = getPaymentInstructions(payment_method, order.total_amount, transactionId);
        }
    }
    else {
        // Use manual payment instructions
        paymentInstructions = getPaymentInstructions(payment_method, order.total_amount, transactionId);
    }
    // Create transaction record
    const { data: transaction, error: txError } = await supabase_1.supabase
        .from('transactions')
        .insert({
        order_id: order_id,
        transaction_id: transactionId,
        payment_method: payment_method || 'bank_transfer',
        payment_provider: xenditResponse ? 'xendit' : 'manual',
        gateway_transaction_id: xenditResponse?.invoiceId || null,
        amount: order.total_amount,
        currency: order.currency,
        status: 'pending',
        expired_at: xenditResponse?.expiryDate || expiredAt.toISOString(),
        metadata: xenditResponse ? {
            xendit_invoice_url: xenditResponse.invoiceUrl,
            xendit_external_id: xenditResponse.externalId
        } : null
    })
        .select()
        .single();
    if (txError) {
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to create transaction', details: txError.message }
        });
    }
    // Build response
    const responseData = {
        transaction,
        payment_instructions: xenditResponse
            ? {
                type: 'xendit',
                checkout_url: xenditResponse.invoiceUrl,
                invoice_id: xenditResponse.invoiceId,
                expires_at: xenditResponse.expiryDate,
                amount: xenditResponse.amount,
                instructions: [
                    'Click the payment link to proceed to checkout',
                    'Choose your preferred payment method',
                    'Complete the payment within the time limit',
                    'You will receive confirmation once payment is successful'
                ]
            }
            : paymentInstructions
    };
    res.status(200).json({
        success: true,
        data: responseData,
        message: xenditResponse
            ? 'Payment initiated. Redirecting to checkout...'
            : 'Payment initiated. Please complete payment within 24 hours.',
        timestamp: new Date().toISOString()
    });
});
/**
 * Get payment status
 * GET /api/v1/payments/:transactionId/status
 */
exports.getPaymentStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { transactionId } = req.params;
    const { data: transaction, error } = await supabase_1.supabase
        .from('transactions')
        .select(`
      *,
      orders!inner(id, order_number, buyer_id, status)
    `)
        .eq('transaction_id', transactionId)
        .single();
    if (error || !transaction) {
        return res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
    }
    // If Xendit transaction, check status from Xendit
    if (transaction.payment_provider === 'xendit' && transaction.gateway_transaction_id) {
        try {
            const xenditStatus = await xendit_service_1.xenditService.getInvoiceStatus(transaction.gateway_transaction_id);
            const mappedStatus = xendit_service_1.xenditService.mapStatus(xenditStatus.status);
            // Update if status changed
            if (mappedStatus !== transaction.status) {
                await supabase_1.supabase
                    .from('transactions')
                    .update({
                    status: mappedStatus === 'completed' ? 'success' : mappedStatus,
                    paid_at: mappedStatus === 'completed' ? xenditStatus.paidAt : null,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', transaction.id);
                // If payment completed, update order and grant access
                if (mappedStatus === 'completed' && transaction.orders.status !== 'paid') {
                    await supabase_1.supabase
                        .from('orders')
                        .update({ status: 'paid', updated_at: new Date().toISOString() })
                        .eq('id', transaction.order_id);
                    await grantAccessAndCreateInvoice(transaction.order_id);
                }
                transaction.status = mappedStatus === 'completed' ? 'success' : mappedStatus;
            }
        }
        catch (xenditError) {
            console.error('[Payment] Failed to check Xendit status:', xenditError);
            // Continue with cached status
        }
    }
    res.status(200).json({
        success: true,
        data: { transaction },
        timestamp: new Date().toISOString()
    });
});
// ============================================
// PAYMENT WEBHOOKS
// ============================================
/**
 * Handle Xendit webhook callback
 * POST /api/v1/payments/webhook/xendit
 */
exports.handleXenditWebhook = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const callbackToken = req.headers['x-callback-token'];
    // Verify webhook token
    if (!xendit_service_1.xenditService.verifyWebhookToken(callbackToken)) {
        console.error('[Webhook] Invalid callback token');
        return res.status(403).json({ success: false, error: { message: 'Invalid callback token' } });
    }
    const payload = xendit_service_1.xenditService.parseWebhookPayload(req.body);
    console.log('[Webhook] Xendit callback received:', {
        id: payload.id,
        external_id: payload.external_id,
        status: payload.status
    });
    // external_id is our order_id
    const orderId = payload.external_id;
    // Find transaction by order_id
    const { data: transaction, error: txError } = await supabase_1.supabase
        .from('transactions')
        .select('*, orders!inner(*)')
        .eq('order_id', orderId)
        .single();
    if (txError || !transaction) {
        console.error('[Webhook] Transaction not found for order:', orderId);
        return res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
    }
    // Map Xendit status to our status
    const mappedStatus = xendit_service_1.xenditService.mapStatus(payload.status);
    let transactionStatus = mappedStatus === 'completed' ? 'success' : mappedStatus;
    let orderStatus = transaction.orders.status;
    switch (mappedStatus) {
        case 'completed':
            transactionStatus = 'success';
            orderStatus = 'paid';
            break;
        case 'expired':
            transactionStatus = 'expired';
            orderStatus = 'expired';
            break;
        case 'failed':
            transactionStatus = 'failed';
            orderStatus = 'failed';
            break;
        default:
            transactionStatus = 'pending';
    }
    // Update transaction
    // Note: Xendit sends payment_method in UPPERCASE but our enum uses lowercase
    const normalizedPaymentMethod = payload.payment_method
        ? payload.payment_method.toLowerCase().replace(/ /g, '_')
        : transaction.payment_method;
    console.log(`[Webhook] Updating transaction ${transaction.id} status to: ${transactionStatus}, payment_method: ${normalizedPaymentMethod}`);
    const { error: updateTxError } = await supabase_1.supabase
        .from('transactions')
        .update({
        status: transactionStatus,
        gateway_response: req.body,
        paid_at: transactionStatus === 'success' ? payload.paid_at : null,
        payment_method: normalizedPaymentMethod,
        updated_at: new Date().toISOString()
    })
        .eq('id', transaction.id);
    if (updateTxError) {
        console.error('[Webhook] Failed to update transaction:', updateTxError);
    }
    else {
        console.log(`[Webhook] Transaction ${transaction.id} status updated to: ${transactionStatus}`);
    }
    // Update order
    console.log(`[Webhook] Updating order ${orderId} status to: ${orderStatus}`);
    const { error: updateOrderError } = await supabase_1.supabase
        .from('orders')
        .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
    })
        .eq('id', orderId);
    if (updateOrderError) {
        console.error('[Webhook] Failed to update order:', updateOrderError);
    }
    else {
        console.log(`[Webhook] Order ${orderId} status updated to: ${orderStatus}`);
    }
    // If payment successful, grant access and create invoice
    if (transactionStatus === 'success') {
        await grantAccessAndCreateInvoice(orderId);
    }
    console.log(`[Webhook] Order ${orderId} processing complete. Transaction: ${transactionStatus}, Order: ${orderStatus}`);
    // Always return 200 to acknowledge webhook
    res.status(200).json({ success: true, message: 'Webhook processed' });
});
/**
 * Handle legacy payment webhook (for backward compatibility)
 * POST /api/v1/payments/webhook
 */
exports.handlePaymentWebhook = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // Check if it's a Xendit webhook
    if (req.headers['x-callback-token']) {
        return (0, exports.handleXenditWebhook)(req, res, next);
    }
    // Legacy webhook handling
    const { order_id, transaction_id, transaction_status, payment_type: _payment_type, gross_amount: _gross_amount, signature_key: _signature_key } = req.body;
    console.log('Payment webhook received:', { order_id, transaction_id, transaction_status });
    // TODO: Verify signature for production
    // For Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
    // Find transaction
    const { data: transaction, error: txError } = await supabase_1.supabase
        .from('transactions')
        .select('*, orders!inner(*)')
        .eq('transaction_id', transaction_id)
        .single();
    if (txError || !transaction) {
        console.error('Transaction not found:', transaction_id);
        return res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
    }
    const orderId = transaction.order_id;
    let newStatus = transaction.status;
    let orderStatus = transaction.orders.status;
    // Map payment gateway status to our status
    switch (transaction_status) {
        case 'capture':
        case 'settlement':
            newStatus = 'success';
            orderStatus = 'paid';
            break;
        case 'pending':
            newStatus = 'pending';
            break;
        case 'deny':
        case 'cancel':
            newStatus = 'failed';
            orderStatus = 'failed';
            break;
        case 'expire':
            newStatus = 'expired';
            orderStatus = 'expired';
            break;
        case 'refund':
            newStatus = 'refunded';
            orderStatus = 'refunded';
            break;
        default:
            newStatus = transaction_status;
    }
    // Update transaction
    await supabase_1.supabase
        .from('transactions')
        .update({
        status: newStatus,
        gateway_response: req.body,
        paid_at: newStatus === 'success' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
    })
        .eq('id', transaction.id);
    // Update order
    await supabase_1.supabase
        .from('orders')
        .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
    })
        .eq('id', orderId);
    // If payment successful, grant access and create invoice
    if (newStatus === 'success') {
        await grantAccessAndCreateInvoice(orderId);
    }
    res.status(200).json({ success: true, message: 'Webhook processed' });
});
/**
 * Manual payment confirmation (Admin only)
 * POST /api/v1/payments/:transactionId/confirm
 */
exports.confirmPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { transactionId } = req.params;
    const { data: transaction, error: txError } = await supabase_1.supabase
        .from('transactions')
        .select('*, orders!inner(*)')
        .eq('transaction_id', transactionId)
        .single();
    if (txError || !transaction) {
        return res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
    }
    if (transaction.status === 'success') {
        return res.status(400).json({ success: false, error: { message: 'Payment already confirmed' } });
    }
    // Update transaction
    await supabase_1.supabase
        .from('transactions')
        .update({
        status: 'success',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
        .eq('id', transaction.id);
    // Update order
    await supabase_1.supabase
        .from('orders')
        .update({
        status: 'paid',
        updated_at: new Date().toISOString()
    })
        .eq('id', transaction.order_id);
    // Grant access and create invoice
    await grantAccessAndCreateInvoice(transaction.order_id);
    res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Grant access and create invoice after successful payment
 */
async function grantAccessAndCreateInvoice(orderId) {
    // Get order with details
    const { data: order, error: orderError } = await supabase_1.supabase
        .from('orders')
        .select(`
      *,
      buyer:users!orders_buyer_id_fkey(id, name, email),
      creator:users!orders_creator_id_fkey(id, name, email),
      pricing_tiers(duration_days)
    `)
        .eq('id', orderId)
        .single();
    if (orderError || !order) {
        console.error('Order not found for access grant:', orderId);
        return;
    }
    // Calculate expiration
    let expiresAt = null;
    if (order.pricing_tiers?.duration_days) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + order.pricing_tiers.duration_days);
        expiresAt = expDate.toISOString();
    }
    // Grant access
    const { error: accessError } = await supabase_1.supabase
        .from('user_access')
        .upsert({
        user_id: order.buyer_id,
        website_id: order.website_id,
        order_id: orderId,
        pricing_tier_id: order.pricing_tier_id,
        expires_at: expiresAt,
        is_active: true,
        granted_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,website_id'
    });
    if (accessError) {
        console.error('Failed to grant access:', accessError);
    }
    // Generate invoice number
    const { data: invoiceNumResult } = await supabase_1.supabase.rpc('generate_invoice_number');
    const invoiceNumber = invoiceNumResult || `INV-${Date.now()}`;
    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase_1.supabase
        .from('invoices')
        .insert({
        invoice_number: invoiceNumber,
        order_id: orderId,
        buyer_name: order.buyer?.name || 'Unknown',
        buyer_email: order.buyer?.email || '',
        creator_name: order.creator?.name || 'Unknown',
        creator_email: order.creator?.email || '',
        line_items: [{
                name: order.item_name,
                price: order.item_price,
                quantity: 1,
                total: order.item_price
            }],
        subtotal: order.item_price,
        platform_fee: order.platform_fee,
        total: order.total_amount,
        currency: order.currency,
        status: 'paid',
        issued_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
    })
        .select()
        .single();
    if (invoiceError) {
        console.error('Failed to create invoice:', invoiceError);
    }
    // Send email notifications (async, don't await)
    const invoiceUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/dashboard/purchases/${orderId}/invoice`;
    // Email to buyer
    if (order.buyer?.email) {
        (0, email_service_1.sendPaymentSuccessEmail)(order.buyer.email, {
            userName: order.buyer.name || 'Customer',
            orderNumber: order.order_number,
            websiteName: order.item_name || 'Product',
            amount: order.total_amount,
            paymentMethod: 'Xendit',
            invoiceUrl
        }).catch(err => console.error('Failed to send payment success email:', err));
        // Also send invoice
        if (invoice) {
            (0, email_service_1.sendInvoiceEmail)(order.buyer.email, {
                userName: order.buyer.name || 'Customer',
                invoiceNumber: invoice.invoice_number,
                orderNumber: order.order_number,
                websiteName: order.item_name || 'Product',
                amount: order.total_amount,
                issueDate: new Date().toISOString(),
                invoiceUrl
            }).catch(err => console.error('Failed to send invoice email:', err));
        }
    }
    // Email to creator (sale notification)
    if (order.creator?.email) {
        const platformFee = order.platform_fee || 0;
        const creatorEarning = order.total_amount - platformFee;
        (0, email_service_1.sendNewSaleEmail)(order.creator.email, {
            creatorName: order.creator.name || 'Creator',
            buyerName: order.buyer?.name || 'Customer',
            websiteName: order.item_name || 'Product',
            tierName: order.tier_name || 'Standard',
            amount: order.total_amount,
            platformFee,
            creatorEarning,
            orderNumber: order.order_number
        }).catch(err => console.error('Failed to send sale notification email:', err));
    }
    console.log(`Access granted and invoice created for order ${orderId}`);
}
/**
 * Get payment instructions for manual payment
 */
function getPaymentInstructions(paymentMethod, amount, transactionId) {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
    const baseInstructions = {
        transaction_id: transactionId,
        amount: amount,
        formatted_amount: formattedAmount,
        expires_in: '24 hours'
    };
    switch (paymentMethod) {
        case 'bank_transfer':
            return {
                ...baseInstructions,
                type: 'bank_transfer',
                bank_name: 'BCA',
                account_number: '1234567890',
                account_name: 'PT Finding Gems Indonesia',
                instructions: [
                    `Transfer tepat ${formattedAmount} ke rekening di atas`,
                    `Tambahkan ${transactionId} di berita transfer`,
                    'Konfirmasi pembayaran akan dilakukan dalam 1x24 jam',
                    'Jika ada kendala, hubungi support@findinggems.com'
                ]
            };
        case 'ewallet':
            return {
                ...baseInstructions,
                type: 'ewallet',
                instructions: [
                    'Scan QR code di bawah dengan aplikasi e-wallet Anda',
                    'Konfirmasi pembayaran di aplikasi',
                    'Tunggu notifikasi konfirmasi'
                ],
                qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transactionId}`
            };
        case 'qris':
            return {
                ...baseInstructions,
                type: 'qris',
                instructions: [
                    'Buka aplikasi mobile banking atau e-wallet',
                    'Pilih menu Scan/Pay dengan QRIS',
                    'Scan QR code yang ditampilkan',
                    'Konfirmasi pembayaran'
                ],
                qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS:${transactionId}`
            };
        default:
            return {
                ...baseInstructions,
                type: 'manual',
                instructions: [
                    `Hubungi support untuk menyelesaikan pembayaran ${formattedAmount}`,
                    `Referensi: ${transactionId}`
                ]
            };
    }
}
//# sourceMappingURL=payment.controller.js.map