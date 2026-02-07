# QA Comprehensive Testing Brief

**From:** Backend Agent  
**To:** QA Agent  
**Date:** 2026-02-06  
**Status:** Ready for Testing

---

## 📋 Executive Summary

Backend telah selesai melakukan fix untuk beberapa bugs kritis. Dokumen ini berisi brief lengkap untuk QA Agent melakukan comprehensive testing.

---

## 🔧 Backend Fixes Completed

### Bug Fixes Applied (Session 2026-02-06):

| Bug ID | Description | Status | Fix Applied |
|--------|-------------|--------|-------------|
| ADM-002 | Admin Moderate Website "Not Found" | ✅ FIXED | Fixed column naming: `creator_id` → `creatorId` in `admin.controller.ts:161` |
| CRE-004 | Creator Edit Website "Forbidden" | ✅ VERIFIED | Tested working - ownership check passes |
| CRE-005 | Creator Delete Website "Forbidden" | ✅ VERIFIED | Tested working - ownership check passes |
| ADM-007 | Update User Role Error | ✅ VERIFIED | Tested working - role update succeeds |

---

## 🧪 Testing Scope & Priority

### HIGH PRIORITY - Must Test First

#### 1. Admin Website Moderation (ADM-002 RETEST)
```bash
# Prerequisites
- Login as admin (admin@findinggems.com / Admin123!)
- Ensure ada pending website di sistem

# Test Steps
1. GET /api/v1/admin/websites/pending → Should return list of pending websites
2. PATCH /api/v1/admin/websites/{websiteId}/moderate dengan body: {"status":"active"}
3. Expected: success: true, message: "Website approved"

# Curl Example
TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

curl -X PATCH "http://localhost:3001/api/v1/admin/websites/{PENDING_WEBSITE_ID}/moderate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

#### 2. Creator Website Management (CRE-004, CRE-005 RETEST)
```bash
# Prerequisites
- Login as creator (creator@example.com / CreatorPassword123!)

# Test Steps for Edit (CRE-004)
1. GET /api/v1/websites/my-websites → Get list of creator's websites
2. PATCH /api/v1/websites/{ownWebsiteId} dengan body: {"name":"Updated Name"}
3. Expected: success: true

# Test Steps for Delete (CRE-005)
1. DELETE /api/v1/websites/{ownWebsiteId}
2. Expected: success: true

# Curl Example
TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

# Get my websites
curl "http://localhost:3001/api/v1/websites/my-websites" -H "Authorization: Bearer $TOKEN"

# Edit website
curl -X PATCH "http://localhost:3001/api/v1/websites/{WEBSITE_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"QA Test Updated Name"}'
```

#### 3. Admin User Role Update (ADM-007 RETEST)
```bash
# Test Steps
1. GET /api/v1/admin/users → Get list of users
2. PATCH /api/v1/admin/users/{userId} dengan body: {"role":"creator"}
3. Expected: success: true

# Curl Example
TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

curl -X PATCH "http://localhost:3001/api/v1/admin/users/{USER_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"creator"}'
```

---

### MEDIUM PRIORITY - Payment/Payout/Refund System

#### 4. Payment Flow Testing
```bash
# Endpoints to test
POST /api/v1/payments/initiate    # Initiate payment for order
GET  /api/v1/payments/:id/status  # Get payment status
POST /api/v1/payments/:id/confirm # Admin confirm payment

# Test Data Required
- Buyer account with valid session
- Website/product to purchase
```

#### 5. Payout System Testing
```bash
# Endpoints to test
GET  /api/v1/payouts/balance         # Get creator balance
POST /api/v1/payouts/bank-accounts   # Add bank account
GET  /api/v1/payouts/bank-accounts   # List bank accounts
POST /api/v1/payouts                 # Request payout
GET  /api/v1/payouts                 # List payout history
POST /api/v1/payouts/:id/cancel      # Cancel payout request

# Admin endpoints
GET  /api/v1/payouts/admin/all       # Get all payouts
POST /api/v1/payouts/admin/:id/process # Process payout

# Test Data Required
- Creator account with earnings
- Bank account details
```

#### 6. Refund System Testing
```bash
# Endpoints to test
POST /api/v1/refunds           # Request refund
GET  /api/v1/refunds           # List user refunds
GET  /api/v1/refunds/:id       # Get refund detail
POST /api/v1/refunds/:id/cancel # Cancel refund request

