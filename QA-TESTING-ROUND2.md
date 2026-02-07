# QA Testing Brief - Round 2

**Date:** 2026-02-07  
**Backend:** localhost:3001  
**Status:** DISC-002 Bug Fixed, Ready for Testing

---

## 📋 Test Cases This Round

| Test ID | Description | Priority | Data Ready |
|---------|-------------|----------|------------|
| DISC-002 | Search by Keyword | P1 | ✅ |
| ADM-PAYOUT | Admin Process Payout | P1 | ✅ |
| CRE-008 | Cancel Payout | P2 | ✅ |
| REV-001-004 | Reviews Module CRUD | P2 | ✅ |

---

## 1️⃣ DISC-002: Search by Keyword

**Bug Fixed:** `shortDescription` column now properly quoted

### Test Steps:
```bash
# Search websites by keyword
curl -s "http://localhost:3001/api/v1/websites?search=analytics" | jq '.success, .data.websites[].name'

# Search with different keywords
curl -s "http://localhost:3001/api/v1/websites?search=AI" | jq '.success, .data.websites[].name'

# Search partial word
curl -s "http://localhost:3001/api/v1/websites?search=code" | jq '.success, .data.websites[].name'
```

### Expected Result:
- `success: true`
- Websites matching search term in name, description, or shortDescription

---

## 2️⃣ ADM-PAYOUT: Admin Process Payout

**Test Data:**
- Payout ID: `0c1e62c3-0663-4c2e-ba98-fd0d1bdbf45f`
- Status: `pending`
- Creator: `creator@example.com`
- Amount: Rp 50,000 (net: Rp 47,500)

### Test Steps:

```bash
# 1. Login as Admin
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findinggems.com","password":"Admin123!"}' | jq -r '.data.accessToken')

echo "Admin Token: $ADMIN_TOKEN"
```

```bash
# 2. Get All Pending Payouts
curl -s "http://localhost:3001/api/v1/payouts/admin/all?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.payouts'
```

```bash
# 3a. Approve Payout (RECOMMENDED - test this first)
curl -s -X POST "http://localhost:3001/api/v1/payouts/admin/0c1e62c3-0663-4c2e-ba98-fd0d1bdbf45f/process" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "transfer_reference": "TRF-QA-TEST-001",
    "status_message": "Transfer completed via BCA"
  }' | jq '.'
```

```bash
# 3b. Alternative - Reject Payout (if testing rejection)
curl -s -X POST "http://localhost:3001/api/v1/payouts/admin/<PAYOUT_ID>/process" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "status_message": "Invalid bank account details"
  }' | jq '.'
```

### Expected Result (Approve):
- `success: true`
- Payout status → `completed`
- Creator's `withdrawn_balance` increased
- Creator's `available_balance` decreased

### Verification:
```sql
-- Via Supabase MCP
SELECT status, transfer_reference, processed_at FROM payouts 
WHERE id = '0c1e62c3-0663-4c2e-ba98-fd0d1bdbf45f';

SELECT available_balance, withdrawn_balance FROM creator_balances 
WHERE creator_id = '905ff5c0-dfcc-417d-93f1-91fedec7c02c';
```

---

## 3️⃣ CRE-008: Cancel Payout

**Prerequisite:** Need a NEW pending payout (the one above might be processed)

### Setup (if needed):
```bash
# Login as Creator
CREATOR_TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

# Request new payout (need balance available)
curl -s -X POST "http://localhost:3001/api/v1/payouts" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}' | jq '.data.payout.id'
```

### Test Steps:
```bash
# Cancel the pending payout
PAYOUT_ID="<NEW_PAYOUT_ID>"

curl -s -X POST "http://localhost:3001/api/v1/payouts/$PAYOUT_ID/cancel" \
  -H "Authorization: Bearer $CREATOR_TOKEN" | jq '.'
```

### Expected Result:
- `success: true`
- `message: "Payout request cancelled"`
- Payout status → `cancelled`

### Verification:
```sql
SELECT id, status, status_message FROM payouts WHERE id = '<PAYOUT_ID>';
```

---

## 4️⃣ REV-001-004: Reviews Module CRUD

**Prerequisite:** Buyer must have a PAID order to leave a review

### Test Data:
- Buyer: `buyer@example.com` / `NewPassword123!`
- Need order with status = `paid`

