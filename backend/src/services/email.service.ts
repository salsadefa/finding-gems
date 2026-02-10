// ============================================
// Email Service - Finding Gems Backend
// ============================================

import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';

// ============================================
// CONFIG
// ============================================

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_TLS_REJECT_UNAUTHORIZED = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false';

// Keep these relatively small so requests fail fast on PaaS.
const SMTP_CONNECTION_TIMEOUT_MS = parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10);
const SMTP_GREETING_TIMEOUT_MS = parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '10000', 10);
const SMTP_SOCKET_TIMEOUT_MS = parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '20000', 10);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED,
    minVersion: 'TLSv1.2',
  },
  connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
  greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
  socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@findinggems.id';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Finding Gems';
const APP_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// ============================================
// TYPES
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function safeEmailErrorForLog(error: unknown) {
  const err = error as any;

  const short = (value: unknown, maxLen = 800) => {
    if (typeof value !== 'string') return value;
    return value.length > maxLen ? `${value.slice(0, maxLen)}...` : value;
  };

  return {
    name: err?.name,
    code: err?.code,
    message: short(err?.message),
    command: err?.command,
    responseCode: err?.responseCode,
    response: short(err?.response),
    errno: err?.errno,
    syscall: err?.syscall,
    address: err?.address,
    port: err?.port,
  };
}

function smtpConfigForLog() {
  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    tlsRejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED,
    connectionTimeoutMs: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeoutMs: SMTP_GREETING_TIMEOUT_MS,
    socketTimeoutMs: SMTP_SOCKET_TIMEOUT_MS,
  };
}

async function sendEmailViaResendHttp(options: EmailOptions): Promise<boolean> {
  const resendApiKey =
    process.env.RESEND_API_KEY || (process.env.SMTP_USER === 'resend' ? process.env.SMTP_PASS : undefined);

  if (!resendApiKey) {
    console.warn('[Email] RESEND_API_KEY not configured. Email not sent.');
    return false;
  }

  const timeoutMs = parseInt(process.env.RESEND_HTTP_TIMEOUT_MS || '10000', 10);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ''),
    };

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        // Resend supports idempotent requests.
        'Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const raw = await resp.text();

    if (!resp.ok) {
      console.error('[Email] Resend HTTP send failed', {
        provider: 'resend_http',
        to: options.to,
        subject: options.subject,
        status: resp.status,
        body: raw.slice(0, 800),
      });
      return false;
    }

    console.log(`[Email] Sent (resend_http) to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Resend HTTP send exception', {
      provider: 'resend_http',
      to: options.to,
      subject: options.subject,
      error: safeEmailErrorForLog(error),
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// CORE SEND EMAIL
// ============================================

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (EMAIL_PROVIDER === 'resend_http') {
      return await sendEmailViaResendHttp(options);
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[Email] SMTP credentials not configured. Email not sent.', {
        provider: EMAIL_PROVIDER,
        smtp: smtpConfigForLog(),
      });
      return false;
    }

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ''),
    });

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send', {
      provider: EMAIL_PROVIDER,
      to: options.to,
      subject: options.subject,
      smtp: smtpConfigForLog(),
      error: safeEmailErrorForLog(error),
    });
    return false;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #6366f1; }
    .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; }
    .status-success { color: #10b981; }
    .status-pending { color: #f59e0b; }
    .status-failed { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    td:first-child { font-weight: 600; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💎 Finding Gems</div>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Finding Gems. All rights reserved.</p>
      <p>Jika ada pertanyaan, hubungi kami di support@findinggems.id</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// PAYMENT EMAILS
// ============================================

interface PaymentSuccessData {
  userName: string;
  orderNumber: string;
  websiteName: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  invoiceUrl: string;
}

export async function sendPaymentSuccessEmail(to: string, data: PaymentSuccessData) {
  const content = `
    <div class="content">
      <h2>Pembayaran Berhasil! 🎉</h2>
      <p>Halo ${data.userName},</p>
      <p>Terima kasih! Pembayaran Anda telah berhasil diproses.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div class="amount">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div class="status-success">✓ Pembayaran Sukses</div>
      </div>
      
      <table>
        <tr><td>Order Number</td><td>${data.orderNumber}</td></tr>
        <tr><td>Produk</td><td>${data.websiteName}</td></tr>
        ${data.paymentMethod ? `<tr><td>Metode Pembayaran</td><td>${data.paymentMethod}</td></tr>` : ''}
        ${data.transactionId ? `<tr><td>ID Transaksi</td><td>${data.transactionId}</td></tr>` : ''}
      </table>
      
      <p>Anda sekarang dapat mengakses produk yang dibeli.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.invoiceUrl}" class="button">Lihat Invoice</a>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `✅ Pembayaran Berhasil - Order ${data.orderNumber}`,
    html: baseTemplate(content),
  });
}

