'use client';

import { useEffect, useState } from 'react';
import { usePaymentStatus } from '@/lib/api/billing';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, Copy, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import Button from '@/components/Button';
import { useToast } from '@/lib/store';

interface VAPaymentDisplayProps {
  bankCode: string;
  bankName: string;
  vaNumber: string;
  customerName: string;
  amount: string;
  expiresAt: string;
  instructions: string[];
  transactionId: string;
  orderId: string;
}

// Bank logo mapping - using simple text/colors for now
const bankStyles: Record<string, { bg: string; text: string; border: string }> = {
  BCA: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600' },
  BNI: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-600' },
  BRI: { bg: 'bg-blue-700', text: 'text-white', border: 'border-blue-700' },
  MANDIRI: { bg: 'bg-yellow-500', text: 'text-blue-900', border: 'border-yellow-500' },
  PERMATA: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600' },
  BSI: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
  BJB: { bg: 'bg-green-700', text: 'text-white', border: 'border-green-700' },
  SAHABAT_SAMPOERNA: { bg: 'bg-red-700', text: 'text-white', border: 'border-red-700' },
  CIMB: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' },
};

export default function VAPaymentDisplay({
  bankCode,
  bankName,
  vaNumber,
  customerName,
  amount,
  expiresAt,
  instructions,
  transactionId,
  orderId,
}: VAPaymentDisplayProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Poll payment status every 3 seconds
  const { data: transaction, isLoading } = usePaymentStatus(transactionId, !isExpired);
  
  const bankStyle = bankStyles[bankCode] || { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-600' };
  
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
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}j ${minutes}m`);
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
  
  // Copy VA number
  const copyVANumber = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    showToast('Nomor VA berhasil disalin', 'success');
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isExpired) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Virtual Account Expired</h3>
        <p className="text-gray-500 mb-6">Please create a new Virtual Account to continue payment.</p>
        <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
          Buat VA Baru
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Bank Header */}
      <div className={`${bankStyle.bg} ${bankStyle.text} rounded-xl p-4 flex items-center gap-4`}>
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-sm opacity-80">Transfer ke</p>
          <h3 className="text-lg font-bold">{bankName}</h3>
        </div>
      </div>
      
      {/* VA Number */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Nomor Virtual Account</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl md:text-3xl font-mono font-bold tracking-wider">{vaNumber}</p>
          <button
            onClick={copyVANumber}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Salin nomor VA"
          >
            {copied ? <CheckCircle size={20} className="text-green-400" /> : <Copy size={20} />}
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2">Atas nama: {customerName}</p>
      </div>
      
      {/* Amount */}
      <div className="text-center bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-1">Total Transfer</p>
        <p className="text-3xl font-bold text-gray-900">{amount}</p>
      </div>
      
      {/* Countdown */}
      <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 rounded-lg py-3 px-4">
        <Clock size={20} />
        <span className="font-semibold">Berlaku sampai: {timeLeft}</span>
      </div>
      
      {/* Instructions Accordion */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-900">Cara Pembayaran</span>
          {showInstructions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showInstructions && (
          <div className="p-4 bg-white">
            <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}
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
