// ============================================
// User Notification Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import {
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
} from '../services/user-notification.service';

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread_only === 'true';

    const result = await getUserNotifications({
      recipientId: req.user.id,
      page,
      limit,
      unreadOnly,
    });

    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
}

export async function getMyUnreadCount(req: Request, res: Response) {
  try {
    const result = await getUserNotifications({ recipientId: req.user.id, limit: 1 });
    return res.json({
      success: true,
      data: { unreadCount: result.unreadCount },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user unread count:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
}

export async function markMyNotificationAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const notification = await markUserNotificationAsRead({ recipientId: req.user.id, id });
    return res.json({
      success: true,
      data: { notification },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking user notification as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
}

export async function markAllMyNotificationsAsRead(req: Request, res: Response) {
  try {
    const result = await markAllUserNotificationsAsRead({ recipientId: req.user.id });
    return res.json({
      success: true,
      data: { updatedCount: result.count },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking all user notifications as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
}
