# 🧪 QA Testing Brief - Round 3 (Comprehensive)

**Date:** 2026-02-07  
**Backend:** localhost:3001  
**Status:** Ready for Testing

---

## 🛠️ Tools yang WAJIB Digunakan

### 1. MCP Supabase Server
Gunakan untuk query database langsung:
```
mcp_supabase-mcp-server_execute_sql
mcp_supabase-mcp-server_list_tables
```

### 2. Context7 / Run Command
Gunakan untuk API testing via curl

### 3. Browser Subagent
Untuk E2E UI testing

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@findinggems.com | Admin123! |
| Buyer | buyer@example.com | NewPassword123! |
| Creator | creator@example.com | CreatorPassword123! |

---

# PART 1: NEGATIVE TESTING (22 Cases)

## NEG-001 to NEG-007: Invalid Input Handling

### NEG-001: Empty Required Fields
```bash
# Registration with empty body
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.success, .error'
```
**Expected:** `success: false`, error menjelaskan field yang required

### NEG-002: Wrong Data Types
```bash
# Price as string instead of number
curl -s -X POST "http://localhost:3001/api/v1/websites" \
  -H "Authorization: Bearer <CREATOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "price": "not-a-number",
    "categoryId": "331840ec-6c3a-4d16-90f0-712d02977059"
  }' | jq '.success, .error'
```
**Expected:** 400 validation error

### NEG-003: Negative Numbers
```bash
# Negative price for payout
curl -s -X POST "http://localhost:3001/api/v1/payouts" \
  -H "Authorization: Bearer <CREATOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": -50000}' | jq '.success, .error'
```
**Expected:** 400 validation error

### NEG-004: Very Long Strings
```bash
# Create 10000+ character name
LONG_STRING=$(python3 -c "print('A' * 10001)")
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"Test123!\",\"name\":\"$LONG_STRING\"}" | jq '.success, .error'
```
**Expected:** 400 atau truncated

### NEG-005: Special Characters
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "specialchar@test.com",
    "password": "Test123!",
    "name": "<>\"&;'\''--SELECT * FROM users",
    "username": "test_special_001"
  }' | jq '.success, .error'
```
**Expected:** Sanitized atau escaped, tidak error

### NEG-006: Unicode/Emoji
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emoji@test.com",
    "password": "Test123!",
    "name": "User 🎉🚀💎 Test",
    "username": "emoji_user_001"
  }' | jq '.success, .error'
```
**Expected:** Handled correctly (accepted atau proper error)

### NEG-007: Null Values
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": null,
    "password": null,
    "name": null
  }' | jq '.success, .error'
```
**Expected:** 400 validation error

---

## NEG-008 to NEG-012: Edge Cases

### NEG-008: Empty Database State
```sql
-- Via Supabase MCP: Check empty case handling
SELECT COUNT(*) FROM websites WHERE status = 'active';
```
```bash
# Request with non-existent category
curl -s "http://localhost:3001/api/v1/websites?category=nonexistent-category-slug" | jq '.success, .data.websites | length'
```
**Expected:** Success with empty array

### NEG-009: Pagination Beyond Data
```bash
curl -s "http://localhost:3001/api/v1/websites?page=9999&limit=10" | jq '.success, .data.websites | length, .data.pagination'
```
**Expected:** Success with empty array, tidak error

### NEG-010: Zero Price Website
```bash
# Create website with zero price (free tier)
curl -s -X POST "http://localhost:3001/api/v1/websites" \
  -H "Authorization: Bearer <CREATOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Free Website Test",
    "description": "Testing zero price",
    "categoryId": "331840ec-6c3a-4d16-90f0-712d02977059",
    "externalUrl": "https://example.com"
  }' | jq '.success'
```
**Expected:** Accepted (free tier) atau proper validation

### NEG-011: Maximum Integer Price
Verify via Supabase MCP:
```sql
SELECT MAX(price) FROM pricing_tiers;
-- Try inserting extreme value
INSERT INTO pricing_tiers (website_id, name, price, currency) 
VALUES ('467fe702-f7f9-4e7e-8519-4bc40975c633', 'Extreme', 99999999999, 'IDR')
RETURNING *;
-- Then rollback
```
**Expected:** Handled atau capped

### NEG-012: Duplicate Submission Prevention
```bash
# Rapidly submit same request twice
for i in 1 2; do
  curl -s -X POST "http://localhost:3001/api/v1/bookmarks" \
    -H "Authorization: Bearer <BUYER_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"website_id": "467fe702-f7f9-4e7e-8519-4bc40975c633"}' &
