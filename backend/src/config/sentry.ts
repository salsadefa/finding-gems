// ============================================
// Sentry Error Monitoring Configuration
// ============================================

import * as Sentry from '@sentry/node';
import { Application, ErrorRequestHandler } from 'express';

/**
 * Initialize Sentry for error monitoring
 * Only initializes if SENTRY_DSN is provided
 */
export const initSentry = (_app: Application): void => {
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

/**
 * Sentry error handler middleware
 * Should be placed before custom error handlers
 */
export const sentryErrorHandler: ErrorRequestHandler = Sentry.expressErrorHandler();

/**
 * Manually capture an exception
 */
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  }
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info'): void => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

export default Sentry;
