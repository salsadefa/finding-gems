'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useToast } from '@/lib/store';
import { useWebsite, useWebsiteBySlug } from '@/lib/api/websites';
import {
  useWebsitePricing,
  useCreateOrder,
  useInitiatePayment,
  useCreateQRISPayment,
  useCreateVAPayment,
  useCreateEWalletPayment,
  formatPrice
} from '@/lib/api/billing';
import Button from '@/components/Button';
import { CheckoutSkeleton } from '@/components/Skeleton';
import QRISPaymentDisplay from '@/components/payment/QRISPaymentDisplay';
import VAPaymentDisplay from '@/components/payment/VAPaymentDisplay';
import EWalletPaymentDisplay from '@/components/payment/EWalletPaymentDisplay';
import { BankSelector, EWalletSelector, type EWalletOption } from '@/components/payment/PaymentMethodSelector';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Wallet,
  QrCode,
  Building2,
  Loader2,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations';

type PaymentMethod = 'bank_transfer' | 'qris' | 'virtual_account' | 'ewallet';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan dengan semua e-wallet & m-banking',
    icon: <QrCode className="w-6 h-6" />,
  },
  {
    id: 'virtual_account',
    name: 'Virtual Account',
    description: 'Transfer via BCA, Mandiri, BNI, BRI',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: 'ewallet',
    name: 'E-Wallet',
    description: 'OVO, DANA, ShopeePay, LinkAja, GoPay',
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer Manual',
    description: 'Transfer manual dengan konfirmasi',
    icon: <CreditCard className="w-6 h-6" />,
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Support multiple param formats: ?website=uuid, ?websiteId=uuid, ?slug=slug
  const websiteId = searchParams.get('website') || searchParams.get('websiteId');
  const slug = searchParams.get('slug');
  const tierId = searchParams.get('tier');

  // Use appropriate hook based on param type
  const { data: websiteById, isLoading: websiteByIdLoading } = useWebsite(websiteId || '');
  const { data: websiteBySlug, isLoading: websiteBySlugLoading } = useWebsiteBySlug(slug || '');
  
  // Determine which website data to use
  const website = websiteById || websiteBySlug;
  const websiteLoading = websiteByIdLoading || websiteBySlugLoading;
  const finalWebsiteId = website?.id || websiteId || '';
  
  const { data: pricingTiers, isLoading: pricingLoading } = useWebsitePricing(finalWebsiteId);
  
  const createOrderMutation = useCreateOrder();
  const initiatePaymentMutation = useInitiatePayment();
  const createQRISMutation = useCreateQRISPayment();
  const createVAMutation = useCreateVAPayment();
  const createEWalletMutation = useCreateEWalletPayment();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('qris');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedEWallet, setSelectedEWallet] = useState<EWalletOption | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState<'review' | 'select_bank' | 'select_ewallet' | 'payment' | 'instructions'>('review');
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [qrisData, setQrisData] = useState<any>(null);
  const [vaData, setVaData] = useState<any>(null);
  const [ewalletData, setEwalletData] = useState<any>(null);
  const [orderContext, setOrderContext] = useState<{ orderId: string; amount: number; transactionId: string } | null>(null);

  const CheckoutClarity = () => (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Shield className="w-4 h-4 text-gray-700" />
        What happens after purchase
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">Instant access</p>
          <p className="mt-1">You’ll see your access on the Purchases page after payment is confirmed.</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">Secure checkout</p>
          <p className="mt-1">Payments are handled via supported payment methods with clear instructions.</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">Support</p>
          <p className="mt-1">If something feels off, contact support and we’ll help resolve it.</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Some payment methods can take a few minutes to confirm.
      </p>
    </div>
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirectParam = slug ? `slug=${slug}` : `website=${finalWebsiteId}`;
      router.push(`/login?redirect=/checkout?${redirectParam}`);
    }
  }, [authLoading, isAuthenticated, router, finalWebsiteId, slug]);

  // Get selected tier or default
  const selectedTier = pricingTiers?.find((t: { id: string }) => t.id === tierId) || pricingTiers?.[0];

  const handleProceedToPayment = async () => {
    if (!websiteId || !selectedTier) return;

    try {
      // Create order first
      const orderResult = await createOrderMutation.mutateAsync({
        website_id: websiteId,
        pricing_tier_id: selectedTier.id,
      });

      const orderId = orderResult.order.id;
      const amount = orderResult.order.total_amount || totalAmount;

      // Store order context for display
      setOrderContext({
        orderId,
        amount,
        transactionId: '',
      });

      // Handle different payment methods
      if (selectedPaymentMethod === 'qris') {
        // QRIS: Create payment and show QR code
        const qrisResult = await createQRISMutation.mutateAsync({ order_id: orderId });
        setOrderContext(prev => prev ? { ...prev, transactionId: qrisResult.transaction.transaction_id } : prev);
        setQrisData(qrisResult.payment_details);
        setStep('payment');
        showToast('QR Code berhasil dibuat!', 'success');
      } else if (selectedPaymentMethod === 'virtual_account') {
        // VA: Go to bank selection step
        setStep('select_bank');
      } else if (selectedPaymentMethod === 'ewallet') {
        // E-Wallet: Go to e-wallet selection step
        setStep('select_ewallet');
      } else {
        // Bank Transfer (Manual): Use existing Xendit flow
        const paymentResult = await initiatePaymentMutation.mutateAsync({
          order_id: orderId,
          payment_method: selectedPaymentMethod,
        });

        const instructions = paymentResult.payment_instructions;
        const transaction = paymentResult.transaction;

        setOrderContext(prev => prev ? { ...prev, transactionId: transaction?.transaction_id || '' } : prev);

        // If Xendit returns a checkout_url, redirect to it
        if (instructions?.type === 'xendit' && instructions?.checkout_url) {
          showToast('Redirecting to payment gateway...', 'success');
          setTimeout(() => { window.location.href = instructions.checkout_url as string; }, 100);
          return;
        }

        // Otherwise show manual payment instructions
        setPaymentInstructions(instructions);
        setStep('instructions');
        showToast('Order created! Please complete payment.', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Failed to create order', 'error');
    }
  };

  // Handle VA bank selection confirmation
  const handleVABankConfirm = async () => {
    if (!orderContext?.orderId || !selectedBank) {
      showToast('Please select a bank first', 'error');
      return;
    }

    try {
      const vaResult = await createVAMutation.mutateAsync({
        order_id: orderContext.orderId,
        bank_code: selectedBank,
      });

      setOrderContext(prev => prev ? { ...prev, transactionId: vaResult.transaction.transaction_id } : prev);
      setVaData(vaResult.payment_details);
      setStep('payment');
      showToast('Virtual Account berhasil dibuat!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Failed to create Virtual Account', 'error');
    }
  };

  // Handle E-Wallet selection confirmation
  const handleEWalletConfirm = async () => {
    if (!orderContext?.orderId || !selectedEWallet) {
      showToast('Please select an e-wallet first', 'error');
      return;
    }

    if (selectedEWallet.requiresMobileNumber && !mobileNumber) {
      showToast(`Please enter your ${selectedEWallet.name} mobile number`, 'error');
      return;
    }

    try {
      const ewalletResult = await createEWalletMutation.mutateAsync({
        order_id: orderContext.orderId,
        ewallet_code: selectedEWallet.code,
        mobile_number: selectedEWallet.requiresMobileNumber ? mobileNumber : undefined,
      });

      setOrderContext(prev => prev ? { ...prev, transactionId: ewalletResult.transaction.transaction_id } : prev);
      setEwalletData(ewalletResult.payment_details);
      setStep('payment');
      showToast('E-Wallet payment initiated!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Failed to create E-Wallet payment', 'error');
    }
  };

  // Handle refresh for expired QRIS
  const handleRefreshQRIS = async () => {
    if (!orderContext?.orderId) return;
    
    try {
      const qrisResult = await createQRISMutation.mutateAsync({ order_id: orderContext.orderId });
      setOrderContext(prev => prev ? { ...prev, transactionId: qrisResult.transaction.transaction_id } : prev);
      setQrisData(qrisResult.payment_details);
      showToast('QR Code baru berhasil dibuat!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Failed to refresh QR Code', 'error');
    }
  };

  // Loading states
  if (authLoading || websiteLoading || pricingLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 pt-20"
      >
        <div className="max-w-4xl mx-auto px-4">
          <CheckoutSkeleton />
        </div>
      </motion.div>
    );
  }

  if (!website || !selectedTier) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you&apos;re trying to purchase is not available.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/search" className="text-blue-600 hover:underline">
              Browse Products
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const totalAmount = selectedTier.price + 1000; // Platform fee

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-xl font-semibold">Checkout</h1>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            <AnimatePresence mode="wait">
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Product Summary */}
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <motion.h2 variants={fadeInUp} className="text-lg font-semibold mb-4">Order Summary</motion.h2>
                    <motion.div variants={fadeInUp} className="flex gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={website.thumbnail || '/placeholder-website.png'}
                          alt={website.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{website.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{selectedTier.name}</p>
                        <p className="text-sm text-gray-500">{selectedTier.description}</p>
                        {selectedTier.duration_days && (
                          <p className="text-sm text-blue-600 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {selectedTier.duration_days} days access
                          </p>
                        )}
                        {!selectedTier.duration_days && (
                          <p className="text-sm text-green-600 mt-1">
                            <Check className="w-4 h-4 inline mr-1" />
                            Lifetime access
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatPrice(selectedTier.price)}</p>
                      </div>
                    </motion.div>

                    {/* Features */}
                    {selectedTier.features && selectedTier.features.length > 0 && (
                      <motion.div 
                        variants={fadeInUp}
                        className="mt-4 pt-4 border-t"
                      >
                        <p className="text-sm font-medium text-gray-700 mb-2">Included:</p>
                        <motion.ul 
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-1"
                        >
                          {selectedTier.features.map((feature: string, idx: number) => (
                            <motion.li 
                              key={idx} 
                              variants={fadeInUp}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <Check className="w-4 h-4 text-green-500" />
                              {feature}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Payment Method Selection */}
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <motion.h2 variants={fadeInUp} className="text-lg font-semibold mb-4">Payment Method</motion.h2>
                    <div className="space-y-3">
                      {paymentMethods.map((method, idx) => (
                        <motion.label
                          key={method.id}
                          variants={fadeInUp}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedPaymentMethod === method.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="sr-only"
                          />
                          <motion.div 
                            whileHover={{ rotate: 5 }}
                            className={`p-2 rounded-lg ${
                              selectedPaymentMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {method.icon}
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-5 h-5 text-blue-500" />
                            </motion.div>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {step === 'instructions' && paymentInstructions && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold mb-4">Payment Instructions</h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 rounded-lg p-4 mb-6"
                  >
                    <p className="text-sm text-blue-800">
                      Please complete the payment within <strong>24 hours</strong>. Your order will expire if payment is not received.
                    </p>
                  </motion.div>

                  {/* Amount to Pay */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center py-6 bg-gray-50 rounded-lg mb-6"
                  >
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-gray-900"
                    >
                      {paymentInstructions.formatted_amount || formatPrice(orderContext?.amount || totalAmount)}
                    </motion.p>
                  </motion.div>

                  {/* Bank Transfer Instructions */}
                  {paymentInstructions.type === 'bank_transfer' && (
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      <motion.div variants={fadeInUp} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Bank</p>
                        <p className="font-semibold text-lg">{paymentInstructions.bank_name}</p>
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Account Number</p>
                        <p className="font-mono font-semibold text-lg">{paymentInstructions.account_number}</p>
                      </motion.div>
                      
                      <motion.div variants={fadeInUp} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Account Name</p>
                        <p className="font-semibold">{paymentInstructions.account_name}</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* QR Code */}
                  {paymentInstructions.qr_url && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block"
                      >
                        <Image
                          src={paymentInstructions.qr_url}
                          alt="Payment QR Code"
                          width={200}
                          height={200}
                          className="mx-auto"
                        />
                      </motion.div>
                      <p className="text-sm text-gray-500 mt-2">Scan with your payment app</p>
                    </motion.div>
                  )}

                  {/* Instructions */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                  >
                    <h3 className="font-medium mb-3">How to Pay:</h3>
                    <motion.ol 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      {paymentInstructions.instructions?.map((instruction: string, idx: number) => (
                        <motion.li 
                          key={idx} 
                          variants={fadeInUp}
                          className="flex gap-3 text-sm text-gray-600"
                        >
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium"
                          >
                            {idx + 1}
                          </motion.span>
                          {instruction}
                        </motion.li>
                      ))}
                    </motion.ol>
                  </motion.div>

                  {/* Reference ID */}
                  {(paymentInstructions.transaction_id || orderContext?.transactionId) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-yellow-50 rounded-lg"
                  >
                    <p className="text-sm text-yellow-800">
                      <strong>Reference ID:</strong> {paymentInstructions.transaction_id || orderContext?.transactionId}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Include this reference in your payment notes
                    </p>
                  </motion.div>
                  )}

                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="mt-6 flex gap-4"
                  >
                    <motion.div variants={fadeInUp} className="flex-1">
                      <Link href="/dashboard">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" className="w-full">
                            View My Orders
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="flex-1">
                      <Link href="/">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full">
                            Continue Browsing
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Select Bank Step - for Virtual Account */}
              {step === 'select_bank' && (
                <motion.div
                  key="select_bank"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('review')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pilih Bank</h2>
                  </div>

                  <BankSelector
                    selected={selectedBank}
                    onSelect={setSelectedBank}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 pt-6 border-t"
                  >
                    <Button
                      onClick={handleVABankConfirm}
                      disabled={!selectedBank || createVAMutation.isPending}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {createVAMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Lanjut ke Pembayaran'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Select E-Wallet Step */}
              {step === 'select_ewallet' && (
                <motion.div
                  key="select_ewallet"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('review')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pilih E-Wallet</h2>
                  </div>

                  <EWalletSelector
                    selected={selectedEWallet}
                    onSelect={(ewallet) => {
                      setSelectedEWallet(ewallet);
                      if (!ewallet.requiresMobileNumber) {
                        setMobileNumber('');
                      }
                    }}
                  />

                  {selectedEWallet?.requiresMobileNumber && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor HP {selectedEWallet.name}
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nomor HP terdaftar di {selectedEWallet.name}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 pt-6 border-t"
                  >
                    <Button
                      onClick={handleEWalletConfirm}
                      disabled={!selectedEWallet || createEWalletMutation.isPending || (selectedEWallet?.requiresMobileNumber && !mobileNumber)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {createEWalletMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Lanjut ke Pembayaran'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Payment Display Step - QRIS */}
              {step === 'payment' && qrisData && (
                <motion.div
                  key="payment_qris"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('review')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pembayaran QRIS</h2>
                  </div>

                  <QRISPaymentDisplay
                    qrString={qrisData.qr_string}
                    amount={qrisData.formatted_amount}
                    expiresAt={qrisData.expires_at}
                    instructions={qrisData.instructions}
                    transactionId={orderContext?.transactionId || ''}
                    orderId={orderContext?.orderId || ''}
                    onRefresh={handleRefreshQRIS}
                  />
                </motion.div>
              )}

              {/* Payment Display Step - Virtual Account */}
              {step === 'payment' && vaData && (
                <motion.div
                  key="payment_va"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('select_bank')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pembayaran Virtual Account</h2>
                  </div>

                  <VAPaymentDisplay
                    bankCode={vaData.bank_code}
                    bankName={vaData.bank_name}
                    vaNumber={vaData.virtual_account_number}
                    customerName={vaData.customer_name}
                    amount={vaData.formatted_amount}
                    expiresAt={vaData.expires_at}
                    instructions={vaData.instructions}
                    transactionId={orderContext?.transactionId || ''}
                    orderId={orderContext?.orderId || ''}
                  />
                </motion.div>
              )}

              {/* Select E-Wallet Step */}
              {step === 'select_ewallet' && (
                <motion.div
                  key="select_ewallet"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('review')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pilih E-Wallet</h2>
                  </div>

                  <EWalletSelector
                    selected={selectedEWallet}
                    onSelect={setSelectedEWallet}
                  />

                  {selectedEWallet?.requiresMobileNumber && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor HP {selectedEWallet.name}
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+6281234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 pt-6 border-t"
                  >
                    <Button
                      onClick={handleEWalletConfirm}
                      disabled={!selectedEWallet || createEWalletMutation.isPending || (selectedEWallet?.requiresMobileNumber && !mobileNumber)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {createEWalletMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Lanjut ke Pembayaran'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Payment Display Step - E-Wallet */}
              {step === 'payment' && ewalletData && (
                <motion.div
                  key="payment_ewallet"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('select_ewallet')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <h2 className="text-lg font-semibold">Pembayaran {ewalletData.ewallet_name}</h2>
                  </div>

                  <EWalletPaymentDisplay
                    ewalletCode={ewalletData.ewallet_code}
                    ewalletName={ewalletData.ewallet_name}
                    amount={formatPrice(totalAmount)}
                    checkoutUrl={ewalletData.checkout_url}
                    mobileDeeplinkUrl={ewalletData.mobile_deeplink_url}
                    expiresAt={ewalletData.expires_at}
                    instructions={ewalletData.instructions}
                    transactionId={orderContext?.transactionId || ''}
                    orderId={orderContext?.orderId || ''}
                    onPaymentSuccess={() => router.push(`/checkout/success?order_id=${orderContext?.orderId}`)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <h3 className="font-semibold mb-4">Order Total</h3>
              
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3 text-sm"
              >
                <motion.div variants={fadeInUp} className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(selectedTier.price)}</span>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>{formatPrice(1000)}</span>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp}
                  className="border-t pt-3 flex justify-between font-semibold text-lg"
                >
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </motion.div>
              </motion.div>

              {step === 'review' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleProceedToPayment}
                    className="w-full mt-6"
                    disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
                  >
                    {(createOrderMutation.isPending || initiatePaymentMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>

                  <CheckoutClarity />
                </motion.div>
              )}

              {/* Security Notice */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-start gap-2 text-xs text-gray-500"
              >
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Your payment information is secure and encrypted. We never store your card details.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
