import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

function toProperCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function GET() {
    try {
        const rows = await executeQuery(`
            SELECT DISTINCT id, name 
            FROM Genre 
            ORDER BY name ASC
        `);

        const formattedGenres = (rows as any[]).map(genre => ({
            ...genre,
            name: toProperCase(genre.name),
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