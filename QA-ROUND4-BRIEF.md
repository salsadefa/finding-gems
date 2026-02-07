# 🧪 QA Testing Brief - Round 4 (Final)
**Finding Gems Application**  
**Date:** 2026-02-07  
**For:** QA Agent (with MCP Playwright)

---

## 📊 Status Alignment dari Round 3 - UPDATED

### ✅ ALL MAJOR BUGS FIXED

| Test ID | Issue | Fix Status | File Changed |
|---------|-------|------------|--------------|
| **NEG-002** | Wrong data type → 500 | ✅ FIXED | website.controller.ts |
| **NEG-004** | 10k+ name accepted | ✅ FIXED | website.controller.ts (max 200 chars) |
| **NEG-008** | Nonexistent category returns websites | ✅ FIXED | website.controller.ts |
| **NEG-009** | Pagination beyond data → error | ✅ FIXED | website.controller.ts |
| **NEG-012** | Duplicate bookmark → 500 | ✅ FIXED | bookmark.controller.ts |
| **NEG-017** | Creator can buy own website | ✅ FIXED | billing.controller.ts |
| **NEG-018** | Review without purchase | ✅ FIXED | review.controller.ts |
| **NEG-020** | Refund after 30 days | ✅ FIXED | refund.controller.ts |
| **SEC-003** | No rate limiting | ✅ FIXED | app.ts (5 attempts/15 min) |
| **SEC-014** | Profile route missing | ✅ FIXED | auth.routes.ts |
| **SEC-015** | Oversized payload not 413 | ✅ FIXED | app.ts (1MB limit + 413 handler) |
| **DISC-002** | Search shortDescription | ✅ FIXED | website.controller.ts |

### ⚠️ Remaining Items to Verify

| Test ID | Issue | Status | Action |
|---------|-------|--------|--------|
| **DATA-011** | Order item_price mismatch | ⚠️ NEEDS DB CHECK | Query existing data |
| **NEG-011** | Max int price | 🔲 NOT TESTED | Edge case test |

### 🚫 BLOCKED (Manual/Advanced)

| Test ID | Reason |
|---------|--------|
| NEG-013, 14, 15, 16 | Server unavailable / Network condition tests |
| SEC-005 | Expired token timing test |
| SEC-017-24 | Advanced security tests (CSRF, XSS, Headers) |
| NEG-022 | No approved creator applications to test |

---

## 🎯 QA Testing dengan MCP Playwright

### Test Environment
```
Backend:  http://localhost:3001
Frontend: http://localhost:3000

Test Accounts:
- admin@test.com / TestAdmin123!
- creator1@test.com / TestCreator123!
- buyer1@test.com / TestBuyer123!
```

---

## Part 1: Backend API Verification (Quick Tests)

### ✅ Test 1: Profile Route (SEC-014 VERIFY)
```bash
# First get a valid token via login
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@test.com","password":"TestBuyer123!"}' | jq -r '.data.token')

# Then test profile route
curl http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** 200 with user data

### ✅ Test 2: Rate Limiting (SEC-003 VERIFY)
```bash
# Run 6 failed login attempts - 6th should be blocked
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}' | jq '.success, .error.code'
  echo ""
done
```
**Expected:** First 5 return auth error, 6th returns `RATE_LIMIT_EXCEEDED`

### ✅ Test 3: Max String Length (NEG-004 VERIFY)
```bash
# Create 300 char name (exceeds 200 limit)
LONG_NAME=$(python3 -c "print('A'*300)")
curl -X POST http://localhost:3001/api/v1/websites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d "{\"name\":\"$LONG_NAME\",\"description\":\"Test\",\"categoryId\":\"test-id\",\"externalUrl\":\"https://example.com\"}"
```
**Expected:** 400 "Name must not exceed 200 characters"

### ✅ Test 4: Payload Too Large (SEC-015 VERIFY)
```bash
# Generate 2MB payload
python3 -c "import json; print(json.dumps({'data': 'A'*2000000}))" > /tmp/large.json
curl -X POST http://localhost:3001/api/v1/websites \
  -H "Content-Type: application/json" \
  -d @/tmp/large.json
