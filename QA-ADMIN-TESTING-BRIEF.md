# QA Testing Brief - Admin Dashboard Backend

> **Untuk Tim QA:** Brief ini berisi test cases untuk admin dashboard backend APIs yang baru ditambahkan.

---

## 📋 Overview

**Scope:** Unit testing untuk Creator Application Admin Controller  
**Target File:** `backend/src/controllers/creator-application-admin.controller.ts`  
**Test File (perlu dibuat):** `backend/src/__tests__/creator-application-admin.controller.test.ts`

---

## 🎯 Controller yang Perlu Ditest

### Creator Application Admin Controller

| Function | Route | Method | Description |
|----------|-------|--------|-------------|
| `getAllCreatorApplications` | `/admin/creator-applications` | GET | List semua creator applications |
| `getCreatorApplicationById` | `/admin/creator-applications/:id` | GET | Get detail 1 application |
| `handleCreatorApplication` | `/admin/creator-applications/:id` | PATCH | Approve/reject application |
| `getCreatorApplicationStats` | `/admin/creator-applications/stats` | GET | Get statistik applications |

---

## 📝 Test Cases

### 1. `getAllCreatorApplications`

#### 1.1 Authentication & Authorization
```typescript
test('throws ForbiddenError if not authenticated')
// req.user = undefined → expect ForbiddenError

test('throws ForbiddenError if user is not admin')
// req.user.role = 'user' → expect ForbiddenError
// req.user.role = 'creator' → expect ForbiddenError
```

#### 1.2 Success Cases
```typescript
test('returns applications with pagination for admin')
// req.user.role = 'admin', query = { page: 1, limit: 20 }
// Mock supabase to return array of applications
// Expect: status 200, data.applications = array, data.pagination exists

test('filters by status')
// query = { status: 'pending' }
// Expect: supabase.eq called with 'status', 'pending'

test('returns empty array when no applications')
// Mock: data = [], count = 0
// Expect: status 200, data.applications = []
```

#### 1.3 Pagination
```typescript
test('calculates pagination correctly')
// total = 50, limit = 20, page = 2
// Expect: pagination.hasNext = true, pagination.hasPrev = true

test('handles last page correctly')
// total = 25, limit = 20, page = 2
// Expect: pagination.hasNext = false
```

---

### 2. `getCreatorApplicationById`

#### 2.1 Authentication & Authorization
```typescript
test('throws ForbiddenError if not admin')
// Same as above
```

#### 2.2 Not Found
```typescript
test('throws NotFoundError if application not found')
// Mock supabase to return { data: null, error: ... }
// Expect: NotFoundError
```

#### 2.3 Success Cases
```typescript
test('returns application detail with user and reviewer')
// Mock: complete application with user relation
// Expect: status 200, data.application includes user info
```

---

### 3. `handleCreatorApplication` (CRITICAL ⚠️)

#### 3.1 Authentication & Authorization
```typescript
test('throws ForbiddenError if not admin')
```

#### 3.2 Validation Errors
```typescript
test('throws ValidationError if status is invalid')
// body.status = 'invalid' → expect ValidationError

test('throws ValidationError if status is empty')
// body.status = '' → expect ValidationError

test('throws ValidationError if rejecting without reason')
// body.status = 'rejected', body.rejectionReason = undefined
// Expect: ValidationError('Rejection reason is required')
```

#### 3.3 Not Found
```typescript
test('throws NotFoundError if application not found')
```

#### 3.4 Re-processing Prevention
```typescript
test('throws ValidationError if application already processed')
// Mock existing application with status = 'approved'
// Try to process again → expect ValidationError
```

#### 3.5 Approval Flow (CRITICAL)
```typescript
test('approves application successfully')
// body = { status: 'approved' }
// Expect: 
//   1. Application status updated to 'approved'
//   2. reviewedAt and reviewedBy set
//   3. status 200

test('updates user role to creator when approved')
// After approval:
// Mock users.update should be called with { role: 'creator' }

test('creates creator_profile when approved')
// After approval:
// Mock creator_profiles.upsert should be called

test('creates creator_balance when approved')
// After approval:
// Mock creator_balances.upsert should be called
```

