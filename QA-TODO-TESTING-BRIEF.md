# 📋 QA TODO Testing Brief - Finding Gems

**Date:** 2026-02-07 15:56 WIB  
**From:** Backend Agent  
**To:** QA Agent  
**Status:** Ready for Execution

---

## 🎯 Objective

Execute **50 test cases** yang sudah siap ditest sekarang.

---

## ⚙️ Prerequisites

### 1. Start Backend Server
```bash
cd /Users/arkan/finding-gems/backend
npm run dev
```
Server running at: `http://localhost:3001`

### 2. Get Auth Tokens
```bash
# Admin Token
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

# Buyer Token
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

# Creator Token
export CREATOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

# Verify tokens
echo "Admin: $ADMIN_TOKEN"
echo "Buyer: $BUYER_TOKEN"
echo "Creator: $CREATOR_TOKEN"
```

---

# 1️⃣ SECURITY TESTS (16 tests)

## SEC-001: SQL Injection

```bash
# Test SQL injection in login email
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR 1=1--","password":"test"}' | jq

# Expected: VALIDATION_ERROR atau UNAUTHORIZED, NOT database error
```

**Pass Criteria:** Request rejected with proper error, no SQL error exposed

---

## SEC-002: XSS Prevention

```bash
# Test XSS in registration name field
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"xsstest@example.com",
    "password":"XssTest123!",
    "name":"<script>alert(1)</script>",
    "username":"xsstest"
  }' | jq

# Expected: Sanitized or rejected
```

**Pass Criteria:** Script tags escaped/sanitized, no raw HTML in response

---

## SEC-003: Brute Force Protection

```bash
# Attempt 25 failed logins (should get 429 after ~5-20 attempts)
for i in {1..25}; do 
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpass"}')
  echo "Attempt $i: $CODE"
done

# Expected: 401 initially, then 429 after rate limit kicks in
```

**Pass Criteria:** Rate limit (429) triggered before 25 attempts

---

## SEC-004: JWT Token Tampering

```bash
# Create tampered token (modify payload)
TAMPERED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

curl -s http://localhost:3001/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TAMPERED_TOKEN" | jq

# Expected: 401 UNAUTHORIZED
```

**Pass Criteria:** Tampered token rejected with 401

---

## SEC-005: Expired Token Access

```bash
# Use an intentionally expired token
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.invalid"

curl -s http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $EXPIRED_TOKEN" | jq

# Expected: 401 UNAUTHORIZED with message about expired token
```

**Pass Criteria:** Expired token rejected with 401

---

## SEC-007: CORS Policy

```bash
# Test CORS from unauthorized origin
curl -s -I -X OPTIONS http://localhost:3001/api/v1/websites \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" | grep -i "access-control"

# Expected: No Access-Control-Allow-Origin for malicious origin
```

**Pass Criteria:** CORS headers not present for unauthorized origins

---

## SEC-008: User Accesses Admin Endpoint

```bash
# Buyer tries to access admin dashboard
curl -s http://localhost:3001/api/v1/admin/dashboard \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.error.code'

# Expected: "FORBIDDEN"
```

**Pass Criteria:** Returns 403 FORBIDDEN

---

## SEC-009: Buyer Accesses Creator Endpoint

```bash
# Buyer tries to create website (creator-only)
curl -s -X POST http://localhost:3001/api/v1/websites \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://test.com","categoryId":"test"}' | jq '.error.code'

# Expected: "FORBIDDEN"
```

**Pass Criteria:** Returns 403 FORBIDDEN

---

## SEC-010: User Edits Other's Website

```bash
# Get a website ID that belongs to creator
WEBSITE_ID=$(curl -s http://localhost:3001/api/v1/websites | jq -r '.data.websites[0].id')

# Buyer tries to edit it
curl -s -X PATCH "http://localhost:3001/api/v1/websites/$WEBSITE_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked"}' | jq

# Expected: 403 FORBIDDEN
```

**Pass Criteria:** Returns 403 FORBIDDEN

---

## SEC-011: IDOR - Order Access

```bash
# Try to access a random order ID (not yours)
curl -s "http://localhost:3001/api/v1/orders/00000000-0000-0000-0000-000000000001" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq

# Expected: 403 or 404 (not another user's order data)
```

**Pass Criteria:** Cannot access other user's orders

---

## SEC-015: Oversized Payload

```bash
# Generate 10MB payload and send
LARGE_PAYLOAD=$(python3 -c "print('{\"data\":\"' + 'A'*10000000 + '\"}')")
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "$LARGE_PAYLOAD" -w "\nHTTP Status: %{http_code}\n" | tail -5

# Expected: 413 Payload Too Large
```

