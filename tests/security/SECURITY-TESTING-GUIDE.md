# 🛡️ Security Testing Guide - Finding Gems

## Overview

Panduan ini menjelaskan cara melakukan security testing untuk Finding Gems API menggunakan berbagai tools dan teknik.

---

## 🔧 Tools yang Dibutuhkan

### 1. OWASP ZAP (Zed Attack Proxy)
**Install:**
```bash
# macOS
brew install --cask owasp-zap

# atau download dari:
# https://www.zaproxy.org/download/
```

### 2. curl (sudah tersedia di macOS)

### 3. jq (untuk parsing JSON)
```bash
brew install jq
```

### 4. SQLMap (untuk SQL Injection testing)
```bash
pip install sqlmap
```

---

## 🎯 Security Test Categories

### A. Authentication & Authorization

#### A1. Brute Force Protection
```bash
# Test rate limiting (should be blocked after 5-10 attempts)
for i in {1..15}; do
  curl -s -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}' | jq '.success'
  sleep 0.2
done
```
**Expected:** After 5-10 attempts, should return 429 Too Many Requests

#### A2. Token Validation
```bash
# Test expired token
curl -s http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxNjAwMDAwMDAwfQ.invalid" \
  | jq '.'

# Expected: 401 Unauthorized
```

#### A3. IDOR Testing (Insecure Direct Object Reference)
```bash
# Login as buyer
BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

# Try to access other user's order (replace with valid order_id from another user)
curl -s http://localhost:3001/api/v1/orders/OTHER_USER_ORDER_ID \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.'

# Expected: 403 Forbidden or 404 Not Found
```

---

### B. Input Validation

#### B1. SQL Injection
```bash
# Test search endpoint
curl -s "http://localhost:3001/api/v1/websites?search=test'%20OR%201=1--" | jq '.'

# Test with SQLMap (automated)
sqlmap -u "http://localhost:3001/api/v1/websites?search=test" --batch --level=2

# Expected: No SQL errors, query should be sanitized
```

#### B2. XSS (Cross-Site Scripting)
```bash
# Test registration with XSS payload
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xss<script>alert(1)</script>@test.com",
    "password": "Password123!",
    "fullName": "<img src=x onerror=alert(1)>"
  }' | jq '.'

# Expected: Validation error or sanitized input
```

#### B3. NoSQL Injection
```bash
# Test with object injection
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$gt": ""}, "password": {"$gt": ""}}' | jq '.'

# Expected: Validation error, not login success
```

#### B4. Path Traversal
```bash
# Test file access
curl -s "http://localhost:3001/api/v1/../../etc/passwd" | head
curl -s "http://localhost:3001/api/v1/uploads/../../../etc/passwd" | head

# Expected: 404 Not Found, not file contents
```

#### B5. Command Injection
```bash
# Test in search parameter
curl -s "http://localhost:3001/api/v1/websites?search=test;%20ls%20-la" | jq '.'
curl -s "http://localhost:3001/api/v1/websites?search=test%7C%20cat%20/etc/passwd" | jq '.'

# Expected: Normal search results, no command execution
```

---

### C. Security Headers

#### C1. Check Response Headers
```bash
curl -s -I http://localhost:3001/api/v1/websites | grep -E "^(X-|Content-Security|Strict-Transport)"

# Expected headers:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security (in production)
# - Content-Security-Policy
```

#### C2. CORS Policy
```bash
# Test CORS from unauthorized origin
curl -s -I http://localhost:3001/api/v1/websites \
  -H "Origin: https://malicious-site.com" | grep -i "access-control"

# Expected: No Access-Control-Allow-Origin for unauthorized origins
```

---

### D. Data Protection

#### D1. Sensitive Data Exposure
```bash
# Check if error messages leak sensitive info
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notexist@test.com","password":"wrong"}' | jq '.'

# Expected: Generic error message like "Invalid credentials"
# NOT "User not found" or "Wrong password"
```

#### D2. Password Policy
```bash
# Test weak password
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123","fullName":"Test"}' | jq '.'

# Expected: Validation error for weak password
```

---

### E. Denial of Service

#### E1. Large Payload
```bash
# Generate large payload (1MB)
LARGE_PAYLOAD=$(python3 -c "print('a' * 1048576)")

curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LARGE_PAYLOAD@test.com\",\"password\":\"Test123!\",\"fullName\":\"Test\"}" | jq '.'

# Expected: 413 Payload Too Large or validation error
```

#### E2. Many Parameters
```bash
# Test with excessive query parameters
curl -s "http://localhost:3001/api/v1/websites?param1=a&param2=b&param3=c&param4=d&param5=e&param6=f&param7=g&param8=h&param9=i&param10=j&param11=k&param12=l" | jq '.success'

# Expected: Should handle gracefully
```

---

## 🔍 OWASP ZAP Automated Scan

### Quick Scan
```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8090

# Run quick scan
zap-cli --zap-url http://localhost:8090 quick-scan http://localhost:3001/api/v1

# Generate report
zap-cli --zap-url http://localhost:8090 report -o security-report.html -f html
```

### Full Scan with API Definition
```bash
# If you have OpenAPI spec:
zap.sh -daemon -port 8090 \
  -config api.addrs.addr.name=.* \
  -config api.addrs.addr.regex=true

# Import OpenAPI spec and scan
zap-cli --zap-url http://localhost:8090 \
  openapi-import http://localhost:3001/api/v1/openapi.json

zap-cli --zap-url http://localhost:8090 active-scan http://localhost:3001
```

---

## 📊 Security Test Checklist

| Category | Test | Expected Result | Status |
|----------|------|-----------------|--------|
| **Auth** | Brute force protection | 429 after 5-10 attempts | ⏳ |
| **Auth** | Invalid token rejection | 401 Unauthorized | ⏳ |
| **Auth** | IDOR prevention | 403/404 for other's resources | ⏳ |
| **Input** | SQL injection | Sanitized/Blocked | ⏳ |
| **Input** | XSS prevention | Sanitized/Blocked | ⏳ |
| **Input** | Path traversal | Blocked | ⏳ |
| **Input** | Command injection | Blocked | ⏳ |
| **Headers** | Security headers present | X-Content-Type-Options, etc | ⏳ |
| **Headers** | CORS configured | Only allowed origins | ⏳ |
| **Data** | No sensitive data in errors | Generic messages | ⏳ |
| **Data** | Password policy enforced | Weak passwords rejected | ⏳ |
| **DoS** | Large payload handled | 413 or validation error | ⏳ |
| **DoS** | Rate limiting works | 429 when exceeded | ⏳ |

---

## 🚨 Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| **CRITICAL** | Data breach possible | Immediate fix before production |
| **HIGH** | Security bypass possible | Fix within 24 hours |
| **MEDIUM** | Indirect security impact | Fix within 1 week |
| **LOW** | Minor security improvement | Fix in next sprint |
| **INFO** | Best practice recommendation | Consider for improvement |

---

## 📝 Reporting Template

```markdown
## Security Issue Report

**ID:** SEC-XXX
**Severity:** [CRITICAL/HIGH/MEDIUM/LOW/INFO]
**Category:** [Authentication/Input Validation/Data Protection/etc]

### Description
[Describe the vulnerability]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Evidence
[Screenshots, logs, curl commands]

### Recommendation
[How to fix]
```

---

## 📚 Resources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/)
- [Node.js Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
