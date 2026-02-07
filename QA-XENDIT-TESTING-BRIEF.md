# 📋 QA Brief: Xendit Payment Testing

**Date:** 2026-02-07 16:07 WIB  
**From:** Backend Agent  
**To:** QA Agent  
**Status:** READY TO TEST ✅

---

## 🎯 Objective

Test **14 payment-related test cases** yang sebelumnya blocked karena butuh Xendit sandbox key.

---

## ✅ Backend Setup Complete

| Item | Status | Value |
|------|--------|-------|
| **API Key** | ✅ Sandbox | `xnd_development_...` (sudah di .env) |
| **Webhook Token** | ⚠️ Existing | Pakai yang ada dulu |
| **Base URL** | ✅ Ready | `https://api.xendit.co` |

---

## 🧪 Testing Method: POLLING (Recommended)

Untuk testing, **tidak perlu ngrok**. Gunakan polling approach:

1. Create order → Get invoice URL
2. Pay via Xendit sandbox (test cards)
3. Check payment status via API (polling)

---

## ⚙️ Prerequisites

### 1. Restart Backend Server
```bash
cd /Users/arkan/finding-gems/backend
npm run dev
```

### 2. Get Auth Tokens
```bash
# Buyer Token
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

echo "Token: $BUYER_TOKEN"
```

### 3. Get a Website ID to Buy
```bash
# Get available websites
curl -s http://localhost:3001/api/v1/websites | jq '.data.websites[] | {id, name, price}'

# Pick one that's NOT owned by buyer
export WEBSITE_ID="<paste-website-id-here>"
```

---

## 📝 Test Cases (14 Total)

### PURCHASE FLOW (7 tests)

#### PURCH-001: Create Order
```bash
# Create order (should return invoice URL)
curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"websiteId\":\"$WEBSITE_ID\"}" | jq

# Expected: 
# - status: 201
# - data.order.id
# - data.order.status: "pending"
# - data.invoiceUrl: "https://checkout.xendit.co/..."
```

**Pass Criteria:** Order created, invoice URL returned

---

#### PURCH-002: View Invoice URL
```bash
# Get the invoice URL from previous response
# Open in browser to see Xendit checkout page
echo "Open this URL in browser: <invoice_url>"
```

**Pass Criteria:** Xendit checkout page loads correctly

---

#### PURCH-003: Pay with Test Card
Open invoice URL in browser and use these **Xendit test cards**:

| Card Number | Result |
|-------------|--------|
| `4000000000000002` | ✅ Success |
| `4000000000000010` | ❌ Declined |
| `4000000000000028` | ❌ Insufficient funds |

**CVV:** Any 3 digits  
**Expiry:** Any future date

---

#### PURCH-004: Check Payment Status (Polling)
```bash
# Get order ID from PURCH-001 response
export ORDER_ID="<order-id-here>"

# Poll payment status
curl -s "http://localhost:3001/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.data.order.status'

# Expected after successful payment: "completed"
```

---

#### PURCH-005: View Order History
```bash
curl -s http://localhost:3001/api/v1/billing/orders/my \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq

# Expected: List of buyer's orders
```

---

#### PURCH-006: Access Purchased Content
```bash
# After payment completed, access the website
curl -s "http://localhost:3001/api/v1/websites/$WEBSITE_ID/access" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq

# Expected: Full website access/download URL
```

---

#### PURCH-007: Cannot Buy Same Website Twice
```bash
# Try to buy same website again
curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"websiteId\":\"$WEBSITE_ID\"}" | jq

# Expected: Error - already purchased
```

---

### REFUND FLOW (3 tests)

#### REF-001: Request Refund
```bash
# Request refund for completed order
curl -s -X POST "http://localhost:3001/api/v1/refunds" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\",\"reason\":\"Not as expected\"}" | jq

# Expected: Refund request created with status "pending"
```

---

#### REF-002: Admin Approve Refund
```bash
# Login as admin
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

# Get refund ID
export REFUND_ID="<refund-id-from-above>"

# Approve refund
curl -s -X PATCH "http://localhost:3001/api/v1/admin/refunds/$REFUND_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Expected: Refund status changed to "approved" or "processing"
```

