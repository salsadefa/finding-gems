# QA Integration Test Brief - Finding Gems Backend

**Date:** 2026-02-06
**For:** QA Testing AI
**Project:** Finding Gems Backend

---

## ⚠️ CRITICAL RULES - READ FIRST

### 🚫 YOU MUST NOT:
1. **DO NOT FIX ANY CODE** - Your job is ONLY to test and report
2. **DO NOT MODIFY ANY FILES** in `backend/`, `app/`, `lib/`, or any source code
3. **DO NOT CREATE NEW FEATURES** or suggest implementations
4. **DO NOT UPDATE DATABASE SCHEMA** or run migrations

### ✅ YOU MUST:
1. **ONLY RUN TESTS** and document results
2. **REPORT FINDINGS** in the format specified below
3. **START THE SERVER** if it's not running (instructions below)
4. **UPDATE THE TEST REPORT** file with your results

---

## 🚀 Step 1: Start Backend Server (if needed)

### Check if server is running:
```bash
curl -s http://localhost:3001/health | jq '.success'
```

**If response is `true`** → Skip to Step 2

**If no response or error** → Start the server:

```bash
# Kill any existing process on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start server in background
cd /Users/arkan/finding-gems/backend && npm run dev &

# Wait for server to start
sleep 5

# Verify server is running
curl -s http://localhost:3001/health | jq '.success'
```

**Expected output:** `true`

If server fails to start, **STOP and report the error**. Do not attempt to fix it.

---

## 🔑 Step 2: Get Authentication Tokens

### Admin Token:
```bash
ADMIN_TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
```

### Buyer Token:
```bash
BUYER_TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"BuyerPassword123!"}' | jq -r '.data.accessToken')

echo "Buyer Token: ${BUYER_TOKEN:0:50}..."
```

### Creator Token:
```bash
CREATOR_TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

echo "Creator Token: ${CREATOR_TOKEN:0:50}..."
```

---

## 📋 Step 3: Run Test Cases

Run each test case and record the result as **PASS**, **FAIL**, or **BLOCKED**.

### Category A: Health & Authentication (4 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| A-01 | Health Check | `curl -s http://localhost:3001/health \| jq '{success, status: .data.status}'` | `success: true, status: "healthy"` |
| A-02 | Admin Login | `curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@findinggems.com","password":"Admin123!"}' \| jq '{success, role: .data.user.role}'` | `success: true, role: "admin"` |
| A-03 | Buyer Login | `curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"buyer@example.com","password":"BuyerPassword123!"}' \| jq '{success, role: .data.user.role}'` | `success: true, role: "buyer"` |
| A-04 | Invalid Login | `curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"wrong@email.com","password":"wrong"}' \| jq '{success}'` | `success: false` |

### Category B: Admin Dashboard (3 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| B-01 | Dashboard Overview | `curl -s http://localhost:3001/api/v1/admin/dashboard -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success, has_overview: (.data.overview != null), has_revenue: (.data.revenue != null)}'` | `success: true, has_overview: true, has_revenue: true` |
| B-02 | Payment Analytics | `curl -s http://localhost:3001/api/v1/admin/analytics/payments -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| B-03 | User Analytics | `curl -s http://localhost:3001/api/v1/admin/analytics/users -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |

### Category C: Admin Website Management (3 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| C-01 | List All Websites | `curl -s "http://localhost:3001/api/v1/admin/websites" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| C-02 | List Pending Websites | `curl -s "http://localhost:3001/api/v1/admin/websites/pending" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| C-03 | Filter by Status | `curl -s "http://localhost:3001/api/v1/admin/websites?status=active" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |

### Category D: Creator Applications (3 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| D-01 | List Applications | `curl -s "http://localhost:3001/api/v1/admin/creator-applications" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| D-02 | Application Stats | `curl -s "http://localhost:3001/api/v1/admin/creator-applications/stats" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| D-03 | Filter by Status | `curl -s "http://localhost:3001/api/v1/admin/creator-applications?status=pending" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |

### Category E: Reports & Users (4 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| E-01 | List Reports | `curl -s "http://localhost:3001/api/v1/admin/reports" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| E-02 | List Users | `curl -s "http://localhost:3001/api/v1/admin/users" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| E-03 | Filter Users by Role | `curl -s "http://localhost:3001/api/v1/admin/users?role=creator" -H "Authorization: Bearer $ADMIN_TOKEN" \| jq '{success}'` | `success: true` |
| E-04 | List Categories | `curl -s "http://localhost:3001/api/v1/categories" \| jq '{success}'` | `success: true` |

### Category F: Authorization Tests (3 tests)

| TC-ID | Test Name | Command | Expected |
|-------|-----------|---------|----------|
| F-01 | No Token → 401 | `curl -s "http://localhost:3001/api/v1/admin/dashboard" \| jq '{success}'` | `success: false` (401 error) |
| F-02 | Buyer → Admin (Forbidden) | `curl -s "http://localhost:3001/api/v1/admin/dashboard" -H "Authorization: Bearer $BUYER_TOKEN" \| jq '{success}'` | `success: false` (403 error) |
| F-03 | Invalid Token | `curl -s "http://localhost:3001/api/v1/admin/dashboard" -H "Authorization: Bearer invalid_token" \| jq '{success}'` | `success: false` (401 error) |

