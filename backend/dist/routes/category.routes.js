"use strict";
// ============================================
// Category Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 * @cache   5 minutes (rarely changes)
 */
router.get('/', (0, cache_1.cacheMiddleware)(300000), category_controller_1.getCategories);
/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID or slug
 * @access  Public
 * @cache   5 minutes
 */
router.get('/:id', (0, cache_1.cacheMiddleware)(300000), category_controller_1.getCategoryById);
/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), category_controller_1.createCategory);
/**
 * @route   PATCH /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), category_controller_1.updateCategory);
/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map