// ============================================
// Server Entry Point - Finding Gems Backend
// ============================================

import dotenv from 'dotenv';

// Load environment variables before other imports
dotenv.config();

import app from './app';
import { logger } from './config/logger';
import { testSupabaseConnection } from './config/supabase';

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      logger.warn('⚠️  Database not connected. Server will start but API calls may fail.');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔑 API documentation: http://localhost:${PORT}/api-docs (coming soon)`);
      if (!isConnected) {
        logger.info(`⚠️  Running in LIMITED MODE - Database not connected`);
      } else {
        logger.info(`✅ Connected to Supabase database`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(reason);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  logger.info('💤 Process terminated');
  process.exit(0);
});

// Start the server
startServer();
