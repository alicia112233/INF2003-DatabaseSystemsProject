import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple flag that gets reset on server restart
let hasHandledRestart = false;

export function middleware(request: NextRequest) {
    // Continue with the request
    const response = NextResponse.next();
     
    // Handle logout route specifically - always process this first
    if (request.nextUrl.pathname === '/logout') {
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
        
        // Add header to trigger localStorage clearing on client side
        redirectResponse.headers.set('x-clear-storage', 'true');
        redirectResponse.headers.set('x-logout-success', 'true');
        
        return redirectResponse;
    }

    // Check if this is the first request after restart
    if (!hasHandledRestart) {
        hasHandledRestart = true;

        // Only redirect if NOT on home page and has auth cookies
        const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
        const userRole = request.cookies.get('userRole')?.value;

        if (request.nextUrl.pathname !== '/' && (isLoggedIn || userRole)) {
            console.log(`Server restart detected - redirecting from ${request.nextUrl.pathname} to home`);

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

            // a special header to trigger localStorage clearing
            redirectResponse.headers.set('x-server-restarted', 'true');
            redirectResponse.headers.set('x-clear-storage', 'true');

            return redirectResponse;
        }

        // If on home page, just clear cookies without redirect
        if (request.nextUrl.pathname === '/' && (isLoggedIn || userRole)) {
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
        const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route));

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
        if (request.nextUrl.pathname === '/') {
            if (isLoggedIn && userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin-dashboard', request.url));
            }
            return response;
        }

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/products', '/authentication'];
        const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route));

        // Protected routes logic - only redirect if not on a public route
        if (!isPublicRoute && !isLoggedIn) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Admin-only routes
        if (path.startsWith('/admin') || path.includes('DashboardLayout') || 
            path.startsWith('/promotion-management') ||
            path.startsWith('/orders-management') || path.startsWith('/rental-management')) {
            if (!isLoggedIn || userRole !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        if (path.startsWith('/profile')) {
            if (!isLoggedIn) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            // Both admin and customer can access profile, so no role restriction here
        }

        // Customer-only routes (cart, wishlist, orders, etc.)
        const customerOnlyRoutes = ['/cart', '/wishlist', '/my-orders'];
        const isCustomerOnlyRoute = customerOnlyRoutes.some(route => path === route || path.startsWith(route));
        
        if (isCustomerOnlyRoute) {
            if (!isLoggedIn || userRole !== 'customer') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|authentication|products).*)'],
};