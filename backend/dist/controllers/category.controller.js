"use strict";
// ============================================
// Category Controller - Finding Gems Backend  
// Using Supabase Client (IPv4 Compatible)
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
exports.getCategories = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const { data: categories, error } = await supabase_1.supabase
        .from('categories')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });
    if (error)
        throw error;
    res.status(200).json({
        success: true,
        data: { categories: categories || [] },
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Get category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
exports.getCategoryById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { data: category, error } = await supabase_1.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
    if (error || !category) {
        throw new errors_1.NotFoundError('Category not found');
    }
    res.status(200).json({
        success: true,
        data: { category },
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private (Admin)
 */
exports.createCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { name, slug, description, icon, color } = req.body;
    if (!name || !slug) {
        throw new errors_1.ValidationError('Name and slug are required');
    }
    const { data: category, error } = await supabase_1.supabase
        .from('categories')
        .insert({ name, slug, description, icon, color })
        .select()
        .single();
    if (error) {
        throw new errors_1.ValidationError('Failed to create category: ' + error.message);
    }
    res.status(201).json({
        success: true,
        data: { category },
        message: 'Category created successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Update category
 * @route   PATCH /api/v1/categories/:id
 * @access  Private (Admin)
 */
exports.updateCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const { data: category, error } = await supabase_1.supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    if (error || !category) {
        throw new errors_1.NotFoundError('Category not found');
    }
    res.status(200).json({
        success: true,
        data: { category },
        message: 'Category updated successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin)
 */
exports.deleteCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) {
        throw new errors_1.NotFoundError('Category not found');
    }
    res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=category.controller.js.map