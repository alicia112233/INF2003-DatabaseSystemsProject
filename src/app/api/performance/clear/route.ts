import { NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/middleware/performance';

export async function DELETE() {
    try {
        await PerformanceMonitor.clearMetrics();
        return NextResponse.json({ message: 'Performance data cleared successfully' });
    } catch (error) {
        console.error('Failed to clear performance data:', error);
        return NextResponse.json(
            { error: 'Failed to clear performance data' },
            { status: 500 }
        );
    }
}