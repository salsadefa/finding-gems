# 📋 QA Brief: Final Payment Flow Testing

**Created:** 2026-02-07 17:15 WIB  
**Author:** Backend Agent  
**Status:** 🟡 Ready for QA

---

## 📌 Summary

Untuk unblock payment flow testing (PURCH-003 to PURCH-006, REV-001 to REV-004), ada 2 opsi:

| Option | Method | Pros | Cons |
|--------|--------|------|------|
| **A: Manual Xendit** | Pay via checkout URL | Real E2E test | Membutuhkan kartu tes yang benar |
| **B: Admin Confirm** | Simulate payment via API | Instant, no Xendit needed | Tidak test Xendit integration |

**Recommendation:** Pakai **Option B** untuk unblock testing sekarang, lalu test Xendit integration secara terpisah.

---

## 🔧 Prerequisites

### 1. Restart Backend Server
```bash
# Kill existing server (jika ada)
pkill -f "ts-node-dev" 2>/dev/null

# Start fresh
cd /Users/arkan/finding-gems/backend && npm run dev
```

### 2. Get Tokens
```bash
# Admin token (untuk confirm payment)
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

# Buyer token (untuk create order, review, dll)
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

echo "Admin: $ADMIN_TOKEN"
echo "Buyer: $BUYER_TOKEN"
```

---

## 🧪 Option A: Manual Xendit Payment (Best for E2E)

### Correct Test Cards:
| Type | Number | Result |
|------|--------|--------|
| VISA (Frictionless) | `4000000000001000` | ✅ Success |
| Mastercard | `5200000000001005` | ✅ Success |
| VISA (Challenge) | `4000000000002503` | ✅ Success (OTP: 111111) |
| Declined | `4000000000000010` | ❌ Decline |

### Steps:
1. Create new order (if needed)
2. Initiate payment
3. Open checkout URL in browser
4. Pay with test card above
5. Wait for webhook (or poll status)

---

## 🧪 Option B: Admin Payment Confirmation (Quick Testing)

Ini cara cepat untuk unblock testing tanpa Xendit.

### Step 1: Find Pending Transaction
```bash
# List pending orders untuk buyer
curl -s "http://localhost:3001/api/v1/billing/orders/my?status=pending" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.orders[] | {id, order_number, website_id: .websites.slug}'
```

### Step 2: Get Transaction ID
```bash
# Ganti ORDER_ID dengan order ID dari step 1
export ORDER_ID="<paste-order-id-here>"

# Get order details including transaction
curl -s "http://localhost:3001/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.transaction.transaction_id'
```

### Step 3: Confirm Payment (Admin)
```bash
export TXN_ID="<paste-transaction-id-here>"

# Admin confirm payment
curl -s -X POST "http://localhost:3001/api/v1/payments/$TXN_ID/confirm" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq
```

Expected response:
```json
{
  "success": true,
  "message": "Payment confirmed successfully"
}
```

### Step 4: Verify Order Status
```bash
# Should be "paid" now
curl -s "http://localhost:3001/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.order.status'
```

### Step 5: Verify Access Granted
```bash
# Get website_id from order
export WEBSITE_ID=$(curl -s "http://localhost:3001/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq -r '.data.order.website_id')

# Check access
curl -s "http://localhost:3001/api/v1/billing/access/check/$WEBSITE_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
```

Expected:
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "access": { ... }
  }
}
```

---

## 🧪 Test Cases After Payment Complete

### PURCH-003: Payment Completed ✅
Already done via admin confirm.

### PURCH-004: Check Payment Status
```bash
curl -s "http://localhost:3001/api/v1/payments/$TXN_ID/status" | jq '.data.transaction.status'
# Expected: "success"
```

### PURCH-006: Check Access
```bash
curl -s "http://localhost:3001/api/v1/billing/access/check/$WEBSITE_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.has_access'
# Expected: true
```

---

## ✍️ REV-001 to REV-004: Review Flow

Setelah payment complete, buyer seharusnya bisa create review.

### REV-001: Create Review
```bash
curl -s -X POST http://localhost:3001/api/v1/reviews \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"websiteId\": \"$WEBSITE_ID\",
    \"rating\": 5,
    \"title\": \"Great product!\",
    \"content\": \"This is an amazing resource. Highly recommended!\"
  }" | jq
```

Expected:
```json
{
  "success": true,
  "data": { "review": { "id": "...", "rating": 5, ... } }
}
```

### REV-002: Update Review
```bash
export REVIEW_ID="<paste-review-id-here>"

curl -s -X PATCH "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "title": "Updated review", "content": "Still great!"}' | jq
```

### REV-003: Get Reviews for Website
```bash
curl -s "http://localhost:3001/api/v1/reviews/website/$WEBSITE_ID" | jq
```

### REV-004: Delete Review
```bash
curl -s -X DELETE "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
```

---

## 🔄 Re-verify Previous Fixes

### PURCH-007: Duplicate Buy Prevention
```bash
# Try create another order for same website (should fail)
curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"website_id\": \"$WEBSITE_ID\"}" | jq

# Expected: Error "You already have access to this website"
```

### NEG-003: Pagination
```bash
curl -s "http://localhost:3001/api/v1/websites?page=-1&limit=-10" | jq '.data.pagination'
# Expected: limit: 10 (not 1)
```

---

## 📊 Report Template

```markdown
## Payment Flow Testing Report

**Date:** 2026-02-07
**Tester:** QA Agent

### Results:

| ID | Test | Status | Notes |
|----|------|--------|-------|
| PURCH-003 | Payment Completed | | |
| PURCH-004 | Check Payment Status | | |
| PURCH-006 | Check Access | | |
| PURCH-007 | Duplicate Buy | | |
| REV-001 | Create Review | | |
| REV-002 | Update Review | | |
| REV-003 | Get Reviews | | |
| REV-004 | Delete Review | | |
| NEG-003 | Pagination | | |

### Issues Found:
- None / List issues here
```

---

## 🎯 Summary

1. **Restart server** untuk load latest fixes
2. **Get tokens** (admin + buyer)
3. **Find pending order** atau create new one
4. **Confirm payment** via admin endpoint
5. **Run PURCH-004, PURCH-006, PURCH-007** tests
6. **Run REV-001 to REV-004** review tests
7. **Re-verify NEG-003** pagination fix

**Good luck!** 🚀
