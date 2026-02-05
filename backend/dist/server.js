"use strict";
// ============================================
// Server Entry Point - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before other imports
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./config/logger");
const supabase_1 = require("./config/supabase");
// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
    logger_1.logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
const PORT = process.env.PORT || 3001;
// Start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await (0, supabase_1.testSupabaseConnection)();
        if (!isConnected) {
            logger_1.logger.warn('⚠️  Database not connected. Server will start but API calls may fail.');
        }
        // Start Express server
        app_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`);
            logger_1.logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`🔑 API documentation: http://localhost:${PORT}/api-docs (coming soon)`);
            if (!isConnected) {
                logger_1.logger.info(`⚠️  Running in LIMITED MODE - Database not connected`);
            }
            else {
                logger_1.logger.info(`✅ Connected to Supabase database`);
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger_1.logger.error(error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger_1.logger.error(reason);
    process.exit(1);
});
// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
    logger_1.logger.info('👋 SIGTERM received. Shutting down gracefully...');
    logger_1.logger.info('💤 Process terminated');
    process.exit(0);
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map