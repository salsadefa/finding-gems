# Email (SMTP/Resend)

This repo sends transactional emails via Nodemailer using SMTP.

## Recommended: Resend SMTP

Configure environment variables in backend `.env` (do not commit secrets):

- `SMTP_HOST=smtp.resend.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=resend`
- `SMTP_PASS=<RESEND_API_KEY>`
- `EMAIL_FROM=noreply@<your-domain>`
- `EMAIL_FROM_NAME=Dualangka`
- `APP_BASE_URL=https://<your-frontend-domain>`
- `OTP_SECRET=<random-long-secret>`

Optional:
- `SMTP_TLS_REJECT_UNAUTHORIZED=true`

## Flows

- Email verification OTP
  - Triggered on register, and on login when email is not verified.
  - Endpoint: `POST /api/v1/auth/verify-email`
  - Resend endpoint: `POST /api/v1/auth/resend-verification`

- Request response email
  - Triggered when a creator responds to a buyer request.
  - Sent only if the buyer has verified email.
