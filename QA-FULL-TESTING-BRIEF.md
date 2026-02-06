# 🧪 QA Full Testing Brief - Finding Gems

> **⚠️ PENTING:** Tim QA fokus HANYA pada testing dan reporting.
> **🚫 JANGAN mengubah code backend ATAU frontend!**

---

## 📋 Project Overview

**Finding Gems** adalah marketplace untuk jual-beli website/digital assets.

| Environment | URL |
|-------------|-----|
| **Frontend (Production)** | https://findinggems.id |
| **Frontend (Preview)** | https://finding-gems.vercel.app |
| **Backend API** | https://finding-gems-backend.onrender.com/api/v1 |
| **Backend (Local Dev)** | http://localhost:3001/api/v1 |

---

## 🔑 Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@findinggems.com` | `Admin123!` | Full admin access |
| **Buyer** | `buyer@example.com` | `BuyerPassword123!` | Regular buyer account |
| **Creator** | `creator@example.com` | `CreatorPassword123!` | Creator with websites |

---

## 📊 Testing Scope

### 1. Functional Testing
### 2. API Testing
### 3. Security Testing
### 4. Performance Testing
### 5. Data Testing
### 6. Negative Testing
### 7. End-to-End Testing

---

# 1️⃣ FUNCTIONAL TESTING

## 1.1 Authentication Module

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| AUTH-001 | User Registration | 1. Go to /register 2. Fill form 3. Submit | Account created, email sent | P1 |
| AUTH-002 | User Login | 1. Go to /login 2. Enter credentials 3. Submit | Token received, redirect to dashboard | P1 |
| AUTH-003 | Logout | 1. Login 2. Click logout | Token cleared, redirect to home | P1 |
| AUTH-004 | Forgot Password | 1. Go to /forgot-password 2. Enter email 3. Submit | Reset email sent | P2 |
| AUTH-005 | Reset Password | 1. Click reset link 2. Enter new password | Password updated | P2 |
| AUTH-006 | Token Refresh | 1. Login 2. Wait for token expiry 3. Make request | Token auto-refreshed | P1 |
| AUTH-007 | Session Persistence | 1. Login 2. Close browser 3. Reopen | Session maintained | P2 |

## 1.2 Website Discovery & Search

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| DISC-001 | Browse Websites | 1. Go to /explore | List of websites displayed | P1 |
| DISC-002 | Search by Keyword | 1. Enter search term 2. Press enter | Filtered results shown | P1 |
| DISC-003 | Filter by Category | 1. Select category dropdown | Only matching websites shown | P1 |
| DISC-004 | Sort by Price (Low-High) | 1. Select sort option | Websites sorted correctly | P2 |
| DISC-005 | Sort by Price (High-Low) | 1. Select sort option | Websites sorted correctly | P2 |
| DISC-006 | Sort by Newest | 1. Select sort option | Latest websites first | P2 |
| DISC-007 | Pagination | 1. Scroll to bottom 2. Click next page | Next set of results | P2 |
| DISC-008 | Website Detail View | 1. Click on website card | Detail page with full info | P1 |

## 1.3 Purchase Flow

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| PUR-001 | Add to Cart | 1. View website 2. Click buy/add | Item added to cart | P1 |
| PUR-002 | Checkout Process | 1. Go to cart 2. Click checkout | Payment page shown | P1 |
| PUR-003 | Payment via Xendit | 1. Select payment method 2. Complete payment | Order created, status pending | P1 |
| PUR-004 | Payment Success Callback | 1. Complete payment on Xendit | Order status updated to paid | P1 |
| PUR-005 | Order Confirmation | 1. After payment | Confirmation email received | P1 |
| PUR-006 | View Order History | 1. Go to /dashboard/purchases | List of orders shown | P1 |
| PUR-007 | View Order Detail | 1. Click on order | Full order details shown | P2 |

## 1.4 Creator Features

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| CRE-001 | Apply as Creator | 1. Go to /become-creator 2. Fill form 3. Submit | Application submitted | P1 |
| CRE-002 | View Application Status | 1. Go to dashboard | Status (pending/approved/rejected) shown | P1 |
| CRE-003 | Create Website Listing | 1. Go to /creator/websites 2. Click add 3. Fill form | Website created (pending review) | P1 |
| CRE-004 | Edit Website | 1. Go to listing 2. Click edit 3. Save | Website updated | P1 |
| CRE-005 | Delete Website | 1. Go to listing 2. Click delete 3. Confirm | Website removed | P2 |
| CRE-006 | View Earnings | 1. Go to /creator/earnings | Balance & transactions shown | P1 |
| CRE-007 | Request Payout | 1. Add bank account 2. Request payout | Payout request created | P1 |
| CRE-008 | Cancel Payout | 1. View pending payout 2. Click cancel | Payout cancelled | P2 |

