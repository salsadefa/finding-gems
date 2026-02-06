# Test Report

## Creator Application Admin Controller

- Test file: `backend/src/__tests__/creator-application-admin.controller.test.ts`
- Scope: unit tests for admin creator application APIs
- Status: created test suite
- Total tests: 25

## Execution

- Command: `cd /Users/arkan/finding-gems/backend && npm test -- creator-application-admin`
- Result: PASS
- Jest summary: 18 suites passed, 180 tests passed, 10 skipped, 190 total

## Coverage

- Command: `cd /Users/arkan/finding-gems/backend && npm run test:coverage`
- Result: FAIL (global coverage thresholds not met)
- Jest summary: 19 suites passed, 205 tests passed, 10 skipped, 215 total
- Global coverage: Statements 48.17%, Branches 39.61%, Functions 56.42%, Lines 49.26%
- Note: Failure is due to global coverage thresholds, not test failures.

## Notes

- Supabase is fully mocked; no real DB calls.
- Includes approval flow checks for user role update, creator profile upsert, and creator balance upsert.
- Includes authorization, validation, not-found, pagination, and stats cases.
- Console output during test run:
  - SMTP credentials not configured warning (from email service tests).
  - Xendit API key/token warnings and a simulated invoice error (from xendit service tests).
  - Payment controller logs during webhook tests.
