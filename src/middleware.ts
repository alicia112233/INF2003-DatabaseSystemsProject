import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if we're on the home page
  if (path === '/') {
    // Get authentication info from cookies
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/authentication/login', request.url));
    }
    
    // Redirect based on user role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    } else if (userRole === 'customer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/'],
};