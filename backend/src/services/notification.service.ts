// ============================================
// Notification Service - Finding Gems Backend
// ============================================

import { prisma } from '../config/database';
import { NotificationType, Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a new admin notification
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.adminNotification.create({
    data: {
      type: params.type,
      title: params.title,
      message: params.message,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ?? Prisma.JsonNull,
    },
  });
}

/**
 * Create notification for new creator application
 */
export async function notifyNewCreatorApplication(
  applicationId: string,
  applicantName: string,
  applicantEmail: string
) {
  return createNotification({
    type: 'creator_application',
    title: 'New Creator Application',
    message: `${applicantName} (${applicantEmail}) has submitted a creator application.`,
    entityType: 'application',
    entityId: applicationId,
    metadata: {
      applicantName,
      applicantEmail,
    },
  });
}

/**
 * Create notification for new order/purchase
 */
export async function notifyNewOrder(
  orderId: string,
  orderNumber: string,
  amount: number,
  buyerName: string,
  websiteName: string
) {
  return createNotification({
    type: 'new_order',
    title: 'New Purchase',
    message: `${buyerName} purchased "${websiteName}" for Rp ${amount.toLocaleString('id-ID')}.`,
    entityType: 'order',
    entityId: orderId,
    metadata: {
      orderNumber,
      amount,
      buyerName,
      websiteName,
    },
  });
}

/**
 * Create notification for new report/moderation
 */
export async function notifyNewReport(
  reportId: string,
  reporterName: string,
  websiteName: string,
  reason: string
) {
  return createNotification({
    type: 'new_report',
    title: 'New Moderation Report',
    message: `${reporterName} reported "${websiteName}" for: ${reason}.`,
    entityType: 'report',
    entityId: reportId,
    metadata: {
      reporterName,
      websiteName,
      reason,
    },
  });
}

/**
 * Create notification for refund request
 */
export async function notifyRefundRequest(
  refundId: string,
  orderNumber: string,
  amount: number,
  buyerName: string,
  reason: string
) {
  return createNotification({
    type: 'refund_request',
    title: 'New Refund Request',
    message: `${buyerName} requested a refund of Rp ${amount.toLocaleString('id-ID')} for order #${orderNumber}.`,
    entityType: 'refund',
    entityId: refundId,
    metadata: {
      orderNumber,
      amount,
      buyerName,
      reason,
    },
  });
}

/**
 * Create system alert notification
 */
export async function notifySystemAlert(
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  return createNotification({
    type: 'system_alert',
    title,
    message,
    metadata,
  });
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get notifications with pagination
 */
export async function getNotifications(params: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where = params.unreadOnly ? { isRead: false } : {};

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.adminNotification.count({ where }),
    prisma.adminNotification.count({ where: { isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  return prisma.adminNotification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  return prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Delete old notifications (cleanup - older than 30 days)
 */
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.adminNotification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      isRead: true,
    },
  });
}
