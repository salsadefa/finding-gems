"use strict";
// ============================================
// Bookmark Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBookmark = exports.deleteBookmark = exports.createBookmark = exports.getMyBookmarks = void 0;
const database_1 = require("../config/database");
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
    const bookmarks = await database_1.prisma.bookmark.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            website: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                    category: {
                        select: {
                            name: true,
                            slug: true,
                        },
                    },
                    creator: {
                        select: {
                            name: true,
                            username: true,
                        },
                    },
                },
            },
        },
    });
    res.status(200).json({
        success: true,
        data: { bookmarks },
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
    const website = await database_1.prisma.website.findUnique({
        where: { id: websiteId },
    });
    if (!website) {
        throw new errors_1.NotFoundError('Website not found');
    }
    // Check if already bookmarked
    const existingBookmark = await database_1.prisma.bookmark.findUnique({
        where: {
            websiteId_userId: {
                websiteId,
                userId: req.user.id,
            },
        },
    });
    if (existingBookmark) {
        throw new errors_1.ConflictError('Website already bookmarked');
    }
    const bookmark = await database_1.prisma.bookmark.create({
        data: {
            websiteId,
            userId: req.user.id,
        },
        include: {
            website: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                    category: {
                        select: {
                            name: true,
                            slug: true,
                        },
                    },
                    creator: {
                        select: {
                            name: true,
                            username: true,
                        },
                    },
                },
            },
        },
    });
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
    const bookmark = await database_1.prisma.bookmark.findUnique({
        where: {
            websiteId_userId: {
                websiteId,
                userId: req.user.id,
            },
        },
    });
    if (!bookmark) {
        throw new errors_1.NotFoundError('Bookmark not found');
    }
    await database_1.prisma.bookmark.delete({
        where: {
            websiteId_userId: {
                websiteId,
                userId: req.user.id,
            },
        },
    });
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
    const bookmark = await database_1.prisma.bookmark.findUnique({
        where: {
            websiteId_userId: {
                websiteId,
                userId: req.user.id,
            },
        },
    });
    res.status(200).json({
        success: true,
        data: { isBookmarked: !!bookmark },
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=bookmark.controller.js.map