interface PaymentFailedData {
  userName: string;
  orderNumber: string;
  websiteName: string;
  amount: number;
  reason?: string;
  retryUrl: string;
}

export async function sendPaymentFailedEmail(to: string, data: PaymentFailedData) {
  const content = `
    <div class="content">
      <h2>Pembayaran Gagal</h2>
      <p>Halo ${data.userName},</p>
      <p>Maaf, pembayaran Anda tidak dapat diproses.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; color: #ef4444;">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div class="status-failed">✗ Pembayaran Gagal</div>
      </div>
      
      <table>
        <tr><td>Order Number</td><td>${data.orderNumber}</td></tr>
        <tr><td>Produk</td><td>${data.websiteName}</td></tr>
        ${data.reason ? `<tr><td>Alasan</td><td>${data.reason}</td></tr>` : ''}
      </table>
      
      <p>Silakan coba lagi atau gunakan metode pembayaran lain.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.retryUrl}" class="button">Coba Lagi</a>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `❌ Pembayaran Gagal - Order ${data.orderNumber}`,
    html: baseTemplate(content),
  });
}

// ============================================
// INVOICE EMAILS
// ============================================

interface InvoiceData {
  userName: string;
  invoiceNumber: string;
  orderNumber: string;
  websiteName: string;
  amount: number;
  issueDate: string;
  invoiceUrl: string;
}

export async function sendInvoiceEmail(to: string, data: InvoiceData) {
  const content = `
    <div class="content">
      <h2>Invoice Anda</h2>
      <p>Halo ${data.userName},</p>
      <p>Berikut adalah invoice untuk pembelian Anda.</p>
      
      <table>
        <tr><td>Invoice Number</td><td>${data.invoiceNumber}</td></tr>
        <tr><td>Order Number</td><td>${data.orderNumber}</td></tr>
        <tr><td>Produk</td><td>${data.websiteName}</td></tr>
        <tr><td>Tanggal</td><td>${data.issueDate}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>Rp ${data.amount.toLocaleString('id-ID')}</strong></td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `📄 Invoice ${data.invoiceNumber} - Finding Gems`,
    html: baseTemplate(content),
  });
}

// ============================================
// AUTH EMAILS
// ============================================

export async function sendEmailVerificationOtpEmail(to: string, data: { userName: string; otp: string }) {
  const content = `
    <div class="content">
      <h2>Verifikasi Email Anda</h2>
      <p>Halo ${data.userName},</p>
      <p>Gunakan kode OTP berikut untuk memverifikasi email Anda:</p>

      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;font-size:32px;letter-spacing:10px;font-weight:800;background:#111827;color:#fff;padding:14px 18px;border-radius:12px;">
          ${data.otp}
        </div>
      </div>

      <p style="color:#6b7280;font-size:13px;">Kode ini berlaku selama 10 menit. Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: '🔐 Kode OTP Verifikasi Email',
    html: baseTemplate(content),
  });
}

export async function sendPasswordResetEmail(to: string, data: { userName: string; resetUrl: string }) {
  const content = `
    <div class="content">
      <h2>Reset Password</h2>
      <p>Halo ${data.userName},</p>
      <p>Kami menerima permintaan untuk mereset password akun Finding Gems Anda.</p>
      <p>Klik tombol di bawah untuk membuat password baru:</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </div>

      <p style="color:#6b7280;font-size:13px;">Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini — akun Anda tetap aman.</p>
      <p style="color:#6b7280;font-size:13px;">Jika tombol tidak berfungsi, salin link berikut ke browser:</p>
      <p style="word-break:break-all;color:#6366f1;font-size:12px;">${data.resetUrl}</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: '🔑 Reset Password - Finding Gems',
    html: baseTemplate(content),
  });
}

