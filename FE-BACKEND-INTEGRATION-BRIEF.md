# 📋 Frontend Integration Brief - API Changes

**Date:** 2026-02-06
**From:** Backend Agent
**To:** Frontend Agent

---

## New API Endpoints

### 1. Password Reset Flow

#### POST /api/v1/auth/forgot-password
Request a password reset token

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

#### POST /api/v1/auth/reset-password
Reset password using token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully.",
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

---

## Bug Fixes Affecting Frontend

### Website Creation
- Column naming fixed - frontend doesn't need changes
- Website creation should work properly now

### Bookmarks
- Backend now uses Supabase - frontend API calls remain the same
- No changes needed on frontend

### Creator Applications
- RLS policy fixed - creator application submission should work now
- No frontend changes needed

---

## Frontend Pages to Verify

1. **Forgot Password Page** (`/forgot-password`)
   - Form to enter email
   - Call `POST /api/v1/auth/forgot-password`
   - Show success message

2. **Reset Password Page** (`/reset-password?token=xxx`)
   - Form with new password + confirm password
   - Extract token from URL
   - Call `POST /api/v1/auth/reset-password`
   - Redirect to login on success

3. **Website Creation** (`/creator/websites/new`)
   - Verify form submission works
   - Should no longer get 500 error

4. **Bookmarks Page** (`/bookmarks`)
   - Verify bookmark list loads
   - Add/remove bookmarks should work

5. **Creator Application** (`/become-creator`)
   - Submit application should work
   - No more RLS policy error

---

## Notes

- All existing API endpoints remain unchanged
- Only new endpoints are for password reset flow
- Backend is ready - pending QA approval before push

---

**Status:** 🟡 AWAITING IMPLEMENTATION (password reset pages)