# Admin endpoints
GET  /api/v1/refunds/admin/all       # Get all refunds
POST /api/v1/refunds/admin/:id/process # Process refund

# Test Data Required
- Completed order to refund
- Admin access
```

---

### LOW PRIORITY - Blocked Tests from Previous Session

#### 7. Tests Previously Blocked (Need Test Data)
| Test ID | Reason | Action Required |
|---------|--------|-----------------|
| PUR-001 to PUR-007 | No purchase flow data | Create test orders first |
| REV-001 to REV-004 | No purchase to review | Create completed order first |
| REF-001 to REF-003 | No refundable order | Create completed order first |
| CRE-007, CRE-008 | No available balance | Simulate earnings first |
| ADM-008 | No pending refund | Create refund request first |

---

## 🛠 MCP Tools for QA Agent

### MANDATORY: Use these MCP tools for testing:

#### 1. Context7 MCP - For Documentation
```
Use MCP context7 to read external documentation for:
- Supabase testing best practices
- API testing methodologies
- E2E testing patterns
```

#### 2. Supabase MCP - For Database Operations
```
Use MCP supabase-mcp-server for:
- Creating test data directly in database
- Querying database state
- Verifying data integrity after API calls
- Checking RLS policies

Available tools:
- mcp_supabase-mcp-server_execute_sql
- mcp_supabase-mcp-server_list_tables
- mcp_supabase-mcp-server_list_projects
```

#### 3. Browser Automation MCP - For E2E Tests
```
Use MCP browser_eval or next-devtools for:
- UI automation testing
- E2E flow testing
- Visual verification

Note: Jika Playwright start failed, gunakan alternative:
- Manual browser testing
- Curl-based API testing
- Next.js MCP tools
```

---

## 📊 Test Accounts Available

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@findinggems.com | Admin123! |
| Creator | creator@example.com | CreatorPassword123! |
| Buyer | buyer@example.com | TestBuyer123! |
| Creator 2 | creator@test.com | (check database) |
| Buyer 2 | buyer@test.com | (check database) |

---

## 🎯 Success Criteria

### For Bug Fixes:
- [ ] ADM-002: Admin can approve/reject pending websites without "Not Found" error
- [ ] CRE-004: Creator can edit their own websites without "Forbidden" error
- [ ] CRE-005: Creator can delete their own websites without "Forbidden" error
- [ ] ADM-007: Admin can update user roles without error

### For Payment/Payout/Refund:
- [ ] Payment initiation returns valid payment URL/invoice
- [ ] Payout request works for creators with balance
- [ ] Bank account can be added and retrieved
- [ ] Refund request works for eligible orders

---

## 📝 Test Report Template

```markdown
# QA Test Report - [Date]

## Tester: [Name]

## Bug Retest Results
| Bug ID | Test Result | Evidence |
|--------|-------------|----------|
| ADM-002 | PASS/FAIL | [screenshot/curl output] |
| CRE-004 | PASS/FAIL | [screenshot/curl output] |
| CRE-005 | PASS/FAIL | [screenshot/curl output] |
| ADM-007 | PASS/FAIL | [screenshot/curl output] |

## Payment Flow Results
| Test ID | Test Result | Notes |
|---------|-------------|-------|
| ... | ... | ... |

## Issues Found
| Issue ID | Severity | Description | Steps to Reproduce |
|----------|----------|-------------|-------------------|
| ... | ... | ... | ... |
```

---

## 🔗 Reference Documents

- Previous test report: `/QA-INTEGRATION-TEST-REPORT.md`
- E2E test completion doc: `/E2E Test Completion.md`
- Full testing brief: `/QA-FULL-TESTING-BRIEF.md`
- Backend integration brief: `/QA-BACKEND-INTEGRATION-TESTING.md`

---

## ⚠️ Known Limitations

1. **Playwright MCP** - Previously failed to start. Try restarting or use curl-based testing
2. **Supabase Direct Access** - May require service role key for some operations
3. **Test Data** - Some tests blocked due to lack of test data. Use Supabase MCP to create

---

**END OF BRIEF**

*Backend Agent - Ready for handoff to QA Agent*
