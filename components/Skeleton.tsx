'use client';
interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}

export default function Skeleton({
    width = '100%',
    height = 20,
    borderRadius,
    className = '',
}: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: borderRadius || 'var(--radius-md)',
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
        </div>
    );
}

// Pre-made skeleton patterns
export function WebsiteCardSkeleton() {
    return (
        <div className="card-skeleton">
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
        </div>
    );
}

export function ListItemSkeleton() {
    return (
        <div className="list-skeleton">
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
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="table-row-skeleton">
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
        </div>
    );
}
