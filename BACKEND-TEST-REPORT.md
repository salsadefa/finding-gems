# Backend Integration Test Report

**Date:** 2026-02-05
**Tester:** Codex
**Environment:** Local

## Summary
- Total Test Cases: 26
- Passed: 7
- Failed: 15
- Blocked: 4

## Results

| TC ID | Test Case | Status | Notes |
|-------|-----------|--------|-------|
| TC-001 | Health check | PASS | status=200 |
| TC-002 | Login valid | PASS | status=200 |
| TC-003 | Login invalid password | PASS | status=401 |
| TC-004 | Protected endpoint without token | PASS | status=401 |
| TC-005 | Get dashboard stats | FAIL | status=200 |
| TC-006 | Get payment analytics | PASS | status=200 |
| TC-007 | Get user analytics | FAIL | status=401 |
| TC-008 | Get all websites (admin) | FAIL | status=401 |
| TC-009 | Get pending websites | FAIL | status=401 |
| TC-010 | Moderate website approve | BLOCKED | blocked: no pending websites |
| TC-011 | Get all creator applications | FAIL | status=401 |
| TC-012 | Get application stats | FAIL | status=401 |
| TC-013 | Get single application | BLOCKED | blocked: no applications |
| TC-014 | Reject without reason | BLOCKED | blocked: no applications |
| TC-015 | Get all reports | FAIL | status=401 |
| TC-016 | Get reports by status | FAIL | status=401 |
| TC-017 | Get all users | FAIL | status=401 |
| TC-018 | Filter users by role | FAIL | status=401 |
| TC-019 | Get all categories | PASS | status=200 |
| TC-020 | Create category (admin) | FAIL | status=401 |
| TC-021 | Delete test category | BLOCKED | blocked: category create failed |
| TC-022 | Login regular user | FAIL | status=401 |
| TC-023 | User forbidden admin dashboard | FAIL | status=401 |
| TC-024 | User forbidden admin websites | FAIL | status=401 |
| TC-025 | Invalid UUID format | FAIL | status=401 code=UNAUTHORIZED |
| TC-026 | Expired token handling | PASS | status=401 |

## Failed Cases Details

### TC-005: Get dashboard stats
- **Expected:** `data.stats` object in response
- **Actual:** 200 OK but response uses `data.overview`, `data.revenue`, `data.pending`, `data.recent_orders` (no `data.stats`)
- **Error Message:** Contract mismatch (response shape differs from brief)
- **Screenshot/Log:** n/a

### TC-007: Get user analytics
- **Expected:** 200 OK with analytics data
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-008: Get all websites (admin)
- **Expected:** 200 OK with websites + pagination
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-009: Get pending websites
- **Expected:** 200 OK with pending websites
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-011: Get all creator applications
- **Expected:** 200 OK with applications list
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-012: Get application stats
- **Expected:** 200 OK with stats
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-015: Get all reports
- **Expected:** 200 OK with reports list
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-016: Get reports by status
- **Expected:** 200 OK with filtered reports
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-017: Get all users
- **Expected:** 200 OK with users list
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-018: Filter users by role
- **Expected:** 200 OK with filtered users
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-020: Create category (admin)
- **Expected:** 201/200 OK
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

### TC-022: Login regular user
- **Expected:** 200 OK with access token
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Invalid email or password for `buyer@example.com`
- **Screenshot/Log:** n/a

### TC-023: User forbidden admin dashboard
- **Expected:** 403 FORBIDDEN
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Regular user login failed; no valid token
- **Screenshot/Log:** n/a

### TC-024: User forbidden admin websites
- **Expected:** 403 FORBIDDEN
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Regular user login failed; no valid token
- **Screenshot/Log:** n/a

### TC-025: Invalid UUID format
- **Expected:** 404 or VALIDATION_ERROR
- **Actual:** 401 UNAUTHORIZED
- **Error Message:** Access token appears to expire almost immediately (JWT exp-iat ~3s)
- **Screenshot/Log:** n/a

## Bugs Found

| Bug ID | Severity | Description | Affected Endpoint |
|--------|----------|-------------|-------------------|
| BUG-001 | HIGH | Admin access token expires almost immediately (JWT exp-iat ~3s), causing 401 on protected endpoints during sequential tests | /api/v1/admin/* |
| BUG-002 | MEDIUM | Admin dashboard response shape does not include `data.stats` as expected in brief | /api/v1/admin/dashboard |
| BUG-003 | MEDIUM | `buyer@example.com` login fails with INVALID credentials (test data missing or wrong) | /api/v1/auth/login |

## Recommendations
- Increase access token TTL or allow refresh in QA scripts to avoid rapid 401s.
- Align admin dashboard response contract (`data.stats`) or update QA expectations.
- Provide valid non-admin test credentials for authorization tests.
- Address blocked cases by seeding pending data (websites/applications).
