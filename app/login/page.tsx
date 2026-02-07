'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLogin } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations';

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
      
      const user = result.data.user;
      
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
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
          
          {/* Header */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div variants={fadeInUp}>
              <Link 
                href="/" 
                className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Dualangka
              </Link>
            </motion.div>
            <motion.h1 
              variants={fadeInUp}
              className="mt-6 text-2xl font-bold text-slate-900"
            >
              Welcome back
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="mt-2 text-sm text-slate-500"
            >
              Sign in to your account
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} 
            className="space-y-5"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-900">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
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

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-slate-400">
                or try demo accounts
              </span>
            </div>
          </div>

          {/* Demo Buttons */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => quickLogin('buyer')}
              disabled={loginMutation.isPending}
            >
              Buyer
            </motion.button>
            
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => quickLogin('creator')}
              disabled={loginMutation.isPending}
            >
              Creator
            </motion.button>
            
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => quickLogin('admin')}
              disabled={loginMutation.isPending}
            >
              Admin
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-slate-500"
          >
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="font-semibold text-slate-900 hover:text-slate-700 transition-colors"
            >
              Sign up
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
