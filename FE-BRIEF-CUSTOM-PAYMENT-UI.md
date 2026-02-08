# 📋 FE Brief: Custom QRIS & Virtual Account Payment Display

## 🎯 Objective

Implement custom UI display for QRIS and Virtual Account payments instead of redirecting to Xendit checkout page.

## 📌 Status: Ready for FE Implementation

Backend implementation is **COMPLETE**. New endpoints are available:

---

## 🔧 New API Endpoints

### 1. QRIS Payment (Custom QR Display)

**Endpoint:** `POST /api/v1/payments/qris`

**Auth:** Required (Bearer token)

**Request Body:**
```json
{
  "order_id": "uuid-of-order"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "...",
      "transaction_id": "TXN-xxx",
      "payment_method": "qris",
      "status": "pending",
      ...
    },
    "payment_details": {
      "type": "qris",
      "qr_string": "00020101021126...", // ← USE THIS TO GENERATE QR CODE IMAGE
      "amount": 150000,
      "formatted_amount": "Rp150.000",
      "expires_at": "2026-02-08T17:35:00.000Z",
      "instructions": [
        "Buka aplikasi mobile banking atau e-wallet Anda",
        "Pilih menu Scan / Pay dengan QRIS",
        "Scan QR code yang ditampilkan",
        "Konfirmasi nominal pembayaran",
        "Selesaikan pembayaran"
      ]
    }
  },
  "message": "QRIS payment created. Scan QR code to pay.",
  "timestamp": "..."
}
```

---

### 2. Virtual Account Payment (Custom VA Display)

**Endpoint:** `POST /api/v1/payments/virtual-account`

**Auth:** Required (Bearer token)

**Request Body:**
```json
{
  "order_id": "uuid-of-order",
  "bank_code": "BCA"
}
```

**Available bank_code values:**
- `BCA` - Bank Central Asia
- `BNI` - Bank Negara Indonesia
- `BRI` - Bank Rakyat Indonesia
- `MANDIRI` - Bank Mandiri
- `PERMATA` - Bank Permata
- `BSI` - Bank Syariah Indonesia
- `BJB` - Bank BJB
- `SAHABAT_SAMPOERNA` - Bank Sahabat Sampoerna
- `CIMB` - CIMB Niaga

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "...",
      "transaction_id": "TXN-xxx",
      "payment_method": "virtual_account",
      "status": "pending",
      ...
    },
    "payment_details": {
      "type": "virtual_account",
      "bank_code": "BCA",
      "bank_name": "Bank Central Asia (BCA)",
      "virtual_account_number": "1234567890123456", // ← DISPLAY THIS
      "customer_name": "John Doe",
      "amount": 150000,
      "formatted_amount": "Rp150.000",
      "expires_at": "2026-02-09T17:20:00.000Z",
      "instructions": [
        "Buka aplikasi mobile banking Bank Central Asia (BCA) Anda",
        "Pilih menu Transfer ke Virtual Account",
        "Masukkan nomor VA: 1234567890123456",
        "Konfirmasi nama penerima dan nominal",
        "Selesaikan pembayaran dengan PIN/password Anda"
      ]
    }
  },
  "message": "Virtual Account created. Complete payment via bank transfer.",
  "timestamp": "..."
}
```

---

### 3. Get Available VA Banks

**Endpoint:** `GET /api/v1/payments/virtual-account/banks`

**Auth:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "banks": [
      { "code": "BCA", "name": "Bank Central Asia (BCA)" },
      { "code": "BNI", "name": "Bank Negara Indonesia (BNI)" },
      { "code": "BRI", "name": "Bank Rakyat Indonesia (BRI)" },
      { "code": "MANDIRI", "name": "Bank Mandiri" },
      { "code": "PERMATA", "name": "Bank Permata" },
      { "code": "BSI", "name": "Bank Syariah Indonesia (BSI)" },
      { "code": "BJB", "name": "Bank BJB" },
      { "code": "SAHABAT_SAMPOERNA", "name": "Bank Sahabat Sampoerna" },
      { "code": "CIMB", "name": "CIMB Niaga" }
    ]
  }
}
```

