"use strict";
// ============================================
// Admin Dashboard Controller - Finding Gems Backend
// Analytics & Statistics for Admin
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPerformers = exports.getUserAnalytics = exports.getPaymentAnalytics = exports.getDashboardOverview = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
// ============================================
// DASHBOARD OVERVIEW
// ============================================
/**
 * Get admin dashboard overview
 * GET /api/v1/admin/dashboard
 */
exports.getDashboardOverview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
    // Parallel queries for performance
    const [totalUsers, totalCreators, totalWebsites, totalOrders, monthlyRevenue, lastMonthRevenue, pendingPayouts, pendingRefunds, pendingCreatorApps, recentOrders,] = await Promise.all([
        // Total users
        supabase_1.supabase.from('users').select('id', { count: 'exact', head: true }),
        // Total creators
        supabase_1.supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
        // Total websites
        supabase_1.supabase.from('websites').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        // Total orders
        supabase_1.supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
        // This month revenue
        supabase_1.supabase.from('orders')
            .select('total_amount, platform_fee')
            .eq('status', 'paid')
            .gte('createdAt', startOfMonth),
        // Last month revenue
        supabase_1.supabase.from('orders')
            .select('total_amount, platform_fee')
            .eq('status', 'paid')
            .gte('createdAt', startOfLastMonth)
            .lte('createdAt', endOfLastMonth),
        // Pending payouts
        supabase_1.supabase.from('payouts').select('id, amount', { count: 'exact' }).eq('status', 'pending'),
        // Pending refunds
        supabase_1.supabase.from('refunds').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
        // Pending creator applications
        supabase_1.supabase.from('creator_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Recent orders
        supabase_1.supabase.from('orders')
            .select(`
        id, order_number, total_amount, status, createdAt,
        buyer:users!orders_buyer_id_fkey(id, name, email),
        website:websites(id, name)
      `)
            .eq('status', 'paid')
            .order('createdAt', { ascending: false })
            .limit(5),
    ]);
    // Calculate revenue
    const thisMonthTotal = monthlyRevenue.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const thisMonthFees = monthlyRevenue.data?.reduce((sum, o) => sum + Number(o.platform_fee || 0), 0) || 0;
    const lastMonthTotal = lastMonthRevenue.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const revenueGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    // Pending payouts amount
    const pendingPayoutAmount = pendingPayouts.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    res.status(200).json({
        success: true,
        data: {
            overview: {
                total_users: totalUsers.count || 0,
                total_creators: totalCreators.count || 0,
                total_websites: totalWebsites.count || 0,
                total_orders: totalOrders.count || 0,
            },
            revenue: {
                this_month: thisMonthTotal,
                platform_fees: thisMonthFees,
                last_month: lastMonthTotal,
                growth_percent: Math.round(revenueGrowth * 10) / 10,
            },
            pending: {
                payouts_count: pendingPayouts.count || 0,
                payouts_amount: pendingPayoutAmount,
                refunds_count: pendingRefunds.count || 0,
                creator_applications: pendingCreatorApps.count || 0,
            },
            recent_orders: recentOrders.data || [],
        },
        timestamp: new Date().toISOString(),
    });
});
// ============================================
// PAYMENT ANALYTICS
// ============================================
/**
 * Get payment analytics
 * GET /api/v1/admin/analytics/payments
 */
