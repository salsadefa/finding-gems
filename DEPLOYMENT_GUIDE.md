# Finding Gems - CI/CD & Deployment Guide

## 📋 Overview

This document provides guidance for setting up CI/CD pipelines and deployment configurations for the Finding Gems project.

---

## 🔧 Environment Variables

### Backend Environment (.env)

```env
# ============================================
# Server Configuration
# ============================================
NODE_ENV=production
PORT=4000

# ============================================
# Database (Supabase)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ============================================
# CORS & Frontend
# ============================================
FRONTEND_URL=https://findinggems.id
APP_BASE_URL=https://findinggems.id

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Xendit Payment Gateway
# ============================================
XENDIT_SECRET_KEY=xnd_production_xxxxx
XENDIT_WEBHOOK_TOKEN=your-secure-webhook-verification-token
XENDIT_SUCCESS_URL=https://findinggems.id/checkout/success
XENDIT_FAILURE_URL=https://findinggems.id/checkout/failed

# ============================================
# Email (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@findinggems.id
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@findinggems.id
EMAIL_FROM_NAME=Finding Gems
```

### Frontend Environment (.env.local)

```env
# ============================================
# API Configuration
# ============================================
NEXT_PUBLIC_API_URL=https://api.findinggems.id/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.findinggems.id

# ============================================
# Supabase (for direct auth - optional)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# App URL
# ============================================
NEXT_PUBLIC_APP_URL=https://findinggems.id
```

---

## 🚀 GitHub Actions Workflows

### Backend CI/CD

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
      - '.github/workflows/backend.yml'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './backend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build TypeScript
        run: npm run build

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test

  deploy-production:
    needs: lint-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Option 1: Deploy to Railway
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: finding-gems-backend

      # Option 2: Deploy to Render
      # - name: Deploy to Render
      #   run: |
      #     curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

      # Option 3: Deploy to Docker/VPS
      # - name: Build and push Docker image
      #   uses: docker/build-push-action@v5
      #   with:
      #     context: ./backend
      #     push: true
      #     tags: your-registry/finding-gems-backend:latest
```

### Frontend CI/CD

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'public/**'
      - 'package.json'
      - '.github/workflows/frontend.yml'
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_APP_URL }}

  deploy-vercel:
    needs: lint-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migration

```yaml
# .github/workflows/database.yml
name: Database Migrations

on:
  workflow_dispatch:
    inputs:
      migration_file:
        description: 'Migration file to run'
        required: true
        type: choice
        options:
          - '001_init'
          - '002_billing_payouts_refunds'
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - 'staging'
          - 'production'

jobs:
  run-migration:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Migration
        run: |
          echo "Running migration: ${{ github.event.inputs.migration_file }}"
          # Use Supabase CLI or psql to run migration
          # supabase db push --file backend/prisma/migrations/${{ github.event.inputs.migration_file }}.sql
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

---

## 🐳 Docker Configuration

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file:
      - .env.local
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
```

---

## 🗄️ Database Migrations

### Running Migrations Manually

1. **Initial Schema (init.sql)**
   ```bash
   # Via Supabase Dashboard SQL Editor
   # Copy contents of backend/prisma/init.sql
   ```

2. **Billing & Payouts (002_billing_payouts_refunds.sql)**
   ```bash
   # Via Supabase Dashboard SQL Editor
   # Copy contents of backend/prisma/migrations/002_billing_payouts_refunds.sql
   ```

### Migration Checklist

- [ ] `init.sql` - Core tables (users, websites, categories, etc.)
- [ ] `002_billing_payouts_refunds.sql` - Billing system
- [ ] Verify RLS policies are applied
- [ ] Verify database functions exist:
  - `generate_order_number()`
  - `generate_invoice_number()`
  - `generate_payout_number()`
  - `generate_refund_number()`
  - `recalculate_creator_balance()`

---

## 🔐 Secrets Management

### GitHub Secrets Required

| Secret Name | Description |
|-------------|-------------|
| `RAILWAY_TOKEN` | Railway deployment token |
| `RENDER_DEPLOY_HOOK` | Render deployment webhook URL |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token |
| `SUPABASE_PROJECT_ID` | Supabase project ID |

### GitHub Variables (non-secret)

| Variable Name | Example Value |
|---------------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://api.findinggems.id/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://findinggems.id` |

---

## 📊 Monitoring & Logging

### Recommended Services

1. **Application Monitoring**
   - Sentry (error tracking)
   - LogRocket (frontend session replay)

2. **Infrastructure Monitoring**
   - Railway/Render built-in metrics
   - Uptime monitoring (UptimeRobot, Pingdom)

3. **Logging**
   - Winston (already configured in backend)
   - LogDNA or Papertrail for log aggregation

### Health Check Endpoints

- Backend: `GET /health` - Basic health check
- Backend: `GET /ready` - Readiness check (includes DB)

---

## 🚨 Deployment Checklist

### Pre-deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Dependencies installed (`npm install`)
- [ ] Build passes locally (`npm run build`)
- [ ] Tests pass (`npm test`)

### Post-deployment

- [ ] Verify health endpoints respond
- [ ] Test authentication flow
- [ ] Test payment flow (with Xendit test mode)
- [ ] Check email delivery
- [ ] Monitor error rates in Sentry/logs

---

**Last Updated:** 2026-02-05
