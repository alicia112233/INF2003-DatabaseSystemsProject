import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path === '/') {
    // Get authentication info from cookies
    const userRole = request.cookies.get('userRole')?.value;

    // Only redirect admins, let customers stay on home page
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
  }
  else {
    // Get authentication info from cookies
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value;

    // If not logged in, redirect to login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};