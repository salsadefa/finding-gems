'use client';

import { use } from 'react';
import Link from 'next/link';
import { useOrderInvoice } from '@/lib/api/billing';
import { formatPrice } from '@/lib/api/billing';
import { formatDate } from '@/lib/utils';
import Button from '@/components/Button';
import { 
  ArrowLeft, 
  Download, 
  Printer,
  Loader2,
  AlertCircle,
  Building2,
  FileText
} from 'lucide-react';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function InvoicePage({ params }: PageProps) {
  const { orderId } = use(params);
  const { data: invoice, isLoading, error } = useOrderInvoice(orderId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, just print - in production, you'd generate a PDF
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or payment hasn't been completed.</p>
          <Link href="/dashboard/purchases">
            <Button>Back to Purchases</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (hidden when printing) */}
      <header className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/purchases" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold">Invoice</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 print:p-0">
        <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:rounded-none">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Finding Gems</h2>
                  <p className="text-sm text-gray-500">Digital Marketplace</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-lg font-mono text-gray-700">{invoice.invoice_number}</p>
              <p className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === 'paid' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {invoice.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Billed To</h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{invoice.buyer_name}</p>
                <p className="text-gray-600">{invoice.buyer_email}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Seller</h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{invoice.creator_name}</p>
                <p className="text-gray-600">via Finding Gems Platform</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Invoice Date</p>
              <p className="font-medium">{invoice.issued_at ? formatDate(invoice.issued_at) : formatDate(invoice.created_at)}</p>
            </div>
            {invoice.paid_at && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                <p className="font-medium">{formatDate(invoice.paid_at)}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Currency</p>
              <p className="font-medium">{invoice.currency}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-600 w-24">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600 w-32">Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-600 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item: { name: string; price: number; quantity: number; total: number }, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                    </td>
                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-600">{formatPrice(item.price)}</td>
                    <td className="py-4 text-right font-medium text-gray-900">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span>{formatPrice(invoice.platform_fee)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                  <span>Total</span>
                  <span>{formatPrice(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for your purchase!</p>
            <p className="mt-2">
              If you have any questions about this invoice, please contact us at{' '}
              <a href="mailto:support@findinggems.id" className="text-blue-600 hover:underline">
                support@findinggems.id
              </a>
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs">
              <Building2 className="w-4 h-4" />
              <span>Finding Gems - Digital Products Marketplace</span>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
