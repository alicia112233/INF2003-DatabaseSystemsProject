import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

function toProperCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function handler() {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
        SELECT DISTINCT id, name 
        FROM Genre 
        ORDER BY name ASC
        `);

        connection.release();

        // Format the genre names to proper case
        const formattedGenres = (rows as any[]).map(genre => ({
            ...genre,
            name: toProperCase(genre.name)
        }));

        return NextResponse.json(formattedGenres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        return NextResponse.json(
            { error: 'Failed to fetch genres' },
            { status: 500 }
        );
    }
}

export const GET = withPerformanceTracking(handler);