## 1.5 Refund Flow

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| REF-001 | Request Refund | 1. Go to purchase 2. Click refund 3. Fill reason | Refund request created | P1 |
| REF-002 | View Refund Status | 1. Go to /dashboard/refunds | Status shown | P1 |
| REF-003 | Cancel Refund Request | 1. View pending refund 2. Click cancel | Request cancelled | P2 |

## 1.6 Reviews & Ratings

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| REV-001 | Write Review | 1. After purchase 2. Go to website 3. Submit review | Review posted | P2 |
| REV-002 | View Reviews | 1. Go to website detail | Reviews displayed | P2 |
| REV-003 | Edit Review | 1. Go to own review 2. Edit 3. Save | Review updated | P3 |
| REV-004 | Delete Review | 1. Go to own review 2. Delete | Review removed | P3 |

## 1.7 Bookmarks

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| BOOK-001 | Add Bookmark | 1. View website 2. Click bookmark icon | Website bookmarked | P2 |
| BOOK-002 | View Bookmarks | 1. Go to /dashboard/bookmarks | List of bookmarks shown | P2 |
| BOOK-003 | Remove Bookmark | 1. Click bookmark again | Bookmark removed | P2 |

## 1.8 Admin Features

| TC-ID | Test Case | Steps | Expected Result | Priority |
|-------|-----------|-------|-----------------|----------|
| ADM-001 | View Dashboard Stats | 1. Login as admin 2. Go to /admin | Stats displayed | P1 |
| ADM-002 | Moderate Website | 1. Go to pending websites 2. Approve/Reject | Status updated | P1 |
| ADM-003 | Handle Creator Application | 1. View applications 2. Approve/Reject | User role updated | P1 |
| ADM-004 | Handle Report | 1. View reports 2. Resolve/Dismiss | Report status updated | P1 |
| ADM-005 | Manage Categories | 1. Go to categories 2. CRUD operations | Categories managed | P2 |
| ADM-006 | View All Users | 1. Go to users tab | User list with pagination | P2 |
| ADM-007 | Update User Role | 1. Select user 2. Change role | Role updated | P2 |
| ADM-008 | Process Refund | 1. Go to refunds 2. Approve/Reject | Refund processed | P1 |

---

# 2️⃣ API TESTING

## 2.1 Authentication Endpoints

```
Base URL: https://finding-gems-backend.onrender.com/api/v1
```

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/auth/register` | POST | No | Valid registration, duplicate email, weak password, missing fields |
| `/auth/login` | POST | No | Valid login, wrong password, non-existent user |
| `/auth/logout` | POST | Yes | Valid logout, expired token |
| `/auth/refresh` | POST | Yes | Valid refresh, expired refresh token |
| `/auth/me` | GET | Yes | Get current user, unauthorized |
| `/auth/forgot-password` | POST | No | Valid email, non-existent email |
| `/auth/reset-password` | POST | No | Valid token, expired token, invalid token |

## 2.2 Website Endpoints

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/websites` | GET | No | List all, pagination, search, filter |
| `/websites/:id` | GET | No | Valid ID, non-existent ID |
| `/websites` | POST | Creator | Create valid, missing fields, invalid data |
| `/websites/:id` | PATCH | Creator | Update own, update others (403) |
| `/websites/:id` | DELETE | Creator | Delete own, delete others (403) |

## 2.3 Admin Endpoints

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/admin/dashboard` | GET | Admin | Get stats |
| `/admin/websites` | GET | Admin | List all websites |
| `/admin/websites/pending` | GET | Admin | List pending |
| `/admin/websites/:id/moderate` | PATCH | Admin | Approve, reject |
| `/admin/users` | GET | Admin | List users |
| `/admin/users/:id` | PATCH | Admin | Update user |
| `/admin/creator-applications` | GET | Admin | List applications |
| `/admin/creator-applications/:id` | PATCH | Admin | Approve/reject |
| `/admin/reports` | GET | Admin | List reports |
| `/admin/reports/:id` | PATCH | Admin | Resolve/dismiss |
| `/admin/analytics/payments` | GET | Admin | Payment stats |
| `/admin/analytics/users` | GET | Admin | User stats |
| `/admin/analytics/top` | GET | Admin | Top performers |

## 2.4 Billing Endpoints

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/billing/checkout` | POST | Yes | Create order |
| `/billing/orders` | GET | Yes | List orders |
| `/billing/orders/:id` | GET | Yes | Order detail |
| `/billing/invoices/:id` | GET | Yes | Get invoice |
| `/payments/webhook/xendit` | POST | Webhook | Payment callback |

