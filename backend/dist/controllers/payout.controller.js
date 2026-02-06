"use strict";
// ============================================
// Payout Controller - Finding Gems Backend
// Creator Earnings & Withdrawal Management
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayout = exports.getAllPayouts = exports.cancelPayout = exports.requestPayout = exports.getPayouts = exports.deleteBankAccount = exports.addBankAccount = exports.getBankAccounts = exports.recalculateBalance = exports.getCreatorBalance = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const email_service_1 = require("../services/email.service");
// ============================================
// CREATOR BALANCE
// ============================================
/**
 * Get creator's balance summary
 * GET /api/v1/payouts/balance
 */
exports.getCreatorBalance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    // Get or create balance record
    let { data: balance, error } = await supabase_1.supabase
        .from('creator_balances')
        .select('*')
        .eq('creator_id', user.id)
        .single();
    if (error && error.code === 'PGRST116') {
        // No balance record, calculate and create
        const calculatedBalance = await calculateCreatorBalance(user.id);
        const { data: newBalance, error: createError } = await supabase_1.supabase
            .from('creator_balances')
            .insert({
            creator_id: user.id,
            ...calculatedBalance
        })
            .select()
            .single();
        if (createError) {
            return res.status(500).json({ success: false, error: { message: 'Failed to create balance record' } });
        }
        balance = newBalance;
    }
    else if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    // Get pending payouts
    const { data: pendingPayouts } = await supabase_1.supabase
        .from('payouts')
        .select('amount')
        .eq('creator_id', user.id)
        .in('status', ['pending', 'processing']);
    const pendingWithdrawal = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    res.status(200).json({
        success: true,
        data: {
            balance: {
                ...balance,
                pending_withdrawal: pendingWithdrawal,
                withdrawable: Number(balance.available_balance) - pendingWithdrawal
            }
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * Recalculate creator balance (from orders)
 * POST /api/v1/payouts/balance/recalculate
 */
exports.recalculateBalance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const calculatedBalance = await calculateCreatorBalance(user.id);
    const { data: balance, error } = await supabase_1.supabase
        .from('creator_balances')
        .upsert({
        creator_id: user.id,
        ...calculatedBalance,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { onConflict: 'creator_id' })
        .select()
        .single();
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: { balance },
        message: 'Balance recalculated successfully',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// BANK ACCOUNTS
// ============================================
/**
 * Get creator's bank accounts
 * GET /api/v1/payouts/bank-accounts
 */
exports.getBankAccounts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { data: accounts, error } = await supabase_1.supabase
        .from('creator_bank_accounts')
        .select('*')
        .eq('creator_id', user.id)
        .order('is_primary', { ascending: false });
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: { accounts: accounts || [] },
        timestamp: new Date().toISOString()
    });
});
/**
 * Add bank account
 * POST /api/v1/payouts/bank-accounts
 */
