'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import Skeleton from '@/components/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('buyer' | 'creator' | 'admin')[];
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps protected pages to ensure only authenticated users with proper roles can access.
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute requiredRoles={['creator', 'admin']}>
 *   <CreatorDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role access if requiredRoles specified
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = user.role as 'buyer' | 'creator' | 'admin';
      const hasRequiredRole = requiredRoles.includes(userRole);
      
      if (!hasRequiredRole) {
        // Redirect based on user role
        if (userRole === 'admin') {
          router.replace('/admin');
        } else if (userRole === 'creator') {
          router.replace('/creator');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return <ProtectedRouteLoading />;
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated || !user) {
    return <ProtectedRouteLoading />;
  }

  // Check role access
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user.role as 'buyer' | 'creator' | 'admin';
    if (!requiredRoles.includes(userRole)) {
      return <ProtectedRouteLoading />;
    }
  }

  return <>{children}</>;
}

/**
 * Loading state shown while checking authentication
 */
function ProtectedRouteLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to use for inline auth checks
 */
export function useRequireAuth(options?: { 
  requiredRoles?: ('buyer' | 'creator' | 'admin')[];
  redirectTo?: string;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { requiredRoles, redirectTo = '/login' } = options || {};

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = user.role as 'buyer' | 'creator' | 'admin';
      if (!requiredRoles.includes(userRole)) {
        if (userRole === 'admin') {
          router.replace('/admin');
        } else if (userRole === 'creator') {
          router.replace('/creator');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, redirectTo]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthorized: isAuthenticated && user && (!requiredRoles || requiredRoles.includes(user.role as any)),
  };
}

export default ProtectedRoute;
