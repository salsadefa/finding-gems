// ============================================
// Logger Configuration - Finding Gems Backend
// ============================================

import winston from 'winston';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

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
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: 'finding-gems-api',
  },
  format: combine(
    timestamp(),
    errors({ stack: true })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        process.env.NODE_ENV === 'development' ? devFormat : json()
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(),
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: json(),
    })
  );
}

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
