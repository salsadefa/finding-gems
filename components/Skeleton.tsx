'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export default function Skeleton({
    width = '100%',
    height = 20,
    borderRadius,
    className = '',
    variant = 'text',
}: SkeletonProps) {
    const getBorderRadius = () => {
        if (borderRadius) return borderRadius;
        switch (variant) {
            case 'circular':
                return '9999px';
            case 'rounded':
                return 'var(--radius-lg)';
            case 'rectangular':
                return '0';
            default:
                return 'var(--radius-md)';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`skeleton ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: getBorderRadius(),
            }}
        >
            <style jsx>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            var(--gray-100) 25%,
            var(--gray-200) 50%,
            var(--gray-100) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </motion.div>
    );
}

// Pre-made skeleton patterns
export function WebsiteCardSkeleton() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-skeleton"
        >
            <Skeleton height={160} borderRadius="var(--radius-lg) var(--radius-lg) 0 0" />
            <div className="card-skeleton-body">
                <Skeleton width={80} height={14} />
                <Skeleton height={20} />
                <Skeleton height={14} />
                <Skeleton width="70%" height={14} />
                <div className="card-skeleton-footer">
                    <Skeleton width={100} height={24} borderRadius="var(--radius-full)" />
                    <Skeleton width={80} height={18} />
                </div>
            </div>

            <style jsx>{`
        .card-skeleton {
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .card-skeleton-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        
        .card-skeleton-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--gray-100);
        }
      `}</style>
        </motion.div>
    );
}

export function ListItemSkeleton() {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="list-skeleton"
        >
            <Skeleton width={48} height={48} borderRadius="var(--radius-full)" />
            <div className="list-skeleton-content">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={14} />
            </div>

            <style jsx>{`
        .list-skeleton {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
        }
        
        .list-skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
      `}</style>
        </motion.div>
    );
}

export function TableRowSkeleton() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="table-row-skeleton"
        >
            <Skeleton width={40} height={40} borderRadius="var(--radius-md)" />
            <Skeleton width="25%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="10%" height={16} />
            <Skeleton width={80} height={32} borderRadius="var(--radius-md)" />

            <style jsx>{`
        .table-row-skeleton {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          border-bottom: 1px solid var(--gray-100);
        }
      `}</style>
        </motion.div>
    );
}

// Enhanced skeleton variants for specific use cases
export function HeroSkeleton() {
    return (
        <div className="hero-skeleton">
            <Skeleton height={32} width={200} className="mb-4" />
            <Skeleton height={64} width="80%" className="mb-4" />
            <Skeleton height={24} width="60%" className="mb-8" />
            <Skeleton height={48} width={300} borderRadius="var(--radius-full)" />
            
            <style jsx>{`
        .hero-skeleton {
          padding: var(--space-8) 0;
        }
      `}</style>
        </div>
    );
}

export function CategoryCardSkeleton() {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="category-skeleton"
        >
            <Skeleton width={40} height={40} borderRadius="var(--radius-lg)" className="mb-3" />
            <Skeleton width="70%" height={20} className="mb-2" />
            <Skeleton width="50%" height={14} />
            
            <style jsx>{`
        .category-skeleton {
          padding: var(--space-6);
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
        }
      `}</style>
        </motion.div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="product-detail-skeleton">
            <div className="product-detail-main">
                <Skeleton height={400} borderRadius="var(--radius-xl)" className="mb-6" />
                <Skeleton height={32} width="60%" className="mb-4" />
                <Skeleton height={20} className="mb-2" />
                <Skeleton height={20} width="90%" className="mb-2" />
                <Skeleton height={20} width="80%" />
            </div>
            <div className="product-detail-sidebar">
                <Skeleton height={200} borderRadius="var(--radius-xl)" className="mb-6" />
                <Skeleton height={120} borderRadius="var(--radius-xl)" />
            </div>
            
            <style jsx>{`
        .product-detail-skeleton {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-8);
          padding: var(--space-8) 0;
        }
        
        @media (max-width: 1024px) {
          .product-detail-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

export function DashboardStatsSkeleton() {
    return (
        <div className="stats-grid-skeleton">
            {[...Array(4)].map((_, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="stat-card-skeleton"
                >
                    <Skeleton width={40} height={40} borderRadius="var(--radius-lg)" className="mb-4" />
                    <Skeleton width={100} height={32} className="mb-2" />
                    <Skeleton width={80} height={16} />
                </motion.div>
            ))}
            
            <style jsx>{`
        .stats-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1024px) {
          .stats-grid-skeleton {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .stats-grid-skeleton {
            grid-template-columns: 1fr;
          }
        }
        
        .stat-card-skeleton {
          padding: var(--space-6);
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
        }
      `}</style>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="profile-skeleton">
            <div className="profile-header-skeleton">
                <Skeleton width={120} height={120} borderRadius="var(--radius-full)" className="mb-4" />
                <Skeleton width={200} height={28} className="mb-2" />
                <Skeleton width={150} height={16} />
            </div>
            <div className="profile-content-skeleton">
                <Skeleton height={200} borderRadius="var(--radius-xl)" />
            </div>
            
            <style jsx>{`
        .profile-skeleton {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-8);
          padding: var(--space-8) 0;
        }
        
        @media (max-width: 768px) {
          .profile-skeleton {
            grid-template-columns: 1fr;
          }
        }
        
        .profile-header-skeleton {
          text-align: center;
        }
      `}</style>
        </div>
    );
}

export function CheckoutSkeleton() {
    return (
        <div className="checkout-skeleton">
            <div className="checkout-steps-skeleton">
                <Skeleton height={8} width="100%" borderRadius="var(--radius-full)" className="mb-8" />
            </div>
            <div className="checkout-content-skeleton">
                <div className="checkout-form-skeleton">
                    <Skeleton height={48} className="mb-4" />
                    <Skeleton height={48} className="mb-4" />
                    <Skeleton height={48} className="mb-4" />
                    <Skeleton height={120} />
                </div>
                <div className="checkout-summary-skeleton">
                    <Skeleton height={300} borderRadius="var(--radius-xl)" />
                </div>
            </div>
            
            <style jsx>{`
        .checkout-skeleton {
          max-width: 1000px;
          margin: 0 auto;
          padding: var(--space-8) 0;
        }
        
        .checkout-content-skeleton {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-8);
        }
        
        @media (max-width: 900px) {
          .checkout-content-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="search-results-skeleton">
            <div className="search-filters-skeleton">
                <Skeleton height={40} width={120} borderRadius="var(--radius-full)" className="mb-4" />
                <Skeleton height={200} borderRadius="var(--radius-xl)" />
            </div>
            <div className="search-grid-skeleton">
                {[...Array(count)].map((_, i) => (
                    <WebsiteCardSkeleton key={i} />
                ))}
            </div>
            
            <style jsx>{`
        .search-results-skeleton {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-8);
        }
        
        @media (max-width: 1024px) {
          .search-results-skeleton {
            grid-template-columns: 1fr;
          }
          
          .search-filters-skeleton {
            display: none;
          }
        }
        
        .search-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }
        
        @media (max-width: 1280px) {
          .search-grid-skeleton {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .search-grid-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="table-skeleton">
            <div className="table-header-skeleton">
                <Skeleton width={40} height={20} />
                <Skeleton width="25%" height={20} />
                <Skeleton width="15%" height={20} />
                <Skeleton width="10%" height={20} />
                <Skeleton width={80} height={20} />
            </div>
            {[...Array(rows)].map((_, i) => (
                <TableRowSkeleton key={i} />
            ))}
            
            <style jsx>{`
        .table-skeleton {
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        
        .table-header-skeleton {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--gray-50);
          border-bottom: 1px solid var(--gray-200);
        }
      `}</style>
        </div>
    );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
    return (
        <div className="form-skeleton">
            {[...Array(fields)].map((_, i) => (
                <div key={i} className="form-field-skeleton">
                    <Skeleton width={100} height={16} className="mb-2" />
                    <Skeleton height={48} borderRadius="var(--radius-lg)" />
                </div>
            ))}
            <Skeleton height={48} width={150} borderRadius="var(--radius-full)" className="mt-6" />
            
            <style jsx>{`
        .form-skeleton {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
      `}</style>
        </div>
    );
}
