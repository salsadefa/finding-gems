# DevOps Guide - Finding Gems

## 📋 Table of Contents
1. [Overview](#overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Docker Configuration](#docker-configuration)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Deployment Strategy](#deployment-strategy)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security & Compliance](#security--compliance)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling Strategy](#scaling-strategy)
10. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Overview

**Project:** Finding Gems  
**Architecture:** Microservices / Monolith (specify)  
**Hosting:** AWS / GCP / Azure / Vercel (specify)  
**Goal:** Production-ready deployment with automated CI/CD, monitoring, and zero-downtime deployments

---

## 🏗 Infrastructure Setup

### 1. **Environment Structure**
```
Environments:
├── Development (dev)
├── Staging (staging)
└── Production (prod)

Each environment has:
- Separate database
- Separate environment variables
- Separate deployment pipeline
- Isolated resources
```

### 2. **Infrastructure as Code (Terraform)**
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "finding-gems-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "finding-gems-vpc"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "finding-gems-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier             = "finding-gems-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_encrypted      = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  skip_final_snapshot = var.environment != "prod"
  
  tags = {
    Environment = var.environment
  }
}
```

### 3. **Domain & DNS Setup**
```hcl
# Route53 configuration
resource "aws_route53_zone" "main" {
  name = "findinggems.com"
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.findinggems.com"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# CloudFront for frontend
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-frontend"
  }
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }
}
```

---

## 🐳 Docker Configuration

### 1. **Multi-Stage Dockerfile (Backend)**
```dockerfile
# backend/Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript (if using TS)
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

### 2. **Dockerfile (Frontend - Next.js)**
```dockerfile
# frontend/Dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3. **Docker Compose (Development)**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: finding-gems-db
    environment:
      POSTGRES_DB: finding_gems_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: finding-gems-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: builder
    container_name: finding-gems-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/finding_gems_dev
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: deps
    container_name: finding-gems-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
    ports:
      - "3001:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

### 4. **Docker Best Practices**
```dockerfile
# ✅ Use specific versions
FROM node:18.17.0-alpine

# ✅ Combine RUN commands to reduce layers
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# ✅ Use .dockerignore
# .dockerignore
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.vscode
coverage
.next

# ✅ Multi-stage builds for smaller images
# ✅ Run as non-root user
# ✅ Add health checks
# ✅ Use build args for configuration
# ✅ Leverage build cache
```

---

## 🔄 CI/CD Pipeline

### 1. **GitHub Actions (Recommended)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: finding-gems

jobs:
  test:
    name: Run Tests
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
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build-and-push:
    name: Build and Push Docker Images
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build, tag, and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:backend-latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-latest
      
      - name: Build, tag, and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }} \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:frontend-latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-latest

  deploy:
    name: Deploy to ECS
    needs: build-and-push
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster finding-gems-cluster \
            --service finding-gems-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster finding-gems-cluster \
            --service finding-gems-frontend \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster finding-gems-cluster \
            --services finding-gems-backend finding-gems-frontend
      
      - name: Run database migrations
        run: |
          # Execute migrations in ECS task
          aws ecs run-task \
            --cluster finding-gems-cluster \
            --task-definition finding-gems-migration \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"

  notify:
    name: Notify Deployment Status
    needs: [test, build-and-push, deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to production ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 2. **GitLab CI/CD (Alternative)**
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

test:
  stage: test
  image: node:18-alpine
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:backend-$CI_COMMIT_SHA ./backend
    - docker push $CI_REGISTRY_IMAGE:backend-$CI_COMMIT_SHA
    - docker build -t $CI_REGISTRY_IMAGE:frontend-$CI_COMMIT_SHA ./frontend
    - docker push $CI_REGISTRY_IMAGE:frontend-$CI_COMMIT_SHA
  only:
    - main

deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $DEPLOY_WEBHOOK_URL
  environment:
    name: production
    url: https://findinggems.com
  only:
    - main
  when: manual
```

---

## 🚀 Deployment Strategy

### 1. **Zero-Downtime Deployment (Blue-Green)**
```yaml
# ECS Task Definition
{
  "family": "finding-gems-backend",
  "taskRoleArn": "arn:aws:iam::xxx:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::xxx:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "${ECR_REGISTRY}/finding-gems:backend-latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:prod/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:prod/jwt-secret"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/finding-gems-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 2. **Database Migration Strategy**
```bash
#!/bin/bash
# scripts/migrate.sh

