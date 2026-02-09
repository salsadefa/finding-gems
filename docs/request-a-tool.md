# Request A Tool (Tool Requests) - v1

This feature lets buyers post what they need, and lets creators respond with solutions (optionally attaching one of their listings). It is designed to capture demand and turn it into creator leads.

## Roles

- Public/Visitor: can browse open + visible requests and read responses.
- Buyer: can create requests and close their own requests.
- Creator: can respond to open requests and optionally attach their own listing.
- Admin: can hide/unhide requests and responses (moderation).

## UX Flow

Buyer:
- Navigate to `/requests`
- Click `Post a request` -> `/requests/new`
- Submit -> redirected to `/requests/:id`
- Optionally close request when enough responses

Creator:
- Navigate to `/requests`
- Open a request detail page `/requests/:id`
- Write a response and optionally attach listing

Admin:
- Navigate to `/admin?tab=requests`
- Hide/unhide requests with an optional reason

## API Endpoints

Public:
- `GET /api/v1/requests`
  - Query: `page`, `limit`, `search`, `category` (slug), `status` (`open`/`closed`), `sortBy` (`newest`/`recent_activity`)
  - Note: public defaults to `status=open` and excludes hidden requests.
- `GET /api/v1/requests/:id`
  - Returns request + visible responses.
  - Public can only access if request is open and not hidden.

Buyer:
- `POST /api/v1/requests`
- `PATCH /api/v1/requests/:id/close`
- `PATCH /api/v1/requests/:id/solve` (body: `responseId`)

Creator:
- `POST /api/v1/requests/:id/responses`
  - Body: `message`, optional `websiteSlug` or `websiteId`
  - Restriction: only allows attaching a listing that belongs to the creator.

Admin:
- `GET /api/v1/admin/requests`
- `PATCH /api/v1/admin/requests/:id/hide`
- `PATCH /api/v1/admin/requests/:id/unhide`
- `PATCH /api/v1/admin/request-responses/:id/hide`
- `PATCH /api/v1/admin/request-responses/:id/unhide`

## Database

- `public.tool_requests`
- `public.tool_request_responses`
- `public.user_notifications`

Triggers:
- Insert response increments `tool_requests.responseCount` and updates `tool_requests.lastResponseAt`.

## Notifications

When a creator posts a response, the buyer receives an in-app notification.
When a buyer selects a response (solves a request), the selected creator receives an in-app notification.

Email notifications:
- If buyer email is verified, they also receive an email when a creator responds.

Endpoints:
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/count`
- `PATCH /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/read-all`
