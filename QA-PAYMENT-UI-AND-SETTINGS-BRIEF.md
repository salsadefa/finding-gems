# QA Brief: Custom Payment UI & Creator Settings

**Date:** 2026-02-08  
**Owner:** QA Team  
**Priority:** High  
**Scope:** Functional Testing + UI/UX Design Review

---

## 📋 Overview

FE telah mengimplementasikan 2 fitur baru:
1. **Custom Payment UI** - QRIS QR Code display & Virtual Account display (tidak redirect ke Xendit)
2. **Creator Settings Page** - Halaman pengaturan untuk creator

Brief ini mencakup **testing fungsional** DAN **review desain UI/UX**.

---

## 🎯 Part 1: Custom Payment UI Testing

### 1.1 QRIS Payment Flow

**Endpoint:** `POST /api/v1/payments/qris`

#### Functional Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PAY-QRIS-001 | QRIS payment initiation | 1. Login as buyer<br>2. Go to checkout<br>3. Select QRIS payment<br>4. Submit | QR code displayed, not redirect to Xendit |
| PAY-QRIS-002 | QR code scannability | 1. Complete PAY-QRIS-001<br>2. Scan QR with banking app | QR code is scannable and shows correct amount |
| PAY-QRIS-003 | Payment details display | View QRIS payment page | Shows: Amount, Order ID, Expiry countdown |
| PAY-QRIS-004 | Expiry countdown | Wait/observe timer | Timer counts down, shows warning at < 5 mins |
| PAY-QRIS-005 | Payment status polling | After payment success | Status updates automatically without refresh |
| PAY-QRIS-006 | Expired handling | Let payment expire (15 mins) | Shows expired message, option to retry |

#### UI/UX Design Review - QRIS

| ID | Criteria | Check Points |
|----|----------|--------------|
| QRIS-UX-001 | **QR Code Size** | Minimum 200x200px, easily scannable on mobile |
| QRIS-UX-002 | **QR Code Contrast** | High contrast (dark on light background) |
| QRIS-UX-003 | **Amount Display** | Large, clear amount with "Rp" prefix, proper thousand separators |
| QRIS-UX-004 | **Instructions Clarity** | Clear step-by-step instructions (1. Open app, 2. Scan, 3. Confirm) |
| QRIS-UX-005 | **Expiry Timer** | Visible countdown, changes color when < 5 mins |
| QRIS-UX-006 | **Loading States** | Skeleton/spinner while QR loading |
| QRIS-UX-007 | **Mobile Responsiveness** | QR centered, all info visible on mobile |
| QRIS-UX-008 | **QRIS Logo** | Official QRIS logo visible for trust |
| QRIS-UX-009 | **Copy Feature** | Option to copy order ID / reference |
| QRIS-UX-010 | **Back/Cancel** | Clear way to cancel/go back |

---

### 1.2 Virtual Account Payment Flow

**Endpoint:** `POST /api/v1/payments/virtual-account`

#### Functional Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PAY-VA-001 | VA bank selection | Go to checkout, select VA | List of banks displayed (BCA, BNI, BRI, Mandiri, etc.) |
| PAY-VA-002 | VA creation | Select bank, submit | VA number displayed, not redirect to Xendit |
| PAY-VA-003 | VA number display | View VA payment page | Shows: Bank name, VA number, Amount, Expiry |
| PAY-VA-004 | Copy VA number | Click copy button | VA number copied to clipboard, toast confirmation |
| PAY-VA-005 | Bank instructions | View payment page | Shows bank-specific transfer instructions |
| PAY-VA-006 | Different banks | Test BCA, BNI, BRI, Mandiri | All banks work correctly |
| PAY-VA-007 | Expiry countdown | Observe timer (24h default) | Timer displays correctly, updates |
| PAY-VA-008 | Payment status polling | After actual transfer | Status updates to PAID |
| PAY-VA-009 | Expired handling | Let VA expire | Shows expired message, option to create new |

#### Supported Banks to Test

| Bank Code | Bank Name | Priority |
|-----------|-----------|----------|
| BCA | Bank Central Asia | 🔴 HIGH |
| BNI | Bank Negara Indonesia | 🔴 HIGH |
| BRI | Bank Rakyat Indonesia | 🔴 HIGH |
| MANDIRI | Bank Mandiri | 🔴 HIGH |
| PERMATA | Bank Permata | 🟡 MED |
| BSI | Bank Syariah Indonesia | 🟡 MED |
| BJB | Bank BJB | 🟢 LOW |
| SAHABAT_SAMPOERNA | Sahabat Sampoerna | 🟢 LOW |
| CIMB | Bank CIMB Niaga | 🟢 LOW |

