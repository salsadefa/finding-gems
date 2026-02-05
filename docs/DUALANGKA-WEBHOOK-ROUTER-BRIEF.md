# Brief: Xendit Webhook Router untuk Multi-Project

## Konteks
Satu akun Xendit digunakan untuk beberapa project:
1. **Dualangka Loyalty** (existing)
2. **Finding Gems** (new)

Saat ini webhook URL di Xendit Dashboard:
```
https://loyalty.dualangka.com/api/webhooks/xendit/invoice
```

## Tugas
Update webhook handler di Dualangka untuk **mendeteksi dan forward** webhook ke project yang benar berdasarkan format `external_id`.

## Cara Identifikasi Project

| Project | Format `external_id` | Contoh |
|---------|---------------------|--------|
| Finding Gems | UUID (36 karakter dengan dash) | `550e8400-e29b-41d4-a716-446655440000` |
| Dualangka | Non-UUID (format lama) | `ORDER-12345`, `TRX-ABC123`, dll |

## Logic yang Harus Ditambahkan

```typescript
// Di webhook handler Dualangka
// File: (cari file yang handle endpoint /api/webhooks/xendit/invoice)

export async function handleXenditInvoiceWebhook(req, res) {
  const payload = req.body;
  const callbackToken = req.headers['x-callback-token'];
  const externalId = payload.external_id;

  // Regex untuk detect UUID v4
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Jika external_id adalah UUID, forward ke Finding Gems
  if (UUID_REGEX.test(externalId)) {
    console.log(`[Webhook Router] Forwarding to Finding Gems: ${externalId}`);
    
    try {
      const response = await fetch('https://api.findinggems.id/api/v1/payments/webhook/xendit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-callback-token': callbackToken // Forward token untuk verifikasi
        },
        body: JSON.stringify(payload)
      });

      console.log(`[Webhook Router] Finding Gems responded: ${response.status}`);
      
      // Return 200 ke Xendit supaya tidak retry
      return res.status(200).json({ 
        success: true, 
        message: 'Forwarded to Finding Gems',
        project: 'finding-gems'
      });
    } catch (error) {
      console.error('[Webhook Router] Failed to forward:', error);
      // Tetap return 200 supaya Xendit tidak retry terus
      return res.status(200).json({ 
        success: false, 
        message: 'Forward failed but acknowledged',
        error: error.message
      });
    }
  }

  // Jika bukan UUID, proses seperti biasa (Dualangka logic)
  console.log(`[Webhook Router] Processing locally (Dualangka): ${externalId}`);
  
  // ... EXISTING DUALANGKA WEBHOOK LOGIC ...
  // Jangan ubah logic yang sudah ada di bawah ini
}
```

## Environment Variable (Optional)
Bisa ditambahkan untuk flexibility:

```env
# Finding Gems API URL for webhook forwarding
FINDING_GEMS_WEBHOOK_URL=https://api.findinggems.id/api/v1/payments/webhook/xendit
```

Lalu di code:
```typescript
const FINDING_GEMS_URL = process.env.FINDING_GEMS_WEBHOOK_URL || 'https://api.findinggems.id/api/v1/payments/webhook/xendit';
```

## Testing
Setelah deploy, test dengan:
1. Buat transaksi di Dualangka → Pastikan masih jalan normal
2. Buat transaksi di Finding Gems → Pastikan webhook di-forward dan diterima

## Notes
- Webhook token (`x-callback-token`) SAMA untuk kedua project
- Finding Gems sudah siap menerima webhook dengan format yang sama
- Pastikan return 200 ke Xendit di semua case (termasuk forward gagal) supaya tidak ada infinite retry

---

**URL Finding Gems:**
- Development: `http://localhost:3001/api/v1/payments/webhook/xendit`
- Production: `https://finding-gems-backend.onrender.com/api/v1/payments/webhook/xendit`

Ganti URL sesuai environment yang aktif.
