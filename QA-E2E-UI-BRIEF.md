# QA E2E UI Testing Brief
**Finding Gems Application**  
**Generated:** 2026-02-06

---

## 📋 Overview

This document provides comprehensive E2E UI test cases for the Finding Gems application. These tests require browser automation (Playwright/Cypress) and should be executed after backend fixes are verified.

---

## 🔧 Prerequisites

1. **Backend Server Running**: `http://localhost:3001`
2. **Frontend Server Running**: `http://localhost:3000`
3. **Browser Automation Tool**: Playwright MCP or Browser Subagent
4. **Test Database**: Seeded with test data

### Test Accounts Required
```
Admin:      admin@test.com / TestAdmin123!
Creator 1:  creator1@test.com / TestCreator123!
Creator 2:  creator2@test.com / TestCreator123!
Buyer 1:    buyer1@test.com / TestBuyer123!
Buyer 2:    buyer2@test.com / TestBuyer123!
```

---

## 🧪 E2E UI Test Cases

### E2E-UI-001: User Registration Flow
**Priority:** HIGH  
**Estimated Time:** 5 min

**Steps:**
1. Navigate to `/auth/register`
2. Fill registration form with unique email
3. Submit form
4. Verify redirect to dashboard/home
5. Verify user profile shows in navbar

**Expected Results:**
- Registration form validation works
- Success shows confirmation message
- User is logged in after registration
- Profile menu is accessible

**Verification Points:**
- [ ] Form validates empty fields
- [ ] Form validates email format
- [ ] Form validates password requirements
- [ ] Success redirects properly
- [ ] User avatar appears in navbar

---

### E2E-UI-002: User Login Flow
**Priority:** HIGH  
**Estimated Time:** 3 min

**Steps:**
1. Navigate to `/auth/login`
2. Enter valid credentials
3. Click login button
4. Verify redirect to dashboard

**Expected Results:**
- Login form accepts valid credentials
- Error shown for invalid credentials
- Session persists across page refresh

**Verification Points:**
- [ ] Valid login works
- [ ] Invalid credentials show error
- [ ] "Remember me" option works
- [ ] Session cookie is set

---

### E2E-UI-003: Website Listing and Search
**Priority:** HIGH  
**Estimated Time:** 5 min

**Steps:**
1. Navigate to `/explore` or home page
2. Verify website cards are displayed
3. Use search bar to filter websites
4. Apply category filter
5. Apply rating filter
6. Verify pagination works

**Expected Results:**
- Websites load with proper cards
- Search filters results correctly
- Category filter works
- Pagination buttons functional

**Verification Points:**
- [ ] Website cards show name, thumbnail, price
- [ ] Search updates results
- [ ] Category filters properly
- [ ] Empty search shows "no results"
- [ ] Pagination navigation works

---

### E2E-UI-004: Website Detail Page
**Priority:** HIGH  
**Estimated Time:** 5 min

**Steps:**
1. Click on any website card
2. Verify URL changes to `/websites/[slug]`
3. Verify all sections load:
   - Hero section with thumbnail
   - Description
   - Pricing tiers
   - Reviews section
   - Creator info

**Expected Results:**
- All website info displays correctly
- Pricing tiers show with CTA buttons
- Reviews render with ratings
- Related websites shown

**Verification Points:**
- [ ] Website title and image load
- [ ] Description content shows
- [ ] Price displays correctly
- [ ] "Buy Now" button visible
- [ ] Reviews section loads

---

### E2E-UI-005: Purchase Flow (Guest → Login → Purchase)
**Priority:** CRITICAL  
**Estimated Time:** 10 min

**Steps:**
1. Visit website detail page as guest
2. Click "Buy Now" on a pricing tier
3. Verify redirect to login (or login modal)
4. Login with buyer account
5. Redirect back to website or checkout
6. Complete purchase form
7. Proceed to payment
8. Verify order confirmation

**Expected Results:**
- Guest is prompted to login
- After login, redirected to checkout
- Payment form loads correctly
- Order confirmation shown after success

**Verification Points:**
- [ ] Guest cannot purchase directly
- [ ] Login redirect works
- [ ] Checkout page loads with correct item
- [ ] Payment gateway opens
- [ ] Order confirmation displays
- [ ] Order appears in user's orders

---

### E2E-UI-006: Creator Dashboard
**Priority:** HIGH  
**Estimated Time:** 8 min

**Steps:**
1. Login as creator account
2. Navigate to creator dashboard
3. Verify sections:
   - My Websites list
   - Sales statistics
   - Earnings summary
   - Add New Website button
4. Test "Add New Website" form

**Expected Results:**
- Dashboard shows creator stats
- Website list is editable
- Create website form works

**Verification Points:**
- [ ] Dashboard route accessible to creators
- [ ] Stats cards show correct numbers
- [ ] Website list displays user's websites
- [ ] Edit/Delete buttons work
- [ ] Create website form functions

---

### E2E-UI-007: Admin Dashboard
**Priority:** HIGH  
**Estimated Time:** 8 min

**Steps:**
1. Login as admin account
2. Navigate to admin dashboard
3. Verify sections:
   - Website moderation queue
   - User management
   - Pending refunds
   - Pending payouts
   - Creator applications
4. Test moderation action (approve/reject)

**Expected Results:**
- Admin sees all pending items
- Can approve/reject websites
- Can process refunds
- Can approve creator applications

**Verification Points:**
- [ ] Admin dashboard accessible
- [ ] Pending websites list loads
- [ ] Approve/Reject buttons work
- [ ] User role changes work
- [ ] Refund processing works

---

### E2E-UI-008: Bookmark Functionality
**Priority:** MEDIUM  
**Estimated Time:** 3 min

