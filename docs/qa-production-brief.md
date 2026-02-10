# QA Production Brief (Post-Deploy)

Target:

- Frontend: `https://findinggems.dualangka.com`
- Backend: `https://finding-gems-backend.onrender.com`

Notes:

- Do not paste secrets/tokens in reports.
- When testing admin-only features, use an admin account that is already `emailVerified=true`.

## 1) Vibe Code Challenge (CVC)

### Public

- Open `/challenges`
  - Expect hero cards with image (or gradient fallback), status pill, dates.
- Open an active challenge detail `/challenges/<slug>`
  - Expect cover hero, rules, approved submissions list.

### Admin

- `/admin?tab=challenges`
  - Create a challenge (title/slug/theme/rules/coverImage/startAt/endAt/status)
  - Approve/reject submissions
  - Feature/unfeature and save featured order

### Creator

- On `/challenges/<slug>` as creator:
  - Submit entry (title/description/demoUrl required)
  - Update submission while status is `submitted` and challenge window is active

## 2) Trust Signals

- `/admin?tab=websites`
  - Toggle `Reviewed`
  - Verify badge shows on website cards (`Reviewed`)
- `New` badge: website created within last 7 days
- `Popular` badge: website `viewCount >= 1000`

## 3) Messaging

### Entry points

- Listing detail `/website/<slug>`: "Message creator" button should open `/dashboard/messages?thread=...`
- Request detail `/requests/<id>`: buyer can message a responder from response card

### Core behaviors

- Threads list loads for authenticated buyer/creator
- Sending a message updates last message preview
- Unread count increments for recipient and clears when thread opened
- Non-participant cannot read a thread

## 4) Weekly Drops UI/UX

- Homepage: Weekly Drop section should be horizontal scroll carousel (with left/right buttons on desktop)
- `/admin?tab=drops`:
  - Can edit title/description inline
  - Items textarea auto-populates from current items
  - Current items list shows websiteName/slug + note

## 5) Performance (Spot-check)

- Lighthouse desktop:
  - `/` homepage
  - `/search`
  - `/website/<slug>`
- Report Perf score + LCP + CLS.