#### UI/UX Design Review - Virtual Account

| ID | Criteria | Check Points |
|----|----------|--------------|
| VA-UX-001 | **Bank Selection UI** | Clear bank logos, names visible, easy to select |
| VA-UX-002 | **Bank Logo Quality** | High-res logos, proper sizing |
| VA-UX-003 | **VA Number Display** | Large font, monospace/easy to read, proper spacing (groups of 4) |
| VA-UX-004 | **Copy Button** | Prominent copy button next to VA number |
| VA-UX-005 | **Copy Feedback** | Visual feedback when copied (toast/animation) |
| VA-UX-006 | **Amount Display** | Clear "Total Pembayaran" with exact amount |
| VA-UX-007 | **Customer Name** | Shows "Atas Nama" untuk verifikasi transfer |
| VA-UX-008 | **Expiry Display** | Clear expiry date/time, countdown if < 24h |
| VA-UX-009 | **Instructions** | Bank-specific transfer instructions (ATM, Mobile, Internet Banking) |
| VA-UX-010 | **Collapsible Instructions** | Instructions grouped by method (ATM/Mobile/IB) |
| VA-UX-011 | **Mobile Responsiveness** | All info readable on mobile, copy works on mobile |
| VA-UX-012 | **Loading States** | Proper loading while VA being created |
| VA-UX-013 | **Error Handling** | Clear error message if VA creation fails |

---

### 1.3 Payment Method Selection

#### UI/UX Design Review - Payment Selection

| ID | Criteria | Check Points |
|----|----------|--------------|
| SEL-UX-001 | **Method Options** | Clear icons for each method (QRIS, VA, E-wallet, Card) |
| SEL-UX-002 | **Method Descriptions** | Brief description of each method |
| SEL-UX-003 | **Recommended Tag** | "Recommended" badge on popular method |
| SEL-UX-004 | **Selection State** | Clear visual for selected method |
| SEL-UX-005 | **Mobile Layout** | Methods stack nicely on mobile |
| SEL-UX-006 | **Proceed Button** | Clear CTA after selection |

---

## 🎯 Part 2: Creator Settings Page Testing

**Path:** `/creator/settings`

### 2.1 Functional Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SET-001 | Access settings | Login as creator, go to /creator/settings | Settings page loads |
| SET-002 | View current profile | Observe page | Shows current bio, expertise, links, etc. |
| SET-003 | Edit bio | Change bio text, save | Bio updated successfully |
| SET-004 | Edit expertise | Add/remove expertise tags | Changes saved |
| SET-005 | Edit professional background | Update text, save | Changes saved |
| SET-006 | Edit portfolio URL | Enter valid URL, save | URL saved |
| SET-007 | Edit social links | Add Twitter/Instagram/etc | Links saved |
| SET-008 | Upload avatar | Upload new image | Avatar updated |
| SET-009 | Form validation | Submit with invalid data | Shows validation errors |
| SET-010 | Save confirmation | After successful save | Toast/message confirms save |
| SET-011 | Discard changes | Make changes, navigate away | Prompts to save or discard |
| SET-012 | Access control | Try access as non-creator | Redirected or 403 |

### 2.2 UI/UX Design Review - Creator Settings

| ID | Criteria | Check Points |
|----|----------|--------------|
| SET-UX-001 | **Page Layout** | Clean, organized sections |
| SET-UX-002 | **Section Headers** | Clear labels for each section (Profile, Social, etc.) |
| SET-UX-003 | **Form Fields** | Proper labels, placeholders, helper text |
| SET-UX-004 | **Input States** | Focus, error, disabled states clear |
| SET-UX-005 | **Error Messages** | Inline errors near relevant fields |
| SET-UX-006 | **Save Button** | Prominent, sticky if long form |
| SET-UX-007 | **Loading States** | Spinner on save, disabled button |
| SET-UX-008 | **Success Feedback** | Clear confirmation after save |
| SET-UX-009 | **Avatar Preview** | Shows current avatar, preview on change |
| SET-UX-010 | **Avatar Upload** | Drag-drop or click to upload |
| SET-UX-011 | **Expertise Tags** | Easy to add/remove, typeahead if available |
| SET-UX-012 | **URL Validation** | Real-time validation for URLs |
| SET-UX-013 | **Character Counts** | Shows remaining chars for limited fields |
| SET-UX-014 | **Mobile Responsiveness** | Form usable on mobile |
| SET-UX-015 | **Consistency** | Matches overall app design system |

---

## 🎨 Part 3: General UI/UX Checklist

Apply to ALL new pages/components:

