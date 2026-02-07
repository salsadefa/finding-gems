# 🎭 UI AUTOMATION TEST BRIEF - REVISED
**Date:** 2026-02-06 21:00
**Status:** REVISED - Fixed incorrect routes and flows
**From:** Backend Agent
**To:** QA Agent

---

## 🚨 IMPORTANT CORRECTIONS

### Issue 1: E2E-UI-002 - Creator Flow
**Problem:** Test expected instant creator access after signup + apply.
**Reality:** Creator application requires **admin approval** before role upgrade.

**Correct Flow:**
1. User signup → role = `buyer`
2. Apply as creator → application status = `pending`
3. **Admin approves** → role upgraded to `creator`
4. User can access `/creator/listings/new`

### Issue 2: E2E-UI-003 - Admin Pending Websites Route
**Problem:** Route `/admin/websites/pending` doesn't exist (404).
**Reality:** Admin uses **single page with tabs**, not sub-routes.

**Correct Route:**
- `/admin` → Click "Websites" tab → Filter by "Pending" status
- Approve/Reject buttons are in the table row actions

---

## 📋 CORRECTED FRONTEND ROUTES

### Admin Panel Structure
```
/admin                    → Main admin page with tabs:
  - Overview Tab          → Dashboard stats
  - Creators Tab          → Creator applications (approve/reject)
  - Websites Tab          → Website moderation (approve/reject)
  - Reports Tab           → User reports
  
/admin/categories         → Category management
/admin/creators           → Creator applications (dedicated page)
/admin/refunds            → Refund management
/admin/reports            → Report management (dedicated page)
```

### Creator Dashboard Structure
```
/creator                  → Creator dashboard (overview)
/creator/listings         → My listings
/creator/listings/new     → Create new listing (REQUIRES role = 'creator')
/creator/analytics        → Analytics dashboard
/creator/analytics/[id]   → Single listing analytics
/creator/earnings         → Earnings & payouts
/creator/settings         → Creator settings
```

### User Dashboard Structure
```
/dashboard                → User dashboard
/dashboard/purchases      → Purchase history
/dashboard/purchases/[id] → Purchase detail
/dashboard/refunds        → Refund requests
/dashboard/sales          → Sales history (for creators)
```

---

## ✅ REVISED E2E TEST CASES

### E2E-UI-002 REVISED: Creator Registration to Website Create
**Pre-condition:** Admin user logged in a separate session to approve

```
Step 1: Register New User (as buyer)
- URL: http://localhost:3000/signup
- Actions:
  1. Fill name: E2E Test Creator
  2. Fill email: e2e_creator_[random]@example.com
  3. Fill username: e2ecreator[random]
  4. Fill password: TestPass123!
  5. Click register
- Expected: Redirect to dashboard, role = buyer

Step 2: Apply as Creator
- URL: http://localhost:3000/apply-creator
- Actions:
  1. Fill bio: "I am an experienced web developer..."
  2. Fill motivation: "I want to share my projects..."
  3. Fill expertise: ["Web Development", "SaaS"]
  4. Click submit
- Expected: Application submitted, status = pending

Step 3: Admin Approves Creator (separate session/window)
- Login as: admin@findinggems.com
- URL: http://localhost:3000/admin
- Actions:
  1. Click "Creators" tab (or navigate to Creators section)
  2. Find the pending application by email/name
  3. Click "View Details"
  4. Click "Approve" button
- Expected: Application approved, user role updated to 'creator'

Step 4: User Creates Website
- Back to user session (refresh page after approval)
- URL: http://localhost:3000/creator/listings/new
- Actions:
  1. Fill website name
  2. Fill description
  3. Select category
  4. Fill price
  5. Submit
- Expected: Website created successfully
```

---

### E2E-UI-003 REVISED: Admin Review Pending Websites
**Pre-condition:** At least 1 pending website exists

```
Step 1: Login as Admin
- URL: http://localhost:3000/login
- Credentials: admin@findinggems.com / Admin123!
- Expected: Redirect to dashboard

Step 2: Navigate to Admin Panel
- URL: http://localhost:3000/admin
- Expected: Admin panel loads with tabs visible

Step 3: Go to Websites Tab
- Actions:
  1. Look for tab navigation (Overview, Creators, Websites, Reports)
  2. Click "Websites" tab
- Expected: Website management table visible

Step 4: Filter by Pending Status
- Actions:
  1. Find status filter buttons (All, Active, Pending, Suspended, Rejected)
  2. Click "Pending" filter
- Expected: Only pending websites shown

Step 5: Approve a Website
- Actions:
  1. Find a pending website row
  2. Click the checkmark icon (Approve) in Actions column
- Expected:
  - Website status changes to 'active'
  - Website removed from pending filter
  - Success notification shown
```

---

## 🔧 ALTERNATIVE: Simpler E2E Tests (No Multi-Session)

If multi-session testing is complex, use these pre-existing test users:

### E2E-ALT-001: Creator Creates Website (Using Existing Creator)
```
Step 1: Login as Creator
- URL: http://localhost:3000/login
- Credentials: creator@example.com / CreatorPassword123!
- Expected: Login successful

Step 2: Navigate to Create Listing
- URL: http://localhost:3000/creator/listings/new
- Expected: Form visible (not "Creator Access Required")

Step 3: Fill and Submit
- Actions:
  1. Fill website details
  2. Submit
- Expected: Website created
```

### E2E-ALT-002: Admin Approves Creator (Using Existing Pending)
```
Step 1: Login as Admin
- URL: http://localhost:3000/login  
- Credentials: admin@findinggems.com / Admin123!

Step 2: Navigate to Admin Creator Applications
- URL: http://localhost:3000/admin
- Actions: Click "Creators" tab or status filter "Pending"

Step 3: Approve/Reject
- Actions: Click on pending application and use Approve/Reject
- Expected: Status changes
```

---

## 📊 TEST CREDENTIALS (Verified)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Buyer | buyer@example.com | NewPassword123! | For purchase tests |
| Creator | creator@example.com | CreatorPassword123! | Already approved, can create listings |
| Admin | admin@findinggems.com | Admin123! | Full admin access |

---

## 🎯 RECOMMENDED TEST ORDER

Given the issues found, test in this order:

### Phase 1: Smoke Tests (Quick Verification)
1. ✅ Homepage loads
2. ✅ Login works for all 3 users
3. ✅ Admin panel loads at `/admin`

### Phase 2: Admin Functionality  
1. Admin → Creators Tab → View pending applications
2. Admin → Creators Tab → Approve/Reject application
3. Admin → Websites Tab → Filter by Pending
4. Admin → Websites Tab → Approve/Reject website

### Phase 3: Creator Functionality
1. Login as creator → Access `/creator/listings/new`
2. Creator creates website → Appears in `/creator/listings`
3. Creator views analytics at `/creator/analytics`

### Phase 4: E2E Flows
1. E2E-ALT-001: Creator workflow (pre-approved creator)
2. E2E-ALT-002: Admin approval workflow

---

## 🚨 KNOWN ISSUES TO VERIFY

1. **Creator Access Required page** - Shows when:
   - User is logged in but role is `buyer` (not `creator`)
   - User's creator application is still `pending`
   
2. **Admin tab navigation** - Ensure tabs work:
   - Overview, Creators, Websites, Reports tabs
   - Clicking tab changes content

3. **Filter buttons** - Verify filter buttons work:
   - All, Pending, Approved, Rejected filters

---

**QA: Please retest with these corrected routes and flows. Start with Phase 1 smoke tests.**
