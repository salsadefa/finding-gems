import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/creator',
  '/creator/listings',
  '/creator/listings/new',
  '/creator/analytics',
];

// Routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin/creators',
  '/admin/categories',
  '/admin/reports',
];

// Routes that require creator role
const creatorRoutes = [
  '/creator',
  '/creator/listings',
  '/creator/listings/new',
  '/creator/analytics',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies (server-side) - Note: localStorage is not accessible in middleware
  // For real production, you'd want to use httpOnly cookies set by the backend
  // For now, we'll do a client-side redirect check
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isCreatorRoute = creatorRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isAuthRoute = authRoutes.includes(pathname);
  
  // For now, we'll pass through and let client-side handle auth
  // This is because we're using localStorage for tokens (not httpOnly cookies)
  // The individual pages will redirect if user is not authenticated
  
  // In production, consider:
  // 1. Using httpOnly cookies for tokens
  // 2. Creating an API route to verify tokens
  // 3. Using NextAuth.js for proper server-side auth
  
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