### Accessibility

| ID | Criteria | Check Points |
|----|----------|--------------|
| A11Y-001 | **Color Contrast** | Text meets WCAG AA (4.5:1 for normal, 3:1 for large) |
| A11Y-002 | **Focus States** | Visible focus ring on interactive elements |
| A11Y-003 | **Keyboard Nav** | All actions possible with keyboard |
| A11Y-004 | **Labels** | All inputs have associated labels |
| A11Y-005 | **Alt Text** | Images have descriptive alt text |

### Responsiveness

| ID | Device | Check Points |
|----|--------|--------------|
| RESP-001 | Mobile (375px) | No horizontal scroll, readable text |
| RESP-002 | Tablet (768px) | Layout adapts properly |
| RESP-003 | Desktop (1440px) | Centered content, max-width respected |

### Performance

| ID | Criteria | Target |
|----|----------|--------|
| PERF-001 | Page Load | < 3s on 3G |
| PERF-002 | Interaction Delay | < 100ms response |
| PERF-003 | Image Loading | Progressive/lazy loading |

---

## 📝 Bug Report Template

```markdown
## Bug Report

**ID:** [PAY-XXX / SET-XXX]
**Severity:** 🔴 Blocker / 🟠 Critical / 🟡 Major / 🟢 Minor
**Type:** Functional / UI/UX / Performance

### Environment
- Browser: 
- Device: 
- Screen Size:
- URL: 

### Steps to Reproduce
1. 
2. 
3. 

### Expected Result


### Actual Result


### Screenshot/Video
[Attach]

### Notes

```

---

## ✅ Sign-off Checklist

### Payment UI

| Component | Functional | UI/UX | Signed by | Date |
|-----------|------------|-------|-----------|------|
| QRIS Payment | ⬜ | ⬜ | | |
| VA Payment | ⬜ | ⬜ | | |
| Bank Selection | ⬜ | ⬜ | | |
| Payment Status | ⬜ | ⬜ | | |

### Creator Settings

| Component | Functional | UI/UX | Signed by | Date |
|-----------|------------|-------|-----------|------|
| Profile Edit | ⬜ | ⬜ | | |
| Social Links | ⬜ | ⬜ | | |
| Avatar Upload | ⬜ | ⬜ | | |
| Form Validation | ⬜ | ⬜ | | |

### General

| Criteria | Status | Notes |
|----------|--------|-------|
| Accessibility | ⬜ | |
| Mobile Responsiveness | ⬜ | |
| Performance | ⬜ | |
| Design Consistency | ⬜ | |

---

## 🔧 Test Data / Credentials

**Test Accounts:**
- Buyer: `qa-buyer@test.com` / `QATest123!`
- Creator: `qa-creator@test.com` / `QATest123!`
- Admin: `admin@findinggems.com` / `Admin123!`

**Test URLs (Local):**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

**Test URLs (Production):**
- Frontend: `https://finding-gems.vercel.app`
- Backend: `https://finding-gems-backend.onrender.com`

---

## 📱 How to Test Payment (Real Flow)

### QRIS Testing
1. Login as buyer
2. Find website with pricing tier
3. Initiate checkout, select QRIS
4. Verify QR displays correctly
5. **(Optional real test)** Scan with mobile banking app

### VA Testing  
1. Login as buyer
2. Find website with pricing tier
3. Initiate checkout, select Virtual Account
4. Select bank (BCA/BNI/BRI/Mandiri)
5. Verify VA number displays correctly
6. Verify copy functionality works
7. **(Optional real test)** Transfer to VA number

**Note:** For real payment testing, coordinate with product team for test budget.

---

## 🚀 After Testing

1. Update sign-off checklist above
2. File any bugs found using bug report template
3. Report critical blockers immediately
4. Submit final QA report to team

---

## 🎯 Part 4: Admin Dashboard Tabs Testing

### 4.1 Admin Reports Tab (`/admin?tab=reports`)

**Path:** `/admin?tab=reports`  
**Status:** ✅ Uses real API (not mock data)

#### Functional Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| REP-001 | Load reports | Login as admin, go to /admin?tab=reports | Reports list loads from API |
| REP-002 | Filter by status | Click Pending/Resolved/Dismissed | List filters correctly |
| REP-003 | View report details | Click "Review" on a report | Modal shows report details |
| REP-004 | Resolve report | Open report, add note, click "Resolve" | Report status updated, removed from pending |
| REP-005 | Dismiss report | Open report, add note, click "Dismiss" | Report status updated |
| REP-006 | Pagination | Navigate pages if >10 reports | Pagination works correctly |
| REP-007 | Empty state | Filter with no results | Shows "No reports found" message |

