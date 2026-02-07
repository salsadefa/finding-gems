'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useResetPassword } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const resetPasswordMutation = useResetPassword();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Get token from URL
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing reset token', 'error');
    }
  }, [token, showToast]);

  const validateForm = () => {
    const newErrors: {password?: string; confirmPassword?: string} = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!token) {
      showToast('Invalid reset token', 'error');
      return;
    }
    
    try {
      await resetPasswordMutation.mutateAsync({ token, password });
      setIsSuccess(true);
      showToast('Password reset successfully!', 'success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to reset password. Please try again.', 'error');
    }
  };

  if (!token) {
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
            <p className="text-gray-500 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Request a new reset link
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
            
            <motion.h1 variants={fadeInUp}>Password reset!</motion.h1>
            <motion.p variants={fadeInUp}>
              Your password has been reset successfully. You will be redirected to the login page shortly.
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
              Go to login
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
          <motion.h1 variants={fadeInUp}>Reset password</motion.h1>
          <motion.p variants={fadeInUp}>
            Enter your new password below.
          </motion.p>
        </motion.div>

        <motion.form 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="auth-form"
        >
          <motion.div variants={fadeInUp} className="password-input-wrapper">
            <Input 
              label="New Password" 
              type={showPassword ? 'text' : 'password'}
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: undefined});
              }} 
              placeholder="••••••••" 
              required 
              error={errors.password}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="password-input-wrapper">
            <Input 
              label="Confirm Password" 
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
              }} 
              placeholder="••••••••" 
              required 
              error={errors.confirmPassword}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>

          <motion.div variants={fadeInUp} className="password-requirements">
            <p className="text-xs text-gray-500">Password must:</p>
            <ul className="text-xs text-gray-500 mt-1 space-y-1">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                {password.length >= 8 ? '✓' : '○'} Be at least 8 characters
              </li>
              <li className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}>
                {/(?=.*[a-z])/.test(password) ? '✓' : '○'} Include lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}>
                {/(?=.*[A-Z])/.test(password) ? '✓' : '○'} Include uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(password) ? 'text-green-600' : ''}>
                {/(?=.*\d)/.test(password) ? '✓' : '○'} Include number
              </li>
            </ul>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Button 
              type="submit" 
              fullWidth 
              loading={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
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
        .password-input-wrapper {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 38px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gray-400);
          padding: 4px;
        }
        .password-toggle:hover {
          color: var(--gray-600);
        }
        .password-requirements {
          background: var(--gray-50);
          padding: 12px;
          border-radius: 8px;
          margin-top: -8px;
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

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
