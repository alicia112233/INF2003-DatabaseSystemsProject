import mongoose, { Document, Schema } from 'mongoose';

export interface PerformanceMetricInput {
    endpoint: string;
    method: string;
    duration: number;
    statusCode: number;
    userAgent?: string;
    ip?: string;
    memoryUsage?: NodeJS.MemoryUsage;
    userId?: string;
    userEmail?: string;
    userRole?: string;
}

export interface IPerformanceMetric extends PerformanceMetricInput, Document {
    timestamp: Date;
}

const PerformanceMetricSchema = new Schema<IPerformanceMetric>({
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    duration: { type: Number, required: true },
    statusCode: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    userAgent: { type: String },
    ip: { type: String },
    memoryUsage: { type: Schema.Types.Mixed },
    userId: { type: String },
    userEmail: { type: String },
    userRole: { type: String },
});

export const PerformanceMetricModel =
    mongoose.models.PerformanceMetric ||
    mongoose.model<IPerformanceMetric>('PerformanceMetric', PerformanceMetricSchema);