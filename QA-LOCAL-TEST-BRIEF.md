# QA Brief - Test on LOCAL Server (NOT Production!)

**Date:** 2026-02-08 15:23
**IMPORTANT:** FE belum push ke production!

---

## ⚠️ JANGAN TEST DI PRODUCTION!

FE changes **belum di-deploy** ke Vercel production.

**Test di LOCAL server:**

```bash
# Start local dev server
cd /Users/arkan/finding-gems
npm run dev
```

**Base URL untuk testing:**
- ❌ BUKAN: `https://finding-gems.vercel.app`
- ✅ PAKAI: `http://localhost:3000`

---

## 🔧 Setup Steps

1. **Pastikan local server running:**
```bash
npm run dev
```

2. **Pastikan backend connected:**
   - Backend: `https://finding-gems-backend.onrender.com`
   - Atau local backend jika ada

3. **Test di browser:**
   - Buka `http://localhost:3000`
   - Login dengan credentials
   - Test semua 9 bugs

---

## 📋 Test URLs (LOCAL)

| Bug | URL to Test |
|-----|-------------|
| FE-UX-NEW-001 | `http://localhost:3000/website/datavault-analytics` |
| FE-UX-NEW-002 | `http://localhost:3000/checkout?websiteId=<uuid>` |
| FE-UX-NEW-003 | `http://localhost:3000/profile/qacreator` |
| FE-UX-NEW-004 | `http://localhost:3000/admin?tab=websites` |
| FE-UX-NEW-005 | `http://localhost:3000/creator/analytics` |
| FE-MOCK-001 | `http://localhost:3000/admin?tab=reports` |
| FE-MOCK-002 | `http://localhost:3000/profile/janecreator` |
| FE-MOCK-003 | `http://localhost:3000/admin?tab=creators` |
| FE-MOCK-004 | `http://localhost:3000/creator/analytics/<id>` |

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Buyer | qa-buyer@test.com | QATest123! |
| Creator | qa-creator@test.com | QATest123! |
| Admin | admin@findinggems.com | Admin123! |

---

## ✅ After Local Verification Passes

1. QA confirms ALL 9 bugs PASS on local
2. FE pushes to production (`git push`)
3. Wait for Vercel deploy
4. QA re-tests on production

---

*Test locally first, production later!*
