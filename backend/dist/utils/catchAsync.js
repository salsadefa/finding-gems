"use strict";
// ============================================
// Async Error Handler - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
/**
 * Wraps async route handlers to catch errors and pass them to next()
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }))
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=catchAsync.js.map