set -e

echo "🔄 Starting database migration..."

# Backup database before migration
echo "📦 Creating database backup..."
pg_dump $DATABASE_URL > "backup-$(date +%Y%m%d-%H%M%S).sql"

# Run migrations
echo "🚀 Running Prisma migrations..."
npx prisma migrate deploy

# Verify migration
echo "✅ Verifying migration..."
npx prisma migrate status

echo "✨ Migration completed successfully!"
```

### 3. **Rollback Strategy**
```yaml
# scripts/rollback.sh
#!/bin/bash

set -e

ROLLBACK_VERSION=$1

if [ -z "$ROLLBACK_VERSION" ]; then
  echo "Error: Please provide rollback version"
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "⚠️  Rolling back to version: $ROLLBACK_VERSION"

# Update ECS service to previous task definition
aws ecs update-service \
  --cluster finding-gems-cluster \
  --service finding-gems-backend \
  --task-definition finding-gems-backend:$ROLLBACK_VERSION \
  --force-new-deployment

echo "🔄 Rollback initiated. Waiting for service to stabilize..."

aws ecs wait services-stable \
  --cluster finding-gems-cluster \
  --services finding-gems-backend

echo "✅ Rollback completed successfully!"
```

---

## 📊 Monitoring & Logging

### 1. **CloudWatch Setup**
```typescript
// backend/src/config/logger.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'finding-gems-backend',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new CloudWatchTransport({
    logGroupName: '/aws/ecs/finding-gems',
    logStreamName: `backend-${process.env.HOSTNAME}`,
    awsRegion: process.env.AWS_REGION,
  }));
}

export default logger;
```

### 2. **Application Performance Monitoring (APM)**
```typescript
// backend/src/config/apm.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    nodeProfilingIntegration(),
  ],
});

// Error tracking middleware
export const errorTracking = (err, req, res, next) => {
  Sentry.captureException(err, {
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
    tags: {
      path: req.path,
      method: req.method,
    },
  });
  next(err);
};
```

### 3. **Health Check Endpoints**
```typescript
// backend/src/routes/health.ts
import express from 'express';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';

const router = express.Router();

// Liveness probe - is the app running?
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness probe - is the app ready to serve traffic?
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    await redis.ping();
    
    res.status(200).json({
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
```

### 4. **Metrics Collection**
```typescript
// backend/src/middleware/metrics.ts
import promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Middleware to track metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  
  next();
};

// Metrics endpoint
export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
```

---

## 🔒 Security & Compliance

### 1. **Secrets Management**
```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name prod/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Access in application
const secret = await secretsManager
  .getSecretValue({ SecretId: 'prod/database-url' })
  .promise();
```

### 2. **Security Scanning**
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'finding-gems:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
```

---

## ✅ Implementation Checklist

### Phase 1: Infrastructure (Week 1)
- [ ] Set up AWS/GCP/Azure account
- [ ] Configure Terraform
- [ ] Provision VPC and networking
- [ ] Set up RDS/database
- [ ] Configure S3/storage
- [ ] Set up CloudFront/CDN
- [ ] Configure DNS

### Phase 2: Docker & CI/CD (Week 2)
- [ ] Create Dockerfiles
- [ ] Set up Docker Compose for local dev
- [ ] Configure GitHub Actions
- [ ] Set up ECR/Container Registry
- [ ] Create deployment pipeline
- [ ] Configure secrets management

### Phase 3: Deployment (Week 3)
- [ ] Deploy to staging
- [ ] Run migration scripts
- [ ] Configure load balancer
- [ ] Set up SSL certificates
- [ ] Test deployment
- [ ] Deploy to production

### Phase 4: Monitoring (Week 4)
- [ ] Set up CloudWatch/logging
- [ ] Configure Sentry/error tracking
- [ ] Create dashboards
- [ ] Set up alerts
- [ ] Configure uptime monitoring
- [ ] Test rollback procedures

---

## 📚 Resources

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Docker Production Guide](https://docs.docker.com/config/containers/resource_constraints/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Remember:** Infrastructure as Code, automate everything, monitor proactively!
