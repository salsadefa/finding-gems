# 🔧 Backend Fixes - QA Round TODO Results

**Date:** 2026-02-07 16:45 WIB  
**From:** Backend Agent  
**To:** QA Agent  
**Status:** FIXES APPLIED ✅

---

## 📊 Bug Summary dari QA Results

### ✅ FIXED (Backend)

| Bug ID | Issue | Fix Applied |
|--------|-------|-------------|
| **NEG-003** | Negative pagination → 500 | Added pagination sanitization in `website.controller.ts` |
| **NEG-004** | Long string 1000 chars accepted | Added max length validation (100 chars) in auth |
| **SEC-002** | XSS payload accepted | Added `sanitizeText()` utility, applied to name field |
| **SEC-007** | CORS returns header for malicious origin | Updated CORS to use origin callback with whitelist |
| **SEC-020** | Rate limit 100 req tidak trigger | Lowered limit from 500 to 100 per 15 min |

### ❌ NOT BUGS (Brief/Route Issues)

| Issue | Root Cause | Correct Info |
|-------|------------|--------------|
| SEC-011 | Brief route salah | Use `/api/v1/billing/orders/:orderId` |
| NEG-017/018 | Brief route salah | Orders: `/billing/orders`, Reviews: `/reviews` |
| DISC-001 | Frontend route | `/explore` → seharusnya `/search` |
| PERF tests | Brief route salah | `/websites/:slug` → `/website/:slug` |

### ⏸️ NOT BACKEND SCOPE

| Issue | Owner |
|-------|-------|
| PERF-015 LCP 10279ms | Frontend optimization |
| PERF-020 TTI 9284ms | Frontend optimization |

---

## 📝 Files Modified

1. **`/backend/src/controllers/website.controller.ts`**
   - Added pagination sanitization (Math.max, Math.min)
   - Prevents negative page/limit values

2. **`/backend/src/controllers/auth.controller.ts`**
   - Added `sanitizeText()` import
   - Added name sanitization (strips HTML tags)
   - Added max length validation (100 chars)

3. **`/backend/src/utils/sanitize.ts`** (NEW)
   - `sanitizeHtml()` - Escape HTML entities
   - `sanitizeText()` - Remove script/HTML tags
   - `validateMaxLength()` - Enforce max length

4. **`/backend/src/app.ts`**
   - Updated CORS to use origin callback
   - Added whitelist: localhost, vercel, findinggems.id
   - Rejects malicious origins properly

5. **`/backend/.env`**
   - `RATE_LIMIT_MAX_REQUESTS`: 500 → 100

6. **`/QA-XENDIT-TESTING-BRIEF.md`**
   - Fixed route paths (orders → billing/orders)
   - Fixed review creation (needs websiteId in body)

---

## 🧪 Verification Commands

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
    "name":"<script>alert(1)</script>Test",
    "username":"xsstest'$(date +%s)'"
  }' | jq '.data.user.name'
# Expected: "Test" (script tag stripped)
```

### Test NEG-004 Fix (Long String)
```bash
LONG_NAME=$(python3 -c "print('A'*150)")
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"longtest$(date +%s)@test.com\",\"password\":\"Test123!\",\"name\":\"$LONG_NAME\",\"username\":\"longtest$(date +%s)\"}" | jq
# Expected: VALIDATION_ERROR - Name must not exceed 100 characters
```

### Test SEC-007 Fix (CORS)
```bash
curl -sI -X OPTIONS http://localhost:3001/api/v1/websites \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" | grep -i "access-control"
# Expected: No Access-Control-Allow-Origin header (or CORS error)
```

### Test SEC-020 Fix (Rate Limit)
```bash
# Send 110 requests (should hit limit at 100)
for i in {1..110}; do 
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/websites)
  echo "Request $i: $CODE"
done | tail -15
# Expected: 429 after request 100
```

---

## 🚀 Next Steps for QA

1. **Restart backend server** to load fixes:
   ```bash
   cd /Users/arkan/finding-gems/backend
   npm run dev
   ```

2. **Re-run failed tests** above to verify fixes

3. **Continue with Xendit testing** - Brief sudah diupdate dengan route yang benar

---

## 📋 Re-test Priority

| Priority | Tests | Notes |
|----------|-------|-------|
| P1 | NEG-003, SEC-002, SEC-007, SEC-020 | Backend fixes |
| P1 | NEG-004 | Max length validation |
| P2 | Xendit Payment Tests | Brief updated, ready |
| P3 | PERF tests | Rerun with correct routes |

---

**Backend Agent - Fixes Complete** 🤝

Restart server dan re-test!
