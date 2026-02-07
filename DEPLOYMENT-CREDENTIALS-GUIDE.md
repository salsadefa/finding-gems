# 🚀 Deployment Credentials Setup

**Date:** 2026-02-08 01:35 WIB

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Vercel]                        [Render]                   │
│   Frontend                        Backend                    │
│   ↓                               ↓                          │
│   https://finding-gems.vercel.app https://finding-gems-      │
│                                   backend.onrender.com       │
│                                                              │
│            ↓                               ↓                 │
│      [Supabase]                    [Xendit]                 │
│      Database                      Payments                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Render Backend Environment Variables

**WAJIB di-set di Render Dashboard:**

URL: https://dashboard.render.com/web/srv-d6278k8gjchc73afbfr0/env

### Required Variables:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `NODE_ENV` | `production` | Set this |
| `PORT` | `3001` | Set this |
| `FRONTEND_URL` | `https://finding-gems.vercel.app` | Your Vercel URL |

### Supabase (Database):
| Variable | Value | Where to Get |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | Supabase Dashboard → Settings → Database |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard |
| `SUPABASE_KEY` | `eyJ...` | Supabase Dashboard → API |

### JWT (Security):
| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_SECRET` | `generate-random-64-char-string` | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` | |
| `JWT_REFRESH_SECRET` | `generate-another-64-char-string` | Different from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | |

### Xendit (Payments) - 🔥 IMPORTANT:
| Variable | Value | Where to Get |
|----------|-------|--------------|
| `XENDIT_API_KEY` | `xnd_production_xxx` | [Xendit Dashboard](https://dashboard.xendit.co/settings/developers#api-keys) |
| `XENDIT_WEBHOOK_TOKEN` | `xxx` | [Xendit Callbacks](https://dashboard.xendit.co/settings/developers#callbacks) |
| `APP_BASE_URL` | `https://finding-gems.vercel.app` | Your frontend URL |

### Email (Optional):
| Variable | Value | Notes |
|----------|-------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Or your SMTP provider |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | `your-email@gmail.com` | |
| `SMTP_PASS` | `app-password` | Use App Password, not regular password |
| `EMAIL_FROM` | `noreply@yourdomain.com` | |

---

## 🔐 Vercel Frontend Environment Variables

Set di: https://vercel.com/[your-project]/settings/environment-variables

### Required:
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://finding-gems-backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://finding-gems-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |

---

## 🔥 Xendit: Sandbox → Production

### Step 1: Switch to Production Mode
1. Go to [Xendit Dashboard](https://dashboard.xendit.co)
2. Toggle from "Test Mode" → "Live Mode" (top right)
3. Copy **Production API Key** (starts with `xnd_production_`)

### Step 2: Update Webhook URL
1. Go to Settings → Callbacks
2. Set webhook URL: `https://finding-gems-backend.onrender.com/api/v1/payments/webhook/xendit`
3. Copy the Webhook Verification Token

### Step 3: Update Render Env
- Replace `XENDIT_API_KEY` with production key
- Set `XENDIT_WEBHOOK_TOKEN` with production token

---

## 📝 Quick Commands

### Generate JWT Secrets:
```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate JWT_REFRESH_SECRET
openssl rand -hex 32
```

### Set Render Env via CLI (optional):
```bash
# Or just use the dashboard - it's easier
```

---

## ✅ Checklist Before Deploy

| # | Task | Status |
|---|------|--------|
| 1 | Set all Render env vars | ⬜ |
| 2 | Set all Vercel env vars | ⬜ |
| 3 | Switch Xendit to Production mode | ⬜ |
| 4 | Update Xendit webhook URL | ⬜ |
| 5 | Verify Supabase connection | ⬜ |
| 6 | Push code to trigger deploy | ⬜ |

---

## 🚀 Deploy Steps

1. **Set env vars di Render** (dashboard)
2. **Set env vars di Vercel** (dashboard)
3. **Push ke main branch** → Both auto-deploy
4. **Test endpoints** → Verify backend is live
5. **Test payment** → Make a small transaction

---

**Backend URL:** https://finding-gems-backend.onrender.com
**Service ID:** srv-d6278k8gjchc73afbfr0