exports.addBankAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { bank_name, bank_code, account_number, account_name, is_primary } = req.body;
    if (!bank_name || !account_number || !account_name) {
        return res.status(400).json({
            success: false,
            error: { message: 'bank_name, account_number, and account_name are required' }
        });
    }
    // If setting as primary, unset other primaries
    if (is_primary) {
        await supabase_1.supabase
            .from('creator_bank_accounts')
            .update({ is_primary: false })
            .eq('creator_id', user.id);
    }
    const { data: account, error } = await supabase_1.supabase
        .from('creator_bank_accounts')
        .insert({
        creator_id: user.id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        is_primary: is_primary || false
    })
        .select()
        .single();
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(201).json({
        success: true,
        data: { account },
        message: 'Bank account added successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * Delete bank account
 * DELETE /api/v1/payouts/bank-accounts/:id
 */
exports.deleteBankAccount = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { id } = req.params;
    const { error } = await supabase_1.supabase
        .from('creator_bank_accounts')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id);
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// PAYOUT REQUESTS
// ============================================
/**
 * Get creator's payout history
 * GET /api/v1/payouts
 */
exports.getPayouts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = supabase_1.supabase
        .from('payouts')
        .select('*', { count: 'exact' })
        .eq('creator_id', user.id)
        .order('createdAt', { ascending: false })
        .range(offset, offset + Number(limit) - 1);
    if (status) {
        query = query.eq('status', status);
    }
    const { data: payouts, count, error } = await query;
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: {
            payouts: payouts || [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                total_pages: Math.ceil((count || 0) / Number(limit))
            }
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * Request a payout
 * POST /api/v1/payouts
 */
exports.requestPayout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    // Check if user is a creator
    if (user.role !== 'creator' && user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Only creators can request payouts' } });
    }
    const { amount, bank_account_id, notes } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: { message: 'Valid amount is required' } });
    }
    // Get balance
    const { data: balance } = await supabase_1.supabase
        .from('creator_balances')
        .select('available_balance')
        .eq('creator_id', user.id)
        .single();
    if (!balance) {
        return res.status(400).json({ success: false, error: { message: 'No balance found' } });
    }
    // Check pending payouts
    const { data: pendingPayouts } = await supabase_1.supabase
        .from('payouts')
        .select('amount')
        .eq('creator_id', user.id)
        .in('status', ['pending', 'processing']);
    const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const withdrawable = Number(balance.available_balance) - pendingAmount;
    if (amount > withdrawable) {
        return res.status(400).json({
            success: false,
            error: { message: `Insufficient balance. Available: Rp ${withdrawable.toLocaleString()}` }
        });
    }
    // Minimum payout check
    const MIN_PAYOUT = 50000; // Rp 50,000
    if (amount < MIN_PAYOUT) {
        return res.status(400).json({
            success: false,
            error: { message: `Minimum payout is Rp ${MIN_PAYOUT.toLocaleString()}` }
        });
    }
    // Get bank account
    let bankAccount;
    if (bank_account_id) {
        const { data } = await supabase_1.supabase
            .from('creator_bank_accounts')
            .select('*')
            .eq('id', bank_account_id)
            .eq('creator_id', user.id)
            .single();
        bankAccount = data;
    }
    else {
        // Get primary account
        const { data } = await supabase_1.supabase
            .from('creator_bank_accounts')
            .select('*')
            .eq('creator_id', user.id)
            .eq('is_primary', true)
            .single();
        bankAccount = data;
    }
    if (!bankAccount) {
        return res.status(400).json({
            success: false,
            error: { message: 'Please add a bank account first' }
        });
    }
    // Calculate fee (example: 0.5% with min Rp 2,500)
    const feePercent = 0.005;
    const minFee = 2500;
    const fee = Math.max(amount * feePercent, minFee);
    const netAmount = amount - fee;
    // Generate payout number
    const { data: payoutNumResult } = await supabase_1.supabase.rpc('generate_payout_number');
    const payoutNumber = payoutNumResult || `PO${Date.now()}`;
    // Create payout request
    const { data: payout, error } = await supabase_1.supabase
        .from('payouts')
        .insert({
        payout_number: payoutNumber,
        creator_id: user.id,
        amount,
        fee,
        net_amount: netAmount,
        currency: 'IDR',
        bank_name: bankAccount.bank_name,
        bank_account_number: bankAccount.account_number,
        bank_account_name: bankAccount.account_name,
        status: 'pending',
        notes
    })
        .select()
        .single();
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    // Send email notification (async)
    if (user.email) {
        (0, email_service_1.sendPayoutRequestedEmail)(user.email, {
            creatorName: user.name || 'Creator',
            payoutNumber: payoutNumber,
            amount: netAmount,
            bankName: bankAccount.bank_name,
            accountNumber: bankAccount.account_number.replace(/\d(?=\d{4})/g, '*'),
            estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')
        }).catch(err => console.error('Failed to send payout request email:', err));
    }
    res.status(201).json({
        success: true,
        data: { payout },
        message: 'Payout request submitted successfully. Processing time: 1-3 business days.',
        timestamp: new Date().toISOString()
    });
});
/**
 * Cancel payout request (only if pending)
 * POST /api/v1/payouts/:id/cancel
 */
exports.cancelPayout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { id } = req.params;
    // Check payout exists and is pending
    const { data: payout } = await supabase_1.supabase
        .from('payouts')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single();
    if (!payout) {
        return res.status(404).json({ success: false, error: { message: 'Payout not found' } });
    }
    if (payout.status !== 'pending') {
        return res.status(400).json({
            success: false,
            error: { message: `Cannot cancel payout with status: ${payout.status}` }
        });
    }
    const { error } = await supabase_1.supabase
        .from('payouts')
        .update({
        status: 'cancelled',
        status_message: 'Cancelled by creator',
        updated_at: new Date().toISOString()
    })
        .eq('id', id);
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        message: 'Payout request cancelled',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// ADMIN PAYOUT MANAGEMENT
// ============================================
/**
 * Get all payout requests (Admin)
 * GET /api/v1/payouts/admin/all
 */
