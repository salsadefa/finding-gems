# Vibe Code Challenge

This feature runs timeboxed challenges to create a repeatable supply + marketing loop.

## Data model (Supabase)

- `public.challenges`
  - `status`: `upcoming` | `active` | `ended`
  - `startAt`, `endAt`: submission window
- `public.challenge_submissions`
  - `status`: `submitted` | `approved` | `rejected`
  - `isFeatured`, `featuredPosition`: featured placement ordering
  - Unique: `(challengeId, userId)` (one submission per creator per challenge)

RLS is disabled; the backend uses service role.

## API

Public:
- `GET /api/v1/challenges`
  - Query: `status`, `page`, `limit`
- `GET /api/v1/challenges/:slug`
  - Returns the challenge and approved submissions (featured pinned first)

Creator:
- `POST /api/v1/challenges/:slug/submissions`
  - Body: `{ title, description, demoUrl, repoUrl?, websiteId?, websiteSlug? }`
- `GET /api/v1/challenges/:slug/my-submission`
- `PATCH /api/v1/challenges/submissions/:id`
  - Only when submission status is `submitted` and challenge is `active` within the window.

Admin:
- `GET /api/v1/admin/challenges`
- `POST /api/v1/admin/challenges`
- `GET /api/v1/admin/challenges/:id`
- `PATCH /api/v1/admin/challenges/:id`
- `GET /api/v1/admin/challenges/:id/submissions`
- `PATCH /api/v1/admin/challenge-submissions/:id/review`
  - Body: `{ status: 'approved'|'rejected', adminNote?, isFeatured?, featuredPosition? }`
- `PUT /api/v1/admin/challenges/:id/featured`
  - Body: `{ submissionIds: string[] }` (clears previous featured, then sets positions)

## Frontend

- `/challenges` list
- `/challenges/[slug]` detail + creator submission form
- Homepage section shows the active challenge (if exists)
- Admin tab: `/admin?tab=challenges`
