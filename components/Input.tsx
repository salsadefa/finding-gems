'use client';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', ...props }, ref) => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="input-wrapper"
            >
                {label && <label className="label">{label}</label>}
                <input
                    ref={ref}
                    className={`input ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
                {hint && !error && <span className="hint">{hint}</span>}
                {error && (
                    <motion.span 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error"
                    >
                        {error}
                    </motion.span>
                )}

                <style jsx>{`
          .input-wrapper {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }
          
          .label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--foreground);
          }
          
          .input {
            width: 100%;
            padding: var(--space-3) var(--space-4);
            font-size: 0.9375rem;
            background: var(--background);
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);
          }
          
          .input:focus {
            outline: none;
            border-color: var(--foreground);
            box-shadow: 0 0 0 3px rgb(0 0 0 / 0.05);
            transform: scale(1.01);
          }
          
          .input::placeholder {
            color: var(--gray-400);
          }
          
          .input-error {
            border-color: var(--error);
            animation: shake 0.5s ease-in-out;
          }
          
          .input-error:focus {
            border-color: var(--error);
            box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
          }
          
          .hint {
            font-size: 0.8125rem;
            color: var(--gray-500);
          }
          
          .error {
            font-size: 0.8125rem;
            color: var(--error);
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
            </motion.div>
        );
    }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', ...props }, ref) => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="textarea-wrapper"
            >
                {label && <label className="label">{label}</label>}
                <textarea
                    ref={ref}
                    className={`textarea ${error ? 'textarea-error' : ''} ${className}`}
                    {...props}
                />
                {hint && !error && <span className="hint">{hint}</span>}
                {error && (
                    <motion.span 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="error"
                    >
                        {error}
                    </motion.span>
                )}

                <style jsx>{`
          .textarea-wrapper {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }
          
          .label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--foreground);
          }
          
          .textarea {
            width: 100%;
            min-height: 120px;
            padding: var(--space-3) var(--space-4);
            font-size: 0.9375rem;
            font-family: inherit;
            background: var(--background);
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-md);
            resize: vertical;
            transition: all var(--transition-fast);
          }
          
          .textarea:focus {
            outline: none;
            border-color: var(--foreground);
            box-shadow: 0 0 0 3px rgb(0 0 0 / 0.05);
            transform: scale(1.005);
          }
          
          .textarea::placeholder {
            color: var(--gray-400);
          }
          
          .textarea-error {
            border-color: var(--error);
            animation: shake 0.5s ease-in-out;
          }
          
          .hint {
            font-size: 0.8125rem;
            color: var(--gray-500);
          }
          
          .error {
            font-size: 0.8125rem;
            color: var(--error);
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
            </motion.div>
        );
    }
);

Textarea.displayName = 'Textarea';

export function Select({
    label,
    error,
    hint,
    children,
    ...props
}: InputProps & { children: React.ReactNode }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="select-wrapper"
        >
            {label && <label className="label">{label}</label>}
            <select
                className={`select ${error ? 'select-error' : ''}`}
                {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
                {children}
            </select>
            {hint && !error && <span className="hint">{hint}</span>}
            {error && (
                <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error"
                >
                    {error}
                </motion.span>
            )}

            <style jsx>{`
        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }
        
        .select {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          font-size: 0.9375rem;
          background: var(--background);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right var(--space-3) center;
          padding-right: var(--space-10);
        }
        
        .select:focus {
          outline: none;
          border-color: var(--foreground);
          box-shadow: 0 0 0 3px rgb(0 0 0 / 0.05);
          transform: scale(1.01);
        }
        
        .select-error {
          border-color: var(--error);
          animation: shake 0.5s ease-in-out;
        }
        
        .hint {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }
        
        .error {
          font-size: 0.8125rem;
          color: var(--error);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
        </motion.div>
    );
}
