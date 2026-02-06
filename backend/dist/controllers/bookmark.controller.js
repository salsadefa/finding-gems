"use strict";
// ============================================
// Bookmark Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBookmark = exports.deleteBookmark = exports.createBookmark = exports.getMyBookmarks = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
/**
 * @desc    Get current user's bookmarks
 * @route   GET /api/v1/bookmarks
 * @access  Private
 */
exports.getMyBookmarks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { data: bookmarks, error } = await supabase_1.supabase
        .from('bookmarks')
        .select(`
      *,
      website:websites(
        id,
        name,
        slug,
        thumbnail,
        category:categories(name, slug),
        creator:users(name, username)
      )
    `)
        .eq('user_id', req.user.id)
        .order('createdAt', { ascending: false });
    if (error)
        throw error;
    res.status(200).json({
        success: true,
        data: { bookmarks: bookmarks || [] },
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Create bookmark
 * @route   POST /api/v1/bookmarks
 * @access  Private
 */
exports.createBookmark = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { websiteId } = req.body;
    if (!websiteId) {
        throw new errors_1.ValidationError('Website ID is required');
    }
    // Check if website exists
    const { data: website, error: websiteError } = await supabase_1.supabase
        .from('websites')
        .select('id, name, slug, thumbnail')
        .eq('id', websiteId)
        .single();
    if (websiteError || !website) {
        throw new errors_1.NotFoundError('Website not found');
    }
    // Check if already bookmarked
    const { data: existingBookmark } = await supabase_1.supabase
        .from('bookmarks')
        .select('id')
        .eq('website_id', websiteId)
        .eq('user_id', req.user.id)
        .single();
    if (existingBookmark) {
        throw new errors_1.ConflictError('Website already bookmarked');
    }
    // Create bookmark
    const { data: bookmark, error } = await supabase_1.supabase
        .from('bookmarks')
        .insert({
        website_id: websiteId,
        user_id: req.user.id,
    })
        .select(`
      *,
      website:websites(
        id,
        name,
        slug,
        thumbnail,
        category:categories(name, slug),
        creator:users(name, username)
      )
    `)
        .single();
    if (error)
        throw error;
    res.status(201).json({
        success: true,
        data: { bookmark },
        message: 'Website bookmarked successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Delete bookmark
 * @route   DELETE /api/v1/bookmarks/:websiteId
 * @access  Private
 */
exports.deleteBookmark = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { websiteId } = req.params;
    // Check if bookmark exists
    const { data: bookmark, error: findError } = await supabase_1.supabase
        .from('bookmarks')
        .select('id')
        .eq('website_id', websiteId)
        .eq('user_id', req.user.id)
        .single();
    if (findError || !bookmark) {
        throw new errors_1.NotFoundError('Bookmark not found');
    }
    // Delete bookmark
    const { error } = await supabase_1.supabase
        .from('bookmarks')
        .delete()
        .eq('website_id', websiteId)
        .eq('user_id', req.user.id);
    if (error)
        throw error;
    res.status(200).json({
        success: true,
        message: 'Bookmark removed successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Check if website is bookmarked
 * @route   GET /api/v1/bookmarks/check/:websiteId
 * @access  Private
 */
exports.checkBookmark = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { websiteId } = req.params;
    const { data: bookmark } = await supabase_1.supabase
        .from('bookmarks')
        .select('id')
        .eq('website_id', websiteId)
        .eq('user_id', req.user.id)
        .single();
    res.status(200).json({
        success: true,
        data: { isBookmarked: !!bookmark },
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=bookmark.controller.js.map