## 2.5 Payout Endpoints

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/payouts` | GET | Creator | List payouts |
| `/payouts` | POST | Creator | Request payout |
| `/payouts/:id/cancel` | PATCH | Creator | Cancel payout |
| `/payouts/admin` | GET | Admin | List all payouts |
| `/payouts/admin/:id/process` | POST | Admin | Process payout |

## 2.6 Refund Endpoints

| Endpoint | Method | Auth | Test Cases |
|----------|--------|------|------------|
| `/refunds` | POST | Yes | Request refund |
| `/refunds` | GET | Yes | My refunds |
| `/refunds/:id/cancel` | PATCH | Yes | Cancel refund |
| `/refunds/admin` | GET | Admin | All refunds |
| `/refunds/admin/:id` | PATCH | Admin | Process refund |

---

# 3️⃣ SECURITY TESTING

## 3.1 Authentication Security

| SEC-ID | Test Case | Method | Expected |
|--------|-----------|--------|----------|
| SEC-001 | SQL Injection in Login | Enter `' OR 1=1--` in email | Request rejected |
| SEC-002 | XSS in Registration | Enter `<script>alert('XSS')</script>` in name | Sanitized/escaped |
| SEC-003 | Brute Force Protection | Attempt 10+ failed logins | Account/IP blocked temporarily |
| SEC-004 | JWT Token Tampering | Modify JWT payload | Request rejected (401) |
| SEC-005 | Expired Token Access | Use expired access token | Request rejected (401) |
| SEC-006 | Token in URL | Pass token as query param | Should still work or reject |
| SEC-007 | CORS Policy | Request from unauthorized origin | Request blocked |

## 3.2 Authorization Security

| SEC-ID | Test Case | Method | Expected |
|--------|-----------|--------|----------|
| SEC-008 | User accesses admin endpoint | GET /admin/dashboard with user token | 403 Forbidden |
| SEC-009 | Buyer accesses creator endpoint | POST /websites with buyer token | 403 Forbidden |
| SEC-010 | User edits other's website | PATCH /websites/:othersId | 403 Forbidden |
| SEC-011 | User views other's orders | GET /billing/orders/:othersId | 403 Forbidden |
| SEC-012 | IDOR - Order Access | Change order ID in URL | Only own orders accessible |
| SEC-013 | IDOR - Payout Access | Change payout ID in URL | Only own payouts accessible |
| SEC-014 | Vertical Privilege Escalation | Change role in request body | Role not changed |

## 3.3 Input Validation Security

| SEC-ID | Test Case | Method | Expected |
|--------|-----------|--------|----------|
| SEC-015 | Oversized Payload | Send 10MB+ JSON body | Request rejected (413) |
| SEC-016 | Invalid Content-Type | Send form-data to JSON endpoint | Proper error (400) |
| SEC-017 | Null Byte Injection | Include \x00 in filename | Sanitized/rejected |
| SEC-018 | Path Traversal | `../../etc/passwd` in file path | Rejected |
| SEC-019 | HTML in Text Fields | `<img src=x onerror=alert(1)>` | Escaped in output |
| SEC-020 | Rate Limiting | 100+ requests in 1 second | Throttled (429) |

## 3.4 Data Security

| SEC-ID | Test Case | Method | Expected |
|--------|-----------|--------|----------|
| SEC-021 | Password in Response | Check login response | Password NEVER returned |
| SEC-022 | Sensitive Data in Logs | Check server logs | No passwords/tokens logged |
| SEC-023 | HTTPS Enforcement | Access via HTTP | Redirect to HTTPS |
| SEC-024 | Secure Headers | Check response headers | X-Frame-Options, CSP present |

---

# 4️⃣ PERFORMANCE TESTING

## 4.1 Response Time Testing

| PERF-ID | Endpoint | Target | Method |
|---------|----------|--------|--------|
| PERF-001 | GET /health | < 100ms | Measure average |
| PERF-002 | POST /auth/login | < 500ms | Include bcrypt hash |
| PERF-003 | GET /websites | < 300ms | With pagination |
| PERF-004 | GET /websites/:id | < 200ms | Single item |
| PERF-005 | GET /admin/dashboard | < 500ms | Complex aggregation |
| PERF-006 | POST /billing/checkout | < 1000ms | Payment creation |

