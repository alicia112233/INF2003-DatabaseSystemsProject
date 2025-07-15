import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

async function handler() {
    let connection;
    try {
        connection = await pool.getConnection();

        // For demo/testing: just get random games with all fields
        const [games] = await connection.query(
            `SELECT id, title, description, price, image_url, platform FROM Game ORDER BY RAND() LIMIT 5`
        );

        return NextResponse.json({ recommendations: games });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export const GET = withPerformanceTracking(handler);