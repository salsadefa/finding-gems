'use client';
import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}, ref) => {
    return (
        <motion.button
            ref={ref}
            whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : undefined}
            whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'full-width' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Spinner />}
            {children}

            <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-weight: 500;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        
        .btn:focus-visible {
          outline: none;
          ring: 2px;
          ring-offset: 2px;
          ring-color: var(--foreground);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-sm {
          padding: var(--space-2) var(--space-3);
          font-size: 0.8125rem;
        }
        
        .btn-md {
          padding: var(--space-3) var(--space-5);
          font-size: 0.875rem;
        }
        
        .btn-lg {
          padding: var(--space-4) var(--space-6);
          font-size: 1rem;
        }
        
        .btn-primary {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        
        .btn-primary:hover:not(:disabled) {
          background: var(--gray-800);
          border-color: var(--gray-800);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        .btn-secondary {
          background: transparent;
          color: var(--foreground);
          border-color: var(--gray-300);
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: var(--gray-100);
          border-color: var(--gray-400);
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        
        .btn-ghost {
          background: transparent;
          color: var(--foreground);
          border-color: transparent;
        }
        
        .btn-ghost:hover:not(:disabled) {
          background: var(--gray-100);
        }
        
        .btn-danger {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          box-shadow: 0 4px 6px -1px rgb(220 38 38 / 0.2);
        }
        
        .btn-outline {
          background: transparent;
          color: var(--gray-700);
          border-color: var(--gray-300);
        }
        
        .btn-outline:hover:not(:disabled) {
          background: var(--gray-50);
          border-color: var(--gray-400);
        }
        
        .full-width {
          width: 100%;
        }
      `}</style>
        </motion.button>
    );
});

Button.displayName = 'Button';

function Spinner() {
    return (
        <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle className="spinner-circle" cx="12" cy="12" r="10" />
            <style jsx>{`
        .spinner-circle {
          stroke-dasharray: 50;
          stroke-dashoffset: 35;
        }
      `}</style>
        </motion.svg>
    );
}

export default Button;
