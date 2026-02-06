"use strict";
// ============================================
// Sentry Error Monitoring Configuration
// ============================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureMessage = exports.captureException = exports.sentryErrorHandler = exports.initSentry = void 0;
const Sentry = __importStar(require("@sentry/node"));
/**
 * Initialize Sentry for error monitoring
 * Only initializes if SENTRY_DSN is provided
 */
const initSentry = (_app) => {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
        console.log('[Sentry] No DSN provided, error monitoring disabled');
        return;
    }
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        // Performance monitoring - capture 10% of transactions
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        // Only send errors in production
        enabled: process.env.NODE_ENV === 'production',
        // Additional context
        release: process.env.npm_package_version || '1.0.0',
        serverName: 'finding-gems-backend',
        // Filter out sensitive data
        beforeSend(event) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }
            return event;
        },
    });
    console.log('[Sentry] Error monitoring initialized');
};
exports.initSentry = initSentry;
/**
 * Sentry error handler middleware
 * Should be placed before custom error handlers
 */
exports.sentryErrorHandler = Sentry.expressErrorHandler();
/**
 * Manually capture an exception
 */
const captureException = (error, context) => {
    if (process.env.SENTRY_DSN) {
        Sentry.withScope((scope) => {
            if (context) {
                scope.setExtras(context);
            }
            Sentry.captureException(error);
        });
    }
};
exports.captureException = captureException;
/**
 * Manually capture a message
 */
const captureMessage = (message, level = 'info') => {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, level);
    }
};
exports.captureMessage = captureMessage;
exports.default = Sentry;
//# sourceMappingURL=sentry.js.map