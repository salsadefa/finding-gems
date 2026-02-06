# 🧪 QA Testing Prompt - Finding Gems Backend

**IMPORTANT INSTRUCTIONS FOR AI QA TESTER:**

You are a **QA Test Engineer**. Your job is to:
1. **Create unit tests** for the backend system
2. **Run all tests** and record results
3. **DO NOT fix any code** - only test and report
4. **Generate a comprehensive test report** at the end

---

## 🎯 YOUR MISSION

### Phase 1: Setup & Dependencies
```bash
cd /Users/arkan/finding-gems/backend
npm install
```

Verify test framework is ready:
```bash
npm test -- --version
```

---

### Phase 2: Create Unit Tests

Create test files in `backend/src/__tests__/` directory for:

#### 1. Email Service Tests (`email.service.test.ts`)
Test all email functions:
- `sendEmail()` - base function
- `sendPaymentSuccessEmail()`
- `sendPaymentFailedEmail()`
- `sendInvoiceEmail()`
- `sendNewSaleEmail()`
- `sendPayoutRequestedEmail()`
- `sendPayoutProcessedEmail()`
- `sendRefundStatusEmail()`
- `sendWelcomeEmail()`

**Test cases:**
- ✅ Should send email with correct subject
- ✅ Should include correct data in email body
- ✅ Should handle missing optional fields
- ✅ Should throw error if SMTP not configured

#### 2. Xendit Service Tests (`xendit.service.test.ts`)
Test payment gateway functions:
- `isAvailable()`
- `createInvoice()`
- `getInvoiceStatus()`
- `expireInvoice()`
- `verifyWebhookToken()`
- `parseWebhookPayload()`
- `mapStatus()`

**Test cases:**
- ✅ Should return false when API key not configured
- ✅ Should create invoice with correct params
- ✅ Should verify webhook token correctly
- ✅ Should map Xendit statuses to internal statuses

#### 3. Payment Controller Tests (`payment.controller.test.ts`)
Test endpoints:
- `POST /api/v1/payments/initiate`
- `GET /api/v1/payments/:id/status`
- `POST /api/v1/payments/webhook/xendit`

**Test cases:**
- ✅ Should return 401 if not authenticated
- ✅ Should return 400 if order_id missing
- ✅ Should create payment and return payment URL
- ✅ Should update order status on webhook callback
- ✅ Should grant user access after successful payment
- ✅ Should send email notifications after payment

#### 4. Payout Controller Tests (`payout.controller.test.ts`)
Test endpoints:
- `GET /api/v1/payouts/balance`
- `POST /api/v1/payouts/balance/recalculate`
- `GET /api/v1/payouts/bank-accounts`
- `POST /api/v1/payouts/bank-accounts`
- `DELETE /api/v1/payouts/bank-accounts/:id`
- `GET /api/v1/payouts`
- `POST /api/v1/payouts`
- `POST /api/v1/payouts/:id/cancel`
- `GET /api/v1/payouts/admin/all` (Admin only)
- `POST /api/v1/payouts/admin/:id/process` (Admin only)

**Test cases:**
- ✅ Should return 401 if not authenticated
- ✅ Should return 403 if not creator
- ✅ Should return balance for creator
- ✅ Should add bank account
- ✅ Should create payout request
- ✅ Should reject if insufficient balance
- ✅ Should reject if no bank account
- ✅ Admin: should process payout
- ✅ Admin: should reject payout with reason
- ✅ Should send email on payout request
- ✅ Should send email on payout processed

#### 5. Refund Controller Tests (`refund.controller.test.ts`)
Test endpoints:
- `POST /api/v1/refunds`
- `GET /api/v1/refunds`
- `GET /api/v1/refunds/:id`
- `POST /api/v1/refunds/:id/cancel`
- `GET /api/v1/refunds/admin/all` (Admin only)
- `POST /api/v1/refunds/admin/:id/process` (Admin only)

**Test cases:**
- ✅ Should return 401 if not authenticated
- ✅ Should create refund request for paid order
- ✅ Should reject if order not paid
- ✅ Should reject if refund already exists
- ✅ Should cancel pending refund
- ✅ Admin: should approve refund
- ✅ Admin: should reject refund with reason
- ✅ Admin: should complete refund and revoke access
- ✅ Should send email on refund status change

