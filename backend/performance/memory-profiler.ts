import { performance, PerformanceObserver } from 'perf_hooks';

interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
}

class MemoryProfiler {
    private snapshots: MemorySnapshot[] = [];
    private observer: PerformanceObserver;
    private isRunning = false;

    constructor() {
        this.observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.entryType === 'measure') {
                    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
                }
            });
        });
    }

    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.observer.observe({ entryTypes: ['measure'] });

        // Take initial snapshot
        this.takeSnapshot();

        // Set up periodic snapshots
        const interval = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(interval);
                return;
            }
            this.takeSnapshot();
        }, 5000); // Every 5 seconds
    }

    stop(): void {
        this.isRunning = false;
        this.observer.disconnect();
    }

    takeSnapshot(): MemorySnapshot {
        const memUsage = process.memoryUsage();
        const snapshot: MemorySnapshot = {
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss,
            arrayBuffers: memUsage.arrayBuffers,
        };

        this.snapshots.push(snapshot);

        // Keep only last 1000 snapshots
        if (this.snapshots.length > 1000) {
            this.snapshots.shift();
        }

        return snapshot;
    }

    measureFunction<T>(name: string, fn: () => T): T {
        performance.mark(`${name}-start`);
        const result = fn();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return result;
    }

    async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
        performance.mark(`${name}-start`);
        const result = await fn();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return result;
    }

    getMemoryTrend(): {
        trend: 'increasing' | 'decreasing' | 'stable';
        averageGrowth: number;
        peakUsage: number;
        currentUsage: number;
    } {
        if (this.snapshots.length < 2) {
            return {
                trend: 'stable',
                averageGrowth: 0,
                peakUsage: 0,
                currentUsage: 0,
            };
        }

        const recent = this.snapshots.slice(-10); // Last 10 snapshots
        const growthRates = [];

        for (let i = 1; i < recent.length; i++) {
            const growth = (recent[i].heapUsed - recent[i - 1].heapUsed) / recent[i - 1].heapUsed;
            growthRates.push(growth);
        }

        const averageGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
        const peakUsage = Math.max(...this.snapshots.map(s => s.heapUsed));
        const currentUsage = this.snapshots[this.snapshots.length - 1].heapUsed;

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (averageGrowth > 0.01) trend = 'increasing';
        else if (averageGrowth < -0.01) trend = 'decreasing';

        return {
            trend,
            averageGrowth,
            peakUsage,
            currentUsage,
        };
    }

    detectMemoryLeaks(): {
        hasLeak: boolean;
        severity: 'low' | 'medium' | 'high';
        details: string;
    } {
        const trend = this.getMemoryTrend();

        if (trend.trend === 'increasing' && trend.averageGrowth > 0.05) {
            return {
                hasLeak: true,
                severity: 'high',
                details: `Memory usage increasing by ${(trend.averageGrowth * 100).toFixed(2)}% per interval`,
            };
        }

        if (trend.trend === 'increasing' && trend.averageGrowth > 0.02) {
            return {
                hasLeak: true,
                severity: 'medium',
                details: `Gradual memory increase detected: ${(trend.averageGrowth * 100).toFixed(2)}% per interval`,
            };
        }

        if (trend.currentUsage > trend.peakUsage * 0.9) {
            return {
                hasLeak: true,
                severity: 'low',
                details: 'Memory usage near peak levels',
            };
        }

        return {
            hasLeak: false,
            severity: 'low',
            details: 'No memory leaks detected',
        };
    }

    generateReport(): string {
        const trend = this.getMemoryTrend();
        const leakDetection = this.detectMemoryLeaks();

        return `
=== MEMORY PROFILING REPORT ===

Current Memory Usage: ${(trend.currentUsage / 1024 / 1024).toFixed(2)} MB
Peak Memory Usage: ${(trend.peakUsage / 1024 / 1024).toFixed(2)} MB
Memory Trend: ${trend.trend}
Average Growth Rate: ${(trend.averageGrowth * 100).toFixed(2)}%

Memory Leak Detection:
- Has Leak: ${leakDetection.hasLeak}
- Severity: ${leakDetection.severity}
- Details: ${leakDetection.details}

Total Snapshots: ${this.snapshots.length}
Monitoring Duration: ${this.snapshots.length * 5} seconds
    `;
    }

    getSnapshots(): MemorySnapshot[] {
        return [...this.snapshots];
    }
}

// Global profiler instance
const globalProfiler = new MemoryProfiler();

export { MemoryProfiler, globalProfiler };