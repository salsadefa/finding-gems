# 📊 QA Testing Master Tracker - Finding Gems

**Last Updated:** 2026-02-10  
**Status:** 🟡 **PRODUCTION LIVE** | ✅ **LAST QA PASSING** | ⚠️ **NEW CHANGES PENDING QA**

> **Backend URL:** https://finding-gems-backend.onrender.com  
> **Frontend URL:** https://finding-gems.vercel.app  
> **Staging Domain (FE):** https://findinggems.dualangka.com  
> **Deploy Commit:** `c53225e` | **Deploy ID:** `dep-d63oglhr0fns738bj0d0`

---

## ⚠️ Pending QA (New Changes)

These items were implemented after the last recorded QA pass and are **NOT YET VERIFIED** end-to-end in production/staging.

### TRUST-001: Trust Signals v1 (Reviewed + New)

- **What changed**
  - New DB fields on `public.websites`: `isReviewed`, `reviewedAt`, `reviewedBy`
  - Admin API: `PATCH /api/v1/admin/websites/:id/reviewed` body `{ isReviewed: boolean }`
  - FE: Website card badges `Reviewed` (manual) + `New` (createdAt <= 7 days)
  - Admin: Websites tab includes action to toggle Reviewed
- **QA checklist**
  - Admin toggles Reviewed on a website -> badge appears on card (homepage/search)
  - Toggling off removes badge
  - A newly created website shows `New` badge (within 7 days)

### FE-STA-001: Staging domain console noise cleanup (preconnect/bookmarks/pages)

- **What changed (expected)**
  - Remove hardcoded preconnect to `api.findinggems.id` (should follow `NEXT_PUBLIC_API_*`)
  - Avoid calling `/api/v1/bookmarks` for unauthenticated visitors (prevent 401 spam)
  - Add placeholder pages for footer links: /about /blog /careers /contact /terms /privacy /pricing /cookies
- **QA checklist**
  - Visit `https://findinggems.dualangka.com` as guest: no CORS errors, no repeated 401 bookmarks spam
  - Footer links no longer 404

### CVC-001: Vibe Code Challenge (full feature)

- **What changed**
  - New tables: `challenges`, `challenge_submissions`
  - New public/creator/admin APIs under `/api/v1/challenges` and `/api/v1/admin/challenges`
  - FE pages: `/challenges`, `/challenges/[slug]`, homepage section
  - Admin tab: `/admin?tab=challenges`
- **QA checklist**
  - Admin creates challenge (upcoming/active) with valid window
  - Creator submits entry while active + within window
  - Admin approves/rejects submission
  - Approved submission shows on public challenge page
  - Admin sets featured order; featured items pin at top

### MSG-001: Messaging (replace mock /dashboard/messages)

- **What changed**
  - DB: new `threads` table + messaging triggers; existing `messages` + `thread_participants` now wired with FKs
  - Backend: `/api/v1/messages/*` endpoints for threads + messages + read state
  - FE: `/dashboard/messages` now uses real API (buyer + creator)
- **QA checklist**
  - Buyer can open Messages page and see threads list
  - Creator can open Messages page and see threads list
  - Create thread (via API / future UI) results in thread visible for both participants
  - Send message updates last message preview + unread count for recipient
  - Opening a thread marks it as read (unreadCount -> 0)

### PERF-NEW-001: Frontend LCP improvements (pending retest)

- **What changed**
  - Homepage hero: removed huge inline `blurDataURL` on background image
  - Website card: removed `framer-motion` hover animations (replaced with CSS transform)
  - Search: removed redundant client-side filter/sort; fixed backend sort params

### TRUST-002: Trust Signals (Popular)

- **What changed**
  - FE shows `Popular` badge based on `viewCount >= 1000`
- **QA checklist**
  - Confirm Popular badge appears only for high-view listings
- **QA checklist**
  - Re-run Lighthouse on homepage/search/detail and confirm LCP improved vs last baseline

---

## 🆕 Custom Payment UI Test Results (2026-02-08 21:36 WIB)

| Test ID | Test | Status | Notes |
|---------|------|--------|-------|
| PAY-QRIS-001 | Create QRIS Payment | ✅ PASS | Returns QR string |
| PAY-VA-004 | Create VA BCA | ✅ PASS | Returns VA number `381659999090819` |
| PAY-EW-002 | Create DANA E-Wallet | 🔄 PENDING | Fix applied, awaiting retest |