---

### 4. E-Wallet Payment (Redirect to E-Wallet App)

**Endpoint:** `POST /api/v1/payments/ewallet`

**Auth:** Required (Bearer token)

**Request Body:**
```json
{
  "order_id": "uuid-of-order",
  "ewallet_code": "DANA"
}
```

**Available ewallet_code values:**
- `DANA` - DANA
- `OVO` - OVO (requires mobile_number)
- `SHOPEEPAY` - ShopeePay
- `LINKAJA` - LinkAja
- `ASTRAPAY` - AstraPay

**For OVO (requires mobile number):**
```json
{
  "order_id": "uuid-of-order",
  "ewallet_code": "OVO",
  "mobile_number": "+628123456789"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "...",
      "transaction_id": "TXN-xxx",
      "payment_method": "ewallet",
      "status": "pending",
      ...
    },
    "payment_details": {
      "type": "ewallet",
      "ewallet_code": "DANA",
      "ewallet_name": "DANA",
      "redirect_url": "https://checkout.xendit.co/...", // ← REDIRECT USER HERE
      "amount": 51000,
      "formatted_amount": "Rp51.000",
      "expires_at": "2026-02-08T22:00:00.000Z",
      "instructions": [
        "Klik tombol 'Bayar dengan DANA'",
        "Anda akan diarahkan ke aplikasi DANA",
        "Login dan konfirmasi pembayaran",
        "Kembali ke halaman ini setelah pembayaran selesai"
      ]
    }
  },
  "message": "E-Wallet payment created. Complete payment via DANA app.",
  "timestamp": "..."
}
```

---

### 5. Get Available E-Wallets

**Endpoint:** `GET /api/v1/payments/ewallet/options`

**Auth:** Not required

**Response:**
```json
{
  "success": true,
  "data": {
    "ewallets": [
      { "code": "DANA", "name": "DANA" },
      { "code": "OVO", "name": "OVO", "requires_mobile": true },
      { "code": "SHOPEEPAY", "name": "ShopeePay" },
      { "code": "LINKAJA", "name": "LinkAja" },
      { "code": "ASTRAPAY", "name": "AstraPay" }
    ]
  }
}
```

---

## 📱 FE Implementation Tasks

### Task 1: QRISPaymentDisplay Component

Create a component that:
1. Receives `qr_string` from API response
2. Converts QR string to QR code image using library like `qrcode.react` or `react-qr-code`
3. Displays:
   - QR code image
   - Amount to pay (formatted)
   - Expiry countdown timer
   - Payment instructions
4. Auto-check payment status using existing `GET /api/v1/payments/:transactionId/status`

**Suggested Libraries:**
```bash
npm install qrcode.react
# or
npm install react-qr-code
```

**Example Usage:**
```tsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG 
  value={payment_details.qr_string} 
  size={256}
  level="M"
/>
```

---

### Task 2: VAPaymentDisplay Component

Create a component that:
1. Displays bank logo (use bank_code to show appropriate logo)
2. Shows virtual account number with copy-to-clipboard functionality
3. Displays:
   - Bank name
   - VA number (with copy button)
   - Customer name
   - Amount to pay (formatted)
   - Expiry countdown timer
   - Payment instructions
4. Auto-check payment status

---

### Task 3: Update Checkout Flow

Modify checkout page to:
1. Add payment method selection step with options:
   - QRIS
   - Virtual Account (with bank selection)
   - E-Wallet (existing - redirects to Xendit)
   - Credit Card (existing - redirects to Xendit)

2. Based on selection:
   - **QRIS**: Call `/api/v1/payments/qris` → Show QRISPaymentDisplay
   - **Virtual Account**: Show bank selection → Call `/api/v1/payments/virtual-account` → Show VAPaymentDisplay
   - **E-Wallet/Credit Card**: Call existing `/api/v1/payments/initiate` → Redirect to Xendit

---

