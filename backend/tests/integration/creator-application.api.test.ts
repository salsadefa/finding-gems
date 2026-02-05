// ============================================
// Creator Application API Integration Tests
// ============================================
// Note: These tests verify the full request/response cycle
// For controller logic, see unit tests in creator-application.controller.test.ts

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import {
  mockSupabaseData,
  resetMockData,
  createMockApplication,
} from '../__mocks__/supabase.mock';

// Mock supabase first
jest.mock('../../src/config/supabase', () => ({
  supabase: require('../__mocks__/supabase.mock').mockSupabase,
}));

// Mock auth middleware to bypass JWT validation
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const role = req.headers['x-test-role'] as string || 'buyer';
      const userId = req.headers['x-test-user-id'] as string || 'test-user-123';
      req.user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        role,
        isActive: true,
      };
    }
    next();
  },
  authorize: (..._roles: string[]) => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

// Now import routes after mocks are set up
import creatorApplicationRoutes from '../../src/routes/creator-application.routes';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/creator-applications', creatorApplicationRoutes);
  
  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: { message: err.message },
    });
  });
  
  return app;
};

describe('Creator Application API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    resetMockData();
  });

  // ==========================================
  // GET /api/v1/creator-applications/me
  // ==========================================
  describe('GET /api/v1/creator-applications/me', () => {
    it('should return 403 without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/creator-applications/me');

      expect(response.status).toBe(403);
    });

    it('should return 404 when no application exists', async () => {
      const response = await request(app)
        .get('/api/v1/creator-applications/me')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-user-id', 'user-without-app');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return user application when exists', async () => {
      const userId = 'user-with-app';
      mockSupabaseData.creator_applications.push(
        createMockApplication({ userId, status: 'pending' })
      );

      const response = await request(app)
        .get('/api/v1/creator-applications/me')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });
  });

  // ==========================================
  // POST /api/v1/creator-applications
  // ==========================================
  describe('POST /api/v1/creator-applications', () => {
    const validApplication = {
      bio: 'I am a passionate developer with more than 50 characters in my bio.',
      motivation: 'I want to share my tools with the community. I have extensive experience building web applications and believe I can contribute valuable resources to help others succeed in their projects.',
      professionalBackground: 'Software Engineer',
      expertise: ['web', 'mobile'],
      portfolioUrl: 'https://example.com/portfolio',
    };

    it('should return 403 without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .send(validApplication);

      expect(response.status).toBe(403);
    });

    it('should return 400 if bio is too short', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .send({ ...validApplication, bio: 'Short' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Bio must be at least 50');
    });

    it('should return 400 if motivation is too short', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .send({ ...validApplication, motivation: 'Short' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Motivation must be at least 100');
    });

    it('should return 400 if portfolio URL is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .send({ ...validApplication, portfolioUrl: 'not-a-url' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid URL');
    });

    it('should return 400 if user already has pending application', async () => {
      const userId = 'user-with-pending';
      mockSupabaseData.creator_applications.push(
        createMockApplication({ userId, status: 'pending' })
      );

      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-user-id', userId)
        .send(validApplication);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('pending application');
    });

    it('should return 400 if user is already a creator', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'creator')
        .send(validApplication);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('already a creator');
    });

    it('should create application with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-user-id', 'new-applicant')
        .send(validApplication);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.message).toContain('submitted successfully');
    });
  });

  // ==========================================
  // GET /api/v1/creator-applications (Admin)
  // ==========================================
  describe('GET /api/v1/creator-applications', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'buyer');

      expect(response.status).toBe(403);
    });

    // Skipped: requires advanced mock with join support
    it.skip('should return applications list for admin', async () => {
      mockSupabaseData.creator_applications.push(
        createMockApplication({ id: 'app-1' }),
        createMockApplication({ id: 'app-2' }),
        createMockApplication({ id: 'app-3' })
      );

      const response = await request(app)
        .get('/api/v1/creator-applications')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    // Skipped: requires advanced mock with join support
    it.skip('should filter by status', async () => {
      mockSupabaseData.creator_applications.push(
        createMockApplication({ id: 'app-1', status: 'pending' }),
        createMockApplication({ id: 'app-2', status: 'approved' }),
        createMockApplication({ id: 'app-3', status: 'pending' })
      );

      const response = await request(app)
        .get('/api/v1/creator-applications?status=pending')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  // ==========================================
  // POST /api/v1/creator-applications/:id/approve
  // ==========================================
  describe('POST /api/v1/creator-applications/:id/approve', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/some-id/approve')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'buyer');

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/invalid-id/approve')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent application', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/12345678-1234-1234-1234-123456789012/approve')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // POST /api/v1/creator-applications/:id/reject
  // ==========================================
  describe('POST /api/v1/creator-applications/:id/reject', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/some-id/reject')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'buyer');

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/not-uuid/reject')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin')
        .send({ reason: 'Not qualified' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent application', async () => {
      const response = await request(app)
        .post('/api/v1/creator-applications/12345678-1234-1234-1234-123456789012/reject')
        .set('Authorization', 'Bearer test-token')
        .set('x-test-role', 'admin')
        .send({ reason: 'Not qualified' });

      expect(response.status).toBe(404);
    });
  });
});
