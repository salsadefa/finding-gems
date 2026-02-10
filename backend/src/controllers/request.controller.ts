// ============================================
// Tool Requests Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import type {
  CreateToolRequestBody,
  CreateToolRequestResponseBody,
  ToolRequestFilters,
  PaginationParams,
} from '../types/request.types';
import { createNotification } from '../services/notification.service';
import { createUserNotification } from '../services/user-notification.service';
import { sendToolRequestResponseEmail } from '../services/email.service';
import { getOrCreateThread } from '../services/message-thread.service';

const sanitizePage = (page: unknown) => {
  const p = Math.floor(Number(page));
  return isNaN(p) || p < 1 ? 1 : p;
};

const sanitizeLimit = (limit: unknown) => {
  const l = Math.floor(Number(limit));
  return isNaN(l) || l < 1 ? 20 : Math.min(100, l);
};

const requestListSelect = `
  id, title, description, status, budgetMin:"budgetMin", budgetMax:"budgetMax", currency,
  responseCount:"responseCount", lastResponseAt:"lastResponseAt",
  selectedResponseId:"selectedResponseId", solvedAt:"solvedAt", solvedBy:"solvedBy",
  createdAt:"createdAt", updatedAt:"updatedAt",
  category:categories(id, name, slug, icon),
  buyer:users!tool_requests_buyerId_fkey(id, name, username, avatar)
`;

const responseSelect = `
  id, message, createdAt:"createdAt",
  responder:users!tool_request_responses_responderId_fkey(id, name, username, avatar, role),
  website:websites(id, name, slug, thumbnail)
`;

function requireBuyer(req: Request) {
  if (!req.user) throw new ForbiddenError('Authentication required');
  if (req.user.role !== 'buyer') throw new ForbiddenError('Buyer access required');
}

function requireCreator(req: Request) {
  if (!req.user) throw new ForbiddenError('Authentication required');
  if (req.user.role !== 'creator') throw new ForbiddenError('Creator access required');
}

/**
 * @desc    List tool requests (public)
 * @route   GET /api/v1/requests
 * @access  Public (optional auth)
 */
