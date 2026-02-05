'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.main>
  );
}
