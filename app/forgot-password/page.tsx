'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForgotPassword } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

function ForgotPasswordContent() {
  const { showToast } = useToast();
  const forgotPasswordMutation = useForgotPassword();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{email?: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: {email?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setIsSuccess(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (error: any) {
      // Always show success message for security (don't reveal if email exists)
      setIsSuccess(true);
      showToast('If an account exists with that email, a reset link has been sent.', 'success');
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="auth-page"
      >
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="auth-card"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="auth-header"
          >
            <motion.div 
              variants={fadeInUp}
              className="success-icon"
            >
              <CheckCircle size={64} className="text-green-500" />
            </motion.div>
            
            <motion.h1 variants={fadeInUp}>Check your email</motion.h1>
            <motion.p variants={fadeInUp}>
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </motion.p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            <Link href="/login" className="back-link">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </motion.div>
        </motion.div>

        <style jsx>{`
          .auth-page { 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            padding: 32px; 
            background: var(--gray-50); 
          }
          .auth-card { 
            width: 100%; 
            max-width: 400px; 
            padding: 40px; 
            background: var(--background); 
            border-radius: 16px; 
            border: 1px solid var(--gray-200); 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
            text-align: center;
          }
          .auth-header { 
            text-align: center; 
          }
          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
          .auth-header h1 { 
            font-size: 1.5rem; 
            margin-bottom: 16px;
          }
          .auth-header p { 
            color: var(--gray-500); 
            line-height: 1.6;
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--foreground);
            font-weight: 500;
            text-decoration: none;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="auth-page"
    >
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="auth-card"
      >
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="auth-header"
        >
          <motion.div variants={fadeInUp}>
            <Link href="/" className="auth-logo">Dualangka</Link>
          </motion.div>
          <motion.h1 variants={fadeInUp}>Forgot password?</motion.h1>
          <motion.p variants={fadeInUp}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </motion.p>
        </motion.div>

        <motion.form 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="auth-form"
        >
          <motion.div variants={fadeInUp}>
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: undefined});
              }} 
              placeholder="you@example.com" 
              required 
              error={errors.email}
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Button 
              type="submit" 
              fullWidth 
              loading={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="auth-footer"
        >
          <Link href="/login" className="back-link">
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .auth-page { 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 32px; 
          background: var(--gray-50); 
        }
        .auth-card { 
          width: 100%; 
          max-width: 400px; 
          padding: 40px; 
          background: var(--background); 
          border-radius: 16px; 
          border: 1px solid var(--gray-200); 
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }
        .auth-header { 
          text-align: center; 
          margin-bottom: 32px; 
        }
        .auth-logo { 
          font-size: 1.5rem; 
          font-weight: 700; 
        }
        .auth-header h1 { 
          font-size: 1.5rem; 
          margin-top: 24px; 
        }
        .auth-header p { 
          color: var(--gray-500); 
          margin-top: 4px; 
          font-size: 14px;
        }
        .auth-form { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
        }
        .auth-footer { 
          text-align: center; 
          margin-top: 24px; 
          font-size: 14px; 
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-weight: 500;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full"
        />
      </motion.div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
