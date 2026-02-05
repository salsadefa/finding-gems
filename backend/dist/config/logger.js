"use strict";
// ============================================
// Logger Configuration - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, errors, printf, colorize } = winston_1.default.format;
// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Determine log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    defaultMeta: {
        service: 'finding-gems-api',
    },
    format: combine(timestamp(), errors({ stack: true })),
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), process.env.NODE_ENV === 'development' ? devFormat : json()),
        }),
    ],
});
// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: json(),
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: json(),
    }));
}
// Stream for Morgan HTTP logging
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
//# sourceMappingURL=logger.js.map