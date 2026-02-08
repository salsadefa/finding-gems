# QA UX/FE Bug Hunting Brief

**Date:** 2026-02-08
**Assigned To:** QA Team
**Objective:** Find UX/FE bugs similar to what was discovered in the previous session

---

## 📋 Background

Dalam session sebelumnya, ditemukan **5 UX bugs kritis** yang semuanya memiliki pola serupa:
1. **Frontend pakai mock data** bukan real API
2. **API response tidak di-handle dengan benar** oleh frontend
3. **Data tidak muncul** padahal backend sudah return data
4. **Empty states** yang tidak informatif

**2 bug sudah di-fix:**
- ✅ Creator Analytics - sekarang pakai real API
- ✅ Payment Instructions - sekarang handle Xendit response properly

---

## 🎯 Metode Hunting Bug UX/FE Sejenis

### 1. Static Code Analysis (Otomatis)

**Jalankan ESLint untuk detect mock data imports:**
```bash
cd /Users/arkan/finding-gems
npm run lint 2>&1 | grep -E "(mockData|mock)" 
```

**Atau pakai grep langsung:**
```bash
# Cari semua file yang import mockData
grep -rn "mockData" app/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."

# Cari semua file yang hardcode data
grep -rn "const.*=.*\[" app/ --include="*.tsx" | grep -v "useState\|useMemo"
```

### 2. User Flow Testing (Manual via Playwright/Browser)

**Pola bug yang ditemukan:**
| Flow | Bug Pattern | How to Check |
|------|-------------|--------------|
| **Purchase → Dashboard** | Data tidak sync | Beli item → cek /dashboard/purchases → harusnya muncul |
| **Payment Instructions** | Detail kosong | Pilih payment method → cek ada VA/QRIS/bank details |
| **Analytics/Stats** | Data fake | Lihat numbers → compare dengan realita |
| **Profile Page** | Mock user data | Kunjungi /profile/[username] → lihat apakah data real |
| **Admin Reports** | Mock reports | Kunjungi /admin?tab=reports → lihat apakah data real |

### 3. API Response Verification

**Check apakah FE handle API response dengan benar:**
```bash
# Login dulu
TOKEN=$(curl -s https://finding-gems-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-buyer@test.com","password":"QATest123!"}' | jq -r '.data.accessToken')

# Test orders endpoint - compare dengan UI
curl -s https://finding-gems-backend.onrender.com/api/v1/billing/orders/my \
  -H "Authorization: Bearer $TOKEN" | jq '.data.orders | length'
# Lalu compare: UI /dashboard/purchases harusnya sama jumlahnya

# Test bookmarks
curl -s https://finding-gems-backend.onrender.com/api/v1/bookmarks \
  -H "Authorization: Bearer $TOKEN" | jq '.data.bookmarks | length'
# Compare dengan UI /dashboard (tab bookmarks)
```

---

## 🔍 Critical Flows to Test

### Flow 1: Full Purchase Flow
```
1. Login buyer → /search → click website → /checkout
2. Select payment → Initiate payment
3. Check: Payment instructions muncul dengan benar?
   - QRIS: Ada QR code?
   - Bank Transfer: Ada VA number, bank name?
   - Amount terlihat jelas?
4. Go to /dashboard/purchases
5. Check: Order yang baru dibuat muncul?
```

### Flow 2: Creator Dashboard
```
1. Login creator → /creator
2. Check /creator/listings → Real atau mock?
3. Check /creator/analytics → Numbers real atau fake?
4. Check /creator/earnings → Balance benar?
```

### Flow 3: Admin Dashboard
```
1. Login admin → /admin
2. Check ?tab=users → Data real dari API?
3. Check ?tab=websites → Prices tidak NaN?
4. Check ?tab=reports → Data real atau mock?
5. Check ?tab=creators → Creator applications real?
```

### Flow 4: Profile Pages
```
1. Visit /profile/qacreator (atau username lain)
2. Check: Profile data dari API atau hardcoded?
3. Check: Websites listing real?
```

---

## 🐛 Known Remaining Bugs (FE harus fix)