**Pass Criteria:** Returns 413 or 400, not 500

---

## SEC-020: Rate Limiting

```bash
# Send 100+ requests rapidly
for i in {1..100}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/websites &
done | sort | uniq -c

# Expected: Some 429 responses after rate limit hit
```

**Pass Criteria:** Rate limit (429) triggered

---

## SEC-021: Password Not in Response

```bash
# Check login response doesn't contain password
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | grep -i "password"

# Expected: No password field in response
```

**Pass Criteria:** Password never returned in any response

---

## SEC-023: HTTPS Enforcement

```bash
# Check production URL redirects HTTP to HTTPS
curl -sI http://findinggems.id 2>&1 | head -5

# Expected: 301/302 redirect to https://
```

**Pass Criteria:** HTTP redirects to HTTPS (production only)

---

## SEC-024: Security Headers

```bash
# Check security headers
curl -sI http://localhost:3001/api/v1/websites | grep -iE "(x-frame|x-content|strict-transport|content-security)"

# Expected: X-Frame-Options, X-Content-Type-Options, etc.
```

**Pass Criteria:** Security headers present

---

# 2️⃣ DATA VALIDATION TESTS (9 tests)

## DATA-001: Email Uniqueness

```bash
# Try to register with existing email
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"buyer@example.com",
    "password":"TestPass123!",
    "name":"Duplicate",
    "username":"duplicate123"
  }' | jq

# Expected: Error about email already exists
```

**Pass Criteria:** Returns error about duplicate email

---

## DATA-002: Username Uniqueness

```bash
# Get existing username first
EXISTING_USER=$(curl -s http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq -r '.data.user.username')

# Try to register with same username
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"newuser$(date +%s)@example.com\",
    \"password\":\"TestPass123!\",
    \"name\":\"Test\",
    \"username\":\"$EXISTING_USER\"
  }" | jq

# Expected: Error about username taken
```

**Pass Criteria:** Returns error about duplicate username

---

## DATA-006: Invalid Email Format

```bash
# Test various invalid email formats
for EMAIL in "invalidemail" "@test.com" "test@" "test@.com" "test@@test.com"; do
  echo "Testing: $EMAIL"
  curl -s -X POST http://localhost:3001/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"Test123!\",\"name\":\"Test\",\"username\":\"test$(date +%s)\"}" | jq '.error.code'
done

# Expected: All return VALIDATION_ERROR
```

**Pass Criteria:** All invalid emails rejected

---

## DATA-007: Weak Password Validation

```bash
# Test weak passwords
for PASS in "short" "nouppercase1" "NOLOWERCASE1" "NoNumber" "12345678"; do
  echo "Testing: $PASS"
  curl -s -X POST http://localhost:3001/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$(date +%s)@test.com\",\"password\":\"$PASS\",\"name\":\"Test\",\"username\":\"test$(date +%s)\"}" | jq '.error.code'
done

# Expected: All return VALIDATION_ERROR
```

**Pass Criteria:** All weak passwords rejected

---

## DATA-008: Price Validation (Negative/Invalid)

```bash
# Test invalid prices (if applicable to your create endpoint)
curl -s -X POST http://localhost:3001/api/v1/websites \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://test.com","price":-100}' | jq

# Expected: VALIDATION_ERROR
```

**Pass Criteria:** Negative prices rejected

---

## DATA-009: Invalid URL Format

```bash
# Test invalid URLs
for URL in "not-a-url" "ftp://invalid" "javascript:alert(1)" "//test"; do
  echo "Testing: $URL"
  curl -s -X POST http://localhost:3001/api/v1/websites \
    -H "Authorization: Bearer $CREATOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test\",\"url\":\"$URL\"}" | jq '.error.code'
done

# Expected: VALIDATION_ERROR for invalid URLs
```

**Pass Criteria:** Invalid URLs rejected

---

# 3️⃣ NEGATIVE TESTS (19 tests)

## NEG-001: Empty Required Fields

```bash
# Send empty object
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{}' | jq

# Expected: 400 with field validation errors
```

**Pass Criteria:** Returns 400 with specific field errors

---

## NEG-002: Wrong Data Types

```bash
# Send wrong data types
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":123,"password":true,"name":null}' | jq

# Expected: 400 validation error
```

**Pass Criteria:** Type validation catches errors

---

## NEG-003: Negative Numbers

