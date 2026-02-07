# 🎭 UI AUTOMATION TEST BRIEF
**Date:** 2026-02-06
**From:** Backend Agent
**To:** QA Agent
**Method:** Playwright MCP (browser automation, non-visual)
**Environment:** LOCAL

---

## ⚠️ PREREQUISITES

### 1. Start Both Servers

```bash
# Terminal 1: Backend
cd /Users/arkan/finding-gems/backend
npm run dev
# Wait for: 🚀 Server running on port 3001

# Terminal 2: Frontend
cd /Users/arkan/finding-gems
npm run dev
# Wait for: ▲ Next.js ready on http://localhost:3000
```

### 2. Verify Servers
```bash
curl -s http://localhost:3001/api/v1/health | jq
curl -s http://localhost:3000 -I | head -1
```

---

## 🎯 TEST SCOPE

### Priority 1: Auth Flows (Critical)
### Priority 2: Discovery Flows
### Priority 3: Creator Flows  
### Priority 4: Admin Flows
### Priority 5: E2E User Journeys

---

## 📋 TEST CASES

### 🔐 AUTH FLOWS (AUTH-UI-001 to AUTH-UI-008)

#### AUTH-UI-001: Login Page Load
```
URL: http://localhost:3000/login
Expected:
- Page loads without errors
- Email input visible
- Password input visible  
- Login button visible
- "Forgot password" link visible
- "Register" link visible
```

#### AUTH-UI-002: Login Success
```
URL: http://localhost:3000/login
Actions:
1. Fill email: buyer@example.com
2. Fill password: NewPassword123!
3. Click login button
Expected:
- Redirect to dashboard or home
- User name visible in header/nav
- No error messages
```

#### AUTH-UI-003: Login Invalid Credentials
```
URL: http://localhost:3000/login
Actions:
1. Fill email: wrong@email.com
2. Fill password: wrongpassword
3. Click login button
Expected:
- Error message displayed
- Stay on login page
- Form not cleared
```

#### AUTH-UI-004: Register Page Load
```
URL: http://localhost:3000/register
Expected:
- Name input visible
- Email input visible
- Username input visible
- Password input visible
- Register button visible
```

#### AUTH-UI-005: Register Success
```
URL: http://localhost:3000/register
Actions:
1. Fill name: UI Test User
2. Fill email: uitest_[random]@example.com
3. Fill username: uitest[random]
4. Fill password: TestPass123!
5. Click register button
Expected:
- Success message or redirect
- Auto-login after register
```

#### AUTH-UI-006: Logout Flow
```
Precondition: Logged in
Actions:
1. Click user avatar/menu
2. Click logout
Expected:
- Redirect to home or login
- Login button visible
- User data cleared from header
```

#### AUTH-UI-007: Forgot Password Page
```
URL: http://localhost:3000/forgot-password
Expected:
- Email input visible
- Submit button visible
Actions:
1. Fill email: buyer@example.com
2. Click submit
Expected:
- Success message displayed
```

#### AUTH-UI-008: Session Persistence
```
Actions:
1. Login successfully
2. Refresh page (F5)
Expected:
- User still logged in
- User name still visible
```

---

### 🔍 DISCOVERY FLOWS (DISC-UI-001 to DISC-UI-008)

#### DISC-UI-001: Homepage Load
```
URL: http://localhost:3000
Expected:
- Hero section visible
- Featured websites visible
- Categories visible
- Search bar visible
- Navigation visible
```

#### DISC-UI-002: Explore Page
```
URL: http://localhost:3000/explore
Expected:
- Website grid visible
- Filter sidebar visible
- Pagination visible
- At least 1 website card visible
```

#### DISC-UI-003: Search Functionality
```
URL: http://localhost:3000/explore
Actions:
1. Type "Analytics" in search
2. Press Enter or click search
Expected:
- Results filtered
- Websites matching "Analytics" shown
```

#### DISC-UI-004: Category Filter
```
URL: http://localhost:3000/explore
Actions:
1. Click "AI Tools" category filter
Expected:
- Only AI Tools websites shown
- Category filter highlighted
```

#### DISC-UI-005: Sort Functionality
```
URL: http://localhost:3000/explore
Actions:
1. Select "Newest" from sort dropdown
Expected:
- Websites reordered by date
```

#### DISC-UI-006: Website Detail Page
```
URL: http://localhost:3000/websites/[slug]
(Use: http://localhost:3000/websites/teamsync-board)
Expected:
- Website name visible
- Description visible
- Screenshots visible
- Creator info visible
- Reviews section visible
- Pricing/Purchase section visible
```

#### DISC-UI-007: Pagination
```
URL: http://localhost:3000/explore
Actions:
1. Scroll to bottom
2. Click page 2
Expected:
- Different websites shown
- Page indicator updates
```

#### DISC-UI-008: Category Page
```
URL: http://localhost:3000/category/ai-tools
Expected:
- Category name visible
- Only AI Tools websites shown
```

---

### 👨‍💼 CREATOR FLOWS (CRE-UI-001 to CRE-UI-006)