done
wait
```
Then check:
```sql
SELECT COUNT(*) FROM bookmarks 
WHERE user_id = '<BUYER_ID>' 
AND website_id = '467fe702-f7f9-4e7e-8519-4bc40975c633';
```
**Expected:** Only 1 record created

---

## NEG-013 to NEG-016: Network/Error Handling (Manual)

### NEG-013: Server Unavailable
- Stop backend
- Verify frontend shows error message
- **Test via browser**

### NEG-014: Slow Network
- Use browser DevTools → Network → Throttle to Slow 3G
- Verify loading states work
- **Test via browser**

### NEG-015-016: Timeout/Partial Response
- **Manual testing required**

---

## NEG-017 to NEG-022: Business Logic Edge Cases

### NEG-017: Buy Own Website
```bash
# Get creator token for website owner
CREATOR_TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"CreatorPassword123!"}' | jq -r '.data.accessToken')

# Try to buy own website
curl -s -X POST "http://localhost:3001/api/v1/billing/checkout" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "website_id": "467fe702-f7f9-4e7e-8519-4bc40975c633",
    "pricing_tier_id": "a6ab8c19-6007-41ba-ad89-e777fad89d66"
  }' | jq '.success, .error'
```
**Expected:** Should be prevented

### NEG-018: Review Without Purchase
```bash
# Use buyer without purchase on this website
curl -s -X POST "http://localhost:3001/api/v1/reviews" \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "website_id": "cc1b18f2-e2f4-4ed9-99fb-4e59476bc0f5",
    "rating": 5,
    "content": "Fake review without purchase"
  }' | jq '.success, .error'
```
**Expected:** Should be prevented (need purchase first)

### NEG-019: Double Purchase Same Website
Check via Supabase MCP:
```sql
-- Check if buyer already has purchase
SELECT * FROM orders 
WHERE buyer_id = '<BUYER_ID>' 
AND website_id = '467fe702-f7f9-4e7e-8519-4bc40975c633'
AND status = 'paid';
```
If exists, try purchasing again.
**Expected:** Should be prevented

### NEG-020: Refund After Time Limit
```sql
-- Create old paid order (30+ days ago)
INSERT INTO orders (
  id, order_number, buyer_id, website_id, pricing_tier_id, creator_id,
  item_name, item_price, platform_fee, total_amount, currency, status, 
  refund_status, created_at
) VALUES (
  gen_random_uuid(), 'ORD-OLD-REFUND', 
  'beeaf51f-2301-4b75-b09d-6eebece3922a',
  '467fe702-f7f9-4e7e-8519-4bc40975c633',
  'a6ab8c19-6007-41ba-ad89-e777fad89d66',
  '9fa93c1e-de95-460a-b25d-146247f62813',
  'Old Order', 50000, 2500, 52500, 'IDR', 'paid', 'none',
  NOW() - INTERVAL '35 days'
) RETURNING id;
```
Then try refund request.
**Expected:** Should be rejected if time limit enforced

### NEG-021: Payout With Zero Balance
```bash
# Create new creator with no sales
curl -s -X POST "http://localhost:3001/api/v1/payouts" \
  -H "Authorization: Bearer <NEW_CREATOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}' | jq '.success, .error'
```
**Expected:** Should be rejected

### NEG-022: Approve Already Approved Application
```bash
# Find already approved creator
curl -s "http://localhost:3001/api/v1/admin/creator-applications?status=approved" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" | jq '.data.applications[0].id'

# Try approving again
curl -s -X PUT "http://localhost:3001/api/v1/admin/creator-applications/<ID>/approve" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" | jq '.success, .error'
```
**Expected:** No side effects, proper message

---

# PART 2: SECURITY TESTING (24 Cases)

## SEC-001 to SEC-007: Authentication Security

### SEC-001: SQL Injection in Login
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"' OR 1=1--\",\"password\":\"anything\"}" | jq '.success'
```
**Expected:** Failed login, tidak SQL injection

