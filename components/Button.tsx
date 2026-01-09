'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
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
        }
        
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }
        
        .btn-secondary {
          background: transparent;
          color: var(--foreground);
          border-color: var(--gray-300);
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: var(--gray-100);
          border-color: var(--gray-400);
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
          opacity: 0.9;
        }
        
        .full-width {
          width: 100%;
        }
      `}</style>
        </button>
    );
}

function Spinner() {
    return (
        <svg
            className="spinner"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle className="spinner-circle" cx="12" cy="12" r="10" />
            <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        .spinner-circle {
          stroke-dasharray: 50;
          stroke-dashoffset: 35;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </svg>
    );
}