**Fixes Applied:**
- VA: Removed `suggestedAmount` (BCA tidak support)
- E-Wallet: Fixed field names `successReturnUrl`/`failureReturnUrl`


## 🚀 Production QA Results (2026-02-08)

| Category | Status | Details |
|----------|--------|---------|
| Frontend Routes | ✅ All 200 | /, /search, /signup, /creator, /admin |
| Backend Health | ✅ Healthy | /health returns 200 |
| Public APIs | ✅ All 200 | websites, categories, detail |
| Auth APIs | ✅ All 200 | admin, creator, buyer endpoints |
| Bookmark Flow | ✅ Complete | add → check → delete |
| Review Flow | ✅ Correct | 403 without purchase (expected) |
| Payment Flow | ✅ Working | order → initiate → cancel |

**Test Accounts Created:**
- Admin: `admin@findinggems.com` / `Admin123!`
- Buyer: `qa-buyer@test.com` / `QATest123!`
- Creator: `qa-creator@test.com` / `QATest123!`

### 🖥️ UI Playwright Tests (13:33 WIB)

| Flow | Status | Details |
|------|--------|---------|
| Buyer Login | ✅ Pass | Redirect to /dashboard |
| Buyer Bookmarks | ✅ Pass | "Saved Tools" tab works |
| Buyer Orders | ✅ Pass | /dashboard/purchases shows history |
| Buyer My Access | ✅ Pass | Empty state + "Browse Products" CTA |
| Admin Login | ✅ Pass | Redirect to /admin |
| Admin Users | ✅ Pass | /admin?tab=users works |
| Admin Websites | ✅ Pass | /admin?tab=websites works |
| Admin Creators | ✅ Pass | /admin?tab=creators shows applications |
| Admin Refunds | ✅ Pass | /admin/refunds shows management page |
| Creator Login | ✅ Pass | Redirect to /creator |
| Creator Listings | ✅ Pass | /creator/listings loads |
| Creator Earnings | ✅ Pass | Balance Rp0, payout disabled (expected) |

**Route Notes:**
- ✅ `/dashboard/purchases` = Orders (not /dashboard/orders)
- ✅ `/admin?tab=users` = Users (not /admin/users)

**Bug Found:**
- ⚠️ `RpNaN` displayed for some website prices in admin list (pricing data issue)

---

## 📈 Final Progress Summary

| Category | Total | ✅ Pass | ❌ Fail | ⚠️ Blocked | Completion |
|----------|-------|---------|---------|------------|------------|
| Security | 16 | **16** | 0 | 0 | **100%** ✅ |
| FK Integrity | 3 | **3** | 0 | 0 | **100%** ✅ |
| Negative | 19 | **15** | 0 | 4 | 79% |
| Payment Flow | 8 | **8** | 0 | 0 | **100%** ✅ |
| Review Flow | 4 | **4** | 0 | 0 | **100%** ✅ |
| Refund Flow | 3 | **3** | 0 | 0 | **100%** ✅ |
| Bookmark | 3 | **3** | 0 | 0 | **100%** ✅ |
| E2E UI | 9 | **8** | 0 | 1 | 89% |
| Performance | 6 | 1 | **3** | 2 | 17% |
| k6 Load | 2 | **2** | 0 | 0 | **100%** ✅ |
| **TOTAL** | **73** | **63** | **3** | **7** | **86%** |

---

## ✅ ALL PASSED TESTS (63 Tests)

### 🔐 Security (16/16) - 100% COMPLETE ✅
- [x] SEC-001: SQL Injection Prevention
- [x] SEC-002: XSS Prevention
- [x] SEC-003: Brute Force Protection (429)
- [x] SEC-004: JWT Tampering Detection
- [x] SEC-005: Expired Token Rejection
- [x] SEC-006: Missing Auth Header → UNAUTHORIZED
- [x] SEC-007: CORS Policy
- [x] SEC-008: Buyer → Admin (403)
- [x] SEC-009: Buyer → Creator (403)
- [x] SEC-010: User Edit Other's Website (403)
- [x] SEC-011: IDOR Order Access → Not authorized
- [x] SEC-012: IDOR Payout Access → NOT_FOUND
- [x] SEC-013: IDOR Refund Access → Access denied
- [x] SEC-015: Oversized Payload (413)
- [x] SEC-021: Password Not in Response
- [x] SEC-024: Security Headers

### 🗄️ FK Integrity (3/3) - 100% COMPLETE ✅
- [x] DATA-003: Foreign Key Violation (error 23503)
- [x] DATA-004: No Orphan Orders
- [x] DATA-005: No Orphan Payouts