```bash
# Test negative values where not allowed
curl -s "http://localhost:3001/api/v1/websites?page=-1&limit=-10" | jq

# Expected: Returns valid response (sanitized) or 400
```

**Pass Criteria:** Negative values handled gracefully

---

## NEG-004: Very Long Strings

```bash
# Send very long string (1000 chars)
LONG_STRING=$(python3 -c "print('A'*1000)")
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"Test123!\",\"name\":\"$LONG_STRING\",\"username\":\"test\"}" | jq

# Expected: 400 validation error about max length
```

**Pass Criteria:** Long strings rejected or truncated

---

## NEG-005: Special Characters

```bash
# Test special characters
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"<>'\''\"&;","username":"test123"}' | jq

# Expected: Escaped/sanitized, not error
```

**Pass Criteria:** Special chars handled safely

---

## NEG-006: Unicode/Emoji in Name

```bash
# Test Unicode/Emoji
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"emoji'$(date +%s)'@test.com","password":"Test123!","name":"Test 🎉 Unicode","username":"emojitest'$(date +%s)'"}' | jq

# Expected: Accepted or rejected gracefully
```

**Pass Criteria:** Unicode handled correctly

---

## NEG-007: Null Values

```bash
# Send null values
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":null,"password":null,"name":null,"username":null}' | jq

# Expected: 400 validation error
```

**Pass Criteria:** Null values rejected

---

## NEG-009: Pagination Beyond Data

```bash
# Request page that doesn't exist
curl -s "http://localhost:3001/api/v1/websites?page=9999" | jq

# Expected: Empty array, not error
```

**Pass Criteria:** Returns empty array `[]`, status 200

---

## NEG-017: Buy Own Website

```bash
# Creator tries to buy their own website
# First get creator's website
CREATOR_WEBSITE=$(curl -s http://localhost:3001/api/v1/websites/my \
  -H "Authorization: Bearer $CREATOR_TOKEN" | jq -r '.data.websites[0].id')

# Try to buy it
curl -s -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"websiteId\":\"$CREATOR_WEBSITE\"}" | jq

# Expected: Error - cannot buy own website
```

**Pass Criteria:** Prevented from buying own website

---

## NEG-018: Review Without Purchase

```bash
# Try to review without purchasing
WEBSITE_ID=$(curl -s http://localhost:3001/api/v1/websites | jq -r '.data.websites[0].id')

curl -s -X POST "http://localhost:3001/api/v1/websites/$WEBSITE_ID/reviews" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great!"}' | jq

# Expected: Error - must purchase first
```

**Pass Criteria:** Review rejected if no purchase

---

# 4️⃣ E2E UI TESTS (Playwright Headless)

## Setup Playwright

```javascript
// Start browser (run via MCP)
mcp_next-devtools_browser_eval({ 
  action: "start", 
  headless: true,
  browser: "chrome"
})
```

---

## E2E-003: Admin Workflow

```javascript
// 1. Navigate to login
mcp_next-devtools_browser_eval({ 
  action: "navigate", 
  url: "http://localhost:3001/login" 
})

// 2. Fill login form
mcp_next-devtools_browser_eval({ 
  action: "fill_form",
  fields: [
    { selector: "input[name='email']", value: "admin@findinggems.com" },
    { selector: "input[name='password']", value: "Admin123!" }
  ]
})

// 3. Click login
mcp_next-devtools_browser_eval({ 
  action: "click", 
  element: "button[type='submit']" 
})

// 4. Navigate to admin dashboard
mcp_next-devtools_browser_eval({ 
  action: "navigate", 
  url: "http://localhost:3000/admin" 
})

// 5. Screenshot
mcp_next-devtools_browser_eval({ 
  action: "screenshot", 
  fullPage: true 
})
```

---

## AUTH-001-007: Auth Flow Tests

```javascript
// AUTH-001: Registration
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/register" })
mcp_next-devtools_browser_eval({ action: "screenshot" })

// Test form fields exist
mcp_next-devtools_browser_eval({ 
  action: "evaluate", 
  script: "document.querySelector('input[name=\"email\"]') !== null"
})

// AUTH-002: Login Page
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/login" })
mcp_next-devtools_browser_eval({ action: "screenshot" })
```

---

## DISC-001-008: Discovery Tests

```javascript
// DISC-001: Browse websites
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/explore" })
mcp_next-devtools_browser_eval({ action: "screenshot" })

// DISC-002: Search
mcp_next-devtools_browser_eval({ 
  action: "type", 
  element: "input[type='search']", 
  text: "AI tools"
})
mcp_next-devtools_browser_eval({ action: "screenshot" })

// DISC-008: Website detail
mcp_next-devtools_browser_eval({ action: "click", element: ".website-card:first-child" })
mcp_next-devtools_browser_eval({ action: "screenshot" })
```

