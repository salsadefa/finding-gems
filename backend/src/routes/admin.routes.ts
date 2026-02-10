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
  setWebsiteReviewed,
} from '../controllers/admin.controller';
import {
  listChallengesAdmin,
  createChallengeAdmin,
  getChallengeAdmin,
  updateChallengeAdmin,
  listChallengeSubmissionsAdmin,
  reviewChallengeSubmissionAdmin,
  setFeaturedOrderAdmin,
} from '../controllers/challenge-admin.controller';
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
import {
  getAdminNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  cleanupNotifications,
} from '../controllers/notification.controller';
import {
  createDropAdmin,
  getDropAdmin,
  listDropsAdmin,
  publishDropAdmin,
  setDropItemsAdmin,
  updateDropAdmin,
} from '../controllers/drop-admin.controller';
import {
  hideToolRequestAdmin,
  hideToolRequestResponseAdmin,
  listToolRequestsAdmin,
  unhideToolRequestAdmin,
  unhideToolRequestResponseAdmin,
} from '../controllers/request-admin.controller';
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
router.patch('/websites/:id/reviewed', setWebsiteReviewed);

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

// Notification management
router.get('/notifications', getAdminNotifications);
router.get('/notifications/count', getUnreadCount);
router.post('/notifications/read-all', markAllNotificationsAsRead);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.delete('/notifications/cleanup', cleanupNotifications);

// Weekly Drops management
router.get('/drops', listDropsAdmin);
router.post('/drops', createDropAdmin);
router.get('/drops/:id', getDropAdmin);
router.patch('/drops/:id', updateDropAdmin);
router.put('/drops/:id/items', setDropItemsAdmin);
router.post('/drops/:id/publish', publishDropAdmin);

// Tool Requests moderation
router.get('/requests', listToolRequestsAdmin);
router.patch('/requests/:id/hide', hideToolRequestAdmin);
router.patch('/requests/:id/unhide', unhideToolRequestAdmin);
router.patch('/request-responses/:id/hide', hideToolRequestResponseAdmin);
router.patch('/request-responses/:id/unhide', unhideToolRequestResponseAdmin);

// Vibe Code Challenge
router.get('/challenges', listChallengesAdmin);
router.post('/challenges', createChallengeAdmin);
router.get('/challenges/:id', getChallengeAdmin);
router.patch('/challenges/:id', updateChallengeAdmin);
router.get('/challenges/:id/submissions', listChallengeSubmissionsAdmin);
router.patch('/challenge-submissions/:id/review', reviewChallengeSubmissionAdmin);
router.put('/challenges/:id/featured', setFeaturedOrderAdmin);

export default router;
