import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
    try {
        // For demo/testing: just get random games with all fields
        const games = await executeQuery(
            `SELECT id, title, description, price, image_url, platform FROM Game ORDER BY RAND() LIMIT 5`
        );

        return NextResponse.json({ recommendations: games });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }
}