---

## 📝 Step 4: Update Test Report

After running all tests, update the file `QA-INTEGRATION-TEST-REPORT.md` with this format:

```markdown
# QA Integration Test Report

**Date:** [TODAY'S DATE]
**Tester:** [YOUR NAME]
**Environment:** Local (localhost:3001)

## Summary
- Total Test Cases: 20
- Passed: [COUNT]
- Failed: [COUNT]
- Blocked: [COUNT]

## Results

| TC-ID | Test Name | Status | Notes |
|-------|-----------|--------|-------|
| A-01 | Health Check | PASS/FAIL | [actual response or error] |
| A-02 | Admin Login | PASS/FAIL | [actual response or error] |
... (continue for all tests)

## Failed Cases Details

### [TC-ID]: [Test Name]
- **Expected:** [what was expected]
- **Actual:** [what actually happened]
- **Error Message:** [if any]

## Bugs Found

| Bug ID | Severity | Description | Affected Endpoint |
|--------|----------|-------------|-------------------|
| BUG-XXX | HIGH/MEDIUM/LOW | [Description] | [Endpoint] |

## Recommendations
- [Your recommendations based on test results]
```

---

## 📊 Quick Test Script

If you want to run all tests at once, use this script:

```bash
#!/bin/bash

echo "🚀 Starting QA Integration Tests..."
echo ""

# Get tokens
ADMIN_TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')
BUYER_TOKEN=$(curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"buyer@example.com","password":"BuyerPassword123!"}' | jq -r '.data.accessToken')

echo "=== Category A: Health & Auth ==="
echo "A-01 Health:" && curl -s http://localhost:3001/health | jq '{success}'
echo "A-02 Admin Login:" && curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq '{success, role: .data.user.role}'
echo "A-03 Buyer Login:" && curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"buyer@example.com","password":"BuyerPassword123!"}' | jq '{success, role: .data.user.role}'
echo "A-04 Invalid Login:" && curl -s http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"wrong@email.com","password":"wrong"}' | jq '{success}'

echo ""
echo "=== Category B: Admin Dashboard ==="
echo "B-01 Dashboard:" && curl -s http://localhost:3001/api/v1/admin/dashboard -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "B-02 Payment Analytics:" && curl -s http://localhost:3001/api/v1/admin/analytics/payments -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "B-03 User Analytics:" && curl -s http://localhost:3001/api/v1/admin/analytics/users -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'

echo ""
echo "=== Category C: Websites ==="
echo "C-01 All Websites:" && curl -s "http://localhost:3001/api/v1/admin/websites" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "C-02 Pending Websites:" && curl -s "http://localhost:3001/api/v1/admin/websites/pending" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "C-03 Filter Status:" && curl -s "http://localhost:3001/api/v1/admin/websites?status=active" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'

echo ""
echo "=== Category D: Creator Applications ==="
echo "D-01 List Apps:" && curl -s "http://localhost:3001/api/v1/admin/creator-applications" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "D-02 App Stats:" && curl -s "http://localhost:3001/api/v1/admin/creator-applications/stats" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "D-03 Filter Status:" && curl -s "http://localhost:3001/api/v1/admin/creator-applications?status=pending" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'

echo ""
echo "=== Category E: Reports & Users ==="
echo "E-01 Reports:" && curl -s "http://localhost:3001/api/v1/admin/reports" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "E-02 Users:" && curl -s "http://localhost:3001/api/v1/admin/users" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "E-03 Users by Role:" && curl -s "http://localhost:3001/api/v1/admin/users?role=creator" -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{success}'
echo "E-04 Categories:" && curl -s "http://localhost:3001/api/v1/categories" | jq '{success}'

echo ""
echo "=== Category F: Authorization ==="
echo "F-01 No Token:" && curl -s "http://localhost:3001/api/v1/admin/dashboard" | jq '{success}'
echo "F-02 Buyer Forbidden:" && curl -s "http://localhost:3001/api/v1/admin/dashboard" -H "Authorization: Bearer $BUYER_TOKEN" | jq '{success}'
echo "F-03 Invalid Token:" && curl -s "http://localhost:3001/api/v1/admin/dashboard" -H "Authorization: Bearer invalid_token" | jq '{success}'

echo ""
echo "✅ All tests completed. Please update QA-INTEGRATION-TEST-REPORT.md with results."
```

---

## 🔧 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@findinggems.com` | `Admin123!` |
| Buyer | `buyer@example.com` | `BuyerPassword123!` |
| Creator | `creator@example.com` | `CreatorPassword123!` |

---

## ❓ Troubleshooting

### Server won't start
- **DO NOT FIX IT** - Report: "Server failed to start with error: [error message]"

### Token is empty/null
- **DO NOT FIX IT** - Report: "Login failed for [user], received: [response]"

### Endpoint returns 500
- Note the error message and continue testing other endpoints
- Report: "[TC-ID] returned 500 with error: [error message]"

### Any other issues
- Document the issue clearly
- Continue with other tests if possible
- **DO NOT attempt to fix anything**

---

**REMINDER: Your job is to TEST and REPORT only. Do not modify any code!**
