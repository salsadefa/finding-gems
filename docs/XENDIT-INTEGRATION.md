# Xendit Payment Gateway Integration Guide

## Overview

Finding Gems menggunakan **Xendit** sebagai payment gateway utama untuk memproses pembayaran di Indonesia. Xendit mendukung berbagai metode pembayaran termasuk:

- **Virtual Account**: BCA, BNI, BRI, Mandiri, Permata, BSI
- **E-Wallet**: OVO, DANA, ShopeePay, LinkAja
- **QRIS**: Semua e-wallet dan mobile banking yang mendukung QRIS
- **Retail Outlets**: Alfamart, Indomaret
- **Credit/Debit Card**: Visa, Mastercard

## Setup Instructions

### 1. Membuat Akun Xendit

1. Daftar di [dashboard.xendit.co](https://dashboard.xendit.co)
2. Verifikasi akun bisnis Anda
3. Lengkapi KYC (Know Your Customer)

### 2. Mendapatkan API Keys

Setelah akun diverifikasi:

1. Buka **Settings > Developers** di dashboard Xendit
2. Copy **Secret API Key** (format: `xnd_development_xxx` atau `xnd_production_xxx`)
3. Di bagian **Callbacks**, copy **Webhook Verification Token**

### 3. Konfigurasi Environment Variables

Tambahkan ke file `.env` di folder `/backend`:

```env
# Xendit Payment Gateway
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxx
XENDIT_WEBHOOK_TOKEN=xxxxxxxxxxxxxxxxxxxx
APP_BASE_URL=https://your-domain.com
```

**Catatan:**
- Gunakan key `xnd_development_xxx` untuk testing
- Ganti ke `xnd_production_xxx` saat production
- `APP_BASE_URL` adalah URL frontend untuk redirect setelah pembayaran

### 4. Konfigurasi Webhook di Xendit Dashboard

1. Buka **Settings > Developers > Callbacks** di dashboard Xendit
2. Set **Invoice Paid Callback URL** ke:
   ```
   https://your-api-domain.com/api/v1/payments/webhook/xendit
   ```
3. Pastikan **Webhook Verification Token** sudah di-copy ke environment variable

### 5. Test Mode vs Production

#### Development/Testing
- Gunakan key `xnd_development_xxx`
- Pembayaran dengan Virtual Account akan otomatis berhasil setelah beberapa detik
- Gunakan [Xendit Test Cards](https://developers.xendit.co/api-reference/#test-cards) untuk credit card testing

#### Production
- Gunakan key `xnd_production_xxx`
- Semua pembayaran akan diproses secara real

## Payment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Xendit    │────▶│   Webhook   │
│   Checkout  │     │   API       │     │   Invoice   │     │   Callback  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │ 1. Create Order   │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │                   │                   │
       │ 2. Initiate       │                   │                   │
       │    Payment        │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │ 3. Create         │                   │
       │                   │    Invoice        │                   │
       │                   │──────────────────▶│                   │
       │                   │                   │                   │
       │                   │ 4. Return         │                   │
       │                   │    checkout_url   │                   │
       │                   │◀──────────────────│                   │
       │                   │                   │                   │
       │ 5. Redirect to    │                   │                   │
       │    Xendit Checkout│                   │                   │
       │◀──────────────────│                   │                   │
       │                   │                   │                   │
       │ 6. User completes │                   │                   │
       │    payment        │                   │                   │
       │───────────────────────────────────────▶                   │
       │                   │                   │                   │
       │                   │                   │ 7. Webhook        │
       │                   │                   │    notification   │
       │                   │◀──────────────────────────────────────│
       │                   │                   │                   │
       │                   │ 8. Update order   │                   │
       │                   │    & grant access │                   │
       │                   │                   │                   │
       │ 9. Redirect to    │                   │                   │
       │    success page   │                   │                   │
       │◀──────────────────────────────────────│                   │
```

## API Endpoints

### Initiate Payment
```
POST /api/v1/payments/initiate
Authorization: Bearer <token>

Body:
{
  "order_id": "uuid-of-order",
  "payment_method": "bank_transfer" | "ewallet" | "qris" | "manual"
}

Response:
{
  "success": true,
  "data": {
    "transaction": { ... },
    "payment_instructions": {
      "type": "xendit",
      "checkout_url": "https://checkout.xendit.co/xxx",
      "invoice_id": "xxx",
      "expires_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Xendit Webhook
```
POST /api/v1/payments/webhook/xendit
Headers:
  x-callback-token: <webhook_verification_token>

Body (from Xendit):
{
  "id": "invoice-id",
  "external_id": "order-id",
  "status": "PAID",
  "paid_at": "2024-01-01T00:00:00Z",
  ...
}
```

### Check Payment Status
```
GET /api/v1/payments/:transactionId/status

Response:
{
  "success": true,
  "data": {
    "transaction": {
      "status": "pending" | "success" | "failed" | "expired"
    }
  }
}
```

## Troubleshooting

### Payment tidak terproses
1. Cek apakah `XENDIT_SECRET_KEY` sudah benar
2. Pastikan webhook URL bisa diakses dari internet
3. Cek log di Xendit Dashboard > Activity Log

### Webhook tidak diterima
1. Verifikasi URL webhook di Xendit Dashboard
2. Pastikan `XENDIT_WEBHOOK_TOKEN` sudah dikonfigurasi
3. Cek apakah server merespons dengan status 200

### Invoice expired
- Default expiry adalah 24 jam
- Bisa diubah di `xendit.service.ts` pada `DEFAULT_INVOICE_DURATION`

## Security Notes

1. **Jangan pernah expose Secret API Key** di frontend
2. **Selalu verifikasi webhook** menggunakan `x-callback-token`
3. **Gunakan HTTPS** di production
4. **Log semua aktivitas pembayaran** untuk audit trail

## Support

- Xendit Documentation: https://developers.xendit.co
- Xendit Support: support@xendit.co
- Finding Gems Support: support@findinggems.id
