# QA Backend Integration Testing Brief

> **Untuk Tim QA:** Brief ini berisi panduan lengkap untuk testing backend SEBELUM deploy ke production.
> **PENTING:** Tim QA HANYA melakukan testing dan reporting. JANGAN fix code apapun.

---

## 📋 Testing Overview

### Scope
Testing semua admin dashboard backend endpoints untuk memastikan:
1. Endpoints respond correctly (status codes)
2. Data format sesuai contract
3. Authentication & Authorization bekerja
4. Error handling proper
5. Database queries tidak error

### Testing Types
1. **Health Check Testing** - Verify server is running
2. **Authentication Testing** - Login flow works
3. **Endpoint Testing (curl)** - Each endpoint responds correctly
4. **Integration Testing** - Full flow testing
5. **Error Scenario Testing** - Handle edge cases

---

## 🔧 Prerequisites

### 1. Setup Environment
```bash
cd /Users/arkan/finding-gems/backend
npm install
```

### 2. Start Local Server
```bash
npm run dev
```
Server should start at `http://localhost:3001`

### 3. Get Admin Token
```bash
# Login as admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' \
  | jq '.data.accessToken'
```

**Save the token** untuk digunakan di semua test berikutnya:
```bash
export TOKEN="<paste_token_here>"
```

---

## 🧪 Test Cases

### 1. Health Check
```bash
# TC-001: Health endpoint returns 200
curl -s http://localhost:3001/health | jq

# Expected: {"success":true,"data":{"status":"healthy",...}}
```

**Pass Criteria:** Status 200, `success: true`

---

### 2. Authentication Tests

```bash
# TC-002: Login with valid credentials
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' \
  | jq '.success, .data.user.role'

# Expected: true, "admin"

# TC-003: Login with invalid password
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"wrongpassword"}' \
  | jq

# Expected: {"success":false,"error":{"code":"UNAUTHORIZED",...}}

# TC-004: Access protected endpoint without token
curl -s http://localhost:3001/api/v1/admin/dashboard \
  | jq '.error.code'

# Expected: "UNAUTHORIZED"
```

---

### 3. Admin Dashboard Endpoints

```bash
# TC-005: Get dashboard stats
curl -s http://localhost:3001/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data.stats'

# Expected: true, {totalWebsites:..., totalUsers:...}

# TC-006: Get payment analytics
curl -s "http://localhost:3001/api/v1/admin/analytics/payments?days=30" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true

# TC-007: Get user analytics
curl -s "http://localhost:3001/api/v1/admin/analytics/users?days=30" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true
```

---

### 4. Website Management Endpoints

```bash
# TC-008: Get all websites (admin)
curl -s "http://localhost:3001/api/v1/admin/websites?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data.websites | length, .data.pagination'

# Expected: true, (number), {page:1, limit:10, ...}

# TC-009: Get pending websites
curl -s "http://localhost:3001/api/v1/admin/websites/pending?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true

# TC-010: Moderate website (approve) - use existing website ID
curl -s -X PATCH "http://localhost:3001/api/v1/admin/websites/<WEBSITE_ID>/moderate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active","adminNote":"Approved for testing"}' \
  | jq '.success'

# Expected: true or error if already active
```

---

### 5. Creator Applications Endpoints

```bash
# TC-011: Get all creator applications
curl -s "http://localhost:3001/api/v1/admin/creator-applications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data.applications'

# Expected: true, [...] or []

# TC-012: Get application stats
curl -s "http://localhost:3001/api/v1/admin/creator-applications/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data'

# Expected: true, {total:X, pending:X, approved:X, rejected:X}

# TC-013: Get single application (if exists)
curl -s "http://localhost:3001/api/v1/admin/creator-applications/<APP_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true or 404

# TC-014: Handle application - reject without reason (should fail)
curl -s -X PATCH "http://localhost:3001/api/v1/admin/creator-applications/<APP_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected"}' \
  | jq

# Expected: {"success":false,"error":{"code":"VALIDATION_ERROR",...}}
```

---

### 6. Reports/Moderation Endpoints

```bash
# TC-015: Get all reports
curl -s "http://localhost:3001/api/v1/admin/reports?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true

# TC-016: Get reports by status
curl -s "http://localhost:3001/api/v1/admin/reports?status=pending" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true
```

