# 📋 QA Performance Retest Brief (UPDATED)

**Date:** 2026-02-07 22:26 WIB  
**Updated By:** Backend Agent  
**Status:** 🔄 Retest with correct URLs + Production Build

---

## ⚠️ Issues from First Test

| Issue | Fix |
|-------|-----|
| Wrong URL `/explore` | Use `/search` |
| Wrong URL `/websites/:slug` | Use `/website/:slug` |
| Dev mode slow | Test with production build |
| Admin redirect | Need authenticated session |

---

## 🔧 Recommended: Test Production Build

Dev mode is **significantly slower** than production. For accurate results:

```bash
# 1. Build production
cd /Users/arkan/finding-gems
npm run build

# 2. Start production server
npm start

# 3. Run Lighthouse tests (default port 3000)
```

---

## 📝 Corrected Test Commands

### PERF-015: Homepage LCP
```bash
npx lighthouse http://localhost:3000 \
  --output=json \
  --output-path=./lighthouse-home-prod.json \
  --only-categories=performance \
  --chrome-flags="--headless"

cat lighthouse-home-prod.json | jq '.audits."largest-contentful-paint".numericValue'
# Target: < 2500ms
```

### PERF-017: Homepage CLS ✅ PASSED
```bash
# Already passed: 0.00799 < 0.1
```

### PERF-018: Explore/Search LCP (CORRECTED URL)
```bash
npx lighthouse http://localhost:3000/search \
  --output=json \
  --output-path=./lighthouse-search-prod.json \
  --only-categories=performance \
  --chrome-flags="--headless"

cat lighthouse-search-prod.json | jq '.audits."largest-contentful-paint".numericValue'
# Target: < 2500ms
```

### PERF-019: Website Detail LCP (CORRECTED URL)
```bash
# Get a valid website slug first
# Example: /website/canva-design-tool or similar

npx lighthouse "http://localhost:3000/website/canva-design-tool" \
  --output=json \
  --output-path=./lighthouse-detail-prod.json \
  --only-categories=performance \
  --chrome-flags="--headless"

cat lighthouse-detail-prod.json | jq '.audits."largest-contentful-paint".numericValue'
# Target: < 2500ms
```

### PERF-020: Admin TTI
```bash
# Option 1: Test login page (public)
npx lighthouse http://localhost:3000/login \
  --output=json \
  --output-path=./lighthouse-login-prod.json \
  --only-categories=performance \
  --chrome-flags="--headless"

# Option 2: Skip admin test - requires authenticated session
# Mark as BLOCKED/MANUAL
```

---

## 📊 Results Template (Updated)

```markdown
## Performance Retest Results - Production Build

| Test | Page | Target | Dev Mode | Prod Build | Status |
|------|------|--------|----------|------------|--------|
| PERF-015 | Homepage | <2,500ms | 10,279ms | ___ms | ⬜ |
| PERF-016 | Homepage (FID) | <100ms | N/A | N/A | ⚠️ BLOCKED |
| PERF-017 | Homepage (CLS) | <0.1 | 0.00799 | - | ✅ PASS |
| PERF-018 | /search | <2,500ms | 404 | ___ms | ⬜ |
| PERF-019 | /website/:slug | <2,500ms | 404 | ___ms | ⬜ |
| PERF-020 | Admin TTI | <3,000ms | 9,284ms | ___ms | ⬜ |
```

---

## 💡 Notes

1. **FID (PERF-016)** - Lighthouse doesn't measure FID, it uses "Max Potential FID" or "Total Blocking Time" as proxy. Mark as BLOCKED.

2. **Admin (PERF-020)** - Requires login. Options:
   - Skip (mark BLOCKED)
   - Manual test via Chrome DevTools
   - Use Lighthouse with `--extra-headers` for auth token

3. **Production build** should show **50-70% improvement** over dev mode.

---

## 🎯 Decision Points

If production build still fails LCP/TTI targets:

**Frontend needs additional work:**
- Optimize images further (WebP, AVIF)
- Implement skeleton loading
- Server-side rendering for critical content
- Reduce JavaScript bundle size
- Use `next/dynamic` for more components

---

**Rerun with production build and correct URLs!**
