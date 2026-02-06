# Frontend Admin Dashboard Integration Brief

> **PENTING:** Frontend team fokus HANYA pada integrasi dan UI/UX improvement. **JANGAN SENTUH BACKEND!**

---

## 📋 Overview

Admin Dashboard saat ini menggunakan **mock data**. Semua backend API sudah siap dan perlu diintegrasikan ke frontend.

**Base URL:** `https://finding-gems-backend.onrender.com/api/v1`

**Authentication:** Semua endpoint admin membutuhkan:
- Header: `Authorization: Bearer <token>`
- User harus punya role `admin`

---

## 🔴 Components yang Perlu Diintegrasikan

### 1. Dashboard Overview Stats
**File:** `app/admin/page.tsx`

**Ganti mock data `mockPlatformStats` dengan:**

```typescript
// Fetch dashboard overview
const response = await fetch(`${API_URL}/admin/dashboard`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { data } = await response.json();

// Response structure:
{
  overview: {
    totalUsers: number,
    totalCreators: number,
    totalWebsites: number,
    totalOrders: number,
    totalRevenue: number,
    platformFees: number,
    pendingWebsites: number,
    pendingApplications: number,
    pendingReports: number
  },
  revenueByMonth: [...],
  recentOrders: [...]
}
```

---

### 2. Analytics Charts
**Endpoints tersedia:**

```typescript
// Payment Analytics (untuk revenue chart)
GET /admin/analytics/payments?period=30d
// Response: { dailyRevenue: [...], paymentMethods: {...}, conversionRate: number }

// User Analytics (untuk user growth chart)  
GET /admin/analytics/users?period=30d
// Response: { userGrowth: [...], roleDistribution: {...} }

// Top Performers (top websites & creators)
GET /admin/analytics/top?limit=5
// Response: { topWebsites: [...], topCreators: [...] }
```

---

### 3. Websites Tab
**Ganti `mockWebsites` dengan:**

```typescript
// Get all websites (admin view)
GET /admin/websites?page=1&limit=20&status=active&search=keyword

// Response:
{
  websites: [
    {
      id, name, slug, description, price, status,
      category: { id, name, slug },
      creator: { id, name, email, avatar },
      createdAt, updatedAt
    }
  ],
  pagination: { page, limit, total, totalPages, hasNext, hasPrev }
}

// Get pending websites for moderation
GET /admin/websites/pending

// Approve/Reject website
PATCH /admin/websites/:id/moderate
Body: { status: 'active' | 'rejected', reason?: string }
```

---

### 4. Users/Creators Tab
**Ganti `mockUsers` dan `mockCreatorProfiles` dengan:**

```typescript
// Get all users
GET /admin/users?page=1&limit=20&role=creator&search=keyword

// Response:
{
  users: [
    {
      id, name, username, email, role, avatar, 
      isEmailVerified, createdAt, updatedAt,
      _count: { websites, orders }
    }
  ],
  pagination: {...}
}

// Update user (role, status)
PATCH /admin/users/:id
Body: { role?: 'user' | 'creator' | 'admin', isActive?: boolean }
```

---

### 5. Creator Applications Tab ⭐ NEW
**Ganti `mockCreatorApplications` dengan:**

```typescript
// Get all applications
GET /admin/creator-applications?page=1&limit=20&status=pending

// Response:
{
  applications: [
    {
      id, userId, bio, professionalBackground, 
      expertise: string[], portfolioUrl, motivation,
      status: 'pending' | 'approved' | 'rejected',
      createdAt, reviewedAt, reviewedBy, rejectionReason,
      user: { id, name, username, email, avatar, role, createdAt }
    }
  ],
  pagination: {...}
}

// Get single application details
GET /admin/creator-applications/:id

// Approve/Reject application
PATCH /admin/creator-applications/:id
Body: { status: 'approved' | 'rejected', rejectionReason?: string }
// Note: rejectionReason WAJIB kalau status = 'rejected'

// Get statistics
GET /admin/creator-applications/stats
// Response: { total, pending, approved, rejected }
```

---

