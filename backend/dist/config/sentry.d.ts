import * as Sentry from '@sentry/node';
import { Application, ErrorRequestHandler } from 'express';
/**
 * Initialize Sentry for error monitoring
 * Only initializes if SENTRY_DSN is provided
 */
export declare const initSentry: (_app: Application) => void;
/**
 * Sentry error handler middleware
 * Should be placed before custom error handlers
 */
export declare const sentryErrorHandler: ErrorRequestHandler;
/**
 * Manually capture an exception
 */
export declare const captureException: (error: Error, context?: Record<string, unknown>) => void;
/**
 * Manually capture a message
 */
export declare const captureMessage: (message: string, level?: Sentry.SeverityLevel) => void;
export default Sentry;
//# sourceMappingURL=sentry.d.ts.map