export async function sendToolRequestResponseEmail(to: string, data: { buyerName: string; requestTitle: string; requestUrl: string; responderName: string }) {
  const content = `
    <div class="content">
      <h2>Respon Baru Untuk Request Anda</h2>
      <p>Halo ${data.buyerName},</p>
      <p><strong>${data.responderName}</strong> baru saja merespon request Anda:</p>
      <p style="margin:16px 0;padding:12px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
        ${data.requestTitle}
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${data.requestUrl}" class="button">Lihat Respon</a>
      </div>
      <p style="color:#6b7280;font-size:13px;">Tip: Pilih respon terbaik untuk menutup request dan menjaga board tetap berkualitas.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: '💬 Respon baru untuk request kamu',
    html: baseTemplate(content),
  });
}

// ============================================
// PAYOUT EMAILS
// ============================================

interface PayoutRequestedData {
  creatorName: string;
  payoutNumber: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  estimatedDate?: string;
}

export async function sendPayoutRequestedEmail(to: string, data: PayoutRequestedData) {
  const content = `
    <div class="content">
      <h2>Permintaan Payout Diterima</h2>
      <p>Halo ${data.creatorName},</p>
      <p>Permintaan payout Anda telah kami terima dan sedang diproses.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div class="amount">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div class="status-pending">⏳ Sedang Diproses</div>
      </div>
      
      <table>
        <tr><td>Payout Number</td><td>${data.payoutNumber}</td></tr>
        <tr><td>Bank Tujuan</td><td>${data.bankName}</td></tr>
        <tr><td>No. Rekening</td><td>${data.accountNumber}</td></tr>
        ${data.estimatedDate ? `<tr><td>Estimasi Sampai</td><td>${data.estimatedDate}</td></tr>` : ''}
      </table>
      
      <p>Estimasi waktu pemrosesan: 1-3 hari kerja.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `💰 Permintaan Payout ${data.payoutNumber} Diterima`,
    html: baseTemplate(content),
  });
}

interface PayoutCompletedData {
  userName: string;
  payoutNumber: string;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  transferReference?: string;
}

export async function sendPayoutCompletedEmail(to: string, data: PayoutCompletedData) {
  const content = `
    <div class="content">
      <h2>Payout Berhasil! 🎉</h2>
      <p>Halo ${data.userName},</p>
      <p>Dana Anda telah berhasil ditransfer.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div class="amount">Rp ${data.netAmount.toLocaleString('id-ID')}</div>
        <div class="status-success">✓ Transfer Berhasil</div>
      </div>
      
      <table>
        <tr><td>Payout Number</td><td>${data.payoutNumber}</td></tr>
        <tr><td>Bank Tujuan</td><td>${data.bankName}</td></tr>
        <tr><td>No. Rekening</td><td>${data.accountNumber}</td></tr>
        ${data.transferReference ? `<tr><td>Referensi Transfer</td><td>${data.transferReference}</td></tr>` : ''}
      </table>
      
      <p>Terima kasih telah menggunakan Finding Gems!</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `✅ Payout ${data.payoutNumber} Berhasil`,
    html: baseTemplate(content),
  });
}

// Payout Processed (for both approved and rejected)
interface PayoutProcessedData {
  creatorName: string;
  payoutNumber: string;
  amount: number;
  status: 'completed' | 'rejected';
  rejectionReason?: string;
  transferReference?: string;
}

export async function sendPayoutProcessedEmail(to: string, data: PayoutProcessedData) {
  const isApproved = data.status === 'completed';
  
  const content = isApproved ? `
    <div class="content">
      <h2>Payout Berhasil! 🎉</h2>
      <p>Halo ${data.creatorName},</p>
      <p>Dana Anda telah berhasil ditransfer ke rekening yang terdaftar.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div class="amount">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div class="status-success">✓ Transfer Berhasil</div>
      </div>
      
      <table>
        <tr><td>Payout Number</td><td>${data.payoutNumber}</td></tr>
        ${data.transferReference ? `<tr><td>Referensi Transfer</td><td>${data.transferReference}</td></tr>` : ''}
      </table>
      
      <p>Terima kasih telah menggunakan Finding Gems!</p>
    </div>
  ` : `
    <div class="content">
      <h2>Payout Ditolak</h2>
      <p>Halo ${data.creatorName},</p>
      <p>Maaf, permintaan payout Anda tidak dapat diproses.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; color: #ef4444;">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div class="status-failed">✗ Payout Ditolak</div>
      </div>
      
      <table>
        <tr><td>Payout Number</td><td>${data.payoutNumber}</td></tr>
        ${data.rejectionReason ? `<tr><td>Alasan</td><td>${data.rejectionReason}</td></tr>` : ''}
      </table>
      
      <p>Dana Anda akan dikembalikan ke saldo available. Silakan periksa kembali informasi rekening dan coba lagi.</p>
      <p>Jika ada pertanyaan, silakan hubungi support kami.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: isApproved 
      ? `✅ Payout ${data.payoutNumber} Berhasil`
      : `❌ Payout ${data.payoutNumber} Ditolak`,
    html: baseTemplate(content),
  });
}

