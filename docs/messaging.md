# Messaging

This repo supports buyer-creator messaging.

## Database

Tables (public schema):

- `threads`
  - context: `website_id` (optional), `request_id` (optional)
  - last message fields: `last_message_at`, `last_message_preview`, `last_message_sender_id`
- `thread_participants`
  - unique `(thread_id, user_id)`
  - `unread_count`, `last_read_at`
- `messages`
  - `thread_id`, `sender_id`, `content`, `created_at`

RLS is disabled; backend uses service role.

Triggers:
- On message insert:
  - update `threads` last message fields
  - increment `unread_count` for other participants
  - reset sender unread_count to 0

## API

All routes require auth.

- `GET /api/v1/messages/threads`
- `POST /api/v1/messages/threads`
  - Body: `{ otherUserId, websiteId?, requestId? }`
- `GET /api/v1/messages/threads/:id/messages`
  - Query: `limit`, `before`
- `POST /api/v1/messages/threads/:id/messages`
  - Body: `{ content }`
- `POST /api/v1/messages/threads/:id/read`

## Frontend

- `/dashboard/messages` shows threads + messages.
