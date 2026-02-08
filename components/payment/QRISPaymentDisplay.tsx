'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePaymentStatus } from '@/lib/api/billing';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';

interface QRISPaymentDisplayProps {
  qrString: string;
  amount: string;
  expiresAt: string;
  instructions: string[];
  transactionId: string;
  orderId: string;
  onRefresh?: () => void;
}

export default function QRISPaymentDisplay({
  qrString,
  amount,
  expiresAt,
  instructions,
  transactionId,
  orderId,
  onRefresh,
}: QRISPaymentDisplayProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  
  // Poll payment status every 3 seconds
  const { data: transaction, isLoading } = usePaymentStatus(transactionId, !isExpired);
  
  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  // Check payment status
  useEffect(() => {
    if (transaction?.status === 'paid') {
      router.push(`/checkout/success?order_id=${orderId}`);
    } else if (transaction?.status === 'expired' || transaction?.status === 'failed') {
      setIsExpired(true);
    }
  }, [transaction, router, orderId]);
  
  if (isExpired) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Expired</h3>
        <p className="text-gray-500 mb-6">Please generate a new QR code to continue payment.</p>
        {onRefresh && (
          <Button onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw size={18} />
            Generate New QR
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Scan dengan QRIS</h3>
        <p className="text-gray-500">Scan QR code menggunakan aplikasi e-wallet atau mobile banking Anda</p>
      </div>
      
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg">
          <QRCodeSVG
            value={qrString}
            size={280}
            level="M"
            includeMargin={true}
          />
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-center bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
        <p className="text-3xl font-bold text-gray-900">{amount}</p>
      </div>
      
      {/* Countdown */}
      <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 rounded-lg py-3 px-4">
        <Clock size={20} />
        <span className="font-semibold">Berlaku sampai: {timeLeft}</span>
      </div>
      
      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Cara Pembayaran:</h4>
        <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
      
      {/* Status */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Memeriksa status pembayaran...
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Menunggu pembayaran...
          </>
        )}
      </div>
    </div>
  );
}
