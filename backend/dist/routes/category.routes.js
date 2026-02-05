"use strict";
// ============================================
// Category Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', category_controller_1.getCategories);
/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID or slug
 * @access  Public
 */
router.get('/:id', category_controller_1.getCategoryById);
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