### Task 4: Payment Status Polling

Implement status checking:
```typescript
// Poll every 3 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await checkPaymentStatus(transactionId);
    if (status === 'success') {
      // Redirect to success page
      router.push(`/checkout/success?order_id=${orderId}`);
    } else if (status === 'expired' || status === 'failed') {
      // Show error state
      setPaymentStatus(status);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [transactionId]);
```

---

## 🎨 UI/UX Recommendations

### QRIS Display
- Large QR code (at least 256x256)
- Clear "Scan dengan QRIS" header
- Show countdown timer prominently
- Add "Refresh QR" button if expired
- Show payment amount clearly

### VA Display  
- Bank logo at top
- Large, easily copyable VA number
- "Copy" button with success feedback
- Clear payment instructions
- Show countdown timer
- Add "How to Pay" expandable section with step-by-step guide

---

## 🔄 Flow Diagram

```
User clicks "Pay" 
    ↓
Payment Method Selection
    ↓
┌─────────────┬──────────────────┬─────────────────────┐
│    QRIS     │  Virtual Account │  E-Wallet/Card      │
│             │                  │                     │
│ POST /qris  │ Select Bank      │ POST /initiate      │
│     ↓       │      ↓           │       ↓             │
│ Show QR UI  │ POST /va         │ Redirect to Xendit  │
│     ↓       │      ↓           │       ↓             │
│ Poll status │ Show VA UI       │ Xendit handles      │
│     ↓       │      ↓           │       ↓             │
│ User scans  │ User transfers   │ User completes      │
│     ↓       │      ↓           │       ↓             │
│ Webhook     │ Webhook          │ Webhook             │
│     ↓       │      ↓           │       ↓             │
│ Status=paid │ Status=paid      │ Status=paid         │
│     ↓       │      ↓           │       ↓             │
└─────────────┴──────────────────┴─────────────────────┘
                      ↓
              Redirect to Success Page
```

---

## 📁 Suggested File Structure

```
/components/payment/
├── QRISPaymentDisplay.tsx      # QRIS QR code display component
├── VAPaymentDisplay.tsx        # Virtual Account display component
├── PaymentMethodSelector.tsx   # Payment method selection UI
├── BankSelector.tsx            # Bank selection for VA
├── PaymentCountdown.tsx        # Expiry countdown timer
└── PaymentStatusPoller.tsx     # Status polling hook/component

/lib/api/
└── payment.ts                  # Add new API functions
```

---

## ⏰ Estimated Effort

| Task | Effort |
|------|--------|
| QRISPaymentDisplay | 2-3 hours |
| VAPaymentDisplay | 2-3 hours |
| PaymentMethodSelector | 1-2 hours |
| Update Checkout Flow | 2-3 hours |
| Testing & Polish | 2 hours |
| **Total** | **~8-12 hours** |

---

## 📝 Notes

1. **Existing flow still works** - Credit Card still redirects to Xendit as before
2. **E-Wallet flow updated** - DANA, OVO, ShopeePay now use dedicated endpoint with redirect URL
3. **Webhooks** - Backend handles webhooks, no FE changes needed for payment confirmation
4. **Error handling** - Handle 503 (service unavailable), 400 (validation), 500 (server error)
5. **Mobile responsive** - QR code should be scannable from mobile browser too

---

## ✅ Backend API Status (Updated 2026-02-08 21:42 WIB)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/v1/payments/qris` | ✅ | QRIS payment with QR string |
| `POST /api/v1/payments/virtual-account` | ✅ | VA payment (BCA tested) |
| `GET /api/v1/payments/virtual-account/banks` | ✅ | List available banks |
| `POST /api/v1/payments/ewallet` | ✅ | E-Wallet payment (DANA fix applied) |
| `GET /api/v1/payments/ewallet/options` | ✅ | List available e-wallets |

**Backend Implementation:** ✅ Complete (QRIS, VA, E-Wallet all ready)
**Ready for FE:** 🟢 Yes

Contact: Backend agent if you have questions about API response structure or behavior.