---

## BOOK-001-003: Bookmark Tests

```javascript
// Login first, then:
// BOOK-001: Add bookmark
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/explore" })
mcp_next-devtools_browser_eval({ action: "click", element: ".bookmark-button" })
mcp_next-devtools_browser_eval({ action: "screenshot" })

// BOOK-002: View bookmarks
mcp_next-devtools_browser_eval({ action: "navigate", url: "http://localhost:3000/dashboard/bookmarks" })
mcp_next-devtools_browser_eval({ action: "screenshot" })

// BOOK-003: Remove bookmark
mcp_next-devtools_browser_eval({ action: "click", element: ".bookmark-button" })
mcp_next-devtools_browser_eval({ action: "screenshot" })
```

---

## Close Browser

```javascript
mcp_next-devtools_browser_eval({ action: "close" })
```

---

# 5️⃣ PERFORMANCE - FRONTEND (6 tests)

## Run Lighthouse Tests

```bash
# Install Lighthouse CLI if needed
npm install -g lighthouse

# PERF-015-017: Homepage metrics
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-home.json --only-categories=performance

# Extract scores
cat lighthouse-home.json | jq '.audits."largest-contentful-paint".numericValue' # LCP (target < 2500)
cat lighthouse-home.json | jq '.audits."first-input-delay".numericValue'        # FID (target < 100)
cat lighthouse-home.json | jq '.audits."cumulative-layout-shift".numericValue'  # CLS (target < 0.1)
```

---

## PERF-018: Explore Page TTI

```bash
lighthouse http://localhost:3000/explore --output=json --output-path=./lighthouse-explore.json --only-categories=performance
cat lighthouse-explore.json | jq '.audits.interactive.numericValue'  # TTI (target < 3000)
```

---

## PERF-019: Website Detail LCP

```bash
# Get first website slug
SLUG=$(curl -s http://localhost:3001/api/v1/websites | jq -r '.data.websites[0].slug')

lighthouse "http://localhost:3000/websites/$SLUG" --output=json --output-path=./lighthouse-detail.json --only-categories=performance
cat lighthouse-detail.json | jq '.audits."largest-contentful-paint".numericValue'  # LCP (target < 2000)
```

---

## PERF-020: Admin Dashboard Load

```bash
# Note: Admin dashboard requires auth, may need to test after login
lighthouse http://localhost:3000/admin --output=json --output-path=./lighthouse-admin.json --only-categories=performance
cat lighthouse-admin.json | jq '.audits.interactive.numericValue'  # Load time (target < 3000)
```

---

# 📊 TEST REPORT TEMPLATE

Setelah testing, isi report ini:

```markdown
# QA Test Report - TODO Tests

**Date:** 2026-02-07
**Tester:** [Name]
**Environment:** Local (localhost:3001)

## Summary
- Total Test Cases: 50
- Passed: X
- Failed: X
- Blocked: X

## Results by Category

### 1. Security Tests (16)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| SEC-001 | SQL Injection | PASS/FAIL | |
| SEC-002 | XSS Prevention | PASS/FAIL | |
| SEC-003 | Brute Force | PASS/FAIL | |
| ... | ... | ... | |

### 2. Data Validation (9)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| DATA-001 | Email Uniqueness | PASS/FAIL | |
| ... | ... | ... | |

### 3. Negative Tests (19)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| NEG-001 | Empty Fields | PASS/FAIL | |
| ... | ... | ... | |

### 4. E2E UI Tests (Playwright)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| E2E-003 | Admin Workflow | PASS/FAIL | |
| ... | ... | ... | |

### 5. Performance (6)
| ID | Test | Metric | Target | Actual | Status |
|----|------|--------|--------|--------|--------|
| PERF-015 | Homepage LCP | ms | < 2500 | X | PASS/FAIL |
| ... | ... | ... | ... | ... | |

## Bugs Found
- BUG-XXX: [Description]

## Notes
[Any additional observations]
```

---

# ✅ CHECKLIST

- [ ] Security Tests (16)
- [ ] Data Validation Tests (9)
- [ ] Negative Tests (19)
- [ ] E2E UI Tests (Playwright)
- [ ] Performance Tests (6)

---

**Backend Agent - Brief Complete** 🤝

Silakan QA mulai testing dan report hasilnya!
