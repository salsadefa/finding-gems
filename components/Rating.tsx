'use client';
interface RatingProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onChange?: (value: number) => void;
}

export default function Rating({
    value,
    max = 5,
    size = 'md',
    showValue = false,
    interactive = false,
    onChange,
}: RatingProps) {
    const sizes = {
        sm: 14,
        md: 18,
        lg: 24,
    };

    const iconSize = sizes[size];
    const stars = Array.from({ length: max }, (_, i) => i + 1);

    const handleClick = (rating: number) => {
        if (interactive && onChange) {
            onChange(rating);
        }
    };

    return (
        <div className="rating-wrapper">
            <div className="stars">
                {stars.map((star) => (
                    <button
                        key={star}
                        className={`star ${star <= value ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                        onClick={() => handleClick(star)}
                        disabled={!interactive}
                        type="button"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                        <svg
                            width={iconSize}
                            height={iconSize}
                            viewBox="0 0 24 24"
                            fill={star <= value ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                ))}
            </div>
            {showValue && (
                <span className="rating-value">{value.toFixed(1)}</span>
            )}

            <style jsx>{`
        .rating-wrapper {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .stars {
          display: inline-flex;
          gap: 2px;
        }
        
        .star {
          padding: 0;
          background: none;
          border: none;
          color: var(--gray-300);
          cursor: default;
          transition: color var(--transition-fast), transform var(--transition-fast);
        }
        
        .star.filled {
          color: var(--foreground);
        }
        
        .star.interactive {
          cursor: pointer;
        }
        
        .star.interactive:hover {
          transform: scale(1.15);
          color: var(--foreground);
        }
        
        .rating-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
        }
      `}</style>
        </div>
    );
}