#### 6. Billing Controller Tests (`billing.controller.test.ts`)
Test endpoints:
- `POST /api/v1/billing/orders`
- `GET /api/v1/billing/orders`
- `GET /api/v1/billing/orders/:id`
- `GET /api/v1/billing/invoices`
- `GET /api/v1/billing/invoices/:id`

**Test cases:**
- ✅ Should create order for website
- ✅ Should return user's orders
- ✅ Should return order detail with transactions
- ✅ Should return user's invoices

---

### Phase 3: Run Tests

Execute all tests:
```bash
cd /Users/arkan/finding-gems/backend
npm test
```

Or run specific test file:
```bash
npm test -- src/__tests__/email.service.test.ts
npm test -- src/__tests__/xendit.service.test.ts
npm test -- src/__tests__/payment.controller.test.ts
npm test -- src/__tests__/payout.controller.test.ts
npm test -- src/__tests__/refund.controller.test.ts
npm test -- src/__tests__/billing.controller.test.ts
```

Run with coverage:
```bash
npm run test:coverage
```

---

### Phase 4: Integration Tests (Optional)

If time permits, create integration tests in `backend/src/__tests__/integration/`:

1. **Payment Flow Integration** (`payment-flow.integration.test.ts`)
   - Create order → Initiate payment → Webhook callback → Check access granted

2. **Payout Flow Integration** (`payout-flow.integration.test.ts`)
   - Add bank account → Request payout → Admin process → Check balance updated

3. **Refund Flow Integration** (`refund-flow.integration.test.ts`)
   - Request refund → Admin process → Check access revoked

---

## 📊 REPORT FORMAT

At the end, generate a report in this format:

```markdown
# 🧪 QA Test Report - Finding Gems Backend
**Date:** [Current Date]
**Tester:** AI QA Agent

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | X |
| Passed | X |
| Failed | X |
| Skipped | X |
| Coverage | X% |

## Test Results by Module

### 1. Email Service
| Test Case | Status | Notes |
|-----------|--------|-------|
| sendEmail base function | ✅/❌ | |
| sendPaymentSuccessEmail | ✅/❌ | |
| ... | | |

### 2. Xendit Service
| Test Case | Status | Notes |
|-----------|--------|-------|
| isAvailable | ✅/❌ | |
| ... | | |

### 3. Payment Controller
| Test Case | Status | Notes |
|-----------|--------|-------|
| POST /payments/initiate - 401 unauthorized | ✅/❌ | |
| ... | | |

### 4. Payout Controller
...

### 5. Refund Controller
...

### 6. Billing Controller
...

## Failed Tests Detail
For each failed test:
- **Test Name:** 
- **Expected:** 
- **Actual:** 
- **Error Message:**
- **Stack Trace:**

## Bugs Found
| ID | Severity | Module | Description | Steps to Reproduce |
|----|----------|--------|-------------|-------------------|
| BUG-001 | High/Medium/Low | | | |

## Recommendations
1. [List any recommendations for code improvements]
2. [List missing test coverage areas]

## Files Created
- backend/src/__tests__/email.service.test.ts
- backend/src/__tests__/xendit.service.test.ts
- ...
```

---

## ⚠️ RULES

1. **DO NOT modify any existing source code files**
2. **ONLY create test files** in `__tests__` directories
3. **Run tests and document results** accurately
4. **Report ALL failures** - do not hide or fix them
5. **Use mocks** for external services (Supabase, Xendit, Nodemailer)
6. **Follow Jest best practices** for test structure

---

## 📁 Project Structure Reference

```
backend/
├── src/
│   ├── __tests__/           # Create test files here
│   │   ├── email.service.test.ts
│   │   ├── xendit.service.test.ts
│   │   ├── payment.controller.test.ts
│   │   ├── payout.controller.test.ts
│   │   ├── refund.controller.test.ts
│   │   ├── billing.controller.test.ts
│   │   └── integration/
│   │       ├── payment-flow.integration.test.ts
│   │       ├── payout-flow.integration.test.ts
│   │       └── refund-flow.integration.test.ts
│   ├── controllers/
│   │   ├── payment.controller.ts
│   │   ├── payout.controller.ts
│   │   ├── refund.controller.ts
│   │   └── billing.controller.ts
│   └── services/
│       ├── email.service.ts
│       └── xendit.service.ts
├── jest.config.js
└── package.json
```

---

## 🚀 START

Begin by:
1. Running `npm install` in backend directory
2. Creating the first test file (`email.service.test.ts`)
3. Running tests incrementally
4. Building up the full test suite
5. Generating the final report

**Good luck!**
