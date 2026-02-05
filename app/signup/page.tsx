'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRegister } from '@/lib/api/auth';
import { useToast } from '@/lib/store';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Star,
  Gem
} from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const registerMutation = useRegister();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name || name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!username || username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await registerMutation.mutateAsync({
        name,
        username,
        email,
        password,
        role: 'buyer',
      });
      
      showToast('Account created successfully! Welcome to Finding Gems.', 'success');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const benefits = [
    { icon: Sparkles, text: 'Discover curated digital products' },
    { icon: Shield, text: 'Secure payments & buyer protection' },
    { icon: Zap, text: 'Instant access to purchases' },
    { icon: Users, text: 'Join 10,000+ creators & buyers' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex"
    >
      {/* Left Side - Visual */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-12">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"
              >
                <Gem className="w-6 h-6 text-gray-900" />
              </motion.div>
              <span className="text-2xl font-bold text-white">Finding Gems</span>
            </Link>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Start Your Journey to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Digital Excellence</span>
            </h2>
            
            <p className="text-gray-400 text-lg mb-10 max-w-md">
              Join thousands of creators and buyers discovering the best digital products, tools, and resources.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"
                  >
                    <benefit.icon className="w-5 h-5" />
                  </motion.div>
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">
                "Finding Gems has completely transformed how I discover and purchase digital products. The curation is top-notch!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Alex Chen</p>
                  <p className="text-gray-500 text-xs">Product Designer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white"
      >
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center"
            >
              <Gem className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold">Finding Gems</span>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Free to join</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-500">
              Start discovering amazing tools &amp; websites
            </motion.p>
          </motion.div>

          <motion.form 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <motion.div variants={fadeInUp}>
              <Input 
                label="Full Name" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({...errors, name: undefined});
                }} 
                placeholder="John Doe" 
                required 
                error={errors.name}
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Input 
                label="Username" 
                value={username} 
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({...errors, username: undefined});
                }} 
                placeholder="johndoe" 
                required 
                error={errors.username}
              />
            </motion.div>
            
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
              {/* Password Strength Indicator */}
              {password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <motion.div
                        key={level}
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: 1,
                          backgroundColor: 
                            (password.length >= 8 && level <= 1) ||
                            (/(?=.*[a-z])(?=.*[A-Z])/.test(password) && level <= 2) ||
                            (/(?=.*\d)/.test(password) && level <= 3) ||
                            (password.length >= 12 && level <= 4)
                              ? '#10b981'
                              : '#e5e7eb'
                        }}
                        className="h-1 flex-1 rounded-full origin-left"
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> 8+ chars
                    </span>
                    <span className={`flex items-center gap-1 ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Upper &amp; lower
                    </span>
                    <span className={`flex items-center gap-1 ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Number
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Input 
                label="Confirm Password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
                }} 
                placeholder="••••••••" 
                required 
                error={errors.confirmPassword}
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Button 
                type="submit" 
                fullWidth 
                loading={registerMutation.isPending}
                className="h-12 text-base"
              >
                {registerMutation.isPending ? (
                  'Creating Account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Want to sell your tools?</p>
                <Link 
                  href="/for-creators" 
                  className="text-sm text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 mt-1 hover:underline"
                >
                  Become a Creator
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6 text-sm text-gray-500"
          >
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-gray-900 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.div>
  );
}

export default function SignupPage() {
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
      <SignupContent />
    </Suspense>
  );
}