### 6. Categories Management Tab ⚠️ MOCK DATA
**File:** `app/admin/categories/page.tsx`

**Ganti `mockCategories` dengan:**

```typescript
// Get all categories (public - no auth required)
GET /categories

// Response:
{
  categories: [
    { id, name, slug, description, icon, color, isActive, createdAt }
  ]
}

// Create category (admin only)
POST /categories
Body: { name: string, slug: string, description?: string, icon?: string, color?: string }
Headers: { Authorization: 'Bearer <token>' }

// Update category (admin only)  
PATCH /categories/:id
Body: { name?, slug?, description?, icon?, color?, isActive? }
Headers: { Authorization: 'Bearer <token>' }

// Delete category (admin only)
DELETE /categories/:id
Headers: { Authorization: 'Bearer <token>' }
```

**Note:** Endpoint categories bukan di `/admin/categories`, tapi langsung di `/categories`. Sudah ada auth middleware untuk POST/PATCH/DELETE.

---

### 7. Reports/Moderation Tab
**Ganti `mockReports` dengan:**

```typescript
// Get all reports
GET /admin/reports?page=1&limit=20&status=pending

// Response:
{
  reports: [
    {
      id, reason, description, status,
      reporter: { id, name, email },
      reportedWebsite: { id, name, slug },
      createdAt, resolvedAt, resolvedBy
    }
  ],
  pagination: {...}
}

// Handle report
PATCH /admin/reports/:id
Body: { status: 'resolved' | 'dismissed', adminNote?: string }
```

---

## 🎨 UI/UX Improvements (Opsional tapi Direkomendasikan)

Kalau ada waktu, improve juga:

### Priority 1 - Essential
- [ ] Loading states untuk semua data fetching
- [ ] Error handling dengan toast notifications
- [ ] Empty states yang informatif
- [ ] Pagination yang proper

### Priority 2 - Nice to Have  
- [ ] Search dengan debounce
- [ ] Filter dropdowns yang lebih user-friendly
- [ ] Confirmation modals untuk actions (approve/reject)
- [ ] Success/Error toast messages

### Priority 3 - Polish
- [ ] Skeleton loaders saat loading
- [ ] Smooth transitions antar tabs
- [ ] Responsive design untuk mobile admin
- [ ] Dark mode support (kalau belum ada)

---

## 📁 Files yang Perlu Dimodifikasi

```
app/admin/
├── page.tsx              # Main dashboard - UTAMA
├── categories/page.tsx   # Categories management
├── creators/page.tsx     # Creators list (kalau ada)
├── refunds/page.tsx      # Refund management
└── reports/page.tsx      # Reports (kalau terpisah)

lib/
└── api.ts atau services/ # API service functions
```

---

## 🔧 Recommended API Service Pattern

Buat helper function untuk admin API calls:

```typescript
// lib/admin-api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://finding-gems-backend.onrender.com/api/v1';

async function adminFetch(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('token'); // atau dari auth context
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
}

// Dashboard
export const getDashboardOverview = () => adminFetch('/admin/dashboard');
export const getPaymentAnalytics = (period = '30d') => adminFetch(`/admin/analytics/payments?period=${period}`);
export const getUserAnalytics = (period = '30d') => adminFetch(`/admin/analytics/users?period=${period}`);

// Websites
export const getAdminWebsites = (params: URLSearchParams) => adminFetch(`/admin/websites?${params}`);
export const getPendingWebsites = () => adminFetch('/admin/websites/pending');
export const moderateWebsite = (id: string, data: { status: string; reason?: string }) => 
  adminFetch(`/admin/websites/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(data) });

// Users  
export const getAdminUsers = (params: URLSearchParams) => adminFetch(`/admin/users?${params}`);
export const updateUser = (id: string, data: { role?: string; isActive?: boolean }) =>
  adminFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Creator Applications
