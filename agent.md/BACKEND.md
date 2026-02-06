# Backend Development Guide - Finding Gems

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [API Design Standards](#api-design-standards)
5. [Error Handling & Validation](#error-handling--validation)
6. [Security Best Practices](#security-best-practices)
7. [Testing Strategy](#testing-strategy)
8. [Database Schema & Models](#database-schema--models)
9. [Implementation Checklist](#implementation-checklist)
10. [Progress Tracking](#progress-tracking)

---

## 🎯 Project Overview

**Project Name:** Finding Gems  
**Description:** [Add your project description]  
**Goal:** Replace all mock data with fully functional backend endpoints, implementing industry-standard SaaS practices with 100% error handling coverage.

---

## 🛠 Technology Stack

### Core Technologies
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** [PostgreSQL/MongoDB/MySQL - specify your choice]
- **ORM/ODM:** [Prisma/Mongoose/TypeORM - specify]
- **Authentication:** JWT + [Auth0/Clerk/Supabase Auth]
- **Validation:** Zod / Joi / express-validator
- **Documentation:** Swagger/OpenAPI 3.0

### Essential Packages
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.0.3",
    "zod": "^3.22.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

---

## 🏗 Architecture & Design Patterns

### Folder Structure (Industry Standard)
```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   ├── env.js
│   │   └── swagger.js
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── [resource].controller.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   └── [Resource].js
│   ├── routes/          # Route definitions
│   │   ├── v1/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── services/        # Business logic
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   └── [resource].service.js
│   ├── utils/           # Helper functions
│   │   ├── logger.js
│   │   ├── responses.js
│   │   └── validators.js
│   ├── types/           # TypeScript types/interfaces
│   │   └── index.ts
│   ├── tests/           # Test files
│   │   ├── unit/
│   │   └── integration/
│   └── app.js           # Express app setup
├── .env.example
├── .gitignore
├── package.json
└── server.js            # Entry point
```

### Design Patterns to Follow

#### 1. **MVC Pattern** (Model-View-Controller)
- **Models:** Database schemas and data logic
- **Controllers:** Handle HTTP requests/responses
- **Services:** Business logic layer (between controller and model)

#### 2. **Repository Pattern**
```javascript
// Example: user.repository.js
class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }
  
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async create(userData) {
    return await User.create(userData);
  }
}
```

#### 3. **Service Layer Pattern**
```javascript
// Example: user.service.js
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async getUserProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }
  
  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
```

---

## 🌐 API Design Standards

### RESTful API Principles

#### 1. **Resource Naming**
```
✅ GOOD:
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

❌ BAD:
GET    /api/v1/getAllUsers
POST   /api/v1/createUser
GET    /api/v1/user/delete/:id
```

#### 2. **HTTP Methods Usage**
- **GET:** Retrieve resources (idempotent, no body)
- **POST:** Create new resources
- **PUT:** Replace entire resource
- **PATCH:** Partial update
- **DELETE:** Remove resource

#### 3. **URL Structure**
```
Pattern: /api/{version}/{resource}/{id}/{sub-resource}

Examples:
/api/v1/users/123/posts
/api/v1/posts/456/comments
/api/v1/workspaces/789/members
```

#### 4. **Query Parameters**
```javascript
// Filtering
GET /api/v1/users?role=admin&status=active

// Sorting
GET /api/v1/posts?sort=-createdAt,title

// Pagination
GET /api/v1/posts?page=2&limit=20

// Field Selection
GET /api/v1/users?fields=id,name,email
```

#### 5. **Response Structure**
```javascript
// Success Response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User retrieved successfully",
  "timestamp": "2025-01-31T10:00:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "timestamp": "2025-01-31T10:00:00Z"
}

// List Response (with pagination)
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-01-31T10:00:00Z"
}
```

#### 6. **HTTP Status Codes**
```javascript
// Success Codes
200 - OK (GET, PUT, PATCH successful)
201 - Created (POST successful)
204 - No Content (DELETE successful)

// Client Error Codes
400 - Bad Request (validation failed)
401 - Unauthorized (not authenticated)
403 - Forbidden (authenticated but not authorized)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate resource)
422 - Unprocessable Entity (semantic errors)
429 - Too Many Requests (rate limit exceeded)

// Server Error Codes
500 - Internal Server Error
502 - Bad Gateway
503 - Service Unavailable
```

---

## ⚠️ Error Handling & Validation

### 1. **Custom Error Classes**
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.code = 'VALIDATION_ERROR';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.code = 'NOT_FOUND';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.code = 'UNAUTHORIZED';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.code = 'FORBIDDEN';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.code = 'CONFLICT';
  }
}
```

### 2. **Global Error Handler Middleware**
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message,
        stack: err.stack,
        details: err.errors || []
      },
      timestamp: new Date().toISOString()
    });
  }

  // Production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        details: err.errors || []
      },
      timestamp: new Date().toISOString()
    });
  }

  // Log error but send generic message
  console.error('ERROR 💥:', err);
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    },
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, catchAsync };
```

### 3. **Input Validation (Zod Example)**
```javascript
// utils/validators.js
const { z } = require('zod');

const userSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['user', 'admin']).optional().default('user')
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError('Validation failed', errors);
      }
      next(error);
    }
  };
};

module.exports = { userSchema, validate };
```

### 4. **Edge Cases to Handle**
```javascript
// ✅ Must handle these scenarios:

// 1. Empty request body
if (!req.body || Object.keys(req.body).length === 0) {
  throw new ValidationError('Request body cannot be empty');
}

// 2. Invalid ID format
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new ValidationError('Invalid ID format');
}

// 3. Duplicate resources
const existingUser = await User.findOne({ email });
if (existingUser) {
  throw new ConflictError('User with this email already exists');
}

// 4. Resource not found
const user = await User.findById(id);
if (!user) {
  throw new NotFoundError('User not found');
}

// 5. Unauthorized access
if (user.id !== req.user.id && req.user.role !== 'admin') {
  throw new ForbiddenError('You do not have permission to access this resource');
}

// 6. Database connection errors
try {
  await db.connect();
} catch (error) {
  throw new AppError('Database connection failed', 503);
}

// 7. File upload errors
if (!req.file) {
  throw new ValidationError('File is required');
}

if (req.file.size > MAX_FILE_SIZE) {
  throw new ValidationError('File size exceeds limit');
}

// 8. Third-party API failures
try {
  const response = await externalAPI.call();
} catch (error) {
  throw new AppError('External service unavailable', 503);
}
```

---

## 🔒 Security Best Practices

### 1. **Authentication & Authorization**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = catchAsync(async (req, res, next) => {
  // 1. Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }
  
  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }
    
    // 4. Check if user changed password after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      throw new UnauthorizedError('Password recently changed. Please login again');
    }
    
    // 5. Grant access
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

### 2. **Rate Limiting**
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter };
```

### 3. **Security Headers (Helmet)**
```javascript
// app.js
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet()); // Sets various HTTP headers for security

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Additional security
app.use(express.json({ limit: '10kb' })); // Body limit
app.disable('x-powered-by'); // Hide Express
```

### 4. **Data Sanitization**
```javascript
// Prevent NoSQL injection
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// Prevent XSS
const xss = require('xss-clean');
app.use(xss());

// Prevent parameter pollution
const hpp = require('hpp');
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit']
}));
```

---

## 🧪 Testing Strategy

### 1. **Unit Tests**
```javascript
// tests/unit/user.service.test.js
describe('UserService', () => {
  describe('getUserProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        password: 'hashedpassword'
      };
      
      userRepository.findById = jest.fn().mockResolvedValue(mockUser);
      
      const result = await userService.getUserProfile('123');
      
      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe('John');
    });
    
    it('should throw NotFoundError if user does not exist', async () => {
      userRepository.findById = jest.fn().mockResolvedValue(null);
      
      await expect(userService.getUserProfile('999'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
```

### 2. **Integration Tests**
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/v1/auth/register', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
  
  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### 3. **Test Coverage Goals**
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All critical paths
- **E2E Tests:** Happy paths and major user flows

---

## 🗄 Database Schema & Models

### Example Schema (Prisma)
```prisma
// schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  password      String
  role          Role     @default(USER)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  posts         Post[]
  profile       Profile?
  
  @@index([email])
}

model Profile {
  id        String   @id @default(cuid())
  bio       String?
  avatar    String?
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
}

enum Role {
  USER
  ADMIN
}
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure
- [ ] Configure environment variables
- [ ] Set up database connection
- [ ] Create custom error classes
- [ ] Implement global error handler
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure CORS and security headers

### Phase 2: Authentication (Week 1-2)
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Password reset flow
- [ ] Email verification
- [ ] JWT token generation/validation
- [ ] Refresh token mechanism
- [ ] Rate limiting for auth routes

### Phase 3: Core Resources (Week 2-3)
- [ ] Define all database models
- [ ] Create CRUD endpoints for each resource
- [ ] Implement input validation
- [ ] Add pagination/filtering/sorting
- [ ] Implement authorization checks
- [ ] Add field-level permissions

### Phase 4: Advanced Features (Week 3-4)
- [ ] File upload handling
- [ ] Email service integration
- [ ] Webhook endpoints
- [ ] Search functionality
- [ ] Data export features
- [ ] Audit logging

### Phase 5: Testing & Documentation (Week 4)
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Set up Swagger documentation
- [ ] Create API usage examples
- [ ] Document all error codes
- [ ] Create deployment guide

### Phase 6: Optimization (Week 5)
- [ ] Add database indexes
- [ ] Implement caching (Redis)
- [ ] Optimize N+1 queries
- [ ] Add API monitoring
- [ ] Performance testing
- [ ] Security audit

---

## 📊 Progress Tracking

### Current Status
```
[TO BE FILLED BY DEVELOPER]

Completed:
- ✅ [Feature 1]
- ✅ [Feature 2]

In Progress:
- 🔄 [Feature 3]

Todo:
- ⏳ [Feature 4]
- ⏳ [Feature 5]
```

### API Endpoints Status
| Endpoint | Method | Status | Tests | Docs |
|----------|--------|--------|-------|------|
| `/auth/register` | POST | ✅ | ✅ | ✅ |
| `/auth/login` | POST | ✅ | ✅ | ✅ |
| `/users` | GET | 🔄 | ⏳ | ⏳ |
| `/users/:id` | GET | ⏳ | ⏳ | ⏳ |

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate API documentation
npm run docs

# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Additional Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [REST API Design Guide](https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## 📝 Notes for Agent

When implementing the backend, follow this systematic approach:

1. **Start with the foundation** - error handling, logging, middleware
2. **Build authentication first** - it's required for most other features
3. **One resource at a time** - complete CRUD + tests + docs before moving on
4. **Test as you go** - don't accumulate testing debt
5. **Document immediately** - Swagger annotations while writing routes
6. **Handle all edge cases** - check the error handling section for complete list
7. **Security from day one** - don't retrofit security later

**Remember:** The goal is 100% error handling coverage and production-ready code, not just making it work.