### SEC-002: XSS in Registration
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xss@test.com",
    "password": "Test123!",
    "name": "<script>alert(1)</script>",
    "username": "xsstest001"
  }' | jq '.'
```
Then check output - should be sanitized/escaped

### SEC-003: Brute Force Protection (Manual)
```bash
# Run 10+ failed logins rapidly
for i in {1..15}; do
  curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@findinggems.com","password":"WrongPassword"}' &
done
wait
```
**Expected:** Rate limited atau blocked temporarily

### SEC-004: JWT Token Tampering
```bash
# Get valid token
TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

# Tamper with token (add character)
TAMPERED="${TOKEN}x"

curl -s "http://localhost:3001/api/v1/auth/me" \
  -H "Authorization: Bearer $TAMPERED" | jq '.success, .error'
```
**Expected:** 401 Unauthorized

### SEC-005: Expired Token Access
- Get token, wait until expiry (1hr), test again
- Or manually create expired token
**Expected:** 401 Unauthorized

### SEC-006: Missing Authorization Header
```bash
curl -s "http://localhost:3001/api/v1/auth/me" | jq '.success, .error'
```
**Expected:** 401 Unauthorized

### SEC-007: Invalid Token Format
```bash
curl -s "http://localhost:3001/api/v1/auth/me" \
  -H "Authorization: Bearer not-a-valid-jwt" | jq '.success, .error'

curl -s "http://localhost:3001/api/v1/auth/me" \
  -H "Authorization: InvalidScheme token123" | jq '.success, .error'
```
**Expected:** 401 Unauthorized

---

## SEC-008 to SEC-014: Authorization Security

### SEC-008: User Accesses Admin Endpoint
```bash
BUYER_TOKEN=$(curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | jq -r '.data.accessToken')

curl -s "http://localhost:3001/api/v1/admin/dashboard" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.success, .error'
```
**Expected:** 403 Forbidden

### SEC-009: Buyer Accesses Creator Endpoint
```bash
curl -s -X POST "http://localhost:3001/api/v1/websites" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","categoryId":"331840ec-6c3a-4d16-90f0-712d02977059"}' | jq '.success, .error'
```
**Expected:** 403 Forbidden (must be creator)

### SEC-010: User Edits Other's Website
```bash
# Buyer trying to edit creator's website
curl -s -X PATCH "http://localhost:3001/api/v1/websites/467fe702-f7f9-4e7e-8519-4bc40975c633" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked!"}' | jq '.success, .error'
```
**Expected:** 403 Forbidden

### SEC-011: User Views Other's Orders
```bash
# Get an order ID from another user via MCP
# Then try accessing it
curl -s "http://localhost:3001/api/v1/billing/orders/<OTHER_USER_ORDER_ID>" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.success, .error'
```
**Expected:** 403 or 404

### SEC-012: IDOR - Order Access
Same as above - test multiple order IDs

### SEC-013: IDOR - Payout Access
```bash
# Get another creator's payout ID via MCP
curl -s "http://localhost:3001/api/v1/payouts/<OTHER_PAYOUT_ID>/cancel" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.success, .error'
```
**Expected:** Forbidden or Not Found

### SEC-014: Vertical Privilege Escalation
```bash
# Try to change own role via profile update
curl -s -X PATCH "http://localhost:3001/api/v1/auth/profile" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' | jq '.'
```
Then verify:
```sql
SELECT role FROM users WHERE email = 'buyer@example.com';
```
**Expected:** Role NOT changed

---

## SEC-015 to SEC-024: Input/Data Security

### SEC-015: Oversized Payload
```bash
# Generate 10MB payload
BIG_DATA=$(python3 -c "import json; print(json.dumps({'data': 'x' * 10000000}))")
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "$BIG_DATA" | jq '.success, .error'
```
**Expected:** 413 Payload Too Large

### SEC-016: Invalid Content-Type
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: text/plain" \
  -d 'email=test@test.com&password=test' | jq '.success, .error'
```
**Expected:** 400 Bad Request