export const getCreatorApplications = (params: URLSearchParams) => adminFetch(`/admin/creator-applications?${params}`);
export const getCreatorApplicationStats = () => adminFetch('/admin/creator-applications/stats');
export const handleCreatorApplication = (id: string, data: { status: string; rejectionReason?: string }) =>
  adminFetch(`/admin/creator-applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Reports
export const getReports = (params: URLSearchParams) => adminFetch(`/admin/reports?${params}`);
export const handleReport = (id: string, data: { status: string; adminNote?: string }) =>
  adminFetch(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
```

---

## ✅ Checklist Integrasi - 100% COMPLETE! 🎉

**Updated:** 6 Feb 2026 (Final)

### ✅ SEMUA FITUR SELESAI

| Task | Status | Details |
|------|--------|---------|
| Dashboard Overview Stats | ✅ | Terintegrasi dengan `useAdminDashboard` |
| Revenue Chart (analytics/payments) | ✅ | Payment analytics dengan bar chart (30 hari) |
| User Growth Chart (analytics/users) | ✅ | Daily signups visualization |
| Top Performers Widget | ✅ | Top websites & creators by revenue/earnings |
| Websites Tab + Pagination & Search | ✅ | Full integration dengan filter by status |
| Website Moderation (approve/reject) | ✅ | Approve/reject pending websites |
| Creator Applications List | ✅ | Full CRUD dengan filter & search |
| Creator Application Approve/Reject | ✅ | With rejection reason modal |
| Reports List | ✅ | View semua user reports |
| Report Handling (resolve/dismiss) | ✅ | With admin notes |
| **Users Tab** | ✅ | **NEW!** List users, filter by role, search |
| **User Role Update** | ✅ | **NEW!** Update role (User → Creator → Admin) |
| **Categories List** | ✅ | **NEW!** List all categories |
| **Category Create** | ✅ | **NEW!** With name, slug, description, icon, color |
| **Category Update** | ✅ | **NEW!** Edit existing category |
| **Category Delete** | ✅ | **NEW!** With confirmation modal |
| Settings Tab | ✅ | Platform settings & admin team |
| Loading States | ✅ | Spinners & skeletons implemented |
| Empty States | ✅ | Informative empty states |
| Error Handling | ✅ | User-friendly error messages |
| Pagination | ✅ | All list views |
| Responsive Design | ✅ | Mobile-friendly |
| Confirmation Modals | ✅ | For destructive actions |

---

## 📊 Progress Summary

| Priority | Progress | Notes |
|----------|----------|-------|
| **P1 Core Features** | **100%** ✅ | All complete! |
| **P2 Nice to Have** | **100%** ✅ | All implemented! |
| **P3 Polish** | **100%** ✅ | All polished! |

---

## 🎉 Integration Complete!

All admin dashboard features have been fully integrated with the backend API.
No more mock data - everything uses real API calls.

### Summary by Tab:
1. **Dashboard** ✅ - Overview stats, charts, top performers
2. **Websites** ✅ - List, filter, search, moderate
3. **Creators** ✅ - Applications with approve/reject
4. **Reports** ✅ - View and handle reports
5. **Users** ✅ - List users, update roles
6. **Categories** ✅ - Full CRUD
7. **Settings** ✅ - Platform settings

---

## ⚠️ Notes Penting

1. **🚫 JANGAN ubah backend code** - Semua API sudah siap dan tested
2. **🔑 Test dengan admin account:** `admin@findinggems.com` (password: `Admin123!`)
3. **📦 Response format:** Backend selalu return `{ success: boolean, data?: any, message?: string }`
4. **📄 Pagination:** Semua list endpoints support `page`, `limit`, `search`, `sortBy`, `sortOrder`
5. **🔗 Base URL:** `https://finding-gems-backend.onrender.com/api/v1`

---

## 🚀 Testing Checklist

Setelah integrasi selesai, test dengan:

- [ ] Login sebagai admin
- [ ] Cek semua tabs load data real (bukan mock)
- [ ] Test approve/reject flows (websites, applications, reports)
- [ ] Test pagination & search di semua list
- [ ] Test error scenarios (network error, unauthorized, etc)
- [ ] Test empty states (ketika data kosong)
- [ ] Test loading states (skeleton/spinner muncul)

---

**Questions?** Hubungi backend team untuk clarification.
