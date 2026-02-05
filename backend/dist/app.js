"use strict";
// ============================================
// Express App Configuration - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./config/logger");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const website_routes_1 = __importDefault(require("./routes/website.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const bookmark_routes_1 = __importDefault(require("./routes/bookmark.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const creator_application_routes_1 = __importDefault(require("./routes/creator-application.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const creator_routes_1 = __importDefault(require("./routes/creator.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const payout_routes_1 = __importDefault(require("./routes/payout.routes"));
const refund_routes_1 = __importDefault(require("./routes/refund.routes"));
const app = (0, express_1.default)();
// ============================================
// Security Middleware
// ============================================
// Helmet - Security headers
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// ============================================
// Rate Limiting
// ============================================
const apiLimiter = (0, express_rate_limit_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
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
app.use(express_1.default.json({ limit: '10mb' }));
// URL-encoded body parsing
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// HTTP request logging
app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
// ============================================
// API Routes
// ============================================
// Health check endpoint
app.get('/health', (_req, res) => {
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
app.get('/ready', async (_req, res) => {
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
app.use(`${API_PREFIX}/auth`, auth_routes_1.default);
// User routes
app.use(`${API_PREFIX}/users`, user_routes_1.default);
// Website routes
app.use(`${API_PREFIX}/websites`, website_routes_1.default);
// Category routes
app.use(`${API_PREFIX}/categories`, category_routes_1.default);
// Bookmark routes
app.use(`${API_PREFIX}/bookmarks`, bookmark_routes_1.default);
// Review routes
app.use(`${API_PREFIX}/reviews`, review_routes_1.default);
// Creator Application routes
app.use(`${API_PREFIX}/creator-applications`, creator_application_routes_1.default);
// Admin routes
app.use(`${API_PREFIX}/admin`, admin_routes_1.default);
// Creator routes
app.use(`${API_PREFIX}/creators`, creator_routes_1.default);
// Report routes
app.use(`${API_PREFIX}/reports`, report_routes_1.default);
// Billing routes
app.use(`${API_PREFIX}/billing`, billing_routes_1.default);
// Payment routes
app.use(`${API_PREFIX}/payments`, payment_routes_1.default);
// Payout routes
app.use(`${API_PREFIX}/payouts`, payout_routes_1.default);
// Refund routes
app.use(`${API_PREFIX}/refunds`, refund_routes_1.default);
// ============================================
// Error Handling
// ============================================
// Handle undefined routes
app.use(errorHandler_1.notFoundHandler);
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map