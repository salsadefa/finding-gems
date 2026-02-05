"use strict";
// ============================================
// Database Configuration - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.testConnection = testConnection;
exports.disconnect = disconnect;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
// Test database connection
async function testConnection() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('Database connection established successfully');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database:', error);
        return false;
    }
}
// Graceful shutdown
async function disconnect() {
    await exports.prisma.$disconnect();
    logger_1.logger.info('Database connection closed');
}
//# sourceMappingURL=database.js.map