'use client';

import { useEffect, useState } from 'react';
import { usePaymentStatus } from '@/lib/api/billing';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, ExternalLink, Smartphone, Monitor, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/Button';

interface EWalletPaymentDisplayProps {
  ewalletCode: string;
  ewalletName: string;
  amount: string;
  checkoutUrl?: string;
  mobileDeeplinkUrl?: string;
  desktopWebUrl?: string;
  expiresAt: string;
  instructions: string[];
  transactionId: string;
  orderId: string;
  onPaymentSuccess?: () => void;
}

const ewalletStyles: Record<string, { bg: string; text: string; icon: string }> = {
  OVO: { bg: 'bg-purple-600', text: 'text-white', icon: 'OVO' },
  DANA: { bg: 'bg-blue-500', text: 'text-white', icon: 'DANA' },
  SHOPEEPAY: { bg: 'bg-orange-500', text: 'text-white', icon: 'SP' },
  LINKAJA: { bg: 'bg-red-600', text: 'text-white', icon: 'LJ' },
  GOPAY: { bg: 'bg-blue-600', text: 'text-white', icon: 'GP' },
};

export default function EWalletPaymentDisplay({
  ewalletCode,
  ewalletName,
  amount,
  checkoutUrl,
  mobileDeeplinkUrl,
  desktopWebUrl,
  expiresAt,
  instructions,
  transactionId,
  orderId,
  onPaymentSuccess,
}: EWalletPaymentDisplayProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { data: transaction, isLoading } = usePaymentStatus(transactionId, !isExpired);
  
  const style = ewalletStyles[ewalletCode] || { bg: 'bg-gray-600', text: 'text-white', icon: 'EW' };
  
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
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
  
  useEffect(() => {
    if (transaction?.status === 'paid') {
      onPaymentSuccess?.();
      router.push(`/checkout/success?order_id=${orderId}`);
    } else if (transaction?.status === 'expired' || transaction?.status === 'failed') {
      setIsExpired(true);
    }
  }, [transaction, router, orderId, onPaymentSuccess]);
  
  const handlePayClick = () => {
    if (isMobile && mobileDeeplinkUrl) {
      window.location.href = mobileDeeplinkUrl;
    } else if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    } else if (desktopWebUrl) {
      window.open(desktopWebUrl, '_blank');
    }
  };
  
  if (isExpired) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Expired</h3>
        <p className="text-gray-500 mb-6">The payment link has expired. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* E-Wallet Header */}
      <div className={`${style.bg} ${style.text} rounded-xl p-4 flex items-center gap-4`}>
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">
          {style.icon}
        </div>
        <div>
          <p className="text-sm opacity-80">Pay with</p>
          <h3 className="text-lg font-bold">{ewalletName}</h3>
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-center bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-1">Total Payment</p>
        <p className="text-3xl font-bold text-gray-900">{amount}</p>
      </div>
      
      {/* Countdown */}
      <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 rounded-lg py-3 px-4">
        <Clock size={20} />
        <span className="font-semibold">Valid until: {timeLeft}</span>
      </div>
      
      {/* Pay Button */}
      <Button 
        onClick={handlePayClick}
        className="w-full flex items-center justify-center gap-2 py-4 text-lg"
      >
        {isMobile ? (
          <>
            <Smartphone size={20} />
            Open {ewalletName} App
          </>
        ) : (
          <>
            <Monitor size={20} />
            Pay with {ewalletName}
          </>
        )}
        <ExternalLink size={18} />
      </Button>
      
      {/* Instructions Accordion */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-900">How to Pay</span>
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
            Checking payment status...
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Waiting for payment...
          </>
        )}
      </div>
    </div>
  );
}
