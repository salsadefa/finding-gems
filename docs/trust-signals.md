# Trust Signals v1 (Reviewed + New)

This repo implements lightweight trust signals to improve conversion.

## Signals

- `Reviewed` (manual)
  - Admin marks a website as reviewed.
- `New` (automatic)
  - A website is considered new if `createdAt` is within the last 7 days.

## Database migration (Supabase)

Run this SQL on the production database (or via migration tooling):

```sql
alter table public.websites
  add column if not exists "isReviewed" boolean not null default false,
  add column if not exists "reviewedAt" timestamptz null,
  add column if not exists "reviewedBy" uuid null;

-- Optional: FK to users table (requires users.id type matches uuid)
-- alter table public.websites
--   add constraint websites_reviewedBy_fkey foreign key ("reviewedBy") references public.users(id);

create index if not exists websites_isReviewed_idx on public.websites ("isReviewed");
```

## API

- `PATCH /api/v1/admin/websites/:id/reviewed`
  - Body: `{ "isReviewed": true | false }`
  - Admin only.