| ID | File | Issue | Severity |
|----|------|-------|----------|
| FE-MOCK-001 | `/app/admin/reports/page.tsx` | Uses `mockReports` | Medium |
| FE-MOCK-002 | `/app/profile/[username]/page.tsx` | Uses mock users/profiles | High |
| FE-MOCK-003 | `/app/admin/creators/page.tsx` | Uses mock applications | Medium |
| FE-MOCK-004 | `/app/creator/analytics/[id]/page.tsx` | Uses mockWebsites | Medium |

**Verify these AFTER FE fixes them!**

---

## 📝 Bug Report Template

Jika menemukan bug baru, report dengan format ini:

```markdown
## Bug ID: FE-UX-XXX

**URL:** /path/to/page
**Severity:** Critical / High / Medium / Low
**Category:** Mock Data / Missing Data / API Mismatch / Empty State

### Description
Apa yang salah

### Expected Behavior
Apa yang seharusnya terjadi

### Actual Behavior
Apa yang terjadi

### Steps to Reproduce
1. Login sebagai [role]
2. Navigate to [page]
3. Perform [action]

### API Response (if applicable)
```json
// Paste API response here
```

### Screenshot
[Attach if available]
```

---

## ✅ Checklist untuk QA

- [ ] Run ESLint mock data check
- [ ] Run grep untuk cari hardcoded data
- [ ] Test full purchase flow (payment instructions visible?)
- [ ] Test dashboard orders sync
- [ ] Test creator analytics (real data?)
- [ ] Test admin reports (real data?)
- [ ] Test profile pages (real data?)
- [ ] Compare API response dengan UI display
- [ ] Document any new bugs found

---

## 📋 QA Verification Summary (Production)

**Total Bugs to Verify:** 9

**Credentials (Production)**
- Buyer: qa-buyer@test.com / QATest123!
- Creator: qa-creator@test.com / QATest123!
- Admin: admin@findinggems.com / Admin123!

**Credentials (Local - localhost:3000/3001)**
- Buyer: buyer2@test.com / password123
- Creator (qa): qa-creator@test.com / QATest123!
- Creator (janecreator): creator@example.com / CreatorPassword123! ← **owns website 467fe702**
- Admin: admin@findinggems.com / Admin123!

**Useful IDs (Local)**
- Website with pricing: `fdc194e7-bdb1-4468-8c2a-62d84371efbf` (qa-test-website-1770457564)
- Pricing tier: `0a71a3d9-1016-4fe4-90d3-be334f3868c2`
- Creator website (janecreator): `467fe702-f7f9-4e7e-8519-4bc40975c633`

### ✅ Bugs Marked Fixed (Verify)

**Last Updated:** 2026-02-08 16:55 (LOCAL testing)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| FE-UX-NEW-001 | Buy CTA on website detail | ✅ PASS | Guest + logged-in buyer verified |
| FE-UX-NEW-002 | Checkout page param handling | ✅ PASS | Params working correctly |
| FE-UX-NEW-003 | Profile pages 404 | ✅ PASS | Profile pages load correctly |
| FE-UX-NEW-004 | Admin RpNaN | ✅ PASS | Shows "Rp -" not RpNaN |
| FE-UX-NEW-005 | Analytics fake numbers | ✅ PASS | Empty state, no inflated metrics |
| FE-MOCK-001 | Admin reports mock data | ✅ PASS | Real API calls confirmed |
| FE-MOCK-002 | Profile page mock data | ✅ PASS | Same as FE-UX-NEW-003 |
| FE-MOCK-003 | Admin creators mock data | ✅ PASS | Real API calls confirmed |
| FE-MOCK-004 | Creator analytics detail mock | ✅ PASS | Real API calls confirmed |

---

## 🧪 Test Steps + Expected Behavior

### FE-UX-NEW-001: Buy CTA on website detail
**Steps**
1. Login Buyer → `/search`
2. Open any website detail `/website/[slug]`
3. Verify a Buy/Checkout CTA is visible
4. Click CTA

**Expected**
- CTA visible on detail page
- CTA navigates to `/checkout` with valid product context

### FE-UX-NEW-002: Checkout page param handling
**Steps**
1. Open `/checkout?websiteId=<valid_id>`
2. Open `/checkout?slug=<valid_slug>`

**Expected**
- Product details render (no “Product Not Found”)
- Pricing and payment options visible

