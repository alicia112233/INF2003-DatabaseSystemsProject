import { NextResponse } from "next/server";
import { executeQuery } from '@/lib/database';

export async function POST() {
    try {
        // Update all existing 'Pending' orders to 'Completed'
        const result = await executeQuery(
            `UPDATE Orders SET status = 'Completed' WHERE status = 'Pending'`
        );

        return NextResponse.json({
            success: true,
            message: `Updated ${(result as any).affectedRows} orders from Pending to Completed`
        });

    } catch (error: any) {
        console.error('Update orders status error:', error);
        return NextResponse.json({
            error: "Failed to update orders status",
            details: error.message
        }, { status: 500 });
    }
}