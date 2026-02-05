'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLogin } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations';

function LoginContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      showToast('Welcome back!', 'success');
      
      // Access user from nested data structure
      const user = result.data.user;
      
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'creator') {
        router.push('/creator');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      showToast(error?.response?.data?.error?.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  // Quick login helpers for testing
  const quickLogin = async (role: 'buyer' | 'creator' | 'admin') => {
    const credentials: Record<string, { email: string; password: string }> = {
      buyer: { email: 'buyer@test.com', password: 'BuyerPass123!' },
      creator: { email: 'creator@test.com', password: 'CreatorPass123!' },
      admin: { email: 'superadmin@findinggems.com', password: 'SuperAdmin123!' }
    };
    
    try {
      const result = await loginMutation.mutateAsync(credentials[role]);
      showToast(`Logged in as ${role}!`, 'success');
      
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'creator') {
        router.push('/creator');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      showToast(error?.response?.data?.error?.message || 'Quick login failed.', 'error');
    }
  };

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
          <motion.h1 variants={fadeInUp}>Welcome back</motion.h1>
          <motion.p variants={fadeInUp}>Sign in to your account</motion.p>
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
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: undefined});
              }} 
              placeholder="••••••••" 
              required 
              error={errors.password}
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Button 
              type="submit" 
              fullWidth 
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="divider"
        >
          <span>or try demo accounts</span>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="demo-buttons"
        >
          <motion.button 
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="demo-btn" 
            onClick={() => quickLogin('buyer')}
            disabled={loginMutation.isPending}
          >
            Login as Buyer
          </motion.button>
          
          <motion.button 
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="demo-btn" 
            onClick={() => quickLogin('creator')}
            disabled={loginMutation.isPending}
          >
            Login as Creator
          </motion.button>
          
          <motion.button 
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="demo-btn" 
            onClick={() => quickLogin('admin')}
            disabled={loginMutation.isPending}
          >
            Login as Admin
          </motion.button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="auth-footer"
        >
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </motion.p>
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
        }
        .auth-form { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
        }
        .divider { 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          margin: 24px 0; 
          color: var(--gray-400); 
          font-size: 12px; 
        }
        .divider::before, .divider::after { 
          content: ''; 
          flex: 1; 
          height: 1px; 
          background: var(--gray-200); 
        }
        .demo-buttons { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
        }
        .demo-btn { 
          padding: 10px; 
          background: var(--gray-100); 
          border: 1px solid var(--gray-200); 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 14px; 
          transition: all 0.2s; 
        }
        .demo-btn:hover:not(:disabled) { 
          background: var(--gray-200); 
        }
        .demo-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-footer { 
          text-align: center; 
          margin-top: 24px; 
          font-size: 14px; 
          color: var(--gray-500); 
        }
        .auth-footer a { 
          color: var(--foreground); 
          font-weight: 500; 
        }
      `}</style>
    </motion.div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
