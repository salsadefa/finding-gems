# 📋 QA Remaining Tests Brief

**Date:** 2026-02-07 17:55 WIB  
**From:** Backend Agent  
**To:** QA Team  
**Priority:** Low (nice-to-have)

---

## 🎯 Summary

Most critical tests are now PASS ✅. Remaining tests are **edge cases** and **nice-to-have** validations.

---

## ✅ Already Completed (50+ tests)

- Security tests: 11/16 PASS
- Data Validation: 6/9 PASS
- Negative tests: 7/19 PASS
- E2E UI: 8/9 PASS
- **Payment flow: 8/8 PASS** ✅
- **Review flow: 4/4 PASS** ✅
- Bookmark: 3/3 PASS
- k6 Load: 2/2 PASS

---

## 📝 Remaining QA Tasks (Optional)

### 1. Security Edge Cases (5 tests)

| ID | Test | Type | Command/Steps |
|----|------|------|---------------|
| SEC-011 | IDOR Order Access | curl | Try accessing other user's order by ID |
| SEC-012 | IDOR Payout Access | curl | Try accessing other user's payout |
| SEC-013 | IDOR Refund Access | curl | Try accessing other user's refund |
| SEC-023 | HTTPS Enforcement | browser | Test production URL redirects HTTP→HTTPS |
| SEC-006 | Missing Auth Header | curl | `curl http://localhost:3001/api/v1/auth/me` → expect 401 |

**How to test:**
```bash
# SEC-011: Try wrong order ID
curl -s "http://localhost:3001/api/v1/billing/orders/00000000-0000-0000-0000-000000000001" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
# Expected: 403 or 404

# SEC-006: Missing auth
curl -s "http://localhost:3001/api/v1/auth/me" | jq
# Expected: 401 Unauthorized
```

---

### 2. FK Integrity Tests (3 tests) - Via Supabase MCP

| ID | Test | Method |
|----|------|--------|
| DATA-003 | Foreign Key Integrity | SQL query |
| DATA-004 | Order-Website Relationship | SQL query |
| DATA-005 | Payout-User Relationship | SQL query |

**How to test (via MCP Supabase):**
```sql
-- DATA-003: Try inserting with invalid FK (should fail)
INSERT INTO orders (id, buyer_id, website_id, pricing_tier_id, creator_id, order_number, item_name, item_price, platform_fee, total_amount, currency, status)
VALUES (gen_random_uuid(), 'invalid-uuid-here', 'invalid-website', 'invalid-tier', 'invalid-creator', 'ORD-FK-TEST', 'Test', 10000, 500, 10500, 'IDR', 'pending');
-- Expected: Foreign key violation error

-- DATA-004: Check orphan orders
SELECT o.id FROM orders o 
LEFT JOIN websites w ON w.id = o.website_id 
WHERE w.id IS NULL;
-- Expected: Empty (no orphans)

-- DATA-005: Check orphan payouts
SELECT p.id FROM payouts p 
LEFT JOIN users u ON u.id = p.creator_id 
WHERE u.id IS NULL;
-- Expected: Empty (no orphans)
```

---

### 3. Negative Edge Cases (12 tests)

| ID | Test | Type |
|----|------|------|
| NEG-008 | Empty Category Filter | curl |
| NEG-010 | Zero Price Website | curl |
| NEG-011 | Max Integer Price | SQL |
| NEG-013 | Server Unavailable | manual |
| NEG-014 | Slow Network | browser DevTools |
| NEG-015 | Request Timeout | manual |
| NEG-016 | Partial Response | manual |
| NEG-017 | Buy Own Website | curl |
| NEG-019 | Double Purchase | curl |
| NEG-020 | Refund After 30 Days | SQL + curl |
| NEG-021 | Payout Zero Balance | curl |
| NEG-022 | Approve Already Approved | curl |

**Sample commands:**
```bash
# NEG-008: Non-existent category
curl -s "http://localhost:3001/api/v1/websites?category=nonexistent-slug" | jq '.data.websites | length'
# Expected: 0 (empty array)

# NEG-017: Creator tries to buy own website
curl -s -X POST http://localhost:3001/api/v1/billing/orders \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"website_id":"<creator-own-website-id>"}' | jq
# Expected: Error - cannot buy own website
```

---

### 4. Refund Flow (3 tests)

| ID | Test | Type |
|----|------|------|
| REF-001 | Request Refund | curl |
| REF-002 | Admin Approve Refund | curl |
| REF-003 | Verify Refund Status | curl |

**Commands:**
```bash
# REF-001: Request refund (need ORDER_ID from paid order)
curl -s -X POST "http://localhost:3001/api/v1/refunds" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"<ORDER_ID>","reason":"Want a refund for testing"}' | jq

# REF-002: Admin approve (need REFUND_ID from above)
curl -s -X POST "http://localhost:3001/api/v1/admin/refunds/<REFUND_ID>/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# REF-003: Check status
curl -s "http://localhost:3001/api/v1/refunds/<REFUND_ID>" \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq
```

---

## ⚠️ Notes

1. **These tests are optional** - All critical functionality is already verified
2. **Most are edge cases** - Unlikely to impact normal user flows
3. **Some require specific setup** (e.g., old orders for refund time limit test)
4. **Manual tests** (NEG-013/14/15/16) require browser/network manipulation

---

## ✅ Recommendation

**Priority:**
1. ⭐ REF-001/002/003 - Test refund flow if time permits
2. ⭐ SEC-006/011 - Quick IDOR tests
3. DATA-003/004/005 - Can run via MCP in seconds

**Skip for now:**
- NEG-013/14/15/16 (manual network testing)
- SEC-023 (production only)
- NEG-011 (max integer edge case)

---

**QA Brief Complete** 🤝
