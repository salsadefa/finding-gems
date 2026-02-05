'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRefresh = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-fallback">
      <div className="error-container">
        <div className="error-icon">
          <AlertTriangle size={48} />
        </div>
        
        <h1 className="error-title">Something went wrong</h1>
        
        <p className="error-message">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error details (development only)</summary>
            <pre className="error-stack">{error.message}</pre>
          </details>
        )}
        
        <div className="error-actions">
          <Button onClick={handleRefresh} variant="primary">
            <RefreshCw size={18} />
            Try Again
          </Button>
          
          <Button onClick={handleGoHome} variant="secondary">
            <Home size={18} />
            Go Home
          </Button>
        </div>
      </div>

      <style jsx>{`
        .error-fallback {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          background: var(--background);
        }

        .error-container {
          max-width: 480px;
          width: 100%;
          text-align: center;
          padding: var(--space-8);
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
        }

        .error-icon {
          color: var(--error);
          margin-bottom: var(--space-4);
          display: flex;
          justify-content: center;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: var(--space-3);
        }

        .error-message {
          font-size: 1rem;
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: var(--space-6);
        }

        .error-details {
          margin-bottom: var(--space-6);
          text-align: left;
          background: var(--gray-100);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .error-details summary {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          user-select: none;
        }

        .error-stack {
          margin-top: var(--space-3);
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--error);
          white-space: pre-wrap;
          word-break: break-word;
          background: var(--gray-50);
          padding: var(--space-3);
          border-radius: var(--radius-sm);
          overflow-x: auto;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        @media (min-width: 480px) {
          .error-actions {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
