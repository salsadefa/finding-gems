'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useToast } from '@/lib/store';
import { useWebsite } from '@/lib/api/websites';
import {
  useWebsitePricing,
  useCreateOrder,
  useInitiatePayment,
  formatPrice
} from '@/lib/api/billing';
import Button from '@/components/Button';
import { CheckoutSkeleton } from '@/components/Skeleton';
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

type PaymentMethod = 'bank_transfer' | 'ewallet' | 'qris';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer via BCA, Mandiri, BNI, BRI',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: 'ewallet',
    name: 'E-Wallet',
    description: 'GoPay, OVO, DANA, ShopeePay',
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan dengan semua e-wallet & m-banking',
    icon: <QrCode className="w-6 h-6" />,
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const websiteId = searchParams.get('website');
  const tierId = searchParams.get('tier');

  const { data: website, isLoading: websiteLoading } = useWebsite(websiteId || '');
  const { data: pricingTiers, isLoading: pricingLoading } = useWebsitePricing(websiteId || '');
  
  const createOrderMutation = useCreateOrder();
  const initiatePaymentMutation = useInitiatePayment();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [step, setStep] = useState<'review' | 'payment' | 'instructions'>('review');
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/checkout?website=${websiteId}`);
    }
  }, [authLoading, isAuthenticated, router, websiteId]);

  // Get selected tier or default
  const selectedTier = pricingTiers?.find((t: { id: string }) => t.id === tierId) || pricingTiers?.[0];

  const handleProceedToPayment = async () => {
    if (!websiteId || !selectedTier) return;

    try {
      // Create order
      const orderResult = await createOrderMutation.mutateAsync({
        website_id: websiteId,
        pricing_tier_id: selectedTier.id,
      });

      // Initiate payment
      const paymentResult = await initiatePaymentMutation.mutateAsync({
        order_id: orderResult.order.id,
        payment_method: selectedPaymentMethod,
      });

      setPaymentInstructions(paymentResult.payment_instructions);
      setStep('instructions');
      showToast('Order created! Please complete payment.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Failed to create order', 'error');
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
                      {paymentInstructions.formatted_amount}
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
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-yellow-50 rounded-lg"
                  >
                    <p className="text-sm text-yellow-800">
                      <strong>Reference ID:</strong> {paymentInstructions.transaction_id}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Include this reference in your payment notes
                    </p>
                  </motion.div>

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
