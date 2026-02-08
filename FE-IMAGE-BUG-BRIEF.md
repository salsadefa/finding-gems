# FE Bug Brief - Image Component Crash

**Date:** 2026-02-08 15:42
**Priority:** High
**Found by:** QA during profile page testing

---

## 🐛 Bug Description

**Issue:** Profile page crashes with "Something went wrong" when a website has empty or invalid thumbnail URL.

**Affected Page:** `/profile/testcreator`

**Error:** `Image src invalid` in browser console

---

## 🔍 Root Cause

Backend returns websites with:
```json
{
  "thumbnail": "",  // Empty string
  "thumbnail": "https://example.com/thumbnail.jpg"  // Invalid/non-existent URL
}
```

Next.js `<Image>` component crashes when:
- `src=""` (empty string)
- `src` points to non-existent image

---

## ✅ Fix Required

Add fallback/validation for thumbnail in website card components:

```tsx
// Option 1: Fallback image
const thumbnailSrc = website.thumbnail && website.thumbnail.trim() !== '' 
  ? website.thumbnail 
  : '/images/placeholder-website.png';

// Option 2: Conditional rendering
{website.thumbnail ? (
  <Image src={website.thumbnail} alt={website.name} ... />
) : (
  <div className="placeholder-thumbnail">No Image</div>
)}

// Option 3: onError handler
<Image 
  src={website.thumbnail || '/images/placeholder.png'} 
  alt={website.name}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholder.png';
  }}
  ...
/>
```

---

## 📍 Files to Check

Look for website card/list components that render thumbnails:

1. `/app/profile/[username]/page.tsx` - Profile page website list
2. `/components/WebsiteCard.tsx` - Reusable website card
3. `/app/search/page.tsx` - Search results
4. `/app/creator/websites/page.tsx` - Creator's website list

---

## 🧪 Test Cases

After fix, verify:

| Test | Expected |
|------|----------|
| `/profile/testcreator` | Page loads without crash |
| Website with `thumbnail: ""` | Shows placeholder image |
| Website with invalid URL | Shows placeholder on error |
| Website with valid thumbnail | Shows actual image |

---

## 📊 Backend Data Sample

```json
// testcreator's websites with problematic thumbnails
{
  "websites": [
    {
      "name": "QA Test Website 1770457564",
      "thumbnail": "",  // ⚠️ EMPTY
    },
    {
      "name": "Updated Test Website", 
      "thumbnail": "https://example.com/thumbnail.jpg"  // ⚠️ INVALID
    }
  ]
}
```

---

## ⏱️ Estimated Effort

**Simple fix:** 15-30 minutes

Add fallback image handling to affected components.

---

*Fix this to complete FE-UX-NEW-003 verification!*