### SEC-017 to SEC-020: (Manual/Advanced Testing)
- Null byte injection
- Path traversal
- HTML injection
- Rate limiting

### SEC-021: Password in Response
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"NewPassword123!"}' | grep -i password
```
**Expected:** Password NEVER in response

### SEC-022 to SEC-024: (Manual/Advanced)
- Check server logs for sensitive data
- HTTPS enforcement
- Security headers

---

# PART 3: DATA VALIDATION TESTING (14 Cases)

## DATA-001 to DATA-005: Data Integrity

### DATA-001: Email Uniqueness
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "Test123!",
    "name": "Duplicate User",
    "username": "duplicate001"
  }' | jq '.success, .error'
```
**Expected:** Error - email already exists

### DATA-002: Username Uniqueness
```bash
curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "Test123!",
    "name": "New User",
    "username": "testbuyer"
  }' | jq '.success, .error'
```
**Expected:** Error - username taken

### DATA-003: Foreign Key Integrity
```sql
-- Via Supabase MCP
-- Try inserting order with invalid buyer_id
INSERT INTO orders (buyer_id, website_id, ...)
VALUES ('non-existent-uuid', ...);
```
**Expected:** Foreign key violation error

### DATA-004 & DATA-005: Relationship Integrity
```sql
-- Check all orders have valid website_id
SELECT o.id FROM orders o 
LEFT JOIN websites w ON w.id = o.website_id 
WHERE w.id IS NULL;

-- Check all payouts have valid creator_id
SELECT p.id FROM payouts p 
LEFT JOIN users u ON u.id = p.creator_id 
WHERE u.id IS NULL;
```
**Expected:** Empty results (no orphans)

---

## DATA-006 to DATA-010: Field Validation

### DATA-006: Invalid Email Formats
```bash
for email in "invalidemail" "@test.com" "test@" "test@.com"; do
  echo "Testing: $email"
  curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"Test123!\",\"name\":\"Test\",\"username\":\"test$(date +%s)\"}" | jq '.success'
done
```
**Expected:** All should fail

### DATA-007: Password Validation
```bash
for pass in "short" "nouppercase1" "NOLOWERCASE1" "NoNumbers!"; do
  echo "Testing: $pass"
  curl -s -X POST "http://localhost:3001/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$(date +%s)@test.com\",\"password\":\"$pass\",\"name\":\"Test\",\"username\":\"test$(date +%s)\"}" | jq '.success, .error.message'
done
```
**Expected:** All should fail with password requirements message

### DATA-008 to DATA-010: Price/URL/Phone Validation
```bash
# Invalid price
# Invalid URL format
# Invalid phone format
```
Test via website creation endpoint

---

## DATA-011 to DATA-014: Data Consistency

### DATA-011: Order Total Matches Price
```sql
SELECT o.id, o.item_price, pt.price, 
       CASE WHEN o.item_price != pt.price THEN 'MISMATCH' ELSE 'OK' END as status
FROM orders o
JOIN pricing_tiers pt ON pt.id = o.pricing_tier_id
LIMIT 10;
```
**Expected:** All OK

### DATA-012: Creator Earnings Calculation
```sql
SELECT 
  cb.creator_id,
  cb.total_earnings as recorded,
  COALESCE(SUM(o.total_amount - o.platform_fee), 0) as calculated
FROM creator_balances cb
LEFT JOIN orders o ON o.creator_id = cb.creator_id AND o.status = 'paid'
GROUP BY cb.creator_id, cb.total_earnings
HAVING cb.total_earnings != COALESCE(SUM(o.total_amount - o.platform_fee), 0);
```
**Expected:** Empty (no mismatches)

### DATA-013: Refund Amount <= Order Amount
```sql
SELECT r.id, r.refund_amount, o.total_amount
FROM refunds r
JOIN orders o ON o.id = r.order_id
WHERE r.refund_amount > o.total_amount;
```
**Expected:** Empty

### DATA-014: Payout Amount <= Available Balance
- Already tested in payout flow

---

# PART 4: E2E UI TESTING (8 Cases)

**Gunakan Browser Subagent untuk testing ini**

