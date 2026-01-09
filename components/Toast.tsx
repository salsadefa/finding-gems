'use client';

import { useToast } from '@/lib/store';

export default function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <div className="toast-content">
                        <ToastIcon type={toast.type} />
                        <span className="toast-message">{toast.message}</span>
                    </div>
                    <button
                        className="toast-dismiss"
                        onClick={() => dismissToast(toast.id)}
                    >
                        <CloseIcon />
                    </button>
                </div>
            ))}

            <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          max-width: 400px;
        }
        
        .toast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--foreground);
          color: var(--background);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          animation: slide-in-right 0.2s ease;
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .toast-success {
          background: var(--success);
        }
        
        .toast-error {
          background: var(--error);
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .toast-message {
          font-size: 0.9375rem;
        }
        
        .toast-dismiss {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgb(255 255 255 / 0.2);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: inherit;
          transition: background var(--transition-fast);
        }
        
        .toast-dismiss:hover {
          background: rgb(255 255 255 / 0.3);
        }
      `}</style>
        </div>
    );
}

function ToastIcon({ type }: { type: 'success' | 'error' | 'info' }) {
    if (type === 'success') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        );
    }
    if (type === 'error') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
