// ============================================
// Tool Requests Admin Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { HideBody, PaginationParams } from '../types/request.types';

const sanitizePage = (page: unknown) => {
  const p = Math.floor(Number(page));
  return isNaN(p) || p < 1 ? 1 : p;
};

const sanitizeLimit = (limit: unknown) => {
  const l = Math.floor(Number(limit));
  return isNaN(l) || l < 1 ? 20 : Math.min(100, l);
};

const adminRequestSelect = `
  id, title, description, status, budgetMin:"budgetMin", budgetMax:"budgetMax", currency,
  responseCount:"responseCount", lastResponseAt:"lastResponseAt",
  isHidden:"isHidden", hiddenReason:"hiddenReason", hiddenAt:"hiddenAt",
  createdAt:"createdAt", updatedAt:"updatedAt",
  category:categories(id, name, slug, icon),
  buyer:users!tool_requests_buyerId_fkey(id, name, username, email, avatar)
`;

/**
 * @desc    List requests (admin)
 * @route   GET /api/v1/admin/requests
 * @access  Private (Admin)
 */
export const listToolRequestsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, status, hidden } = req.query as PaginationParams & {
    status?: 'open' | 'closed';
    hidden?: string;
  };

  const sanitizedPage = sanitizePage(page);
  const sanitizedLimit = sanitizeLimit(limit);
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  let q = supabase.from('tool_requests').select(adminRequestSelect, { count: 'exact' });
  if (status) q = q.eq('status', status);
  if (hidden === 'true') q = q.eq('isHidden', true);
  if (hidden === 'false') q = q.eq('isHidden', false);

  q = q.order('createdAt', { ascending: false });

  const { data, error, count } = await q.range(skip, skip + sanitizedLimit - 1);
  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / sanitizedLimit);

  res.status(200).json({
    success: true,
    data: {
      requests: data || [],
      pagination: {
        page: sanitizedPage,
        limit: sanitizedLimit,
        total,
        totalPages,
        hasNext: sanitizedPage < totalPages,
        hasPrev: sanitizedPage > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Hide a request (admin moderation)
 * @route   PATCH /api/v1/admin/requests/:id/hide
 * @access  Private (Admin)
 */
export const hideToolRequestAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as HideBody;
  const reason = body?.reason ? String(body.reason).trim() : null;

  if (reason && reason.length > 500) {
    throw new ValidationError('Reason too long', [{ field: 'reason', message: 'Max 500 characters' }]);
  }

  const { data: updated, error } = await supabase
    .from('tool_requests')
    .update({
      isHidden: true,
      hiddenReason: reason,
      hiddenAt: new Date().toISOString(),
      hiddenBy: req.user?.id || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select(adminRequestSelect)
    .maybeSingle();

  if (error) throw error;
  if (!updated) throw new NotFoundError('Request not found');

  res.status(200).json({
    success: true,
    data: { request: updated },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Unhide a request
 * @route   PATCH /api/v1/admin/requests/:id/unhide
 * @access  Private (Admin)
 */
export const unhideToolRequestAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: updated, error } = await supabase
    .from('tool_requests')
    .update({
      isHidden: false,
      hiddenReason: null,
      hiddenAt: null,
      hiddenBy: null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select(adminRequestSelect)
    .maybeSingle();

  if (error) throw error;
  if (!updated) throw new NotFoundError('Request not found');

  res.status(200).json({
    success: true,
    data: { request: updated },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Hide a response (admin moderation)
 * @route   PATCH /api/v1/admin/request-responses/:id/hide
 * @access  Private (Admin)
 */
export const hideToolRequestResponseAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as HideBody;
  const reason = body?.reason ? String(body.reason).trim() : null;

  const { data: updated, error } = await supabase
    .from('tool_request_responses')
    .update({
      isHidden: true,
      hiddenReason: reason,
      hiddenAt: new Date().toISOString(),
      hiddenBy: req.user?.id || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, requestId:"requestId", isHidden:"isHidden", hiddenReason:"hiddenReason"')
    .maybeSingle();

  if (error) throw error;
  if (!updated) throw new NotFoundError('Response not found');

  res.status(200).json({
    success: true,
    data: { response: updated },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Unhide a response
 * @route   PATCH /api/v1/admin/request-responses/:id/unhide
 * @access  Private (Admin)
 */
export const unhideToolRequestResponseAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: updated, error } = await supabase
    .from('tool_request_responses')
    .update({
      isHidden: false,
      hiddenReason: null,
      hiddenAt: null,
      hiddenBy: null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, requestId:"requestId", isHidden:"isHidden", hiddenReason:"hiddenReason"')
    .maybeSingle();

  if (error) throw error;
  if (!updated) throw new NotFoundError('Response not found');

  res.status(200).json({
    success: true,
    data: { response: updated },
    timestamp: new Date().toISOString(),
  });
});