```
**Expected:** 413 "Request body exceeds the maximum allowed size of 1MB"

### ✅ Test 5: Pagination Beyond Data (NEG-009 VERIFY)
```bash
curl "http://localhost:3001/api/v1/websites?page=9999&limit=10" | jq '.success, .data.websites'
```
**Expected:** success: true, websites: []

### ✅ Test 6: Nonexistent Category (NEG-008 VERIFY)
```bash
curl "http://localhost:3001/api/v1/websites?category=fake-category-xyz" | jq '.success, .data.websites'
```
**Expected:** success: true, websites: []

---

## Part 2: E2E UI Testing dengan Playwright

### 🚀 Start Browser
```
mcp_next-devtools_browser_eval action=start browser=chrome headless=false
```

---

### E2E-001: User Registration Flow
**Priority:** HIGH

**Steps:**
```
1. action=navigate url=http://localhost:3000/auth/register
2. action=type element="input[name=name]" text="E2E Test User"
3. action=type element="input[name=email]" text="e2e-test@example.com"
4. action=type element="input[name=password]" text="TestPassword123!"
5. action=click element="button[type=submit]"
6. Wait for redirect
7. action=screenshot fullPage=true
```

**Expected:**
- Form validates inputs
- Success redirects to dashboard
- Profile menu appears in navbar

---

### E2E-002: User Login Flow  
**Priority:** HIGH

**Steps:**
```
1. action=navigate url=http://localhost:3000/auth/login
2. action=type element="input[name=email]" text="buyer1@test.com"
3. action=type element="input[name=password]" text="TestBuyer123!"
4. action=click element="button[type=submit]"
5. Wait for redirect
6. Refresh page
7. Verify still logged in
```

**Expected:**
- Login successful
- Session persists on refresh

---

### E2E-003: Website Listing & Search
**Priority:** HIGH

**Steps:**
```
1. action=navigate url=http://localhost:3000/explore
2. Verify website cards displayed
3. action=type element="input[name=search]" text="analytics"
4. Verify filtered results
5. action=click element="[data-category='productivity']"
6. Verify category filter
7. Test pagination next/prev
```

**Expected:**
- All filters work correctly
- Pagination functional

---

### E2E-004: Website Detail Page
**Priority:** HIGH

**Steps:**
```
1. action=navigate url=http://localhost:3000/websites/[any-slug]
2. Verify hero section loads
3. Verify pricing tiers visible
4. Verify reviews section
5. Verify creator info
6. action=screenshot fullPage=true
```

**Expected:**
- All sections render correctly

---

### E2E-005: Purchase Flow
**Priority:** CRITICAL

**Prerequisites:** Logged in as buyer

**Steps:**
```
1. Navigate to website detail
2. Click "Buy Now" on tier
3. Verify checkout page
4. Complete purchase form
5. Verify order confirmation
6. Navigate to /orders
7. Verify order in list
```

**Expected:**
- Full purchase flow completes

---

### E2E-006: Creator Dashboard
**Priority:** HIGH

**Prerequisites:** Logged in as creator

**Steps:**
```
1. Navigate to /creator/dashboard
2. Verify stats cards
3. Verify website list
4. Click "Add Website"
5. Fill and submit form
6. Verify new website appears
```

**Expected:**
- Creator can manage websites

---

### E2E-007: Admin Dashboard
**Priority:** HIGH

**Prerequisites:** Logged in as admin

**Steps:**
```
1. Navigate to /admin
2. Verify all sections load
3. Approve/Reject pending website
4. Verify status updates
```

**Expected:**
- Admin can moderate content

---

### E2E-008: Bookmark & Review
**Priority:** MEDIUM

**Steps:**
```
1. Navigate to website detail
2. Click bookmark button
3. Navigate to /bookmarks
4. Verify website in list
5. For purchased website, submit review
6. Verify review appears
```

**Expected:**
- Bookmark and review work

---

## 📋 Execution Checklist

### Backend API Verification
- [ ] SEC-014: Profile route works
- [ ] SEC-003: Rate limiting blocks after 5 attempts
- [ ] NEG-004: Long string rejected (max 200)
- [ ] SEC-015: Large payload returns 413
- [ ] NEG-009: Pagination beyond returns empty
- [ ] NEG-008: Fake category returns empty

### E2E UI Testing
- [ ] E2E-001: Registration flow
- [ ] E2E-002: Login flow
- [ ] E2E-003: Search & filter
- [ ] E2E-004: Website detail
- [ ] E2E-005: Purchase flow
- [ ] E2E-006: Creator dashboard
- [ ] E2E-007: Admin dashboard
- [ ] E2E-008: Bookmark & review

---

## 📊 Report Template

```markdown
## [TEST-ID]: [Title]
**Status:** ✅ PASS / ❌ FAIL / ⏳ BLOCKED
**Environment:** localhost:3001 / localhost:3000

### Steps Executed:
1. ...
2. ...

### Evidence:
[Screenshot URL or curl output]

### Issues:
[If any bugs found]

### Notes:
[Additional observations]
```

---

**Brief Version:** 2.0  
**Backend Status:** ✅ All fixes applied  
**Ready for:** QA Testing with Playwright MCP