exports.getPaymentAnalytics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { period = '30d' } = req.query;
    // Calculate date range
    let days = 30;
    if (period === '7d')
        days = 7;
    if (period === '90d')
        days = 90;
    if (period === '1y')
        days = 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    // Get orders for the period
    const { data: orders } = await supabase_1.supabase
        .from('orders')
        .select('total_amount, platform_fee, status, createdAt')
        .gte('createdAt', startDate.toISOString());
    // Group by date
    const dailyData = {};
    orders?.forEach(order => {
        const date = order.createdAt.split('T')[0];
        if (!dailyData[date]) {
            dailyData[date] = { revenue: 0, orders: 0, fees: 0 };
        }
        if (order.status === 'paid') {
            dailyData[date].revenue += Number(order.total_amount);
            dailyData[date].fees += Number(order.platform_fee || 0);
            dailyData[date].orders += 1;
        }
    });
    // Convert to array and sort
    const chartData = Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
    // Calculate totals
    const totals = {
        total_revenue: orders?.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
        total_fees: orders?.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.platform_fee || 0), 0) || 0,
        total_orders: orders?.filter(o => o.status === 'paid').length || 0,
        average_order_value: 0,
    };
    totals.average_order_value = totals.total_orders > 0 ? totals.total_revenue / totals.total_orders : 0;
    // Get payment method breakdown
    const { data: transactions } = await supabase_1.supabase
        .from('transactions')
        .select('payment_method, amount, status')
        .gte('createdAt', startDate.toISOString())
        .eq('status', 'paid');
    const paymentMethods = {};
    transactions?.forEach(tx => {
        const method = tx.payment_method || 'unknown';
        if (!paymentMethods[method]) {
            paymentMethods[method] = { count: 0, amount: 0 };
        }
        paymentMethods[method].count += 1;
        paymentMethods[method].amount += Number(tx.amount);
    });
    res.status(200).json({
        success: true,
        data: {
            period,
            chart_data: chartData,
            totals,
            payment_methods: Object.entries(paymentMethods).map(([method, data]) => ({
                method,
                ...data,
            })),
        },
        timestamp: new Date().toISOString(),
    });
});
// ============================================
// USER ANALYTICS
// ============================================
/**
 * Get user analytics
 * GET /api/v1/admin/analytics/users
 */
exports.getUserAnalytics = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { period = '30d' } = req.query;
    let days = 30;
    if (period === '7d')
        days = 7;
    if (period === '90d')
        days = 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    // Get new users in period
    const { data: newUsers } = await supabase_1.supabase
        .from('users')
        .select('createdAt, role')
        .gte('createdAt', startDate.toISOString());
    // Group by date
    const dailySignups = {};
    newUsers?.forEach(u => {
        const date = u.createdAt.split('T')[0];
        dailySignups[date] = (dailySignups[date] || 0) + 1;
    });
    // Role breakdown
    const roleBreakdown = {
        user: newUsers?.filter(u => u.role === 'user').length || 0,
        creator: newUsers?.filter(u => u.role === 'creator').length || 0,
        admin: newUsers?.filter(u => u.role === 'admin').length || 0,
    };
    // Get total users by role
    const { data: allUsers } = await supabase_1.supabase
        .from('users')
        .select('role');
    const totalByRole = {
        user: allUsers?.filter(u => u.role === 'user').length || 0,
        creator: allUsers?.filter(u => u.role === 'creator').length || 0,
        admin: allUsers?.filter(u => u.role === 'admin').length || 0,
    };
    res.status(200).json({
        success: true,
        data: {
            period,
            new_users: newUsers?.length || 0,
            daily_signups: Object.entries(dailySignups)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date)),
            new_users_by_role: roleBreakdown,
            total_by_role: totalByRole,
        },
        timestamp: new Date().toISOString(),
    });
});
// ============================================
// TOP PERFORMERS
// ============================================
/**
 * Get top performers (websites, creators)
 * GET /api/v1/admin/analytics/top
 */
exports.getTopPerformers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    // Top selling websites
    const { data: topWebsites } = await supabase_1.supabase
        .from('orders')
        .select(`
      website_id,
      website:websites(id, name, slug),
      total_amount
    `)
        .eq('status', 'paid');
    const websiteSales = {};
    topWebsites?.forEach(order => {
        const id = order.website_id;
        if (!websiteSales[id]) {
            websiteSales[id] = { website: order.website, revenue: 0, orders: 0 };
        }
        websiteSales[id].revenue += Number(order.total_amount);
        websiteSales[id].orders += 1;
    });
    const sortedWebsites = Object.values(websiteSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    // Top earning creators
    const { data: topCreators } = await supabase_1.supabase
        .from('orders')
        .select(`
      creator_id,
      creator:users!orders_creator_id_fkey(id, name, email, avatar),
      total_amount,
      platform_fee
    `)
        .eq('status', 'paid');
    const creatorEarnings = {};
    topCreators?.forEach(order => {
        const id = order.creator_id;
        if (!creatorEarnings[id]) {
            creatorEarnings[id] = { creator: order.creator, revenue: 0, earnings: 0, orders: 0 };
        }
        creatorEarnings[id].revenue += Number(order.total_amount);
        creatorEarnings[id].earnings += Number(order.total_amount) - Number(order.platform_fee || 0);
        creatorEarnings[id].orders += 1;
    });
    const sortedCreators = Object.values(creatorEarnings)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);
    res.status(200).json({
        success: true,
        data: {
            top_websites: sortedWebsites,
            top_creators: sortedCreators,
        },
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=admin-dashboard.controller.js.map