### FE-UX-NEW-003: Profile pages 404
**Steps**
1. Open `/profile/janecreator`
2. Open `/profile/qacreator`

**Expected**
- Profile page loads (not 404)
- Creator info + listings visible (or clear empty state)

### FE-UX-NEW-004: Admin RpNaN
**Steps**
1. Login Admin → `/admin?tab=websites`
2. Scan Price column

**Expected**
- Prices show valid numbers (e.g., Rp 0 / Rp 51rb), not `RpNaN`

### FE-UX-NEW-005: Analytics fake numbers
**Steps**
1. Login Creator → `/creator/analytics`
2. Compare UI numbers with API (or empty state)

**Expected**
- Metrics reflect real API data
- If no data, show zeros/empty state (not inflated demo numbers)

### FE-MOCK-001: Admin reports mock data
**Steps**
1. Login Admin → `/admin?tab=reports`
2. Open DevTools → Network → refresh

**Expected**
- Reports populated from real API call
- No mock/static report list

### FE-MOCK-002: Profile page mock data
**Steps**
1. Open `/profile/[username]`
2. Check Network API responses

**Expected**
- Profile data loads from API (not hardcoded)

### FE-MOCK-003: Admin creators mock data
**Steps**
1. Login Admin → `/admin?tab=creators`
2. Check Network API responses

**Expected**
- Creator applications from API (not mock list)

### FE-MOCK-004: Creator analytics detail mock
**Steps**
1. Login Creator → `/creator/analytics/[id]`
2. Check Network API responses

**Expected**
- Detail analytics data comes from API (not mockWebsites)

---

## 🔍 How to Verify API Calls

**Browser DevTools**
1. Open DevTools → Network → XHR/Fetch
2. Refresh page
3. Click relevant request → note URL + response
4. Compare UI values with API response

**cURL Examples (use Bearer token)**
```bash
# Login buyer to get token
TOKEN=$(curl -s https://finding-gems-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-buyer@test.com","password":"QATest123!"}' | jq -r '.data.accessToken')

# Orders vs UI (buyer)
curl -s https://finding-gems-backend.onrender.com/api/v1/billing/orders/my \
  -H "Authorization: Bearer $TOKEN" | jq '.data.orders'

# Bookmarks vs UI (buyer)
curl -s https://finding-gems-backend.onrender.com/api/v1/bookmarks \
  -H "Authorization: Bearer $TOKEN" | jq '.data.bookmarks'
```

---

## ✅ Verification Checklist (LOCAL)

- [x] FE-UX-NEW-001 verified ✅ PASS
- [x] FE-UX-NEW-002 verified ✅ PASS
- [x] FE-UX-NEW-003 verified ✅ PASS
- [x] FE-UX-NEW-004 verified ✅ PASS
- [x] FE-UX-NEW-005 verified ✅ PASS
- [x] FE-MOCK-001 verified ✅ PASS
- [x] FE-MOCK-002 verified ✅ PASS
- [x] FE-MOCK-003 verified ✅ PASS
- [x] FE-MOCK-004 verified ✅ PASS

---

## 📝 Bug Report Format

```markdown
## Bug ID: FE-UX-XXX

**URL:** /path/to/page
**Severity:** Critical / High / Medium / Low
**Category:** Mock Data / Missing Data / API Mismatch / Empty State

### Description
Apa yang salah

### Expected Behavior
Apa yang seharusnya terjadi

### Actual Behavior
Apa yang terjadi

### Steps to Reproduce
1. Login sebagai [role]
2. Navigate to [page]
3. Perform [action]

### API Response (if applicable)
```json
// Paste API response here
```

### Screenshot
[Attach if available]
```

---

## ✅ Sign-Off Table

| QA | Date | Environment | Overall Result | Notes |
|----|------|-------------|----------------|-------|
|    |      | Production  | Pass / Fail / Blocked | |

---

## 🛠️ Tools yang Dibutuhkan

1. **Browser DevTools** - Network tab untuk lihat API calls
2. **Playwright** (opsional) - Automated testing
3. **cURL/httpie** - API testing manual
4. **Terminal** - Untuk grep/ESLint commands

---

*Report issues ke tim. Good luck hunting! 🎯*