**Steps:**
1. Login as buyer
2. Navigate to website detail
3. Click bookmark/save button
4. Navigate to bookmarks page
5. Verify website appears in list
6. Remove bookmark
7. Verify removal

**Expected Results:**
- Bookmark toggle works
- Bookmarks list shows saved items
- Unbookmark removes from list

**Verification Points:**
- [ ] Bookmark button visible (logged in)
- [ ] Bookmark adds to list
- [ ] Bookmark page shows items
- [ ] Remove bookmark works

---

### E2E-UI-009: Review Submission
**Priority:** MEDIUM  
**Estimated Time:** 5 min

**Prerequisite:** User must have purchased the website

**Steps:**
1. Login as buyer who has purchased a website
2. Navigate to purchased website detail
3. Scroll to review section
4. Submit a review (rating + text)
5. Verify review appears

**Expected Results:**
- Review form only shows to purchasers
- Review submits successfully
- New review appears in list
- Website rating updates

**Verification Points:**
- [ ] Non-purchasers cannot review
- [ ] Rating selector works (1-5)
- [ ] Review text required
- [ ] Submit shows confirmation
- [ ] Review appears immediately

---

### E2E-UI-010: Refund Request Flow
**Priority:** MEDIUM  
**Estimated Time:** 5 min

**Prerequisite:** User must have a recent order (within 30 days)

**Steps:**
1. Login as buyer with recent order
2. Navigate to orders/purchases page
3. Find eligible order
4. Click "Request Refund"
5. Fill refund request form
6. Submit request
7. Verify status update

**Expected Results:**
- Refund button shows for eligible orders
- Form captures reason/evidence
- Confirmation shown after submit
- Order status changes to "refund_requested"

**Verification Points:**
- [ ] Refund button on eligible orders only
- [ ] Cannot refund after 30 days
- [ ] Reason field required
- [ ] Confirmation message shown
- [ ] Status updates in UI

---

### E2E-UI-011: Payout Request (Creator)
**Priority:** MEDIUM  
**Estimated Time:** 5 min

**Prerequisite:** Creator has available earnings

**Steps:**
1. Login as creator with earnings
2. Navigate to earnings/payout page
3. View available balance
4. Request payout
5. Select bank account
6. Confirm payout request
7. Verify request status

**Expected Results:**
- Earnings dashboard shows correctly
- Available vs pending balance clear
- Payout form submits
- Request appears in history

**Verification Points:**
- [ ] Balance shows correctly
- [ ] 7-day settlement explained
- [ ] Bank selection works
- [ ] Minimum payout enforced
- [ ] Request confirmation shown

---

### E2E-UI-012: Responsive Design Tests
**Priority:** HIGH  
**Estimated Time:** 10 min

**Test across viewports:**
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1440x900

**Pages to test:**
1. Home page
2. Explore/listing page
3. Website detail page
4. Auth pages (login/register)
5. Dashboard pages
6. Checkout page

**Verification Points:**
- [ ] Navigation collapses on mobile
- [ ] Images scale correctly
- [ ] Text readable on all sizes
- [ ] Buttons are tap-friendly (min 44px)
- [ ] Forms work on mobile
- [ ] Modals are scrollable

---

## 🔴 Known Backend Issues (Fixed in Round 3)

| ID | Issue | Status |
|----|-------|--------|
| NEG-009 | Pagination beyond data returns 500 | ✅ FIXED |
| NEG-008 | Nonexistent category filter | ✅ FIXED |
| NEG-012 | Duplicate bookmark 500 error | ✅ FIXED |
| NEG-020 | Refund after 30 days allowed | ✅ FIXED |
| DISC-002 | Search not matching shortDescription | ✅ FIXED |

---

## 📊 Test Execution Tracking

| Test ID | Status | Tester | Date | Notes |
|---------|--------|--------|------|-------|
| E2E-UI-001 | ⬜ Pending | | | |
| E2E-UI-002 | ⬜ Pending | | | |
| E2E-UI-003 | ⬜ Pending | | | |
| E2E-UI-004 | ⬜ Pending | | | |
| E2E-UI-005 | ⬜ Pending | | | |
| E2E-UI-006 | ⬜ Pending | | | |
| E2E-UI-007 | ⬜ Pending | | | |
| E2E-UI-008 | ⬜ Pending | | | |
| E2E-UI-009 | ⬜ Pending | | | |
| E2E-UI-010 | ⬜ Pending | | | |
| E2E-UI-011 | ⬜ Pending | | | |
| E2E-UI-012 | ⬜ Pending | | | |

---

## 🚀 Running E2E Tests

### Using Playwright MCP
```bash
# Start browser automation
mcp_next-devtools_browser_eval action=start browser=chrome headless=false

# Navigate to page
mcp_next-devtools_browser_eval action=navigate url=http://localhost:3000

# Take screenshot
mcp_next-devtools_browser_eval action=screenshot fullPage=true
```

### Using Browser Subagent
```
Task: "Navigate to http://localhost:3000/auth/login, fill email field with buyer1@test.com, fill password with TestBuyer123!, click login button, wait for dashboard, take screenshot"
```

---

## 📝 Reporting Format

For each test case, report:
1. **Status**: PASS / FAIL / BLOCKED / SKIPPED
2. **Screenshots**: Attach relevant screenshots
3. **Steps Completed**: List steps executed
4. **Issues Found**: Detail any bugs discovered
5. **Notes**: Additional observations

---

## ✅ Acceptance Criteria

All E2E tests pass with:
- 100% of CRITICAL tests passing
- 90%+ of HIGH priority tests passing  
- No regression from previous rounds
- All user flows complete without errors

---

**Document Version:** 1.0  
**Created By:** Backend Agent  
**For:** QA Agent (E2E UI Testing)
