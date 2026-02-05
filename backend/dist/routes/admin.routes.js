"use strict";
// ============================================
// Admin Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Platform stats
router.get('/stats', admin_controller_1.getPlatformStats);
// Website management
router.get('/websites', admin_controller_1.getAllWebsitesAdmin);
router.get('/websites/pending', admin_controller_1.getPendingWebsites);
router.patch('/websites/:id/moderate', admin_controller_1.moderateWebsite);
// User management
router.get('/users', admin_controller_1.getAllUsers);
router.patch('/users/:id', admin_controller_1.updateUserAdmin);
// Report management
router.get('/reports', admin_controller_1.getReports);
router.patch('/reports/:id', admin_controller_1.handleReport);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map