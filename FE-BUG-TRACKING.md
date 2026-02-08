# Frontend Bug Tracking & Automation Strategy

## 📋 Current Bug Status

### Discovered Mock Data Issues (Auto-detected)
These were found using static code analysis (`grep_search`):

| ID | File | Issue | Status | Priority |
|----|------|-------|--------|----------|
| FE-MOCK-001 | `/app/admin/reports/page.tsx` | Uses `mockReports` from mockData | 🔴 Open | Medium |
| FE-MOCK-002 | `/app/profile/[username]/page.tsx` | Uses `mockUsers`, `mockCreatorProfiles`, `mockWebsites` | 🔴 Open | High |
| FE-MOCK-003 | `/app/admin/creators/page.tsx` | Uses `mockCreatorApplications`, `mockCreatorProfiles`, `mockUsers` | 🔴 Open | Medium |
| FE-MOCK-004 | `/app/creator/analytics/[id]/page.tsx` | Uses `mockWebsites` | 🔴 Open | Medium |

### Fixed Issues
| ID | File | Issue | Status | Fixed In |
|----|------|-------|--------|----------|
| FE-ANALYTICS-001 | `/app/creator/analytics/page.tsx` | Was using mock data instead of real API | ✅ Fixed | This session |
| FE-PAYMENT-001 | `/app/checkout/page.tsx` | Xendit checkout_url not handled properly | ✅ Fixed | This session |
| FE-PAYMENT-002 | `/lib/api/billing.ts` | PaymentInstructions type missing Xendit fields | ✅ Fixed | This session |

---

## 🤖 Automated QA Detection Strategies

### 1. ESLint `no-restricted-imports` Rule

**Best for:** Preventing mock data imports in production code

Add to `.eslintrc.json`:
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["**/mockData*", "**/mock*", "**/__mocks__/*"],
            "message": "Mock data should not be used in production components. Use real API hooks instead."
          }
        ]
      }
    ]
  }
}
```

### 2. Custom grep-based CI Check Script

Create `.github/scripts/check-mock-data.sh`:
```bash
#!/bin/bash
# Check for mock data usage in production code

echo "🔍 Scanning for mock data usage..."

MOCK_IMPORTS=$(grep -rn "mockData" app/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec.")

if [ -n "$MOCK_IMPORTS" ]; then
    echo "❌ FAILED: Found mock data imports in production code:"
    echo "$MOCK_IMPORTS"
    exit 1
else
    echo "✅ PASSED: No mock data found in production code"
    exit 0
fi
```

### 3. Visual Regression Testing Tools

| Tool | Best For | Integration |
|------|----------|-------------|
| **Lost Pixel** | Open-source, Next.js native | GitHub Actions |
| **Percy** | All-in-one visual testing | CI/CD |
| **Playwright** | E2E + visual regression | GitHub Actions |

### 4. Runtime Error Monitoring

| Tool | Features | Use Case |
|------|----------|----------|
| **Sentry** | Error tracking, session replay | Production error monitoring |
| **LogRocket** | Session recording, DOM changes | Debug user-reported issues |
| **Highlight.io** | Full-stack observability | Next.js optimized |

### 5. TypeScript Strict Mode + Zod

**For data validation:**
```typescript
// lib/schemas/payment.ts
import { z } from 'zod';

export const PaymentInstructionsSchema = z.object({
  type: z.enum(['bank_transfer', 'ewallet', 'qris', 'xendit', 'manual']),
  amount: z.number(),
  formatted_amount: z.string().optional(),
  checkout_url: z.string().url().optional(),
  // ... more fields
});

// Usage in API hooks - validates at runtime
const instructions = PaymentInstructionsSchema.parse(response.data);
```

---

## 🎯 Recommended QA Workflow Automation

### Phase 1: Immediate (Static Analysis)
```yaml
# .github/workflows/fe-qa.yml
name: Frontend QA

on: [push, pull_request]

jobs:
  lint-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for mock data
        run: |
          if grep -rn "mockData" app/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."; then
            echo "❌ Mock data found in production code!"
            exit 1
          fi
          
      - name: Run ESLint
        run: npm run lint
        
      - name: Type Check
        run: npm run type-check
```

### Phase 2: Integration Tests (Playwright)
```typescript
// tests/payment-flow.spec.ts
import { test, expect } from '@playwright/test';

test('checkout page handles Xendit redirect', async ({ page }) => {
  // Navigate to checkout
  await page.goto('/checkout?website=xxx&tier=yyy');
  
  // Select payment method
  await page.click('[data-testid="payment-method-qris"]');
  
  // Submit payment
  await page.click('[data-testid="proceed-payment"]');
  
  // Should redirect to Xendit or show instructions
  await expect(page).toHaveURL(/xendit|instructions/);
});
```

### Phase 3: Visual Regression (Lost Pixel)
```json
// lostpixel.config.ts
{
  "pageShots": {
    "baseUrl": "http://localhost:3000",
    "pages": [
      { "path": "/checkout", "name": "checkout" },
      { "path": "/creator/analytics", "name": "analytics" },
      { "path": "/dashboard", "name": "dashboard" }
    ]
  }
}
```

---

## 📝 Bug Tracking Template

When logging new FE bugs, use this format:

```markdown
## Bug ID: FE-XXX-NNN

**File:** `/app/path/to/file.tsx`
**Severity:** Critical / High / Medium / Low
**Category:** Mock Data / API Integration / UI/UX / Type Error / Visual Regression

### Description
Brief description of the issue

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Steps to Reproduce
1. Step 1
2. Step 2

### Solution
How to fix it

### Related PRs/Commits
- PR #123
```

---

## 🚀 Next Steps

1. **Fix remaining mock data usages** (FE-MOCK-001 through FE-MOCK-004)
2. ~~**Add ESLint `no-restricted-imports` rule**~~ ✅ DONE - Added in `eslint.config.mjs`
3. **Set up CI/CD pipeline** with mock data check script
4. **Consider adding Playwright** for E2E testing of critical flows
5. **Implement Sentry** for production error tracking

---

*Last Updated: 2026-02-08*
*Author: QA Automation*
