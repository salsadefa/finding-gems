---
description: QA Testing - Create unit tests and generate test report for backend system
---

# QA Testing Workflow

## Prerequisites
// turbo-all

## Steps

1. Install dependencies
```bash
cd /Users/arkan/finding-gems/backend && npm install
```

2. Create test directory if not exists
```bash
mkdir -p /Users/arkan/finding-gems/backend/src/__tests__
```

3. Create email service tests - see QA_TESTING_PROMPT.md for test cases

4. Create xendit service tests - see QA_TESTING_PROMPT.md for test cases

5. Create payment controller tests - see QA_TESTING_PROMPT.md for test cases

6. Create payout controller tests - see QA_TESTING_PROMPT.md for test cases

7. Create refund controller tests - see QA_TESTING_PROMPT.md for test cases

8. Create billing controller tests - see QA_TESTING_PROMPT.md for test cases

9. Create creator-application-admin controller tests - see QA-ADMIN-TESTING-BRIEF.md for test cases

10. Run all tests
```bash
cd /Users/arkan/finding-gems/backend && npm test
```

11. Run tests with coverage
```bash
cd /Users/arkan/finding-gems/backend && npm run test:coverage
```

12. Generate test report - save to /Users/arkan/finding-gems/TEST_REPORT.md

## Important Rules
- DO NOT modify any source code files
- ONLY create test files in __tests__ directories
- Use mocks for external services (Supabase, Xendit, Nodemailer)
- Report ALL failures accurately
- Follow Jest best practices

## Reference
See QA_TESTING_PROMPT.md for detailed test cases and report format.
See QA-ADMIN-TESTING-BRIEF.md for admin dashboard controller test cases.
