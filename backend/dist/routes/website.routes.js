"use strict";
// ============================================
// Website Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const website_controller_1 = require("../controllers/website.controller");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/websites
 * @desc    Get all websites with filters and pagination
 * @access  Public
 * @cache   60 seconds (public data)
 */
router.get('/', (0, cache_1.cacheMiddleware)(60000), auth_1.optionalAuth, website_controller_1.getWebsites);
/**
 * @route   GET /api/v1/websites/my-websites
 * @desc    Get current user's websites
 * @access  Private (Creator)
 */
router.get('/my-websites', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), website_controller_1.getMyWebsites);
/**
 * @route   POST /api/v1/websites
 * @desc    Create new website
 * @access  Private (Creator)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), website_controller_1.createWebsite);
/**
 * @route   GET /api/v1/websites/:id
 * @desc    Get website by ID or slug
 * @access  Public
 */
router.get('/:id', auth_1.optionalAuth, website_controller_1.getWebsiteById);
/**
 * @route   PATCH /api/v1/websites/:id
 * @desc    Update website
 * @access  Private (Creator/Admin)
 */
router.patch('/:id', auth_1.authenticate, website_controller_1.updateWebsite);
/**
 * @route   DELETE /api/v1/websites/:id
 * @desc    Delete website
 * @access  Private (Creator/Admin)
 */
router.delete('/:id', auth_1.authenticate, website_controller_1.deleteWebsite);
exports.default = router;
//# sourceMappingURL=website.routes.js.map