---

#### REF-003: Verify Refund Status
```bash
# Check refund status
curl -s "http://localhost:3001/api/v1/refunds/$REFUND_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq

# Expected: Refund completed
```

---

### REVIEW FLOW (4 tests - Requires Completed Purchase)

#### REV-001: Add Review (After Purchase)
```bash
# Can only review after purchasing
# Note: Reviews use /api/v1/reviews with websiteId in body
curl -s -X POST "http://localhost:3001/api/v1/reviews" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"websiteId\":\"$WEBSITE_ID\",\"rating\":5,\"comment\":\"Great website, very useful!\"}" | jq

# Expected: Review created successfully
```

---

#### REV-002: Update Review
```bash
export REVIEW_ID="<review-id-from-above>"

curl -s -X PATCH "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":4,"comment":"Updated: Good website"}' | jq

# Expected: Review updated
```

---

#### REV-003: View Website Reviews
```bash
curl -s "http://localhost:3001/api/v1/reviews?websiteId=$WEBSITE_ID" | jq

# Expected: List of reviews including the one just created
```

---

#### REV-004: Delete Review
```bash
curl -s -X DELETE "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq

# Expected: Review deleted successfully
```

---

## 🎴 Xendit Test Cards Reference

### Credit Cards (Visa/Mastercard)
| Card Number | Scenario |
|-------------|----------|
| `4000000000000002` | Success |
| `4000000000000010` | Card Declined |
| `4000000000000028` | Insufficient Funds |
| `4000000000000036` | Stolen Card |
| `4000000000000044` | Inactive Card |

### E-Wallet (for simulation)
| Method | Test Flow |
|--------|-----------|
| OVO | Sandbox auto-approves |
| GoPay | Sandbox auto-approves |
| DANA | Sandbox auto-approves |

### Bank Transfer (VA)
| Bank | Test |
|------|------|
| BCA | Sandbox auto-generates VA |
| BNI | Sandbox auto-generates VA |
| Mandiri | Sandbox auto-generates VA |

---

## 📊 Test Report Template

```markdown
# Xendit Payment Testing Report

**Date:** 2026-02-07
**Tester:** [Name]
**Environment:** Local (Sandbox)

## Summary
- Total: 14
- Passed: X
- Failed: X
- Blocked: X

## Results

### Purchase Flow (7)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| PURCH-001 | Create Order | | |
| PURCH-002 | View Invoice | | |
| PURCH-003 | Pay with Card | | |
| PURCH-004 | Check Status | | |
| PURCH-005 | Order History | | |
| PURCH-006 | Access Content | | |
| PURCH-007 | Duplicate Buy | | |

### Refund Flow (3)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| REF-001 | Request Refund | | |
| REF-002 | Admin Approve | | |
| REF-003 | Verify Status | | |

### Review Flow (4)
| ID | Test | Status | Notes |
|----|------|--------|-------|
| REV-001 | Add Review | | |
| REV-002 | Update Review | | |
| REV-003 | View Reviews | | |
| REV-004 | Delete Review | | |

## Issues Found
- [List any bugs]

## Notes
- [Any observations]
```

---

## ⚠️ Known Limitations

1. **Webhook tidak aktif** - Payment status perlu di-poll manual
2. **Sandbox mode** - Tidak ada real money transfer
3. **Test cards only** - Real cards won't work in sandbox

---

## 🆘 Troubleshooting

### "Xendit not configured" Error
```bash
# Restart server to reload .env
cd /Users/arkan/finding-gems/backend
npm run dev
```

### Token Expired
```bash
# Re-login to get new token
export BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')
```

### Invoice URL Not Loading
- Check if XENDIT_API_KEY is sandbox key (starts with `xnd_development_`)
- Verify you're not using a blocker browser extension

---

**Backend Agent - Handoff Complete** 🤝

Silakan QA mulai testing Xendit payment flow!
