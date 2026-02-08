# Frontend Bug Fix Brief

**Date:** 2026-02-08
**Assigned To:** Frontend Team
**Status:** 🔴 Action Required

---

## 📊 Summary

| Category | Count | Priority |
|----------|-------|----------|
| **Critical UX Bugs** | 5 | 🔴 High |
| **Mock Data Issues** | 4 | 🟡 Medium |
| **Total** | **9 bugs** | |

---

# 🔴 CRITICAL UX BUGS (From QA Testing)

## FE-UX-NEW-001: No Buy/Checkout CTA on Website Detail Page
**Severity:** 🔴 Critical - Blocks purchase flow!
**URL:** `https://finding-gems.vercel.app/website/datavault-analytics`
**File:** `/app/website/[slug]/page.tsx`

### Description
Website detail page hanya menampilkan:
- ✅ Visit Website
- ✅ Bookmark
- ✅ Share

**MISSING:** Tidak ada tombol "Buy" atau "Purchase" atau "Get Access"!

### Expected Behavior
Harus ada CTA untuk beli/checkout, contoh:
```tsx
<Button onClick={() => router.push(`/checkout?website=${website.id}`)}>
  Get Access - Rp {price}
</Button>
```

### Root Cause Investigation
Cek apakah:
1. Button ada tapi hidden?
2. Button memang tidak di-implement?
3. Pricing tiers tidak di-render?

---

## FE-UX-NEW-002: Checkout Page "Product Not Found"
**Severity:** 🔴 Critical - Purchase flow broken!
**URL:** `/checkout?websiteId=...` atau `/checkout?slug=...`
**File:** `/app/checkout/page.tsx`

### Description
Halaman checkout selalu menampilkan "Product Not Found" meskipun website valid.

### Expected Behavior
Checkout page harus bisa handle:
- `?website=uuid` → cari by UUID
- `?websiteId=uuid` → cari by UUID  
- `?slug=website-slug` → cari by slug

### Investigation
```tsx
// app/checkout/page.tsx - check line ~50-80
const websiteId = searchParams.get('website') || searchParams.get('websiteId');
const slug = searchParams.get('slug');

// Pastikan query ke API benar:
// GET /api/v1/websites/:id atau GET /api/v1/websites?slug=xxx
```

---

## FE-UX-NEW-003: Profile Pages Return 404
**Severity:** 🔴 Critical - User-facing pages broken!
**URLs:** 
- `/profile/janecreator` → 404
- `/profile/qacreator` → 404
**File:** `/app/profile/[username]/page.tsx`

### Description
Profile pages return 404 for valid usernames.

### Expected Behavior
Should load user profile from API.

### Root Cause (Known)
This file uses **mock data**! See FE-MOCK-002 below.

```tsx
// WRONG - Current implementation
import { mockUsers } from '@/lib/mockData';
const user = mockUsers.find(u => u.username === username);
if (!user) return notFound(); // Always 404 for real users!
```

### Fix
Replace with real API call:
```tsx
const { data: user, error } = await apiClient.get(`/users/${username}/profile`);
if (error || !user) return notFound();
```

---

## FE-UX-NEW-004: Admin Websites Shows "RpNaN"
**Severity:** 🟡 Medium
**URL:** `/admin?tab=websites`
**File:** `/app/admin/page.tsx` (websites section)

### Description
Price column menampilkan "RpNaN" untuk beberapa websites.

### Expected Behavior
Tampilkan harga dengan format benar: "Rp 50.000" atau "Free"

### Root Cause
```tsx
// Wrong
<span>Rp{website.price}</span> // price is undefined/null

// Should be
<span>{website.price ? `Rp ${website.price.toLocaleString()}` : 'Free'}</span>
```

---

## FE-UX-NEW-005: Creator Analytics Shows Fake Numbers
**Severity:** 🟡 Medium
**URL:** `/creator/analytics`
**File:** `/app/creator/analytics/page.tsx`

### Description
Analytics page menampilkan angka tinggi (views, revenue, etc) meskipun creator tidak punya listings.

