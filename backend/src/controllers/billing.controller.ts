// ============================================
// Billing Controller - Finding Gems Backend
// Orders, Payments, Invoices
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { CreateOrderData } from '../types/billing.types';

// Platform fee in IDR
const PLATFORM_FEE = 1000;

// Order expiration time (24 hours)
const ORDER_EXPIRATION_HOURS = 24;

// ============================================
// PRICING TIER ENDPOINTS
// ============================================

/**
 * Get pricing tiers for a website
 * GET /api/v1/billing/websites/:websiteId/pricing
 */
export const getWebsitePricing = catchAsync(async (req: Request, res: Response) => {
  const { websiteId } = req.params;

  const { data: tiers, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('website_id', websiteId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch pricing tiers', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    data: { tiers: tiers || [] },
    timestamp: new Date().toISOString()
  });
});

/**
 * Create pricing tier (Creator only)
 * POST /api/v1/billing/websites/:websiteId/pricing
 */
export const createPricingTier = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { websiteId } = req.params;
  const { name, description, price, currency, duration_days, features, sort_order } = req.body;

  // Verify website belongs to user
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('id, "creatorId"')
    .eq('id', websiteId)
    .single();

  if (websiteError || !website) {
    return res.status(404).json({ success: false, error: { message: 'Website not found' } });
  }

  if (website.creatorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized to manage this website pricing' } });
  }

  // Create pricing tier
  const { data: tier, error } = await supabase
    .from('pricing_tiers')
    .insert({
      website_id: websiteId,
      name,
      description,
      price: parseFloat(price),
      currency: currency || 'IDR',
      duration_days: duration_days ? parseInt(duration_days) : null,
      features: features || [],
      sort_order: sort_order || 0
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create pricing tier', details: error.message }
    });
  }

  res.status(201).json({
    success: true,
    data: { tier },
    message: 'Pricing tier created successfully',
    timestamp: new Date().toISOString()
  });
});

/**
 * Update pricing tier (Creator only)
 * PATCH /api/v1/billing/pricing/:tierId
 */
export const updatePricingTier = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { tierId } = req.params;
  const updates = req.body;

  // Get tier with website
  const { data: tier, error: tierError } = await supabase
    .from('pricing_tiers')
    .select('*, websites!inner(id, "creatorId")')
    .eq('id', tierId)
    .single();

  if (tierError || !tier) {
    return res.status(404).json({ success: false, error: { message: 'Pricing tier not found' } });
  }

  if ((tier as any).websites.creatorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
  }

  // Update tier
  const { data: updated, error } = await supabase
    .from('pricing_tiers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', tierId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update pricing tier', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    data: { tier: updated },
    message: 'Pricing tier updated',
    timestamp: new Date().toISOString()
  });
});

/**
 * Delete pricing tier (Creator only)
 * DELETE /api/v1/billing/pricing/:tierId
 */
export const deletePricingTier = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { tierId } = req.params;

  // Get tier with website
  const { data: tier, error: tierError } = await supabase
    .from('pricing_tiers')
    .select('*, websites!inner(id, "creatorId")')
    .eq('id', tierId)
    .single();

  if (tierError || !tier) {
    return res.status(404).json({ success: false, error: { message: 'Pricing tier not found' } });
  }

  if ((tier as any).websites.creatorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
  }

  // Soft delete (set inactive)
  const { error } = await supabase
    .from('pricing_tiers')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', tierId);

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete pricing tier', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Pricing tier deleted',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ORDER ENDPOINTS
// ============================================

