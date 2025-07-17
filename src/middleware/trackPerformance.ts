import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from './performance';

export function withPerformanceTracking(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();
        const url = new URL(req.url);
        const endpoint = url.pathname + (url.search || '');
        const method = req.method;

        // Extract user information from cookies
        const userId = req.cookies.get('userId')?.value;
        const userEmail = req.cookies.get('userEmail')?.value;
        const userRole = req.cookies.get('userRole')?.value;

        // If user is not authenticated or is a guest, don't use the email/role
        const isAuthenticated = userId && userEmail && userRole;
        const isGuest = !isAuthenticated || userRole === 'guest';

        let response: NextResponse;
        let statusCode = 200;

        try {
            response = await handler(req);
            statusCode = response.status;
            return response;
        } catch (error) {
            statusCode = 500;
            console.error('API Error:', error);
            response = NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
            return response;
        } finally {
            const duration = Date.now() - startTime;
            
            if (!endpoint.includes('/api/performance')) {
                await PerformanceMonitor.addMetric({
                    endpoint,
                    method,
                    duration,
                    statusCode,
                    userAgent: req.headers.get('user-agent') || undefined,
                    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                    userId: isGuest ? undefined : userId,
                    userEmail: isGuest ? undefined : userEmail,
                    userRole: isGuest ? undefined : userRole,
                });
            }
        }
    };
}