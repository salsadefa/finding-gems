import { Request, Response } from 'express';
/**
 * @desc    Get current user's bookmarks
 * @route   GET /api/v1/bookmarks
 * @access  Private
 */
export declare const getMyBookmarks: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Create bookmark
 * @route   POST /api/v1/bookmarks
 * @access  Private
 */
export declare const createBookmark: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Delete bookmark
 * @route   DELETE /api/v1/bookmarks/:websiteId
 * @access  Private
 */
export declare const deleteBookmark: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Check if website is bookmarked
 * @route   GET /api/v1/bookmarks/check/:websiteId
 * @access  Private
 */
export declare const checkBookmark: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=bookmark.controller.d.ts.map