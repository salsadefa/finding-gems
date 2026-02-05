"use strict";
// ============================================
// Bookmark Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/bookmarks
 * @desc    Get current user's bookmarks
 * @access  Private
 */
router.get('/', auth_1.authenticate, bookmark_controller_1.getMyBookmarks);
/**
 * @route   POST /api/v1/bookmarks
 * @desc    Create bookmark
 * @access  Private
 */
router.post('/', auth_1.authenticate, bookmark_controller_1.createBookmark);
/**
 * @route   GET /api/v1/bookmarks/check/:websiteId
 * @desc    Check if website is bookmarked
 * @access  Private
 */
router.get('/check/:websiteId', auth_1.authenticate, bookmark_controller_1.checkBookmark);
/**
 * @route   DELETE /api/v1/bookmarks/:websiteId
 * @desc    Delete bookmark
 * @access  Private
 */
router.delete('/:websiteId', auth_1.authenticate, bookmark_controller_1.deleteBookmark);
exports.default = router;
//# sourceMappingURL=bookmark.routes.js.map