---

### 7. User Management Endpoints

```bash
# TC-017: Get all users
curl -s "http://localhost:3001/api/v1/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data.users | length'

# Expected: true, (number)

# TC-018: Filter users by role
curl -s "http://localhost:3001/api/v1/admin/users?role=creator" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true
```

---

### 8. Categories Endpoints

```bash
# TC-019: Get all categories
curl -s "http://localhost:3001/api/v1/categories" \
  | jq '.success, .data.categories | length'

# Expected: true, (number > 0)

# TC-020: Create category (admin only)
curl -s -X POST "http://localhost:3001/api/v1/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category","slug":"test-category","description":"Test","icon":"Test","color":"#000000"}' \
  | jq '.success'

# Expected: true

# TC-021: Delete the test category
curl -s -X DELETE "http://localhost:3001/api/v1/categories/<CATEGORY_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success'

# Expected: true
```

---

### 9. Authorization Tests (Non-Admin Access)

```bash
# First, login as regular user
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"BuyerPassword123!"}' \
  | jq '.data.accessToken'

# Save as USER_TOKEN
export USER_TOKEN="<paste_token_here>"

# TC-022: Regular user cannot access admin dashboard
curl -s "http://localhost:3001/api/v1/admin/dashboard" \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '.error.code'

# Expected: "FORBIDDEN"

# TC-023: Regular user cannot access admin websites
curl -s "http://localhost:3001/api/v1/admin/websites" \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '.error.code'

# Expected: "FORBIDDEN"
```

---

### 10. Error Handling Tests

```bash
# TC-024: Invalid endpoint returns 404
curl -s "http://localhost:3001/api/v1/nonexistent" \
  | jq

# Expected: 404 error

# TC-025: Invalid UUID format
curl -s "http://localhost:3001/api/v1/admin/creator-applications/invalid-uuid" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.error.code'

# Expected: "NOT_FOUND" or "VALIDATION_ERROR"

# TC-026: Expired token handling
curl -s "http://localhost:3001/api/v1/admin/dashboard" \
  -H "Authorization: Bearer expired.token.here" \
  | jq '.error.code'

# Expected: "UNAUTHORIZED"
```

---

## 📊 Test Report Template

Setelah testing, isi report ini:

```markdown
# Backend Integration Test Report

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Environment:** Local / Staging

## Summary
- Total Test Cases: 26
- Passed: X
- Failed: X
- Blocked: X

## Results

| TC ID | Test Case | Status | Notes |
|-------|-----------|--------|-------|
| TC-001 | Health check | PASS/FAIL | |
| TC-002 | Login valid | PASS/FAIL | |
| ... | ... | ... | |

## Failed Cases Details

### TC-XXX: [Test Name]
- **Expected:** [what was expected]
- **Actual:** [what happened]
- **Error Message:** [paste error]
- **Screenshot/Log:** [if applicable]

## Bugs Found

| Bug ID | Severity | Description | Affected Endpoint |
|--------|----------|-------------|-------------------|
| BUG-001 | HIGH | ... | /api/v1/... |

## Recommendations
- [List any recommendations]
```

---

## ⚠️ Known Issues to Verify

Dari Render logs, verify apakah issues ini masih ada:

1. **RLS Policy Error on creator_applications**
   ```
   "new row violates row-level security policy for table \"creator_applications\""
   ```
   - Test: POST /api/v1/creator-applications as authenticated user

2. **Column name mismatch (should be fixed)**
   ```
   "column websites.created_at does not exist"
   ```
   - Test: GET /api/v1/admin/websites

---

## 🚫 Rules untuk QA

1. **JANGAN** modify source code apapun
2. **JANGAN** fix bugs - hanya report
3. **CATAT** semua error messages dengan lengkap
4. **SCREENSHOT** jika perlu
5. **PRIORITAS** test cases berdasarkan severity

---

## 📁 Output Files

Save test report ke:
```
/Users/arkan/finding-gems/BACKEND-TEST-REPORT.md
```

---

## ✅ Definition of Done

Testing dianggap complete jika:
- [ ] Semua 26 test cases dijalankan
- [ ] Report lengkap dengan status setiap TC
- [ ] Semua bugs documented dengan detail
- [ ] Recommendations provided

---

**Questions?** Hubungi backend team untuk clarification.
