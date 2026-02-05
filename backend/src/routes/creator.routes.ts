// ============================================
// Creator Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getCreators,
  getCreatorProfile,
  getMyCreatorProfile,
  updateMyCreatorProfile,
  getCreatorStats,
} from '../controllers/creator.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, getCreators);

// Protected routes (must come before /:idOrUsername)
router.get('/me', authenticate, authorize('creator', 'admin'), getMyCreatorProfile);
router.patch('/me', authenticate, authorize('creator', 'admin'), updateMyCreatorProfile);
router.get('/me/stats', authenticate, authorize('creator', 'admin'), getCreatorStats);

// Public route with dynamic param (must come last)
router.get('/:idOrUsername', optionalAuth, getCreatorProfile);

export default router;