#### UI/UX Design Review - Reports Tab

| ID | Criteria | Check Points |
|----|----------|--------------|
| REP-UX-001 | **Table Layout** | Clean columns, proper alignment |
| REP-UX-002 | **Status Badges** | Clear color coding (yellow=pending, green=resolved, gray=dismissed) |
| REP-UX-003 | **Modal Design** | Clear structure, easy to read details |
| REP-UX-004 | **Action Buttons** | Prominent Resolve/Dismiss actions |
| REP-UX-005 | **Loading States** | Shows skeleton while loading |
| REP-UX-006 | **Review Guidelines** | Sidebar shows clear guidelines |
| REP-UX-007 | **Filter Buttons** | Active filter clearly highlighted |

---

### 4.2 Admin Finance Tab (`/admin?tab=finance`)

**Path:** `/admin?tab=finance`  
**Status:** ⚠️ **TAB DOES NOT EXIST!**

#### Investigation Result

| Item | Status | Notes |
|------|--------|-------|
| Navigation Link | ✅ Exists | In sidebar layout |
| Tab Component | ❌ **MISSING** | No `FinanceTab.tsx` in `/app/admin/tabs/` |
| Backend Endpoints | ⚠️ Partial | Payment analytics exist, but no dedicated finance endpoints |

#### Expected Features (for FE to implement)

The Finance tab should show:
- Revenue overview (total, this month, growth)
- Transaction history
- Payout management (pending/completed payouts to creators)
- Refund requests
- Payment method breakdown
- Commission/fee summary

#### Functional Tests (WHEN IMPLEMENTED)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| FIN-001 | Load finance tab | Shows finance dashboard |
| FIN-002 | Revenue overview | Shows total revenue, monthly breakdown |
| FIN-003 | Transaction list | Lists all transactions with filters |
| FIN-004 | Payout management | Shows pending payouts to creators |
| FIN-005 | Refund requests | Lists refund requests |
| FIN-006 | Export data | Can export to CSV/Excel |

**⚠️ BLOCKER:** This tab needs FE implementation first!

---

### 4.3 Admin Notification Bell (Top Bar)

**Location:** `/admin` top header bar  
**Status:** ⚠️ **NO FUNCTIONALITY - UI ONLY**

#### Investigation Result

| Item | Status | Notes |
|------|--------|-------|
| Bell Icon | ✅ Visible | Shows in header with red badge |
| Click Handler | ❌ **NONE** | Button does nothing when clicked |
| Notification Count | ❌ **STATIC** | Always shows red dot, not real count |
| Dropdown | ❌ **NONE** | No dropdown/modal opens |
| Backend API | ❌ **NONE** | No `/notifications` endpoints exist |
| WebSocket | ❌ **NONE** | No real-time notification system |

#### Expected Features (for future implementation)

| Feature | Description |
|---------|-------------|
| Click to open | Shows dropdown with recent notifications |
| Notification types | New creator application, new report, new refund request, system alerts |
| Badge count | Shows unread count, hidden when 0 |
| Mark as read | Can mark individual/all as read |
| Real-time | WebSocket for instant updates |

#### Functional Tests (WHEN IMPLEMENTED)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| NOTIF-001 | Click bell | Opens notification dropdown |
| NOTIF-002 | Unread count | Badge shows correct unread count |
| NOTIF-003 | View notification | Can read notification details |
| NOTIF-004 | Mark as read | Can mark as read, count decreases |
| NOTIF-005 | Real-time update | New notifications appear instantly |

**⚠️ NOTE:** Currently UI-only. Backend + FE implementation needed.

---

## 📋 Summary: Mock Data Status

| Feature | Mock Data? | API Status |
|---------|------------|------------|
| Admin Reports Tab | ❌ No mock | ✅ Uses real API |
| Admin Finance Tab | N/A | ⚠️ **Tab doesn't exist** |
| Notification Bell | N/A | ⚠️ **No functionality** |
| Admin Creators Tab | ❌ No mock | ✅ Uses real API |
| Admin Websites Tab | ❌ No mock | ✅ Uses real API |
| Admin Users Tab | ❌ No mock | ✅ Uses real API |
| Admin Settings Tab | TBD | Need to verify |

---

## 🔴 Blockers/Missing Features for FE

| Item | Type | Action Needed |
|------|------|---------------|
| `/admin?tab=finance` | Missing Tab | FE needs to create `FinanceTab.tsx` |
| Notification Bell | No Functionality | Backend + FE implementation needed |

---

*Last Updated: 2026-02-08 17:31 WIB*