/**
 * Create order (initiate purchase)
 * POST /api/v1/billing/orders
 */
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { website_id, pricing_tier_id, notes } = req.body as CreateOrderData;

  if (!website_id) {
    return res.status(400).json({ success: false, error: { message: 'website_id is required' } });
  }

  // Get website details
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('id, name, "creatorId", status')
    .eq('id', website_id)
    .single();

  if (websiteError || !website) {
    return res.status(404).json({ success: false, error: { message: 'Website not found' } });
  }

  if (website.status !== 'active') {
    return res.status(400).json({ success: false, error: { message: 'Website is not available for purchase' } });
  }

  // Check if user already has access
  const { data: existingAccess } = await supabase
    .from('user_access')
    .select('id')
    .eq('user_id', user.id)
    .eq('website_id', website_id)
    .eq('is_active', true)
    .single();

  if (existingAccess) {
    return res.status(400).json({ success: false, error: { message: 'You already have access to this website' } });
  }

  // Get pricing tier
  let itemPrice = 0;
  let itemName = website.name;
  let pricingTier = null;

  if (pricing_tier_id) {
    const { data: tier } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('id', pricing_tier_id)
      .eq('website_id', website_id)
      .eq('is_active', true)
      .single();

    if (!tier) {
      return res.status(400).json({ success: false, error: { message: 'Invalid pricing tier' } });
    }

    pricingTier = tier;
    itemPrice = tier.price;
    itemName = `${website.name} - ${tier.name}`;
  } else {
    // Get default pricing (first active tier)
    const { data: defaultTier } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('website_id', website_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single();

    if (!defaultTier) {
      return res.status(400).json({ success: false, error: { message: 'No pricing available for this website' } });
    }

    pricingTier = defaultTier;
    itemPrice = defaultTier.price;
    itemName = `${website.name} - ${defaultTier.name}`;
  }

  // Generate order number
  const { data: orderNumResult } = await supabase.rpc('generate_order_number');
  const orderNumber = orderNumResult || `ORD-${Date.now()}`;

  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ORDER_EXPIRATION_HOURS);

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      buyer_id: user.id,
      website_id: website_id,
      pricing_tier_id: pricingTier?.id,
      creator_id: website.creatorId,
      item_name: itemName,
      item_price: itemPrice,
      platform_fee: PLATFORM_FEE,
      total_amount: itemPrice + PLATFORM_FEE,
      currency: 'IDR',
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      notes
    })
    .select()
    .single();

  if (orderError) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create order', details: orderError.message }
    });
  }

  res.status(201).json({
    success: true,
    data: { 
      order,
      pricing_tier: pricingTier
    },
    message: 'Order created successfully. Please proceed to payment.',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get order by ID
 * GET /api/v1/billing/orders/:orderId
 */
export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { orderId } = req.params;

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      websites!inner(id, name, slug, thumbnail),
      buyer:users!orders_buyer_id_fkey(id, name, email),
      creator:users!orders_creator_id_fkey(id, name, email)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  // Only buyer, creator, or admin can view
  if (order.buyer_id !== user.id && order.creator_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized to view this order' } });
  }

  // Get transaction if exists
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('order_id', orderId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();

  // Get invoice if exists
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .single();

  res.status(200).json({
    success: true,
    data: { 
      order,
      transaction,
      invoice
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get my orders (purchase history)
 * GET /api/v1/billing/orders/my
 */
export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = supabase
    .from('orders')
    .select(`
      *,
      websites!inner(id, name, slug, thumbnail)
    `, { count: 'exact' })
    .eq('buyer_id', user.id)
    .order('createdAt', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: orders, count, error } = await query;

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch orders', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    data: { 
      orders: orders || [],
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Cancel order (only pending orders)
 * POST /api/v1/billing/orders/:orderId/cancel
 */
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { orderId } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  if (order.buyer_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, error: { message: 'Only pending orders can be cancelled' } });
  }

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to cancel order', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// INVOICE ENDPOINTS
// ============================================

/**
 * Get invoice by order ID
 * GET /api/v1/billing/orders/:orderId/invoice
 */
export const getOrderInvoice = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { orderId } = req.params;

  // Verify order belongs to user
  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, creator_id')
    .eq('id', orderId)
    .single();

  if (!order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  if (order.buyer_id !== user.id && order.creator_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !invoice) {
    return res.status(404).json({ success: false, error: { message: 'Invoice not found' } });
  }

  res.status(200).json({
    success: true,
    data: { invoice },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get my invoices
 * GET /api/v1/billing/invoices/my
 */
export const getMyInvoices = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Get user's orders first
  let query = supabase
    .from('invoices')
    .select(`
      *,
      orders!inner(buyer_id, website_id, websites(name, slug))
    `, { count: 'exact' })
    .eq('orders.buyer_id', user.id)
    .order('createdAt', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: invoices, count, error } = await query;

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch invoices', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    data: { 
      invoices: invoices || [],
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// USER ACCESS ENDPOINTS
// ============================================

/**
 * Get my access (purchased products)
 * GET /api/v1/billing/access/my
 */
export const getMyAccess = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { data: access, error } = await supabase
    .from('user_access')
    .select(`
      *,
      websites!inner(id, name, slug, thumbnail, "externalUrl")
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('granted_at', { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch access', details: error.message }
    });
  }

  res.status(200).json({
    success: true,
    data: { access: access || [] },
    timestamp: new Date().toISOString()
  });
});

/**
 * Check if user has access to a website
 * GET /api/v1/billing/access/check/:websiteId
 */
export const checkAccess = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  const { websiteId } = req.params;

  const { data: access } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('website_id', websiteId)
    .eq('is_active', true)
    .single();

  // Check if expired
  let hasAccess = false;
  if (access) {
    if (access.expires_at) {
      hasAccess = new Date(access.expires_at) > new Date();
    } else {
      hasAccess = true; // Lifetime access
    }
  }

  res.status(200).json({
    success: true,
    data: { 
      has_access: hasAccess,
      access: hasAccess ? access : null
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// CREATOR SALES ENDPOINTS
// ============================================

/**
 * Get creator sales
 * GET /api/v1/billing/creator/sales
 */
export const getCreatorSales = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    return res.status(403).json({ success: false, error: { message: 'Creator access required' } });
  }

  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = supabase
    .from('orders')
    .select(`
      *,
      websites!inner(id, name, slug, thumbnail),
      buyer:users!orders_buyer_id_fkey(id, name, email)
    `, { count: 'exact' })
    .eq('creator_id', user.id)
    .order('createdAt', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: sales, count, error } = await query;

  if (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch sales', details: error.message }
    });
  }

  // Calculate totals
  const { data: totals } = await supabase
    .from('orders')
    .select('total_amount, platform_fee')
    .eq('creator_id', user.id)
    .eq('status', 'paid');

  const totalRevenue = totals?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  const totalFees = totals?.reduce((sum, o) => sum + o.platform_fee, 0) || 0;
  const netRevenue = totalRevenue - totalFees;

  res.status(200).json({
    success: true,
    data: { 
      sales: sales || [],
      stats: {
        total_orders: count || 0,
        total_revenue: totalRevenue,
        platform_fees: totalFees,
        net_revenue: netRevenue
      },
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    },
    timestamp: new Date().toISOString()
  });
});
