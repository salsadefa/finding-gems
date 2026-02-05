# ============================================
# Finding Gems - Backend Dockerfile
# ============================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY package*.json ./
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

EXPOSE 8000

ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "dist/server.js"]
