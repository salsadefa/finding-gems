# ============================================
# Finding Gems - Backend Dockerfile
# ============================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 10000

# PORT will be set by Render at runtime
# Default fallback is handled in src/server.ts (3001)

# Health check - Render will check via HTTP on the dynamic port
# We don't need HEALTHCHECK in Dockerfile, Render has its own health checks

CMD ["node", "dist/server.js"]
