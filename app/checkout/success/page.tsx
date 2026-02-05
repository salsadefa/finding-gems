'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaymentStatus } from '@/lib/api/billing';
import Button from '@/components/Button';
import { 
  CheckCircle, 
  Loader2, 
  Package, 
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [showConfetti, setShowConfetti] = useState(true);

  // Poll for payment status in case redirect happens before webhook
  const { data: transaction, isLoading } = usePaymentStatus(
    orderId ? `TXN-${Date.now()}` : '', // This is a placeholder - need to get from order
    !!orderId
  );

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4"
    >
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -20, 
                  x: `${Math.random() * 100}%`,
                  rotate: 0,
                  opacity: 1 
                }}
                animate={{ 
                  y: '100vh',
                  rotate: 720,
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: 'easeIn'
                }}
                className="absolute"
              >
                <Sparkles 
                  className="w-4 h-4" 
                  style={{ color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)] }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="mb-6"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={fadeInUp} className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-600 mb-6">
              Thank you for your purchase. Your payment has been processed successfully.
            </motion.p>
          </motion.div>

          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono text-sm font-medium text-gray-900">{orderId}</p>
              </div>
            )}
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-left bg-green-50 rounded-lg p-4 mb-6"
          >
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-semibold text-green-800 mb-2"
            >
              What&apos;s next?
            </motion.h3>
            <motion.ul 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2 text-sm text-green-700"
            >
              {[
                'Access has been granted to your account',
                'Invoice has been sent to your email',
                'You can access your product immediately'
              ].map((item, idx) => (
                <motion.li 
                  key={idx}
                  variants={fadeInUp}
                  className="flex items-start gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Actions */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <motion.div variants={fadeInUp}>
              <Link href="/dashboard/purchases" className="block">
                <Button fullWidth>
                  <Package className="w-4 h-4 mr-2" />
                  View My Purchases
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            
            {orderId && (
              <motion.div variants={fadeInUp}>
                <Link href={`/dashboard/purchases/${orderId}/invoice`} className="block">
                  <Button variant="outline" fullWidth>
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoice
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Need help? <a href="mailto:support@findinggems.id" className="text-blue-600 hover:underline">Contact Support</a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
