# Email (SMTP/Resend)

This repo sends transactional emails via one of:

- SMTP (Nodemailer)
- Resend HTTP API (recommended on Render)

## Recommended on Render: Resend HTTP API

Some PaaS providers may block or degrade outbound SMTP (leading to timeouts). For production on Render, prefer Resend's HTTP API.

Environment variables (backend):

- `EMAIL_PROVIDER=resend_http`
- `RESEND_API_KEY=<RESEND_API_KEY>`
- `EMAIL_FROM=noreply@<your-domain>`
- `EMAIL_FROM_NAME=Dualangka`
- `APP_BASE_URL=https://<your-frontend-domain>`
- `OTP_SECRET=<random-long-secret>`

Optional:
- `RESEND_HTTP_TIMEOUT_MS=10000`

## Alternative: Resend SMTP (STARTTLS)

Configure environment variables in backend `.env` (do not commit secrets):

- `SMTP_HOST=smtp.resend.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=resend`
- `SMTP_PASS=<RESEND_API_KEY>`
- `EMAIL_FROM=noreply@<your-domain>`
- `EMAIL_FROM_NAME=Dualangka`
- `APP_BASE_URL=https://<your-frontend-domain>`
- `OTP_SECRET=<random-long-secret>`

Optional:
- `SMTP_TLS_REJECT_UNAUTHORIZED=true`
- `SMTP_CONNECTION_TIMEOUT_MS=10000`
- `SMTP_GREETING_TIMEOUT_MS=10000`
- `SMTP_SOCKET_TIMEOUT_MS=20000`

## Flows

- Email verification OTP
  - Triggered on register, and on login when email is not verified.
  - Endpoint: `POST /api/v1/auth/verify-email`
  - Resend endpoint: `POST /api/v1/auth/resend-verification`

- Request response email
  - Triggered when a creator responds to a buyer request.
  - Sent only if the buyer has verified email.
