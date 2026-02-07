// ============================================
// Express App Configuration - Finding Gems Backend
// ============================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { morganStream } from './config/logger';
import { initSentry, sentryErrorHandler } from './config/sentry';

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

// Initialize Sentry (must be done early)
initSentry(app);

// ============================================
// Performance Middleware (BEST PRACTICE)
// ============================================

// Gzip compression - reduces payload size by ~70%
// Best Practice: Enable compression for all responses
app.use(compression({
  level: 6, // Balanced compression (1-9, higher = more compression, slower)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

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
// SEC-007 Fix: Properly validate origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://finding-gems.vercel.app',
  'https://findinggems.id',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject all other origins
    return callback(new Error('Not allowed by CORS'), false);
  },
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

// Environment-aware auth rate limiting
// Relaxed in development for QA testing, strict in production
const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min (dev) / 15 min (prod)
  max: isDevelopment ? 20 : 5, // 20 attempts (dev) / 5 attempts (prod)
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: isDevelopment 
          ? 'Too many login attempts, please try again after 5 minutes'
          : 'Too many login attempts, please try again after 15 minutes',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ============================================
// Body Parsing & Logging
// ============================================

// JSON body parsing with size limit (1MB max)
app.use(express.json({ 
  limit: '1mb',
  verify: (_req, _res, buf) => {
    if (buf.length > 1024 * 1024) {
      const err = new Error('Payload too large') as any;
      err.status = 413;
      err.type = 'entity.too.large';
      throw err;
    }
  }
}));

// URL-encoded body parsing
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Handle payload too large errors
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the maximum allowed size of 1MB',
      },
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
});

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

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler);

// Global error handler
app.use(errorHandler);

export default app;
