// ============================================
// Admin Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getPlatformStats,
  getPendingWebsites,
  moderateWebsite,
  getAllUsers,
  updateUserAdmin,
  getReports,
  handleReport,
  getAllWebsitesAdmin,
} from '../controllers/admin.controller';
import {
  getDashboardOverview,
  getPaymentAnalytics,
  getUserAnalytics,
  getTopPerformers,
} from '../controllers/admin-dashboard.controller';
import {
  getAllCreatorApplications,
  getCreatorApplicationById,
  handleCreatorApplication,
  getCreatorApplicationStats,
} from '../controllers/creator-application-admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard & Analytics
router.get('/dashboard', getDashboardOverview);
router.get('/analytics/payments', getPaymentAnalytics);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/top', getTopPerformers);

// Platform stats (legacy)
router.get('/stats', getPlatformStats);

// Website management
router.get('/websites', getAllWebsitesAdmin);
router.get('/websites/pending', getPendingWebsites);
router.patch('/websites/:id/moderate', moderateWebsite);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserAdmin);

// Creator application management
router.get('/creator-applications/stats', getCreatorApplicationStats);
router.get('/creator-applications', getAllCreatorApplications);
router.get('/creator-applications/:id', getCreatorApplicationById);
router.patch('/creator-applications/:id', handleCreatorApplication);

// Report management
router.get('/reports', getReports);
router.patch('/reports/:id', handleReport);

export default router;
