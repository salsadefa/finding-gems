# 📋 QA Brief: Continue Testing After Backend Fixes

**Date:** 2026-02-07 16:45 WIB  
**From:** Backend Agent  
**To:** QA Agent  
**Status:** READY TO CONTINUE ✅

---

## 📊 Summary Status

### Tests Already Done ✅
| Category | Pass | Fail | Blocked |
|----------|------|------|---------|
| Security | 10 | 4 | 2 |
| Data Validation | 6 | 0 | 3 |
| Negative | 6 | 4 | 9 |
| E2E UI | 8 | 1 | 0 |
| Performance | 1 | 4 | 1 |
| **Xendit Payment** | 4 | 3 | 7 |

### Bugs Fixed by Backend Agent ✅
| Bug | Issue | Fix Applied |
|-----|-------|-------------|
| NEG-003 | Negative pagination → 500 | Pagination sanitization |
| NEG-004 | Long string 1000 chars accepted | Max length 100 chars |
| SEC-002 | XSS payload accepted | `sanitizeText()` function |
| SEC-007 | CORS returns header for malicious | Origin callback whitelist |
| SEC-020 | Rate limit 100 req not triggered | Lowered to 100/15min |
| **PURCH-005** | orders.createdAt not exist | Fixed to `created_at` |

---

## 🚀 Step 1: RESTART Backend Server

```bash
# Kill any existing server, then restart
cd /Users/arkan/finding-gems/backend
npm run dev
```

**Wait until you see:** "Server running on port 3001"

---

## 🧪 Step 2: Re-Verify Backend Fixes (5 tests)

### Test NEG-003 Fix (Negative Pagination)
```bash
curl -s "http://localhost:3001/api/v1/websites?page=-1&limit=-10" | jq '.data.pagination'
# Expected: page: 1, limit: 10 (sanitized, no 500 error)
```

### Test SEC-002 Fix (XSS)
```bash
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"xsstest'$(date +%s)'@example.com",
    "password":"XssTest123!",
    "name":"<script>alert(1)</script>TestUser",
    "username":"xsstest'$(date +%s)'"
  }' | jq '.data.user.name'
# Expected: "TestUser" (script tag stripped)
```

### Test NEG-004 Fix (Long String)
```bash
LONG_NAME=$(python3 -c "print('A'*150)")
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"longtest$(date +%s)@test.com\",\"password\":\"Test123!\",\"name\":\"$LONG_NAME\",\"username\":\"longtest$(date +%s)\"}" | jq '.error'
# Expected: VALIDATION_ERROR - Name must not exceed 100 characters
```

### Test SEC-007 Fix (CORS)
```bash
curl -sI -X OPTIONS http://localhost:3001/api/v1/websites \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" 2>&1 | grep -i "access-control-allow-origin"
# Expected: NO "Access-Control-Allow-Origin" header (empty result)
```

### Test PURCH-005 Fix (Order History)
```bash
# Get token first
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

curl -s "http://localhost:3001/api/v1/billing/orders/my" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.success'
# Expected: true (no column error)
```

---

## 📦 Step 3: Seed Data for Payment Testing

### 3.1 Get Creator Token
```bash
export CREATOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')
echo "Creator Token: $CREATOR_TOKEN"
```

### 3.2 Create New Website (Active)
```bash
# Get a category ID first
CATEGORY_ID=$(curl -s http://localhost:3001/api/v1/categories | jq -r '.data.categories[0].id')

# Create website
NEW_WEBSITE=$(curl -s -X POST http://localhost:3001/api/v1/websites \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"QA Test Website $(date +%s)\",
    \"description\": \"Website for QA payment testing\",
    \"externalUrl\": \"https://qa-test-website.com\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"tags\": [\"qa\", \"test\"]
  }")

export NEW_WEBSITE_ID=$(echo $NEW_WEBSITE | jq -r '.data.website.id')
echo "Created Website ID: $NEW_WEBSITE_ID"
```

### 3.3 Activate Website (Admin)
```bash
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

curl -s -X PATCH "http://localhost:3001/api/v1/admin/websites/$NEW_WEBSITE_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' | jq

echo "Website activated!"
```

### 3.4 Create Pricing Tier
```bash
curl -s -X POST "http://localhost:3001/api/v1/billing/websites/$NEW_WEBSITE_ID/pricing" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Access",
    "description": "Full access to the website",
    "price": 50000,
    "currency": "IDR",
    "duration_days": null,
    "features": ["Full access", "Updates", "Support"]
  }' | jq

echo "Pricing tier created!"
```

