// ============================================
// User Notifications Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyNotifications,
  getMyUnreadCount,
  markAllMyNotificationsAsRead,
  markMyNotificationAsRead,
} from '../controllers/user-notification.controller';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.get('/count', authenticate, getMyUnreadCount);
router.patch('/:id/read', authenticate, markMyNotificationAsRead);
router.post('/read-all', authenticate, markAllMyNotificationsAsRead);

export default router;
