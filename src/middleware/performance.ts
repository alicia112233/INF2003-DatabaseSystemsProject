import dbConnect from '@/utils/mongodb';
import { PerformanceMetricModel, PerformanceMetricInput, IPerformanceMetric } from '../models/PerformanceMetric';

class PerformanceMonitorClass {
    async addMetric(metric: PerformanceMetricInput) {
        await dbConnect();

        const newMetric = new PerformanceMetricModel({
            ...metric,
            timestamp: new Date(),
            memoryUsage: process.memoryUsage(),
        });

        await newMetric.save();
    }

    async getMetrics(): Promise<IPerformanceMetric[]> {
        await dbConnect();
        return PerformanceMetricModel.find().sort({ timestamp: -1 }).limit(1000);
    }

    async getMetricsByUser(userId: string) {
        await dbConnect();
        return PerformanceMetricModel.find({ userId });
    }

    async getMetricsByRole(userRole: string) {
        await dbConnect();
        return PerformanceMetricModel.find({ userRole });
    }

    async getMetricsByEndpoint(endpoint: string) {
        await dbConnect();
        return PerformanceMetricModel.find({ endpoint: { $regex: endpoint } });
    }

    async getMetricsByTimeframe(timeframeMs: number) {
        await dbConnect();
        const since = new Date(Date.now() - timeframeMs);
        return PerformanceMetricModel.find({ timestamp: { $gte: since } });
    }

    async clearMetrics() {
        await dbConnect();
        return PerformanceMetricModel.deleteMany({});
    }

    getMemoryStats() {
        const usage = process.memoryUsage();
        const totalMemory = usage.heapTotal + usage.external + usage.arrayBuffers;
        const usedMemory = usage.heapUsed + usage.external + usage.arrayBuffers;

        return {
            used: usedMemory,
            total: totalMemory,
            percentage: (usedMemory / totalMemory) * 100,
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
        };
    }
}

export const PerformanceMonitor = new PerformanceMonitorClass();