### Investigation
Cek apakah:
1. Masih pakai mock data setelah fix?
2. API return data yang salah?
3. State tidak di-reset untuk empty listings?

### Expected Behavior
Jika creator tidak punya listings:
- Total Views: 0
- Total Revenue: Rp 0
- Empty state message

---

# 🟡 MOCK DATA ISSUES

## FE-MOCK-001: Admin Reports Page
**File:** `app/admin/reports/page.tsx`
**Issue:** Uses `mockReports` instead of real API

### Fix
```tsx
// Replace mockReports with API hook
import { useReports } from '@/lib/api/admin';
const { data: reports, isLoading } = useReports();
```

**Backend API:** `GET /api/v1/admin/reports`

---

## FE-MOCK-002: Profile Page (HIGH PRIORITY)
**File:** `app/profile/[username]/page.tsx`
**Issue:** Uses `mockUsers`, `mockCreatorProfiles`, `mockWebsites`
**Related:** This causes FE-UX-NEW-003 (404s)!

### Fix
```tsx
// lib/api/users.ts - Create hook
export async function getUserProfile(username: string) {
  const response = await apiClient.get(`/users/${username}/profile`);
  return response.data.data;
}


// app/profile/[username]/page.tsx - Use API
export default async function ProfilePage({ params }) {
  const profile = await getUserProfile(params.username);
  if (!profile) return notFound();
  return <ProfileView profile={profile} />;
}
```

**Backend APIs:**
- `GET /api/v1/users/:username/profile`
- `GET /api/v1/creators/:id`
- `GET /api/v1/websites?creator_id=xxx`

---

## FE-MOCK-003: Admin Creators Page
**File:** `app/admin/creators/page.tsx`
**Issue:** Uses `mockCreatorApplications`, `mockCreatorProfiles`

### Fix
```tsx
import { useCreatorApplications } from '@/lib/api/admin';
const { data: applications, isLoading } = useCreatorApplications();
```

**Backend API:** `GET /api/v1/admin/creator-applications`

---

## FE-MOCK-004: Creator Analytics Detail Page
**File:** `app/creator/analytics/[id]/page.tsx`
**Issue:** Uses `mockWebsites`

### Fix
```tsx
import { useWebsiteAnalytics } from '@/lib/api/analytics';
const { data: analytics, isLoading } = useWebsiteAnalytics(websiteId);
```

**Backend API:** `GET /api/v1/creator/websites/:id/analytics`

---

# 📝 Notes from QA

### Non-blocking Issues
- Footer prefetch console errors untuk `/privacy`, `/terms` (404 prefetch)
- These can be fixed later

### Test Accounts
```
Buyer:   qa-buyer@test.com / QATest123!
Creator: qa-creator@test.com / QATest123!
Admin:   admin@findinggems.com / Admin123!
```

---

# ✅ Verification Checklist

After fixing, verify:

- [ ] `/website/[slug]` has Buy/Checkout button
- [ ] `/checkout?website=uuid` loads product correctly
- [ ] `/profile/[username]` loads real user data
- [ ] `/admin?tab=websites` shows prices correctly (no NaN)
- [ ] `/creator/analytics` shows real data (0 if no listings)
- [ ] `npm run lint` - No mock data warnings
- [ ] `npm run build` - Build passes

---

# 🚀 Priority Order

1. **FE-UX-NEW-001** - Add Buy CTA (blocks ALL purchases)
2. **FE-UX-NEW-002** - Fix checkout page params
3. **FE-MOCK-002** - Profile page API (fixes FE-UX-NEW-003)
4. **FE-UX-NEW-004** - Fix RpNaN display
5. **FE-UX-NEW-005** - Fix analytics empty state
6. **FE-MOCK-001, 003, 004** - Other mock data fixes

---

# 📞 Contact

**Backend API Issues?** Ask backend team
**Design Questions?** Check existing pages for patterns

---

*Last Updated: 2026-02-08 14:40*
*QA Report: Complete*