## 4.2 Load Testing

| PERF-ID | Scenario | Target | Tool |
|---------|----------|--------|------|
| PERF-007 | 50 concurrent users | All responses < 2s | k6/JMeter |
| PERF-008 | 100 concurrent users | 95% responses < 3s | k6/JMeter |
| PERF-009 | 200 concurrent users | Server stays up | k6/JMeter |
| PERF-010 | Sustained load (10 min) | No memory leak | k6/JMeter |

## 4.3 Database Performance

| PERF-ID | Query | Target |
|---------|-------|--------|
| PERF-011 | List websites with pagination | < 50ms |
| PERF-012 | Complex search with filters | < 100ms |
| PERF-013 | Admin dashboard aggregations | < 200ms |
| PERF-014 | User with relations (orders, websites) | < 100ms |

## 4.4 Frontend Performance

| PERF-ID | Page | Metric | Target |
|---------|------|--------|--------|
| PERF-015 | Homepage | LCP | < 2.5s |
| PERF-016 | Homepage | FID | < 100ms |
| PERF-017 | Homepage | CLS | < 0.1 |
| PERF-018 | Explore Page | TTI | < 3s |
| PERF-019 | Website Detail | LCP | < 2s |
| PERF-020 | Admin Dashboard | Load Time | < 3s |

---

# 5️⃣ DATA TESTING

## 5.1 Data Integrity

| DATA-ID | Test Case | Method | Expected |
|---------|-----------|--------|----------|
| DATA-001 | Email Uniqueness | Register with existing email | Error: email already exists |
| DATA-002 | Username Uniqueness | Register with existing username | Error: username taken |
| DATA-003 | Foreign Key Integrity | Delete user with websites | Cascade delete or prevent |
| DATA-004 | Order-Website Relationship | Check order references | Valid website ID |
| DATA-005 | Payout-User Relationship | Check payout owner | Matches creator |

## 5.2 Data Validation

| DATA-ID | Field | Validation | Test |
|---------|-------|------------|------|
| DATA-006 | Email | Valid format | `invalidemail`, `@test.com`, `test@` |
| DATA-007 | Password | Min 8 chars, uppercase, number | `short`, `nouppercase1`, `NONUMBER` |
| DATA-008 | Price | Positive number | `-100`, `0`, `abc` |
| DATA-009 | URL | Valid URL format | `not-a-url`, `ftp://invalid` |
| DATA-010 | Phone | Valid format | `abcd`, `123`, `+62invalid` |

## 5.3 Data Consistency

| DATA-ID | Test Case | Expected |
|---------|-----------|----------|
| DATA-011 | Order total matches website price | Prices match |
| DATA-012 | Creator earnings = Sum of sales - fees | Math correct |
| DATA-013 | Refund amount <= Order amount | Cannot exceed |
| DATA-014 | Payout amount <= Available balance | Cannot exceed |

---

# 6️⃣ NEGATIVE TESTING

## 6.1 Invalid Input Handling

| NEG-ID | Test Case | Input | Expected |
|--------|-----------|-------|----------|
| NEG-001 | Empty required fields | `{}` | 400 with field errors |
| NEG-002 | Wrong data types | `price: "abc"` | 400 validation error |
| NEG-003 | Negative numbers | `price: -100` | 400 validation error |
| NEG-004 | Very long strings | 10000+ chars | 400 or truncated |
| NEG-005 | Special characters | `<>'"&;` in fields | Escaped/sanitized |
| NEG-006 | Unicode/Emoji | 🎉 in name | Handled correctly |
| NEG-007 | Null values | `name: null` | 400 validation error |

## 6.2 Edge Cases

| NEG-ID | Test Case | Scenario | Expected |
|--------|-----------|----------|----------|
| NEG-008 | Empty database | No websites exist | Empty state shown |
| NEG-009 | Pagination beyond data | `page=9999` | Empty array, not error |
| NEG-010 | Zero price website | `price: 0` | Accepted (free) or rejected |
| NEG-011 | Max integer price | `price: 9999999999` | Handled or capped |
| NEG-012 | Duplicate submission | Click submit twice rapidly | Only one record created |

## 6.3 Network/Server Errors

| NEG-ID | Test Case | Method | Expected |
|--------|-----------|--------|----------|
| NEG-013 | Server unavailable | Stop backend | Frontend shows error message |
| NEG-014 | Slow network | Throttle to 2G | Loading states work |
| NEG-015 | Request timeout | Very slow response | Proper timeout handling |
| NEG-016 | Partial response | Disconnect mid-response | Error handled gracefully |

