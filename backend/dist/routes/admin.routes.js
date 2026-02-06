"use strict";
// ============================================
// Admin Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_dashboard_controller_1 = require("../controllers/admin-dashboard.controller");
const creator_application_admin_controller_1 = require("../controllers/creator-application-admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Dashboard & Analytics
router.get('/dashboard', admin_dashboard_controller_1.getDashboardOverview);
router.get('/analytics/payments', admin_dashboard_controller_1.getPaymentAnalytics);
router.get('/analytics/users', admin_dashboard_controller_1.getUserAnalytics);
router.get('/analytics/top', admin_dashboard_controller_1.getTopPerformers);
// Platform stats (legacy)
router.get('/stats', admin_controller_1.getPlatformStats);
// Website management
router.get('/websites', admin_controller_1.getAllWebsitesAdmin);
router.get('/websites/pending', admin_controller_1.getPendingWebsites);
router.patch('/websites/:id/moderate', admin_controller_1.moderateWebsite);
// User management
router.get('/users', admin_controller_1.getAllUsers);
router.patch('/users/:id', admin_controller_1.updateUserAdmin);
// Creator application management
router.get('/creator-applications/stats', creator_application_admin_controller_1.getCreatorApplicationStats);
router.get('/creator-applications', creator_application_admin_controller_1.getAllCreatorApplications);
router.get('/creator-applications/:id', creator_application_admin_controller_1.getCreatorApplicationById);
router.patch('/creator-applications/:id', creator_application_admin_controller_1.handleCreatorApplication);
// Report management
router.get('/reports', admin_controller_1.getReports);
router.patch('/reports/:id', admin_controller_1.handleReport);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map