-- CreateEnum: NotificationType
CREATE TYPE "NotificationType" AS ENUM ('creator_application', 'new_order', 'new_report', 'refund_request', 'system_alert');

-- CreateTable: AdminNotification
CREATE TABLE "admin_notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_notifications_isRead_idx" ON "admin_notifications"("isRead");
CREATE INDEX "admin_notifications_type_idx" ON "admin_notifications"("type");
CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications"("createdAt");
