import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyApplication,
  createApplication,
  getApplications,
  approveApplication,
  rejectApplication,
} from '../controllers/creator-application.controller';

const router = Router();

// User routes (authenticated)
router.get('/me', authenticate, getMyApplication);
router.post('/', authenticate, createApplication);

// Admin routes
router.get('/', authenticate, getApplications);
router.post('/:id/approve', authenticate, approveApplication);
router.post('/:id/reject', authenticate, rejectApplication);

export default router;
