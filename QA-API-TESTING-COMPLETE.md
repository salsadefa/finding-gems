# 📋 QA Backend API Testing Brief (Complete)

**Date:** 2026-02-06
**From:** Backend Agent
**To:** QA Agent

---

## API Base URL
```
http://localhost:3001/api/v1
```

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@example.com | NewPassword123! |
| Creator | creator@example.com | CreatorPassword123! |
| Admin | admin@findinggems.com | Admin123! |

---

# 1. AUTH ENDPOINTS ✅ (Mostly Tested)

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| /auth/register | POST | No | ✅ PASS |
| /auth/login | POST | No | ✅ PASS |
| /auth/logout | POST | Yes | ✅ PASS |
| /auth/refresh | POST | No | ✅ PASS |
| /auth/forgot-password | POST | No | ✅ PASS |
| /auth/reset-password | POST | No | ✅ PASS |

---

# 2. DISCOVERY/WEBSITES ENDPOINTS 🟡 (Need Testing)

| Endpoint | Method | Auth | Test Command |
|----------|--------|------|--------------|
| /websites | GET | No | `curl http://localhost:3001/api/v1/websites` |
| /websites?search=ai | GET | No | `curl "http://localhost:3001/api/v1/websites?search=ai"` |
| /websites?category=ai-tools | GET | No | `curl "http://localhost:3001/api/v1/websites?category=ai-tools"` |
| /websites?sort=newest | GET | No | `curl "http://localhost:3001/api/v1/websites?sort=newest"` |
| /websites?sort=price_asc | GET | No | `curl "http://localhost:3001/api/v1/websites?sort=price_asc"` |
| /websites?page=1&limit=10 | GET | No | `curl "http://localhost:3001/api/v1/websites?page=1&limit=10"` |
| /websites/:slug | GET | No | `curl http://localhost:3001/api/v1/websites/teamsync-board` |
| /websites/:id | GET | No | `curl http://localhost:3001/api/v1/websites/<UUID>` |

---

# 3. CATEGORIES ENDPOINTS 🟡 (Need Testing)

| Endpoint | Method | Auth | Test Command |
|----------|--------|------|--------------|
| /categories | GET | No | `curl http://localhost:3001/api/v1/categories` |
| /categories/:slug | GET | No | `curl http://localhost:3001/api/v1/categories/ai-tools` |

---

# 4. USER ENDPOINTS 🟡 (Need Testing)

| Endpoint | Method | Auth | Test Command |
|----------|--------|------|--------------|
| /users/me | GET | Buyer | `curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/users/me` |
| /users/me | PATCH | Buyer | `curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Updated Name"}' http://localhost:3001/api/v1/users/me` |
| /users/:username | GET | No | `curl http://localhost:3001/api/v1/users/testcreator` |

---

# 5. BOOKMARKS ENDPOINTS ✅ (Tested)

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| /bookmarks | GET | Buyer | ✅ PASS |
| /bookmarks | POST | Buyer | ✅ PASS |
| /bookmarks/:websiteId | DELETE | Buyer | ✅ PASS |
| /bookmarks/check/:websiteId | GET | Buyer | ✅ PASS |

---

# 6. CREATOR ENDPOINTS 🟡 (Partial)

| Endpoint | Method | Auth | Status/Command |
|----------|--------|------|----------------|
| /creator-applications | POST | Buyer | ✅ PASS |
| /creator-applications/me | GET | Any | Need test |
| /my-websites | GET | Creator | `curl -H "Authorization: Bearer $CREATOR_TOKEN" http://localhost:3001/api/v1/my-websites` |
| /websites | POST | Creator | ✅ PASS |
| /websites/:id | PATCH | Creator | Need test (edit own website) |
| /websites/:id | DELETE | Creator | Need test (delete own website) |

### Creator Website Edit Test:
```bash
# Get creator token first
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

# Get creator's websites
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/my-websites

# Edit website (replace WEBSITE_ID)
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}' \
  http://localhost:3001/api/v1/websites/WEBSITE_ID
```

---

# 7. PAYOUT ENDPOINTS 🟡 (Partial)

