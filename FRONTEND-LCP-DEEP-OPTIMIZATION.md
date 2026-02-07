# 📋 Frontend LCP Deep Optimization Brief

**Date:** 2026-02-08 00:55 WIB  
**From:** Backend Agent  
**To:** Frontend Team  
**Priority:** HIGH  
**Goal:** Achieve LCP < 2.5s (currently 3.8-4.5s)

---

## 📊 Current Status

| Page | Current | Target | Gap |
|------|---------|--------|-----|
| Homepage | 4,537ms | 2,500ms | -2s needed |
| Search | 3,850ms | 2,500ms | -1.4s needed |
| Detail | 4,394ms | 2,500ms | -1.9s needed |

---

## 🎯 Best Practice Checklist (2024)

### 1. ✅ Image Optimization with `next/image` (CRITICAL)

**Check if already done:**
```tsx
// ❌ BAD - No priority, no dimensions
<Image src="/hero.png" alt="Hero" />

// ✅ GOOD - LCP image with priority
<Image 
  src="/hero.png" 
  alt="Hero"
  width={1200}
  height={600}
  priority           // Preload LCP image
  placeholder="blur" // Show blur while loading
  quality={75}       // Reduce file size
/>
```

**Action:** Check `app/page.tsx` hero image - ensure `priority` is set.

---

### 2. 🔥 Font Optimization with `next/font` (HIGH IMPACT)

**Current issue check:** Are you loading fonts via CSS `@import` or `<link>`?

```tsx
// ❌ BAD - External font request delays LCP
@import url('https://fonts.googleapis.com/css2?family=Inter');

// ✅ GOOD - Use next/font (self-hosted, no network request)
// In app/layout.tsx:
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',  // Prevents FOIT
  preload: true
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      ...
    </html>
  );
}
```

**Action:** Check `app/layout.tsx` and `globals.css` for font loading method.

---

### 3. 🔥 Script Optimization with `next/script`

**Check for heavy 3rd party scripts:**
```tsx
// ❌ BAD - Blocks rendering
<script src="https://analytics.example.com/script.js" />

// ✅ GOOD - Load after hydration
import Script from 'next/script';

<Script 
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"  // or "lazyOnload"
/>
```

**Action:** Audit all `<script>` tags in layout and pages.

---

### 4. ✅ Preload Critical Assets

Add to `app/layout.tsx` head:
```tsx
<head>
  {/* Preload hero image */}
  <link 
    rel="preload" 
    href="/bg-hero.png" 
    as="image"
    fetchPriority="high"
  />
  
  {/* Preconnect to API */}
  <link rel="preconnect" href="https://api.example.com" />
  <link rel="dns-prefetch" href="https://api.example.com" />
  
  {/* Preload critical font */}
  <link 
    rel="preload" 
    href="/fonts/inter.woff2" 
    as="font" 
    type="font/woff2" 
    crossOrigin="anonymous"
  />
</head>
```

---

### 5. 🔥 Optimize CSS (HIGH IMPACT)

**Remove unused CSS:**
```bash
# Install PurgeCSS or use Next.js built-in
npm install -D @fullhuman/postcss-purgecss
```

**Inline critical CSS:**
```tsx
// In next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,  // Enable CSS optimization
  },
};
```

---

### 6. ✅ Reduce JavaScript Bundle

**Check bundle size:**
```bash
npm run build
# Look for large chunks in output

# Analyze bundle
npx @next/bundle-analyzer
```

**Heavy libraries to check:**
- Framer Motion (~40KB) - Replace with CSS
- Moment.js (~70KB) - Replace with date-fns
- Lodash (~70KB) - Import specific functions only

```tsx
// ❌ BAD
import _ from 'lodash';

// ✅ GOOD
import debounce from 'lodash/debounce';
```

---

### 7. 🔥 Server Response Time

**Use SSG/ISR where possible:**
```tsx
// For static pages (fastest)
export const dynamic = 'force-static';

// For ISR (revalidate every hour)
export const revalidate = 3600;

// Avoid if not needed
export const dynamic = 'force-dynamic';
```

---

### 8. 🔥 Identify LCP Element

**Run this in Chrome DevTools:**
```javascript
// Find what element is the LCP
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP element:', entry.element);
    console.log('LCP time:', entry.startTime);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

**Common LCP culprits:**
1. Hero image (most common)
2. Large text block with web font
3. Background image in CSS
4. Video poster frame

---

## 📋 Diagnostic Checklist

Run through this checklist:

| # | Check | Status |
|---|-------|--------|
| 1 | Hero image has `priority` prop? | ⬜ |
| 2 | Using `next/font` instead of CSS font import? | ⬜ |
| 3 | All 3rd party scripts use `next/script`? | ⬜ |
| 4 | No blocking CSS in `<head>`? | ⬜ |
| 5 | Critical assets preloaded? | ⬜ |
| 6 | No large libraries imported fully? | ⬜ |
| 7 | Images in WebP format? | ⬜ |
| 8 | API preconnect set up? | ⬜ |

---

## 🎯 Quick Wins (Do These First)

1. **Check font loading** - If using CSS @import for fonts, switch to next/font
2. **Verify hero image priority** - Must have `priority` prop
3. **Remove unused dependencies** - Check for heavy libraries
4. **Enable CSS optimization** - Add `optimizeCss: true` to next.config

---

## 📊 Expected Results

If all optimizations applied correctly:

| Page | Current | Expected | Target |
|------|---------|----------|--------|
| Homepage | 4.5s | **1.5-2.0s** | <2.5s ✅ |
| Search | 3.9s | **1.8-2.2s** | <2.5s ✅ |
| Detail | 4.4s | **1.6-2.1s** | <2.5s ✅ |

---

## 🔍 Debug Commands

```bash
# 1. Analyze bundle
ANALYZE=true npm run build

# 2. Check what's slow
npx lighthouse http://localhost:3000 --view

# 3. Find LCP element in Lighthouse JSON
cat lighthouse-home-final.json | jq '.audits."largest-contentful-paint-element"'
```

---

**After implementing, rebuild and QA will retest!**