### ❌ Negative Testing (15/19) - 79%
- [x] NEG-001 to NEG-011: All core negative tests PASS
- [x] NEG-017: Creator Cannot Buy Own Website
- [x] NEG-019: Double Purchase Blocked
- [x] NEG-020: Refund After 30 Days Rejected
- [x] NEG-022: Approve Refund Twice → Error

### 💳 Payment Flow (8/8) - 100% COMPLETE ✅
- [x] All 8 purchase tests PASS

### ⭐ Review Flow (4/4) - 100% COMPLETE ✅
- [x] All 4 review tests PASS

### 💸 Refund Flow (3/3) - 100% COMPLETE ✅
- [x] REF-001: Request Refund
- [x] REF-002: Admin Approve Refund
- [x] REF-003: Verify Refund Status

### 🔖 Bookmark (3/3) - 100% COMPLETE ✅
- [x] All 3 bookmark tests PASS

### ⚡ k6 Load Tests (2/2) - 100% COMPLETE ✅
- [x] Smoke Test - p95: 88ms, 0% errors
- [x] Load Test 10VUs - p95: 427ms, 0% errors

---

## ❌ FAILED TESTS (3 Tests) - FRONTEND PERFORMANCE

| Test | Metric | Target | Actual | Gap | Owner |
|------|--------|--------|--------|-----|-------|
| PERF-015 | Homepage LCP | <2,500ms | **4,420ms** | 77% over | Frontend |
| PERF-018 | Search LCP | <2,500ms | **4,570ms** | 83% over | Frontend |
| PERF-019 | Detail LCP | <2,500ms | **4,486ms** | 79% over | Frontend |

**Note:** Production build improved 57% from dev mode (10,279ms → 4,420ms) but still needs more optimization.

---

## ⚠️ BLOCKED TESTS (7 Tests)

| Test | Reason | Type |
|------|--------|------|
| SEC-023 | Production URL only | Deploy |
| PERF-016 | FID not measured by Lighthouse | Tool limitation |
| PERF-020 | Needs authenticated admin session | Manual |
| NEG-013 | Server unavailable test | Manual network |
| NEG-014 | Slow network test | Manual network |
| NEG-015 | Request timeout test | Manual network |
| NEG-016 | Partial response test | Manual network |
| NEG-021 | Dev stack trace expected | Expected behavior |

---

## 🔧 BUGS FIXED (10 Total)

| Bug ID | Issue | Fixed By |
|--------|-------|----------|
| NEG-003 | Negative pagination | Backend |
| NEG-004 | Long string | Backend |
| SEC-002 | XSS payload | Backend |
| SEC-007 | CORS header | Backend |
| SEC-020 | Rate limit | Backend |
| PURCH-005 | orders.createdAt | Backend |
| PURCH-006 | hasAccess null | Backend |
| PURCH-007 | Duplicate buy | Backend |
| SEC-013 | IDOR refund | Backend |
| NEG-010 | Zero price tier | Backend |

---

## 🏁 Final Status

### ✅ BACKEND: PRODUCTION READY
| Area | Status |
|------|--------|
| All Core APIs | ✅ Working |
| Security | ✅ 16/16 PASS |
| Payment/Refund/Review | ✅ 15/15 PASS |
| Data Integrity | ✅ 100% |
| Load Testing | ✅ PASS |

### 🟡 FRONTEND: NEEDS PERFORMANCE WORK
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| LCP | 4.4-4.6s | <2.5s | ❌ 77-83% over |
| CLS | 0.008 | <0.1 | ✅ PASS |
| FID | N/A | <100ms | ⚠️ Not measured |

---

## 📋 Next Steps

### For Launch:
1. **Frontend** - Fix LCP issues (image optimization, lazy loading, SSR)
2. **DevOps** - Deploy to production, test SEC-023 (HTTPS)
3. **Update** - Replace placeholder domain `findinggems.id`

### Optional (Nice-to-have):
- Manual network tests (NEG-013/14/15/16)
- Authenticated admin Lighthouse test (PERF-020)

---

## 📊 Summary Stats

```
Total Tests:      73
Passed:           63 (86%)
Failed:            3 (4%) - All FE Performance
Blocked:           7 (10%) - Expected/Manual

Backend Bugs Fixed: 10
Improvement:        57% (dev → prod build)
Test Duration:      ~1 week
```

**🎉 Backend Complete! Frontend needs ~2s LCP improvement.**