#### CRE-UI-001: Creator Dashboard
```
Precondition: Login as creator@example.com / CreatorPassword123!
URL: http://localhost:3000/dashboard
Expected:
- Dashboard stats visible
- My websites section visible
- Earnings widget visible
```

#### CRE-UI-002: My Websites List
```
URL: http://localhost:3000/dashboard/my-websites
Expected:
- List of creator's websites
- Edit/Delete buttons per website
- Create new button visible
```

#### CRE-UI-003: Create Website Form
```
URL: http://localhost:3000/dashboard/websites/new
Expected:
- Name input visible
- Description input visible
- Category dropdown visible
- Thumbnail upload visible
- Submit button visible
```

#### CRE-UI-004: Edit Website
```
URL: http://localhost:3000/dashboard/websites/[id]/edit
Actions:
1. Change name
2. Click save
Expected:
- Success message
- Changes saved
```

#### CRE-UI-005: Creator Stats
```
URL: http://localhost:3000/dashboard/stats
Expected:
- Total views visible
- Total websites count
- Total reviews count
- Earnings summary
```

#### CRE-UI-006: Payout Section
```
URL: http://localhost:3000/dashboard/payouts
Expected:
- Balance visible
- Payout history visible
- Bank accounts section
- Request payout button
```

---

### 🔧 ADMIN FLOWS (ADM-UI-001 to ADM-UI-006)

#### ADM-UI-001: Admin Dashboard
```
Precondition: Login as admin@findinggems.com / Admin123!
URL: http://localhost:3000/admin
Expected:
- Overview stats visible
- Recent activity visible
- Quick actions visible
```

#### ADM-UI-002: Pending Websites
```
URL: http://localhost:3000/admin/websites/pending
Expected:
- List of pending websites
- Approve/Reject buttons
```

#### ADM-UI-003: Moderate Website
```
Actions:
1. Go to pending websites
2. Click approve on first website
Expected:
- Website approved
- Removed from pending list
```

#### ADM-UI-004: Creator Applications
```
URL: http://localhost:3000/admin/creator-applications
Expected:
- List of applications
- User info visible
- Approve/Reject buttons
```

#### ADM-UI-005: User Management
```
URL: http://localhost:3000/admin/users
Expected:
- User list visible
- Role column visible
- Edit buttons visible
```

#### ADM-UI-006: Analytics Dashboard
```
URL: http://localhost:3000/admin/analytics
Expected:
- Payment analytics chart
- User analytics chart
- Top performers list
```

---

### 🔄 E2E FLOWS (E2E-UI-001 to E2E-UI-003)

#### E2E-UI-001: Complete Browse-to-Bookmark Flow
```
Actions:
1. Visit homepage
2. Click explore
3. Search for "Analytics"
4. Click first result
5. Click bookmark button
6. Go to bookmarks page
Expected:
- Website appears in bookmarks
```

#### E2E-UI-002: Creator Registration to Website Create
```
Actions:
1. Register new user
2. Go to dashboard
3. Apply as creator (if needed)
4. Create new website
5. Verify in my-websites list
Expected:
- Website created and listed
```

#### E2E-UI-003: Admin Review Workflow
```
Precondition: Admin login
Actions:
1. Go to pending websites
2. Review first pending website
3. Approve it
4. Verify removed from pending
5. Verify appears in active websites
Expected:
- Website status changes to active
```

---

## 🎭 PLAYWRIGHT MCP COMMANDS

### Start Browser
```
Action: start
Browser: chrome (or webkit for Safari-like)
Headless: false (for debugging) or true (for CI)
```

### Navigate
```
Action: navigate
URL: http://localhost:3000/login
```

### Click Element
```
Action: click
Element: "Login button" or selector like "#login-btn"
```

### Type Text
```
Action: type
Element: "Email input" or selector like "input[name=email]"
Text: buyer@example.com
```

### Take Screenshot
```
Action: screenshot
FullPage: true
```

### Get Console Messages
```
Action: console_messages
ErrorsOnly: false
```

---

## 🔑 TEST CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@example.com | NewPassword123! |
| Creator | creator@example.com | CreatorPassword123! |
| Admin | admin@findinggems.com | Admin123! |

---

## ✅ SUCCESS CRITERIA

### Per Test Case:
1. No JavaScript console errors (red)
2. Expected elements visible
3. Expected actions work
4. No broken UI layouts

### Overall:
- All Priority 1 (Auth) tests PASS
- All Priority 2 (Discovery) tests PASS
- At least 80% overall pass rate

---

## 📊 REPORTING FORMAT

After each test, report:
```
| Test ID | Status | Screenshot | Notes |
|---------|--------|------------|-------|
| AUTH-UI-001 | PASS/FAIL | Yes/No | Details |
```

---

## 🚨 IMPORTANT NOTES

1. **Local Testing** - All tests run on localhost, no deployment needed
2. **Random Data** - Use random suffixes for new registrations to avoid conflicts
3. **Screenshots** - Take screenshots for any FAIL results
4. **Console Errors** - Check browser console for JavaScript errors
5. **Mobile Responsive** - Optional: resize browser to test mobile views

---

**QA Agent: Please start with AUTH flows first, then proceed in priority order.**