## E2E-001: Complete Buyer Journey
```
1. Buka https://findinggems.id atau http://localhost:3000
2. Click Register
3. Fill form dengan data baru
4. Submit dan login
5. Browse ke /explore
6. Search "analytics"
7. Click website detail
8. Click Buy/Checkout
9. Complete payment simulation
10. Check order di /dashboard/purchases
11. Write review
12. Logout
```

## E2E-002: Complete Creator Journey
```
1. Login sebagai buyer
2. Go to /become-creator
3. Fill application form
4. Submit
5. Login sebagai admin
6. Approve application
7. Logout, login kembali sbg creator
8. Create new website listing
9. Add pricing tiers
10. Submit for review
11. Admin approve website
12. Check published website
```

## E2E-003: Admin Workflow
```
1. Login sebagai admin
2. Go to /admin/dashboard
3. Check stats
4. Go to pending websites → approve/reject
5. Go to creator applications → approve/reject
6. Go to refunds → process one
7. Go to payouts → process one
8. Check analytics page
9. Logout
```

## E2E-004 to E2E-008: Critical Paths
Test complete flows dari start to finish

---

# 📝 Reporting Format

```
## Test ID: [ID]
**Status:** PASS / FAIL / BLOCKED
**Steps Executed:** [describe]
**Expected:** [what should happen]
**Actual:** [what happened]
**Evidence:** [curl output / screenshot / SQL result]
**Notes:** [any additional info]
```

---

# ✅ Checklist

## Negative Testing
- [ ] NEG-001: Empty Required Fields
- [ ] NEG-002: Wrong Data Types
- [ ] NEG-003: Negative Numbers
- [ ] NEG-004: Very Long Strings
- [ ] NEG-005: Special Characters
- [ ] NEG-006: Unicode/Emoji
- [ ] NEG-007: Null Values
- [ ] NEG-008: Empty Database State
- [ ] NEG-009: Pagination Beyond Data
- [ ] NEG-010: Zero Price Website
- [ ] NEG-011: Max Integer Price
- [ ] NEG-012: Duplicate Submission
- [ ] NEG-017: Buy Own Website
- [ ] NEG-018: Review Without Purchase
- [ ] NEG-019: Double Purchase
- [ ] NEG-020: Refund After Time Limit
- [ ] NEG-021: Payout Zero Balance
- [ ] NEG-022: Approve Already Approved

## Security Testing
- [ ] SEC-001: SQL Injection
- [ ] SEC-002: XSS in Registration
- [ ] SEC-003: Brute Force Protection
- [ ] SEC-004: JWT Tampering
- [ ] SEC-005: Expired Token
- [ ] SEC-006: Missing Auth Header
- [ ] SEC-007: Invalid Token Format
- [ ] SEC-008: User → Admin Endpoint
- [ ] SEC-009: Buyer → Creator Endpoint
- [ ] SEC-010: Edit Other's Website
- [ ] SEC-011: View Other's Orders
- [ ] SEC-012: IDOR Order Access
- [ ] SEC-013: IDOR Payout Access
- [ ] SEC-014: Privilege Escalation
- [ ] SEC-015: Oversized Payload
- [ ] SEC-016: Invalid Content-Type
- [ ] SEC-021: Password Not in Response

## Data Validation
- [ ] DATA-001: Email Uniqueness
- [ ] DATA-002: Username Uniqueness
- [ ] DATA-003: Foreign Key Integrity
- [ ] DATA-004: Order-Website Relationship
- [ ] DATA-005: Payout-User Relationship
- [ ] DATA-006: Email Format Validation
- [ ] DATA-007: Password Validation
- [ ] DATA-011: Order Total Matches
- [ ] DATA-012: Earnings Calculation
- [ ] DATA-013: Refund ≤ Order

## E2E Testing
- [ ] E2E-001: Buyer Complete Flow
- [ ] E2E-002: Creator Complete Flow
- [ ] E2E-003: Admin Workflow
- [ ] E2E-004: Registration → Purchase
- [ ] E2E-005: Creator Apply → List Website

---

**Total Remaining Test Cases: ~77**

Report hasil dengan format di atas. Gunakan MCP Supabase untuk database queries!
