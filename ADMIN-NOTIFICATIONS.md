# Admin Notification System Implementation

## Overview
Admin notification system for Finding Gems platform that notifies administrators about important events.

## Notification Types
| Type | Trigger | Priority |
|------|---------|----------|
| `creator_application` | New creator registration | High |
| `new_order` | Successful payment | Medium |
| `new_report` | New website report submitted | High |
| `refund_request` | New refund request | High |
| `system_alert` | System events | Variable |

## Implementation Status

### Backend ✅ Complete
1. **Database Schema** (`prisma/schema.prisma`)
   - Added `NotificationType` enum
   - Added `AdminNotification` model
   - Indexes on `isRead`, `type`, `createdAt`

2. **Notification Service** (`src/services/notification.service.ts`)
   - `createNotification()` - Generic notification creation
   - `notifyNewCreatorApplication()` - Trigger for new applications
   - `notifyNewOrder()` - Trigger for successful payments
   - `notifyNewReport()` - Trigger for new reports
   - `notifyRefundRequest()` - Trigger for refund requests
   - `notifySystemAlert()` - Generic system alerts
   - `getNotifications()` - Fetch with pagination
   - `markAsRead()` / `markAllAsRead()` - Mark read status
   - `cleanupOldNotifications()` - Cleanup old data

3. **Notification Controller** (`src/controllers/notification.controller.ts`)
   - GET `/admin/notifications` - List notifications
   - GET `/admin/notifications/count` - Unread count
   - PATCH `/admin/notifications/:id/read` - Mark one as read
   - POST `/admin/notifications/read-all` - Mark all as read
   - DELETE `/admin/notifications/cleanup` - Cleanup old

4. **Route Integration** (`src/routes/admin.routes.ts`)
   - Mounted under `/admin/notifications`
   - Protected by admin authentication

5. **Controller Integrations**
   - `creator-application.controller.ts` - triggers `notifyNewCreatorApplication`
   - `report.controller.ts` - triggers `notifyNewReport`
   - `payment.controller.ts` - triggers `notifyNewOrder`
   - `refund.controller.ts` - triggers `notifyRefundRequest`

### Frontend ✅ Complete
1. **API Hooks** (`lib/api/admin-notifications.ts`)
   - `useAdminNotifications()` - Fetch notifications with polling (30s)
   - `useUnreadNotificationCount()` - Badge count with polling (15s)
   - `useMarkNotificationAsRead()` - Mark single notification
   - `useMarkAllNotificationsAsRead()` - Mark all notifications
   - Helper functions for icons/colors/links

2. **UI Component** (`components/AdminNotificationDropdown.tsx`)
   - Bell icon with unread badge
   - Dropdown with notification list
   - Click to navigate to related entity
   - Mark as read functionality
   - Mark all as read button

## Database Migration
Run when database is available:
```sql
-- File: /prisma/migrations/manual_add_admin_notifications.sql

CREATE TYPE "NotificationType" AS ENUM ('creator_application', 'new_order', 'new_report', 'refund_request', 'system_alert');

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

CREATE INDEX "admin_notifications_isRead_idx" ON "admin_notifications"("isRead");
CREATE INDEX "admin_notifications_type_idx" ON "admin_notifications"("type");
CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications"("createdAt");
```

## Integration in Admin UI

Add the notification dropdown to admin header:

```tsx
import AdminNotificationDropdown from '@/components/AdminNotificationDropdown';

// In admin header/navbar
<AdminNotificationDropdown />
```

## Next Steps
1. [ ] Run database migration when DB is available
2. [ ] Add `AdminNotificationDropdown` to admin layout
3. [ ] Create NotificationsTab for full notification history
4. [ ] Add email forwarding for critical notifications (optional)
5. [ ] Add push notifications via service worker (optional)

## Testing
- Create creator application → Admin should see notification
- Complete purchase → Admin should see notification  
- Submit report → Admin should see notification
- Request refund → Admin should see notification
