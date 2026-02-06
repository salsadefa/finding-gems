"use strict";
// ============================================
// Email Service - Finding Gems Backend
// ============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendPaymentSuccessEmail = sendPaymentSuccessEmail;
exports.sendPaymentFailedEmail = sendPaymentFailedEmail;
exports.sendInvoiceEmail = sendInvoiceEmail;
exports.sendPayoutRequestedEmail = sendPayoutRequestedEmail;
exports.sendPayoutCompletedEmail = sendPayoutCompletedEmail;
exports.sendPayoutProcessedEmail = sendPayoutProcessedEmail;
exports.sendRefundStatusEmail = sendRefundStatusEmail;
exports.sendNewSaleEmail = sendNewSaleEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
// ============================================
// CONFIG
// ============================================
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@findinggems.id';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Finding Gems';
const APP_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
// ============================================
// CORE SEND EMAIL
// ============================================
async function sendEmail(options) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('[Email] SMTP credentials not configured. Email not sent.');
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
    }
    catch (error) {
        console.error('[Email] Failed to send:', error);
        return false;
    }
}
// ============================================
// EMAIL TEMPLATES
// ============================================
const baseTemplate = (content) => `
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
async function sendPaymentSuccessEmail(to, data) {
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
async function sendPaymentFailedEmail(to, data) {
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
async function sendInvoiceEmail(to, data) {
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
async function sendPayoutRequestedEmail(to, data) {
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
async function sendPayoutCompletedEmail(to, data) {
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
async function sendPayoutProcessedEmail(to, data) {
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
async function sendRefundStatusEmail(to, data) {
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
async function sendNewSaleEmail(to, data) {
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
async function sendWelcomeEmail(to, userName) {
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
//# sourceMappingURL=email.service.js.map