import { Request, Response } from 'express';
/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export declare const getCategories: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export declare const getCategoryById: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private (Admin)
 */
export declare const createCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update category
 * @route   PATCH /api/v1/categories/:id
 * @access  Private (Admin)
 */
export declare const updateCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin)
 */
export declare const deleteCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=category.controller.d.ts.map