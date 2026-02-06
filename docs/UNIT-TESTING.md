# Unit Testing Documentation

## Overview
This document outlines the unit testing strategy and structure for the Finding Gems application.

---

## Test Structure

### Backend Tests
Location: `/backend/tests/unit/`

| Test File | Controller | Coverage |
|-----------|------------|----------|
| `auth.controller.test.ts` | Auth Controller | Registration, Login, Password validation |
| `bookmark.controller.test.ts` | Bookmark Controller | CRUD operations, authorization |
| `category.controller.test.ts` | Category Controller | Get categories, CRUD operations |
| `creator-application.controller.test.ts` | Creator Application | Application submission, admin review |
| `review.controller.test.ts` | Review Controller | Create, read, delete reviews |
| `user.controller.test.ts` | User Controller | User CRUD, profile updates |
| `website.controller.test.ts` | Website Controller | Website CRUD, view tracking |
| `errors.test.ts` | Error Classes | Custom error class validation |

### Frontend Tests
Location: `/lib/api/__tests__/`

| Test File | Module | Coverage |
|-----------|--------|----------|
| `normalize.test.ts` | API Normalization | snake_case to camelCase conversion |

---

## Running Tests

### Backend Tests
```bash
cd backend

# Run all unit tests
SUPABASE_URL=http://test.supabase.co SUPABASE_ANON_KEY=test-key npm test -- tests/unit

# Run with verbose output
SUPABASE_URL=http://test.supabase.co SUPABASE_ANON_KEY=test-key npm test -- tests/unit --verbose

# Run specific test file
SUPABASE_URL=http://test.supabase.co SUPABASE_ANON_KEY=test-key npm test -- tests/unit/auth.controller.test.ts

# Run with coverage
SUPABASE_URL=http://test.supabase.co SUPABASE_ANON_KEY=test-key npm test -- tests/unit --coverage
```

### Frontend Tests
```bash
# Run frontend tests (when package is configured)
npm test -- lib/api/__tests__
```

---

## Testing Patterns

### 1. Async Error Handling with `catchAsync`

The backend uses a `catchAsync` wrapper for controllers. Tests must wait for async error propagation:

```typescript
// Helper to wait for async catchAsync to propagate errors
const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

it('should handle errors', async () => {
  // Setup mocks...
  
  controllerFunction(req as Request, res as Response, next);
  await waitForAsync(); // Important: Wait for error propagation
  
  expect(next).toHaveBeenCalledWith(expect.objectContaining({
    statusCode: 404
  }));
});
```

### 2. Supabase Mocking

For chained Supabase queries, mock the full chain:

```typescript
// Example: Mocking .from().select().eq().single()
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ 
        data: mockData, 
        error: null 
      })
    })
  })
});
```

### 3. Sequential Supabase Calls

Use `mockImplementation` with call counting for sequential database calls:

```typescript
let callCount = 0;
(supabase.from as jest.Mock).mockImplementation((table) => {
  callCount++;
  
  if (callCount === 1) {
    // First call - e.g., check existence
    return { select: /* ... */ };
  }
  
  // Second call - e.g., insert
  return { insert: /* ... */ };
});
```

### 4. Prisma Mocking

For Prisma-based controllers:

```typescript
jest.mock('@prisma/client');

const mockPrisma = {
  bookmark: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

// In tests
mockPrisma.bookmark.findMany.mockResolvedValue(mockBookmarks);
```

---

## API Response Normalization

The frontend uses normalization utilities to convert snake_case API responses to camelCase:

```typescript
// lib/api/normalize.ts

// Convert single field
snakeToCamel('external_url') // => 'externalUrl'

// Normalize entire object recursively
normalizeKeys({ external_url: 'https://...' }) 
// => { externalUrl: 'https://...' }
```

### Usage in API Hooks

```typescript
// In useWebsite hook
const response = await api.get<{ data: { website: unknown } }>(`/websites/${id}`);
return normalizeKeys<Website>(response.data.website);
```

---

## Test Results Summary

As of last run:
- **Test Suites**: 8 passed, 8 total
- **Tests**: 72 passed, 10 skipped, 82 total
- **Time**: ~6 seconds

### Skipped Tests
10 tests in `creator-application.controller.test.ts` are skipped pending more complex mock implementations:
- Bio/motivation validation
- Portfolio URL validation
- Pending application checks
- Full application creation flow
- Admin list/filter operations
- Application approval/rejection flow

---

## Best Practices

1. **Always use `waitForAsync()`** when testing controllers wrapped with `catchAsync`
2. **Mock the full Supabase chain** - missing a method in the chain causes undefined errors
3. **Reset mocks in `beforeEach`** - prevents test pollution
4. **Test both success and error paths** - verify error handling works correctly
5. **Use descriptive test names** - makes test failures easy to understand

---

## Common Issues & Solutions

### 1. "Cannot read property 'x' of undefined"
**Cause**: Incomplete mock chain
**Solution**: Ensure all chained methods are mocked

### 2. "expect(next).toHaveBeenCalledWith..." not matching
**Cause**: Missing `await waitForAsync()`
**Solution**: Add the helper and await it before assertions

### 3. Memory/heap exhaustion
**Cause**: Infinite loops in mock (especially slug generation)
**Solution**: Ensure mock returns data that terminates loops (e.g., return `null` for "slug not exists")

### 4. Tests passing but functionality broken
**Cause**: Mocks not matching actual controller behavior
**Solution**: Review controller implementation and update mocks accordingly

---

## Future Improvements

1. **Integration Tests** - Add tests with Supabase local emulator
2. **E2E Tests** - Add Playwright/Cypress tests for critical flows
3. **Coverage Reports** - Configure Jest coverage with thresholds
4. **CI/CD Integration** - Run tests on every PR

---

*Last Updated: February 5, 2026*
