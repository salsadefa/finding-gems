'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content modal-${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="modal-header">
                        <h2 className="modal-title">{title}</h2>
                        <button className="modal-close" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgb(0 0 0 / 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          z-index: 50;
          animation: fade-in 0.15s ease;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: var(--background);
          border-radius: var(--radius-xl);
          max-height: 90vh;
          overflow-y: auto;
          animation: slide-up 0.2s ease;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-sm {
          width: 100%;
          max-width: 400px;
        }
        
        .modal-md {
          width: 100%;
          max-width: 500px;
        }
        
        .modal-lg {
          width: 100%;
          max-width: 700px;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .modal-title {
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--gray-500);
          transition: all var(--transition-fast);
        }
        
        .modal-close:hover {
          background: var(--gray-100);
          color: var(--foreground);
        }
        
        .modal-body {
          padding: var(--space-6);
        }
      `}</style>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
