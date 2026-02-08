// ============================================
// Notification Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  cleanupOldNotifications,
} from '../services/notification.service';

// ============================================
// GET NOTIFICATIONS
// ============================================

/**
 * Get admin notifications
 * GET /api/v1/admin/notifications
 */
export async function getAdminNotifications(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread_only === 'true';

    const result = await getNotifications({ page, limit, unreadOnly });

    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
}

// ============================================
// GET UNREAD COUNT
// ============================================

/**
 * Get unread notification count (for badge)
 * GET /api/v1/admin/notifications/count
 */
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const result = await getNotifications({ limit: 1 });

    return res.json({
      success: true,
      data: {
        unreadCount: result.unreadCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
}

// ============================================
// MARK AS READ
// ============================================

/**
 * Mark single notification as read
 * PATCH /api/v1/admin/notifications/:id/read
 */
export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const notification = await markAsRead(id);

    return res.json({
      success: true,
      data: { notification },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
}

/**
 * Mark all notifications as read
 * POST /api/v1/admin/notifications/read-all
 */
export async function markAllNotificationsAsRead(req: Request, res: Response) {
  try {
    const result = await markAllAsRead();

    return res.json({
      success: true,
      data: {
        updatedCount: result.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
}

// ============================================
// CLEANUP
// ============================================

/**
 * Delete old notifications (admin cleanup)
 * DELETE /api/v1/admin/notifications/cleanup
 */
export async function cleanupNotifications(req: Request, res: Response) {
  try {
    const daysOld = parseInt(req.query.days_old as string) || 30;

    const result = await cleanupOldNotifications(daysOld);

    return res.json({
      success: true,
      data: {
        deletedCount: result.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cleanup notifications',
    });
  }
}
