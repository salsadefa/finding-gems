# Render Deployment Notes

Backend is deployed on Render.

## Required environment variables

These are required to enable email verification OTP and request-response email notifications.

- `APP_BASE_URL=https://finding-gems.vercel.app`

Resend SMTP:
- `SMTP_HOST=smtp.resend.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=resend`
- `SMTP_PASS=<RESEND_API_KEY>`

If SMTP is timing out on Render, switch to Resend HTTP API:
- `EMAIL_PROVIDER=resend_http`
- `RESEND_API_KEY=<RESEND_API_KEY>`

Sender:
- `EMAIL_FROM=contact@dualangka.com`
- `EMAIL_FROM_NAME=Dualangka`

Security:
- `OTP_SECRET=<random-long-secret>`
- `SMTP_TLS_REJECT_UNAUTHORIZED=true`

## Notes

- `EMAIL_FROM` should use a domain verified in Resend (SPF/DKIM) for best deliverability.
- After changing env vars in Render, trigger a new deploy or restart the service.
