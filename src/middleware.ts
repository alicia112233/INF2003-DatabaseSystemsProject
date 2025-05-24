import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path === '/') {
    // Get authentication info from cookies
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/authentication/login', request.url));
    }
    
    // Only redirect admins, let customers stay on home page
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
    // Remove the customer redirect - let them access the home page
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};