exports.getAllPayouts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = supabase_1.supabase
        .from('payouts')
        .select(`
      *,
      creator:users!payouts_creator_id_fkey(id, name, email)
    `, { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(offset, offset + Number(limit) - 1);
    if (status) {
        query = query.eq('status', status);
    }
    const { data: payouts, count, error } = await query;
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: {
            payouts: payouts || [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                total_pages: Math.ceil((count || 0) / Number(limit))
            }
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * Process payout (Admin)
 * POST /api/v1/payouts/admin/:id/process
 */
exports.processPayout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { id } = req.params;
    const { action, transfer_reference, transfer_proof_url, status_message } = req.body;
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, error: { message: 'Action must be approve or reject' } });
    }
    const { data: payout } = await supabase_1.supabase
        .from('payouts')
        .select('*')
        .eq('id', id)
        .single();
    if (!payout) {
        return res.status(404).json({ success: false, error: { message: 'Payout not found' } });
    }
    if (!['pending', 'processing'].includes(payout.status)) {
        return res.status(400).json({
            success: false,
            error: { message: `Cannot process payout with status: ${payout.status}` }
        });
    }
    const newStatus = action === 'approve' ? 'completed' : 'rejected';
    // Update payout
    const { error: payoutError } = await supabase_1.supabase
        .from('payouts')
        .update({
        status: newStatus,
        status_message: status_message || (action === 'approve' ? 'Transfer completed' : 'Rejected by admin'),
        transfer_reference,
        transfer_proof_url,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
        .eq('id', id);
    if (payoutError) {
        return res.status(500).json({ success: false, error: { message: payoutError.message } });
    }
    // If approved, update creator balance
    if (action === 'approve') {
        // Update withdrawn and available balance directly
        const { data: currentBalance } = await supabase_1.supabase
            .from('creator_balances')
            .select('withdrawn_balance, available_balance')
            .eq('creator_id', payout.creator_id)
            .single();
        if (currentBalance) {
            await supabase_1.supabase
                .from('creator_balances')
                .update({
                withdrawn_balance: Number(currentBalance.withdrawn_balance) + Number(payout.amount),
                available_balance: Math.max(0, Number(currentBalance.available_balance) - Number(payout.amount)),
                updated_at: new Date().toISOString()
            })
                .eq('creator_id', payout.creator_id);
        }
    }
    // Send email notification to creator
    const { data: creator } = await supabase_1.supabase
        .from('users')
        .select('email, name')
        .eq('id', payout.creator_id)
        .single();
    if (creator?.email) {
        (0, email_service_1.sendPayoutProcessedEmail)(creator.email, {
            creatorName: creator.name || 'Creator',
            payoutNumber: payout.payout_number,
            amount: payout.net_amount,
            status: newStatus,
            rejectionReason: newStatus === 'rejected' ? status_message : undefined,
            transferReference: transfer_reference
        }).catch(err => console.error('Failed to send payout processed email:', err));
    }
    res.status(200).json({
        success: true,
        message: `Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        timestamp: new Date().toISOString()
    });
});
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Calculate creator balance from orders
 */
async function calculateCreatorBalance(creatorId) {
    // Get all paid orders for this creator
    const { data: orders } = await supabase_1.supabase
        .from('orders')
        .select('total_amount, platform_fee, status, createdAt')
        .eq('creator_id', creatorId)
        .eq('status', 'paid');
    const now = new Date();
    const settlementDays = 7; // 7 days settlement period
    let totalEarnings = 0;
    let pendingBalance = 0;
    let availableBalance = 0;
    orders?.forEach(order => {
        const creatorEarning = Number(order.total_amount) - Number(order.platform_fee);
        totalEarnings += creatorEarning;
        const orderDate = new Date(order.createdAt);
        const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceOrder >= settlementDays) {
            availableBalance += creatorEarning;
        }
        else {
            pendingBalance += creatorEarning;
        }
    });
    // Get already withdrawn
    const { data: completedPayouts } = await supabase_1.supabase
        .from('payouts')
        .select('amount')
        .eq('creator_id', creatorId)
        .eq('status', 'completed');
    const withdrawnBalance = completedPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    // Available = earnings after settlement - already withdrawn
    availableBalance = availableBalance - withdrawnBalance;
    return {
        total_earnings: totalEarnings,
        pending_balance: pendingBalance,
        available_balance: Math.max(0, availableBalance),
        withdrawn_balance: withdrawnBalance
    };
}
//# sourceMappingURL=payout.controller.js.map