#### 3.6 Rejection Flow
```typescript
test('rejects application successfully with reason')
// body = { status: 'rejected', rejectionReason: 'Not qualified' }
// Expect:
//   1. Status updated to 'rejected'
//   2. rejectionReason saved
//   3. User role NOT changed
//   4. No creator_profile created
```

---

### 4. `getCreatorApplicationStats`

#### 4.1 Authentication & Authorization
```typescript
test('throws ForbiddenError if not admin')
```

#### 4.2 Success Cases
```typescript
test('returns stats for all statuses')
// Mock 4 parallel queries with counts
// Expect: { total: X, pending: Y, approved: Z, rejected: W }

test('returns zeros when no applications exist')
// Mock all counts = 0
// Expect: { total: 0, pending: 0, approved: 0, rejected: 0 }
```

---

## 🔧 Mock Setup Template

Gunakan mock setup yang sudah ada di `admin.controller.test.ts`:

```typescript
import { 
  getAllCreatorApplications,
  getCreatorApplicationById,
  handleCreatorApplication,
  getCreatorApplicationStats
} from '../controllers/creator-application-admin.controller';
import { ForbiddenError, ValidationError, NotFoundError } from '../utils/errors';

const fromMock = jest.fn();

jest.mock('../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
  },
}));

class MockQuery {
  response: any;
  constructor(response: any) {
    this.response = response;
  }
  select = jest.fn(() => this);
  eq = jest.fn(() => this);
  neq = jest.fn(() => this);
  gte = jest.fn(() => this);
  or = jest.fn(() => this);
  order = jest.fn(() => this);
  range = jest.fn(() => this);
  insert = jest.fn(() => this);
  update = jest.fn(() => this);
  upsert = jest.fn(() => this);
  single = jest.fn(async () => this.response);
  then = (resolve: any, reject?: any) => Promise.resolve(this.response).then(resolve, reject);
}

const createRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};
```

---

## 📊 Expected Test Coverage

| Function | Min Coverage | Priority |
|----------|-------------|----------|
| `getAllCreatorApplications` | 80%+ | HIGH |
| `getCreatorApplicationById` | 80%+ | MEDIUM |
| `handleCreatorApplication` | 90%+ | CRITICAL |
| `getCreatorApplicationStats` | 80%+ | MEDIUM |

---

## ⚠️ Important Rules

1. **DO NOT** modify source code files
2. **ONLY** create test files in `__tests__` directories  
3. Use mocks for Supabase - never hit real database
4. Test both success and error paths
5. Focus on `handleCreatorApplication` - this has business logic critical for approval flow

---

## 🔄 Existing Tests Reference

Lihat contoh yang sudah ada:
- `backend/src/__tests__/admin.controller.test.ts` - Pattern untuk admin tests
- `backend/src/__tests__/payout.controller.test.ts` - Contoh testing dengan multiple mocks

---

## 📁 File Output

Test file harus dibuat di:
```
/Users/arkan/finding-gems/backend/src/__tests__/creator-application-admin.controller.test.ts
```

---

## 🚀 Run Tests

```bash
# Run specific test file
cd /Users/arkan/finding-gems/backend && npm test -- creator-application-admin

# Run all tests
cd /Users/arkan/finding-gems/backend && npm test

# Run with coverage
cd /Users/arkan/finding-gems/backend && npm run test:coverage
```

---

## ✅ Acceptance Criteria

- [ ] Semua test cases di atas diimplementasi
- [ ] Coverage minimal 80% untuk setiap function
- [ ] Tidak ada test yang skip atau pending
- [ ] Semua tests PASS
- [ ] Output test report di console clean (no warnings)

---

**Questions?** Hubungi backend team untuk clarification.