// ============================================
// REFUND EMAILS
// ============================================

interface RefundStatusData {
  userName: string;
  refundNumber: string;
  orderNumber: string;
  amount: number;
  status: 'approved' | 'rejected' | 'completed';
  message?: string;
}

export async function sendRefundStatusEmail(to: string, data: RefundStatusData) {
  const statusText = {
    approved: { title: 'Refund Disetujui', emoji: '✅', color: '#10b981' },
    rejected: { title: 'Refund Ditolak', emoji: '❌', color: '#ef4444' },
    completed: { title: 'Refund Selesai', emoji: '💰', color: '#10b981' },
  };

  const status = statusText[data.status];

  const content = `
    <div class="content">
      <h2>${status.title} ${status.emoji}</h2>
      <p>Halo ${data.userName},</p>
      <p>Status refund Anda telah diupdate.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; color: ${status.color};">Rp ${data.amount.toLocaleString('id-ID')}</div>
        <div style="color: ${status.color};">${status.title}</div>
      </div>
      
      <table>
        <tr><td>Refund Number</td><td>${data.refundNumber}</td></tr>
        <tr><td>Order Number</td><td>${data.orderNumber}</td></tr>
        ${data.message ? `<tr><td>Keterangan</td><td>${data.message}</td></tr>` : ''}
      </table>
      
      ${data.status === 'completed' ? '<p>Dana telah dikembalikan ke metode pembayaran asal.</p>' : ''}
      ${data.status === 'rejected' ? '<p>Jika ada pertanyaan, silakan hubungi support kami.</p>' : ''}
    </div>
  `;

  return sendEmail({
    to,
    subject: `${status.emoji} ${status.title} - ${data.refundNumber}`,
    html: baseTemplate(content),
  });
}

// ============================================
// CREATOR SALE NOTIFICATION
// ============================================

interface NewSaleData {
  creatorName: string;
  buyerName: string;
  websiteName: string;
  tierName: string;
  amount: number;
  platformFee: number;
  creatorEarning: number;
  orderNumber: string;
}

export async function sendNewSaleEmail(to: string, data: NewSaleData) {
  const content = `
    <div class="content">
      <h2>Penjualan Baru! 🎉</h2>
      <p>Halo ${data.creatorName},</p>
      <p>Selamat! Anda mendapatkan penjualan baru.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div class="amount">+Rp ${data.creatorEarning.toLocaleString('id-ID')}</div>
        <div style="color: #6b7280; font-size: 14px;">Pendapatan Anda</div>
      </div>
      
      <table>
        <tr><td>Pembeli</td><td>${data.buyerName}</td></tr>
        <tr><td>Produk</td><td>${data.websiteName}</td></tr>
        <tr><td>Tier</td><td>${data.tierName}</td></tr>
        <tr><td>Order Number</td><td>${data.orderNumber}</td></tr>
        <tr><td>Harga Jual</td><td>Rp ${data.amount.toLocaleString('id-ID')}</td></tr>
        <tr><td>Platform Fee</td><td>Rp ${data.platformFee.toLocaleString('id-ID')}</td></tr>
        <tr><td><strong>Pendapatan Anda</strong></td><td><strong>Rp ${data.creatorEarning.toLocaleString('id-ID')}</strong></td></tr>
      </table>
      
      <p>Dana akan tersedia untuk penarikan setelah periode settlement (7 hari).</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/dashboard/sales" class="button">Lihat Dashboard</a>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `💰 Penjualan Baru: ${data.websiteName} - Rp ${data.creatorEarning.toLocaleString('id-ID')}`,
    html: baseTemplate(content),
  });
}

// ============================================
// WELCOME EMAIL
// ============================================

export async function sendWelcomeEmail(to: string, userName: string) {
  const content = `
    <div class="content">
      <h2>Selamat Datang di Finding Gems! 💎</h2>
      <p>Halo ${userName},</p>
      <p>Terima kasih telah bergabung dengan Finding Gems, marketplace untuk menemukan dan menjual website-website berkualitas.</p>
      
      <h3>Apa yang bisa Anda lakukan?</h3>
      <ul>
        <li>🔍 <strong>Temukan</strong> website dan tools terbaik</li>
        <li>💼 <strong>Beli</strong> akses ke produk premium</li>
        <li>💰 <strong>Jual</strong> produk Anda sebagai creator</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/explore" class="button">Mulai Jelajahi</a>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: '💎 Selamat Datang di Finding Gems!',
    html: baseTemplate(content),
  });
}