export const listToolRequests = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, category, status, sortBy } = req.query as PaginationParams & ToolRequestFilters;
  const sanitizedPage = sanitizePage(page);
  const sanitizedLimit = sanitizeLimit(limit);
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  let q = supabase
    .from('tool_requests')
    .select(requestListSelect, { count: 'exact' })
    .eq('isHidden', false);

  // Public default: open requests only
  const requestedStatus = status || 'open';
  q = q.eq('status', requestedStatus);

  if (search) {
    const s = String(search).trim();
    if (s) {
      q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
    }
  }

  if (category) {
    const slug = String(category).trim();
    if (slug) {
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (catError) throw catError;
      if (!cat) {
        return res.status(200).json({
          success: true,
          data: {
            requests: [],
            pagination: {
              page: sanitizedPage,
              limit: sanitizedLimit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
          timestamp: new Date().toISOString(),
        });
      }
      q = q.eq('categoryId', cat.id);
    }
  }

  if (sortBy === 'recent_activity') {
    q = q.order('lastResponseAt', { ascending: false, nullsFirst: false });
    q = q.order('createdAt', { ascending: false });
  } else {
    q = q.order('createdAt', { ascending: false });
  }

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
 * @desc    Get request detail + responses
 * @route   GET /api/v1/requests/:id
 * @access  Public (optional auth)
 */
export const getToolRequestById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: requestRow, error } = await supabase
    .from('tool_requests')
    .select(requestListSelect + ', buyerId:"buyerId", isHidden:"isHidden"')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!requestRow) throw new NotFoundError('Request not found');

  // Public can only see non-hidden open requests.
  // Owner (buyer) can see their own even if closed; admin can see hidden.
  const isAdmin = req.user?.role === 'admin';
  const isOwner = req.user?.id && req.user.id === (requestRow as any).buyerId;
  const isPublicVisible = (requestRow as any).isHidden === false && (requestRow as any).status === 'open';

  if (!isPublicVisible && !isOwner && !isAdmin) {
    throw new NotFoundError('Request not found');
  }

  const { data: responses, error: respError } = await supabase
    .from('tool_request_responses')
    .select(responseSelect)
    .eq('requestId', id)
    .eq('isHidden', false)
    .order('createdAt', { ascending: true });

  if (respError) throw respError;

  res.status(200).json({
    success: true,
    data: {
      request: requestRow,
      responses: responses || [],
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create a new tool request
 * @route   POST /api/v1/requests
 * @access  Private (Buyer)
 */
export const createToolRequest = catchAsync(async (req: Request, res: Response) => {
  requireBuyer(req);

  const body = req.body as CreateToolRequestBody;
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();

  if (title.length < 8 || title.length > 120) {
    throw new ValidationError('Title must be 8-120 characters', [
      { field: 'title', message: 'Invalid length' },
    ]);
  }

  if (description.length < 60 || description.length > 4000) {
    throw new ValidationError('Description must be 60-4000 characters', [
      { field: 'description', message: 'Invalid length' },
    ]);
  }

  const budgetMin = body.budgetMin !== undefined ? Number(body.budgetMin) : null;
  const budgetMax = body.budgetMax !== undefined ? Number(body.budgetMax) : null;

  if (budgetMin !== null && (isNaN(budgetMin) || budgetMin < 0)) {
    throw new ValidationError('Invalid budgetMin', [{ field: 'budgetMin', message: 'Must be a positive number' }]);
  }
  if (budgetMax !== null && (isNaN(budgetMax) || budgetMax < 0)) {
    throw new ValidationError('Invalid budgetMax', [{ field: 'budgetMax', message: 'Must be a positive number' }]);
  }
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
    throw new ValidationError('budgetMin cannot exceed budgetMax', [
      { field: 'budgetMin', message: 'Too high' },
    ]);
  }

  const insertRow: Record<string, unknown> = {
    buyerId: req.user!.id,
    categoryId: body.categoryId || null,
    title,
    description,
    status: 'open',
    budgetMin,
    budgetMax,
    currency: (body.currency || 'IDR').toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('tool_requests')
    .insert(insertRow)
    .select(requestListSelect)
    .single();

  if (error) throw error;

  // Send admin notification (system_alert) for visibility.
  try {
    await createNotification({
      type: 'system_alert',
      title: 'New Tool Request',
      message: `${req.user!.name} posted a request: "${title}"`,
      entityType: 'tool_request',
      entityId: (created as any).id,
      metadata: {
        requestId: (created as any).id,
        buyerId: req.user!.id,
      },
    });
  } catch {
    // Do not fail the request if notifications fail
  }

  res.status(201).json({
    success: true,
    data: { request: created },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Close a request (buyer)
 * @route   PATCH /api/v1/requests/:id/close
 * @access  Private (Buyer)
 */
export const closeToolRequest = catchAsync(async (req: Request, res: Response) => {
  requireBuyer(req);
  const { id } = req.params;

  const { data: existing, error: findError } = await supabase
    .from('tool_requests')
    .select('id, buyerId:"buyerId", status')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existing) throw new NotFoundError('Request not found');
  if ((existing as any).buyerId !== req.user!.id) throw new ForbiddenError('You can only close your own request');
  if (existing.status !== 'open') {
    return res.status(200).json({
      success: true,
      data: { request: existing },
      timestamp: new Date().toISOString(),
    });
  }

  const { data: updated, error } = await supabase
    .from('tool_requests')
    .update({ status: 'closed', closedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select(requestListSelect)
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { request: updated },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Solve a request by selecting a response (buyer)
 * @route   PATCH /api/v1/requests/:id/solve
 * @access  Private (Buyer)
 */
export const solveToolRequest = catchAsync(async (req: Request, res: Response) => {
  requireBuyer(req);
  const { id } = req.params;
  const responseId = String(req.body?.responseId || '').trim();

  const { data: requestRow, error: findError } = await supabase
    .from('tool_requests')
    .select('id, buyerId:"buyerId", status')
    .eq('id', id)
    .maybeSingle();
  if (findError) throw findError;
  if (!requestRow) throw new NotFoundError('Request not found');
  if ((requestRow as any).buyerId !== req.user!.id) {
    throw new ForbiddenError('You can only solve your own request');
  }
  if ((requestRow as any).status !== 'open') {
    throw new ValidationError('Request is not open');
  }

  let respRow: any = null;
  if (responseId) {
    const { data, error: respError } = await supabase
      .from('tool_request_responses')
      .select('id, requestId:"requestId", responderId:"responderId", isHidden:"isHidden"')
      .eq('id', responseId)
      .maybeSingle();
    if (respError) throw respError;
    if (!data || (data as any).requestId !== id) {
      throw new ValidationError('Invalid responseId', [
        { field: 'responseId', message: 'Response not found for this request' },
      ]);
    }
    if ((data as any).isHidden) {
      throw new ValidationError('Cannot select a hidden response');
    }
    respRow = data;
  }

  const solvedAt = new Date().toISOString();
  const { data: updated, error: updError } = await supabase
    .from('tool_requests')
    .update({
      status: 'closed',
      closedAt: solvedAt,
      selectedResponseId: responseId || null,
      solvedAt,
      solvedBy: req.user!.id,
      updatedAt: solvedAt,
    })
    .eq('id', id)
    .select(requestListSelect)
    .single();
  if (updError) throw updError;

  // Notify the creator whose response was selected (only if selected)
  if (respRow?.responderId) {
    try {
      // Ensure a message thread exists between buyer and creator for this request.
      await getOrCreateThread({
        userAId: req.user!.id,
        userBId: respRow.responderId,
        requestId: id,
      });

      await createUserNotification({
        recipientId: respRow.responderId,
        type: 'request_solved',
        title: 'Your response was selected',
        message: 'A buyer selected your response on a tool request.',
        entityType: 'tool_request',
        entityId: id,
        metadata: {
          requestId: id,
          responseId: respRow.id,
          buyerId: req.user!.id,
        },
      });
    } catch {
      // ignore
    }
  }

  res.status(200).json({
    success: true,
    data: { request: updated },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create a response to a request
 * @route   POST /api/v1/requests/:id/responses
 * @access  Private (Creator)
 */
export const createToolRequestResponse = catchAsync(async (req: Request, res: Response) => {
  requireCreator(req);
  const { id } = req.params;
  const body = req.body as CreateToolRequestResponseBody;

  const message = String(body.message || '').trim();
  if (message.length < 20 || message.length > 4000) {
    throw new ValidationError('Message must be 20-4000 characters', [
      { field: 'message', message: 'Invalid length' },
    ]);
  }

  // Request must exist and be open and not hidden.
  const { data: requestRow, error: findError } = await supabase
    .from('tool_requests')
    .select('id, title, buyerId:"buyerId", status, isHidden:"isHidden"')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!requestRow) throw new NotFoundError('Request not found');
  if ((requestRow as any).isHidden) throw new NotFoundError('Request not found');
  if (requestRow.status !== 'open') throw new ValidationError('Request is closed');

  let websiteId: string | null = body.websiteId || null;
  if (!websiteId && body.websiteSlug) {
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, creatorId')
      .eq('slug', String(body.websiteSlug))
      .maybeSingle();
    if (websiteError) throw websiteError;
    if (!website) {
      throw new ValidationError('Invalid websiteSlug', [{ field: 'websiteSlug', message: 'Website not found' }]);
    }
    // Only allow attaching your own listing
    if ((website as any).creatorId && (website as any).creatorId !== req.user!.id) {
      throw new ForbiddenError('You can only attach your own listing');
    }
    websiteId = website.id;
  }

  if (websiteId) {
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, creatorId')
      .eq('id', websiteId)
      .maybeSingle();
    if (websiteError) throw websiteError;
    if (!website) {
      throw new ValidationError('Invalid websiteId', [{ field: 'websiteId', message: 'Website not found' }]);
    }
    if ((website as any).creatorId && (website as any).creatorId !== req.user!.id) {
      throw new ForbiddenError('You can only attach your own listing');
    }
  }

  const insertRow: Record<string, unknown> = {
    requestId: id,
    responderId: req.user!.id,
    message,
    websiteId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('tool_request_responses')
    .insert(insertRow)
    .select(responseSelect)
    .single();

  if (error) throw error;

  // Notify buyer (in-app + email best-effort)
  try {
    const buyerId = (requestRow as any).buyerId as string | undefined;
    if (buyerId) {
      // Ensure a message thread exists between buyer and creator for this request.
      await getOrCreateThread({
        userAId: buyerId,
        userBId: req.user!.id,
        requestId: id,
      });

      await createUserNotification({
        recipientId: buyerId,
        type: 'request_response',
        title: 'New response on your request',
        message: `${req.user!.name} responded to: "${(requestRow as any).title}"`,
        entityType: 'tool_request',
        entityId: id,
        metadata: {
          requestId: id,
          responseId: (created as any).id,
          responderId: req.user!.id,
        },
      });

      const { data: buyer } = await supabase
        .from('users')
        .select('email, name, emailVerified:"emailVerified"')
        .eq('id', buyerId)
        .maybeSingle();

      if (buyer?.email && buyer.emailVerified) {
        const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const requestUrl = `${appUrl}/requests/${id}`;
        await sendToolRequestResponseEmail(buyer.email, {
          buyerName: buyer.name || 'there',
          requestTitle: (requestRow as any).title,
          requestUrl,
          responderName: req.user!.name,
        });
      }
    }
  } catch {
    // Don't fail response creation if notification fails
  }

  res.status(201).json({
    success: true,
    data: { response: created },
    timestamp: new Date().toISOString(),
  });
});
