import { NextRequest, NextResponse } from 'next/server';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

// Define the correct handler type for Next.js API routes
type NextApiHandler = (req: NextRequest) => Promise<NextResponse>;

// Utility to automatically wrap API handlers
export function createTrackedAPI(handlers: {
    GET?: NextApiHandler;
    POST?: NextApiHandler;
    PUT?: NextApiHandler;
    DELETE?: NextApiHandler;
    PATCH?: NextApiHandler;
}) {
    const trackedHandlers: Record<string, NextApiHandler> = {};

    Object.entries(handlers).forEach(([method, handler]) => {
        if (handler) {
            trackedHandlers[method] = withPerformanceTracking(handler);
        }
    });

    return trackedHandlers;
}