## 6.4 Business Logic Edge Cases

| NEG-ID | Test Case | Expected |
|--------|-----------|----------|
| NEG-017 | Buy own website | Should be prevented |
| NEG-018 | Review without purchase | Should be prevented |
| NEG-019 | Double purchase same website | Should be prevented |
| NEG-020 | Refund after 30 days | Should be rejected |
| NEG-021 | Payout with zero balance | Should be rejected |
| NEG-022 | Approve already approved app | No side effects |

---

# 7️⃣ END-TO-END TESTING

## 7.1 User Journey: Buyer

```
E2E-001: Complete Purchase Flow

1. Register as new user
2. Verify email (if required)
3. Login
4. Browse websites
5. Search for specific website
6. View website detail
7. Add to cart / Buy now
8. Complete checkout
9. Payment via Xendit
10. Receive confirmation
11. View in purchase history
12. Write review
13. Request refund (optional)
14. Logout
```

## 7.2 User Journey: Creator

```
E2E-002: Creator Complete Flow

1. Register as new user
2. Login
3. Apply to become creator
4. Wait for admin approval
5. Check approval status
6. Create website listing
7. Upload images/descriptions
8. Submit for review
9. Wait for moderator approval
10. View published website
11. Receive sale notification
12. Check earnings dashboard
13. Add bank account
14. Request payout
15. Logout
```

## 7.3 User Journey: Admin

```
E2E-003: Admin Workflow

1. Login as admin
2. View dashboard stats
3. Check pending websites
4. Approve/reject websites
5. Check creator applications
6. Approve/reject applications
7. View reports
8. Resolve/dismiss reports
9. Process pending refunds
10. View payment analytics
11. Logout
```

## 7.4 Critical Path Testing

| E2E-ID | Critical Path | Priority |
|--------|---------------|----------|
| E2E-004 | Registration → Login → Purchase → Payment | P1 |
| E2E-005 | Creator Apply → Approval → List Website | P1 |
| E2E-006 | Sale → Earnings → Payout Request | P1 |
| E2E-007 | Purchase → Refund Request → Admin Process | P1 |
| E2E-008 | Report Website → Admin Review → Resolve | P2 |

---

# 📝 REPORTING TEMPLATE

## Bug Report Format

```markdown
### Bug ID: BUG-XXX

**Summary:** [One-line description]

**Severity:** Critical / High / Medium / Low

**Priority:** P1 / P2 / P3

**Environment:**
- Browser: Chrome 120
- OS: macOS 14.2
- API Version: v1
- URL: https://...

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Evidence:**
- Screenshot: [link]
- Video: [link]
- Console Logs: [paste]
- Network Response: [paste]

**Additional Notes:**
[Any other relevant info]
```

## Test Report Format

```markdown
# Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Prod/Staging/Local]

## Summary
- Total Test Cases: XX
- Passed: XX (XX%)
- Failed: XX (XX%)
- Blocked: XX (XX%)
- Skipped: XX

## Test Results by Module

| Module | Pass | Fail | Blocked |
|--------|------|------|---------|
| Auth | X | X | X |
| Websites | X | X | X |
| ... | X | X | X |

## Critical Bugs Found
- BUG-001: [Summary]
- BUG-002: [Summary]

## Recommendations
1. [Issue 1]
2. [Issue 2]
```

---

# 🛠️ TOOLS RECOMMENDATION

| Type | Tool | Purpose |
|------|------|---------|
| API Testing | Postman / Insomnia | Manual API testing |
| API Automation | Newman / k6 | Automated API tests |
| Load Testing | k6 / JMeter / Artillery | Performance testing |
| E2E Testing | Playwright / Cypress | Browser automation |
| Security | OWASP ZAP / Burp Suite | Security scanning |
| Performance | Lighthouse / WebPageTest | Frontend performance |
| Monitoring | Postman Monitors | Continuous testing |

---

# ⚠️ IMPORTANT REMINDERS

1. **🚫 JANGAN mengubah code apapun** - Report saja, jangan fix
2. **📸 Dokumentasikan semua** - Screenshot, video, logs
3. **🔄 Test di environment yang benar** - Production URL
4. **⏰ Note waktu test** - Timezone WIB
5. **📊 Prioritize bugs** - Critical > High > Medium > Low
6. **🔁 Retest after fix** - Verify bug fixes work

---

# 📞 CONTACT

**Report bugs to:** [Backend/FE Team Channel]
**Questions:** [QA Lead / Project Manager]

---

**Last Updated:** February 6, 2026
**Version:** 1.0