| Endpoint | Method | Auth | Status/Command |
|----------|--------|------|----------------|
| /payouts/balance | GET | Creator | ✅ PASS |
| /payouts/bank-accounts | GET | Creator | `curl -H "Authorization: Bearer $CREATOR_TOKEN" http://localhost:3001/api/v1/payouts/bank-accounts` |
| /payouts/bank-accounts | POST | Creator | Need bank account data |
| /payouts | POST | Creator | Need balance > 0 |
| /payouts | GET | Creator | `curl -H "Authorization: Bearer $CREATOR_TOKEN" http://localhost:3001/api/v1/payouts` |

---

# 8. ORDER/PURCHASE ENDPOINTS 🔴 (Need Xendit)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /orders | POST | Buyer | Need Xendit integration |
| /orders | GET | Buyer | `curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/orders` |
| /orders/:id | GET | Buyer | Need order ID |
| /webhooks/xendit | POST | No | Payment callback |

---

# 9. REVIEWS ENDPOINTS 🟡 (Need Purchase)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /reviews | POST | Buyer | Need completed order first |
| /reviews/:websiteId | GET | No | `curl http://localhost:3001/api/v1/reviews/WEBSITE_ID` |
| /reviews/:id | PATCH | Buyer | Need own review |
| /reviews/:id | DELETE | Buyer | Need own review |

---

# 10. ADMIN ENDPOINTS 🟡 (Partial)

| Endpoint | Method | Auth | Status/Command |
|----------|--------|------|----------------|
| /admin/dashboard | GET | Admin | ✅ PASS |
| /admin/dashboard/payments | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/dashboard/payments` |
| /admin/dashboard/users | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/dashboard/users` |
| /admin/dashboard/top-performers | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/dashboard/top-performers` |
| /admin/users | GET | Admin | ✅ PASS |
| /admin/users/:id | PATCH | Admin | ✅ PASS |
| /admin/websites/pending | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/websites/pending` |
| /admin/websites/:id/moderate | PATCH | Admin | Need pending website |
| /admin/categories | POST | Admin | ✅ PASS |
| /admin/categories/:id | PATCH | Admin | Need category ID |
| /admin/categories/:id | DELETE | Admin | ✅ PASS |
| /admin/creator-applications | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/creator-applications` |
| /admin/creator-applications/:id/approve | POST | Admin | Need application ID |
| /admin/creator-applications/:id/reject | POST | Admin | Need application ID |
| /admin/reports | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/reports` |
| /admin/reports/:id | PATCH | Admin | Need report ID |
| /admin/refunds | GET | Admin | `curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/refunds` |
| /admin/refunds/:id/process | POST | Admin | Need refund request |

---

# 11. REPORTS ENDPOINTS 🟡 (Need Testing)

| Endpoint | Method | Auth | Command |
|----------|--------|------|---------|
| /reports | POST | Buyer | Create report on website/review |
| /reports/me | GET | Buyer | View my reports |

```bash
# Create report
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"websiteId":"WEBSITE_ID","reason":"spam","description":"This is spam content"}' \
  http://localhost:3001/api/v1/reports
```

---

# SUMMARY - What CAN Be Tested Now

## ✅ Already Tested & Passing
- Auth (all 6 endpoints)
- Bookmarks (all 4 endpoints)
- Creator Application (submit)
- Creator Balance
- Website Create
- Admin Dashboard
- Admin Users
- Admin Categories

## 🟡 Can Test Now (via curl)
- Discovery: browse, search, filter, sort, pagination
- Website detail
- Categories list
- User profile CRUD
- Creator's websites list
- Creator website edit/delete
- Bank accounts CRUD
- Payout history
- Admin pending websites
- Admin creator applications (approve/reject)
- Admin reports
- Reports create/view

## 🔴 Blocked (Need external dependencies)
- Orders/Purchase (need Xendit sandbox)
- Payment webhooks (need Xendit)
- Reviews (need completed purchase)
- Refunds (need completed purchase)
- E2E flows (need browser)
- Performance tests (need k6/JMeter)

---

## Recommended Test Order for QA:

1. **Discovery Flow** (public, no auth needed)
2. **User Profile** (buyer auth)
3. **Creator Features** (creator auth)
4. **Admin Operations** (admin auth)
5. **Error Cases** (negative testing)
