// ============================================
// Express App Configuration - Finding Gems Backend
// ============================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { morganStream } from './config/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import websiteRoutes from './routes/website.routes';
import categoryRoutes from './routes/category.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import reviewRoutes from './routes/review.routes';
import creatorApplicationRoutes from './routes/creator-application.routes';
import adminRoutes from './routes/admin.routes';
import creatorRoutes from './routes/creator.routes';
import reportRoutes from './routes/report.routes';
import billingRoutes from './routes/billing.routes';
import paymentRoutes from './routes/payment.routes';
import payoutRoutes from './routes/payout.routes';
import refundRoutes from './routes/refund.routes';

const app: Application = express();

// ============================================
// Security Middleware
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ============================================
// Rate Limiting
// ============================================

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (reduced for testing)
  max: 100, // 100 login attempts per window (increased for testing)
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
    timestamp: new Date().toISOString(),
  },
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ============================================
// Body Parsing & Logging
// ============================================

// JSON body parsing with size limit
app.use(express.json({ limit: '10mb' }));

// URL-encoded body parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
  });
});

// Readiness check (includes database check)
app.get('/ready', async (_req: Request, res: Response) => {
  // TODO: Add database health check
  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      timestamp: new Date().toISOString(),
    },
  });
});

// API version prefix
const API_PREFIX = '/api/v1';

// Auth routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// User routes
app.use(`${API_PREFIX}/users`, userRoutes);

// Website routes
app.use(`${API_PREFIX}/websites`, websiteRoutes);

// Category routes
app.use(`${API_PREFIX}/categories`, categoryRoutes);

// Bookmark routes
app.use(`${API_PREFIX}/bookmarks`, bookmarkRoutes);

// Review routes
app.use(`${API_PREFIX}/reviews`, reviewRoutes);

// Creator Application routes
app.use(`${API_PREFIX}/creator-applications`, creatorApplicationRoutes);

// Admin routes
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Creator routes
app.use(`${API_PREFIX}/creators`, creatorRoutes);

// Report routes
app.use(`${API_PREFIX}/reports`, reportRoutes);

// Billing routes
app.use(`${API_PREFIX}/billing`, billingRoutes);

// Payment routes
app.use(`${API_PREFIX}/payments`, paymentRoutes);

// Payout routes
app.use(`${API_PREFIX}/payouts`, payoutRoutes);

// Refund routes
app.use(`${API_PREFIX}/refunds`, refundRoutes);

// ============================================
// Error Handling
// ============================================

// Handle undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
