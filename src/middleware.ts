import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple flag that gets reset on server restart
let hasHandledRestart = false;

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const response = NextResponse.next();

    // Check if this is the first request after restart
    if (!hasHandledRestart) {
        hasHandledRestart = true;

        // Only redirect if NOT on home page and has auth cookies
        const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
        const userRole = request.cookies.get('userRole')?.value;

        if (path !== '/' && (isLoggedIn || userRole)) {
            console.log(`Server restart detected - redirecting from ${path} to home`);

            const redirectResponse = NextResponse.redirect(new URL('/', request.url));

            // Clear authentication cookies
            redirectResponse.cookies.set('isLoggedIn', '', {
                expires: new Date(0),
                path: '/',
            });
            redirectResponse.cookies.set('userRole', '', {
                expires: new Date(0),
                path: '/',
            });

            // Add a special header to trigger localStorage clearing
            redirectResponse.headers.set('x-server-restarted', 'true');
            redirectResponse.headers.set('x-clear-storage', 'true');

            return redirectResponse;
        }

        // If on home page, just clear cookies without redirect
        if (path === '/' && (isLoggedIn || userRole)) {
            console.log('Server restart detected on home page - clearing cookies');
            response.cookies.set('isLoggedIn', '', {
                expires: new Date(0),
                path: '/',
            });
            response.cookies.set('userRole', '', {
                expires: new Date(0),
                path: '/',
            });
            response.headers.set('x-server-restarted', 'true');
            response.headers.set('x-clear-storage', 'true');
            return response;
        }

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/products', '/authentication'];
        const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route));

        // Protected routes logic - only redirect if not on a public route
        if (!isPublicRoute && !isLoggedIn) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // No auth cookies found, continue normally
        response.headers.set('x-server-restarted', 'false');
    } else {
        // Normal middleware logic after restart has been handled
        response.headers.set('x-server-restarted', 'false');

        const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
        const userRole = request.cookies.get('userRole')?.value;

        // Home page logic
        if (path === '/') {
            if (isLoggedIn && userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin-dashboard', request.url));
            }
            return response;
        }

        // Protected routes logic
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|authentication|products|logout).*)'],
};