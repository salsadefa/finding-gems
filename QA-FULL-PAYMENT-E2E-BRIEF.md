# 📋 QA Full Payment E2E Test Brief

**Date:** 2026-02-08 13:20 WIB  
**Priority:** High  
**Status:** 🔄 In Progress

---

## 🎯 Objective

Complete the full payment flow using Xendit test card, then verify review submission works after purchase.

---

## 📍 URLs

| Service | URL |
|---------|-----|
| Backend API | https://finding-gems-backend.onrender.com |
| Frontend | https://finding-gems.vercel.app |

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Buyer** | `qa-buyer@test.com` | `QATest123!` |

---

## 💳 Xendit Test Card

| Field | Value |
|-------|-------|
| Card Number | `4000000000000002` |
| Expiry | Any future date (e.g., `12/28`) |
| CVV | Any 3 digits (e.g., `123`) |
| OTP (if prompted) | `123456` |

---

## 📝 Test Steps

### Step 1: Login as Buyer
```bash
BUYER_TOKEN=$(curl -s https://finding-gems-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-buyer@test.com","password":"QATest123!"}' | jq -r '.data.accessToken')
echo "Token: $BUYER_TOKEN"
```

### Step 2: Get a Website to Purchase
```bash
# Get first available website
WEBSITE=$(curl -s "https://finding-gems-backend.onrender.com/api/v1/websites?limit=1" | jq -r '.data.websites[0]')
WEBSITE_ID=$(echo $WEBSITE | jq -r '.id')
WEBSITE_NAME=$(echo $WEBSITE | jq -r '.name')
echo "Website: $WEBSITE_NAME ($WEBSITE_ID)"
```

### Step 3: Create Order
```bash
ORDER=$(curl -s https://finding-gems-backend.onrender.com/api/v1/billing/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"websiteId\":\"$WEBSITE_ID\"}")
  
ORDER_ID=$(echo $ORDER | jq -r '.data.order.id')
echo "Order ID: $ORDER_ID"
echo "Order Status: $(echo $ORDER | jq -r '.data.order.status')"
```

### Step 4: Initiate Payment
```bash
PAYMENT=$(curl -s https://finding-gems-backend.onrender.com/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"orderId\":\"$ORDER_ID\"}")

CHECKOUT_URL=$(echo $PAYMENT | jq -r '.data.checkoutUrl')
echo "Checkout URL: $CHECKOUT_URL"
```

### Step 5: Complete Payment (Browser)
1. Open the checkout URL in browser
2. Enter test card details:
   - Card: `4000000000000002`
   - Expiry: `12/28`
   - CVV: `123`
3. Complete payment
4. If OTP prompted, enter: `123456`

### Step 6: Verify Order Status (after payment)
```bash
# Wait 10-30 seconds for webhook, then check
curl -s "https://finding-gems-backend.onrender.com/api/v1/billing/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '{status: .data.order.status, paidAt: .data.order.paidAt}'
```

**Expected:** `status: "paid"` or `status: "completed"`

### Step 7: Submit Review (after payment success)
```bash
curl -s https://finding-gems-backend.onrender.com/api/v1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"websiteId\":\"$WEBSITE_ID\",
    \"rating\":5,
    \"title\":\"Great product!\",
    \"content\":\"This is a test review after successful payment.\"
  }" | jq '{success, reviewId: .data.review.id}'
```

**Expected:** `success: true`

---

## ✅ Expected Results

| Step | Expected Result |
|------|-----------------|
| 1. Login | Token received |
| 2. Get Website | Website ID received |
| 3. Create Order | Order ID, status: `pending` |
| 4. Initiate Payment | Checkout URL received |
| 5. Complete Payment | Payment success page |
| 6. Check Order | status: `paid` |
| 7. Submit Review | success: true |

---

## 🏁 Success Criteria

- [ ] Order created successfully
- [ ] Xendit checkout page loads
- [ ] Payment completes with test card
- [ ] Webhook updates order to `paid`
- [ ] Review submission succeeds (201)

---

## 📊 After Test

Update `QA-MASTER-TRACKER.md` with results:
- PURCH-PROD-001: Full Payment E2E (Xendit)
- REV-PROD-001: Review After Purchase

---

*Generated: 2026-02-08 13:20 WIB*
