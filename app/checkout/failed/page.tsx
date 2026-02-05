'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

function CheckoutFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const reason = searchParams.get('reason');

  const getFailureMessage = () => {
    switch (reason) {
      case 'expired':
        return 'Your payment session has expired. Please try again.';
      case 'declined':
        return 'Your payment was declined. Please check your payment details and try again.';
      case 'cancelled':
        return 'You cancelled the payment. No charges were made.';
      case 'insufficient_balance':
        return 'Insufficient balance. Please check your account balance and try again.';
      default:
        return 'There was an issue processing your payment. Please try again or contact support.';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Failed Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="mb-6"
          >
            <motion.div 
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={fadeInUp} className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-600 mb-6">
              {getFailureMessage()}
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
                <p className="text-sm text-gray-500 mb-1">Order Reference</p>
                <p className="font-mono text-sm font-medium text-gray-900">{orderId}</p>
              </div>
            )}
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-left bg-yellow-50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">What can you do?</h3>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• Check your payment method and try again</li>
                  <li>• Use a different payment method</li>
                  <li>• Contact your bank if the issue persists</li>
                  <li>• Reach out to our support team</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {orderId ? (
              <motion.div variants={fadeInUp}>
                <Link href={`/checkout?website=${orderId}`} className="block">
                  <Button fullWidth>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp}>
                <Link href="/" className="block">
                  <Button fullWidth>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            )}
            
            <motion.div variants={fadeInUp}>
              <a href="mailto:support@findinggems.id" className="block">
                <Button variant="outline" fullWidth>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          No charges were made to your account for this transaction.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutFailedContent />
    </Suspense>
  );
}