### Setup - Check/Create Paid Order:
```sql
-- Via Supabase MCP - check existing paid orders for buyer
SELECT o.id, o.order_number, o.status, o.website_id, w.name as website_name
FROM orders o
JOIN websites w ON w.id = o.website_id
WHERE o.buyer_id = (SELECT id FROM users WHERE email = 'buyer@example.com')
AND o.status = 'paid';
```

If no paid order exists, create one:
```sql
-- Seed a paid order for buyer@example.com
INSERT INTO orders (
  id, order_number, buyer_id, website_id, pricing_tier_id, creator_id,
  item_name, item_price, platform_fee, total_amount, currency, status, refund_status,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ORD-REVIEW-TEST-001',
  '1142df69-2285-49ad-87a8-8723f0ff0584',  -- buyer@example.com
  '467fe702-f7f9-4e7e-8519-4bc40975c633',  -- CodeMentor Live
  'a6ab8c19-6007-41ba-ad89-e777fad89d66',
  '9fa93c1e-de95-460a-b25d-146247f62813',
  'Review Test Order',
  50000, 2500, 52500, 'IDR', 'paid', 'none',
  NOW(), NOW()
)
RETURNING id, website_id;
```

### Test REV-001: Create Review
```bash
# Login as Buyer
BUYER_TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

# Create Review
curl -s -X POST "http://localhost:3001/api/v1/reviews" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "website_id": "467fe702-f7f9-4e7e-8519-4bc40975c633",
    "rating": 5,
    "title": "Excellent mentorship platform!",
    "content": "Great experience learning from experienced developers. The live coding sessions are very helpful."
  }' | jq '.'
```

### Test REV-002: View Reviews
```bash
# Get website reviews (public)
curl -s "http://localhost:3001/api/v1/reviews?websiteId=467fe702-f7f9-4e7e-8519-4bc40975c633" | jq '.data.reviews'

# Or via website detail
curl -s "http://localhost:3001/api/v1/websites/codementor-live" | jq '.data.website.reviews'
```

### Test REV-003: Edit Review
```bash
REVIEW_ID="<REVIEW_ID_FROM_CREATE>"

curl -s -X PUT "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "title": "Updated: Great platform",
    "content": "Updated review content after more usage."
  }' | jq '.'
```

### Test REV-004: Delete Review
```bash
curl -s -X DELETE "http://localhost:3001/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.'
```

### Expected Results:
- REV-001: `success: true`, review created with ID
- REV-002: `success: true`, array of reviews returned
- REV-003: `success: true`, review updated
- REV-004: `success: true`, review deleted

---

## 🔑 Test Accounts Quick Reference

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@findinggems.com | Admin123! |
| Creator | creator@example.com | CreatorPassword123! |
| Buyer | buyer@example.com | NewPassword123! |

---

## 📝 Verification Queries (Supabase MCP)

### Check Payout Status:
```sql
SELECT id, payout_number, status, amount, net_amount, 
       transfer_reference, processed_at 
FROM payouts 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Creator Balance:
```sql
SELECT creator_id, total_earnings, available_balance, 
       pending_balance, withdrawn_balance 
FROM creator_balances;
```

### Check Reviews:
```sql
SELECT r.id, r.rating, r.title, w.name as website, u.name as reviewer
FROM reviews r
JOIN websites w ON w.id = r.website_id
JOIN users u ON u.id = r.user_id
ORDER BY r.created_at DESC
LIMIT 10;
```

---

## ✅ Test Completion Checklist

- [ ] DISC-002: Search working with keywords
- [ ] ADM-PAYOUT: Admin can approve/reject payout
- [ ] CRE-008: Creator can cancel pending payout
- [ ] REV-001: Create review (buyer with paid order)
- [ ] REV-002: View reviews for website
- [ ] REV-003: Edit own review
- [ ] REV-004: Delete own review

---

**Report hasil via format:**
```
Test ID | Status | Notes
--------|--------|------
DISC-002 | PASS/FAIL | Details
ADM-PAYOUT | PASS/FAIL | Details
CRE-008 | PASS/FAIL | Details
REV-001 | PASS/FAIL | Details
REV-002 | PASS/FAIL | Details
REV-003 | PASS/FAIL | Details
REV-004 | PASS/FAIL | Details
```
