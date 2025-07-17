import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/middleware/performance';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        const timeframe = searchParams.get('timeframe') || '1h';

        const metrics = await PerformanceMonitor.getMetrics();
        const now = new Date();
        const timeframeMs = getTimeframeMs(timeframe);

        const filteredMetrics = metrics.filter(m =>
            now.getTime() - m.timestamp.getTime() <= timeframeMs &&
            (!endpoint || m.endpoint.includes(endpoint))
        );

        const analysis = {
            totalRequests: filteredMetrics.length,
            averageResponseTime: filteredMetrics.length > 0 
                ? filteredMetrics.reduce((sum, m) => sum + m.duration, 0) / filteredMetrics.length 
                : 0,
            slowestRequests: filteredMetrics
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 10),
            errorRate: filteredMetrics.length > 0 
                ? (filteredMetrics.filter(m => m.statusCode >= 400).length / filteredMetrics.length) * 100 
                : 0,
            memoryStats: PerformanceMonitor.getMemoryStats(),
            endpointStats: getEndpointStats(filteredMetrics),
            timeSeriesData: getTimeSeriesData(filteredMetrics, timeframe),
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Performance API error:', error);
        return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
    }
}

function getTimeframeMs(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
    };
    return timeframes[timeframe] || timeframes['1h'];
}

function getEndpointStats(metrics: any[]) {
    const endpointMap = new Map();

    metrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        if (!endpointMap.has(key)) {
            endpointMap.set(key, {
                endpoint: metric.endpoint,
                method: metric.method,
                count: 0,
                totalTime: 0,
                errors: 0,
                userEmail: metric.userEmail || 'Anonymous',
                userRole: metric.userRole,
                ip: metric.ip,
            });
        }

        const stats = endpointMap.get(key);
        stats.count++;
        stats.totalTime += metric.duration;
        if (metric.statusCode >= 400) stats.errors++;
    });

    return Array.from(endpointMap.values()).map(stats => ({
        ...stats,
        averageTime: stats.totalTime / stats.count,
        errorRate: (stats.errors / stats.count) * 100,
    }));
}

function getTimeSeriesData(metrics: any[], timeframe: string) {
    const bucketSize = getBucketSize(timeframe);
    const buckets = new Map();

    metrics.forEach(metric => {
        const bucketKey = Math.floor(metric.timestamp.getTime() / bucketSize) * bucketSize;
        if (!buckets.has(bucketKey)) {
            buckets.set(bucketKey, {
                timestamp: bucketKey,
                requests: 0,
                totalTime: 0,
                errors: 0,
            });
        }

        const bucket = buckets.get(bucketKey);
        bucket.requests++;
        bucket.totalTime += metric.duration;
        if (metric.statusCode >= 400) bucket.errors++;
    });

    return Array.from(buckets.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(bucket => ({
            ...bucket,
            averageTime: bucket.totalTime / bucket.requests,
        }));
}

function getBucketSize(timeframe: string): number {
    const bucketSizes: { [key: string]: number } = {
        '5m': 30 * 1000,    // 30 seconds
        '15m': 60 * 1000,   // 1 minute
        '1h': 5 * 60 * 1000, // 5 minutes
        '24h': 60 * 60 * 1000, // 1 hour
        '7d': 6 * 60 * 60 * 1000, // 6 hours
    };
    return bucketSizes[timeframe] || bucketSizes['1h'];
}