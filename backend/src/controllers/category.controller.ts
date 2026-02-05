// ============================================
// Category Controller - Finding Gems Backend  
// Using Supabase Client (IPv4 Compatible)
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ValidationError, NotFoundError } from '../utils/errors';

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('isActive', true)
    .order('name', { ascending: true });

  if (error) throw error;

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
export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !category) {
    throw new NotFoundError('Category not found');
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
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, slug, description, icon, color } = req.body;

  if (!name || !slug) {
    throw new ValidationError('Name and slug are required');
  }

  const { data: category, error } = await supabase
    .from('categories')
    .insert({ name, slug, description, icon, color })
    .select()
    .single();

  if (error) {
    throw new ValidationError('Failed to create category: ' + error.message);
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
export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: category, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !category) {
    throw new NotFoundError('Category not found');
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
export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new NotFoundError('Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    timestamp: new Date().toISOString(),
  });
});