### 3.5 Verify Setup
```bash
# Check website is active with pricing
curl -s "http://localhost:3001/api/v1/billing/websites/$NEW_WEBSITE_ID/pricing" | jq

# Should show pricing tier
```

---

## 💳 Step 4: Run Payment Tests (Xendit)

### 4.1 Get Buyer Token
```bash
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')
```

### 4.2 PURCH-001: Create Order
```bash
# Get pricing tier ID
TIER_ID=$(curl -s "http://localhost:3001/api/v1/billing/websites/$NEW_WEBSITE_ID/pricing" | jq -r '.data.tiers[0].id')

# Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"website_id\":\"$NEW_WEBSITE_ID\",\"pricing_tier_id\":\"$TIER_ID\"}")

echo $ORDER_RESPONSE | jq

export ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.order.id')
echo "Order ID: $ORDER_ID"
```

### 4.3 PURCH-002: Initiate Payment (Xendit)
```bash
# Create Xendit invoice for the order
PAYMENT_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/v1/billing/orders/$ORDER_ID/pay" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method": "CREDIT_CARD"}')

echo $PAYMENT_RESPONSE | jq

# Get invoice URL
INVOICE_URL=$(echo $PAYMENT_RESPONSE | jq -r '.data.invoice_url // .data.checkout_url // empty')
echo "Pay at: $INVOICE_URL"
```

### 4.4 PURCH-003: Pay with Test Card
Open the invoice URL in browser and use:
- **Card:** `4000000000000002`
- **Expiry:** Any future date
- **CVV:** Any 3 digits

### 4.5 PURCH-004: Check Payment Status
```bash
# Poll order status
curl -s "http://localhost:3001/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.order.status'
# Expected after payment: "paid"
```

### 4.6 PURCH-005: View Order History
```bash
curl -s "http://localhost:3001/api/v1/billing/orders/my" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
# Expected: List with the new order
```

### 4.7 PURCH-006: Check Access
```bash
curl -s "http://localhost:3001/api/v1/billing/access/check/$NEW_WEBSITE_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
# Expected: has_access: true (after payment complete)
```

### 4.8 PURCH-007: Duplicate Buy
```bash
curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"website_id\":\"$NEW_WEBSITE_ID\"}" | jq
# Expected: Error - already have access
```

---

## 📝 Step 5: Review Tests (After Payment)

### REV-001: Add Review
```bash
curl -s -X POST "http://localhost:3001/api/v1/reviews" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"websiteId\": \"$NEW_WEBSITE_ID\",
    \"rating\": 5,
    \"title\": \"Great website!\",
    \"content\": \"This is an excellent website with lots of useful features.\"
  }" | jq

export REVIEW_ID=$(curl -s "http://localhost:3001/api/v1/reviews?websiteId=$NEW_WEBSITE_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq -r '.data.reviews[0].id')
echo "Review ID: $REVIEW_ID"
```

### REV-002: Update Review
```bash
curl -s -X PATCH "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "content": "Updated: Still good but found some minor issues."}' | jq
```

### REV-003: View Reviews
```bash
curl -s "http://localhost:3001/api/v1/reviews?websiteId=$NEW_WEBSITE_ID" | jq
```

### REV-004: Delete Review
```bash
curl -s -X DELETE "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
```

---

## 📊 Report Template

```markdown
# QA Continuation Report

**Date:** 2026-02-07
**Tester:** [Name]

## Fix Verification (5 tests)
| Bug | Re-Test Status | Notes |
|-----|----------------|-------|
| NEG-003 | PASS/FAIL | |
| NEG-004 | PASS/FAIL | |
| SEC-002 | PASS/FAIL | |
| SEC-007 | PASS/FAIL | |
| PURCH-005 | PASS/FAIL | |

## Payment Tests (8 tests)
| ID | Status | Notes |
|----|--------|-------|
| PURCH-001 | | |
| PURCH-002 | | |
| PURCH-003 | | |
| PURCH-004 | | |
| PURCH-005 | | |
| PURCH-006 | | |
| PURCH-007 | | |

## Review Tests (4 tests)
| ID | Status | Notes |
|----|--------|-------|
| REV-001 | | |
| REV-002 | | |
| REV-003 | | |
| REV-004 | | |

## Issues Found
- [List any new bugs]
```

---

**Backend Agent - Handoff Complete** 🤝

QA silakan:
1. Restart server
2. Re-verify 5 fixes
3. Seed data
4. Run payment + review tests
