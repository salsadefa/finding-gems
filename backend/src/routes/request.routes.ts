// ============================================
// Tool Requests Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createToolRequest,
  createToolRequestResponse,
  closeToolRequest,
  solveToolRequest,
  getToolRequestById,
  listToolRequests,
} from '../controllers/request.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

const isDevelopment = process.env.NODE_ENV !== 'production';

const createLimiter = (opts: { windowMs: number; maxDev: number; maxProd: number; message: string }) => {
  return rateLimit({
    windowMs: opts.windowMs,
    max: isDevelopment ? opts.maxDev : opts.maxProd,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    },
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: opts.message,
        },
        timestamp: new Date().toISOString(),
      });
    },
  });
};

const createRequestLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  maxDev: 20,
  maxProd: 5,
  message: 'Too many requests created. Please wait a bit and try again.',
});

const createResponseLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  maxDev: 60,
  maxProd: 15,
  message: 'Too many responses sent. Please slow down and try again.',
});

// Public (optional auth)
router.get('/', optionalAuth, listToolRequests);
router.get('/:id', optionalAuth, getToolRequestById);

// Buyer actions
router.post('/', authenticate, authorize('buyer'), createRequestLimiter, createToolRequest);
router.patch('/:id/close', authenticate, authorize('buyer'), closeToolRequest);
router.patch('/:id/solve', authenticate, authorize('buyer'), solveToolRequest);

// Creator actions
router.post('/:id/responses', authenticate, authorize('creator'), createResponseLimiter, createToolRequestResponse);

export default router;
