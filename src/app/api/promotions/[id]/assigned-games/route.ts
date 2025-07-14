import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function GET(
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const promotionId = parseInt(id);
        
        if (isNaN(promotionId)) {
            return NextResponse.json(
                { error: 'Invalid promotion ID' },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();
        
        // Fetch games that have this promotion assigned
        const [rows] = await connection.execute(
            'SELECT id, title FROM Game WHERE promo_id = ?',
            [promotionId]
        );
        
        connection.release();
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching assigned games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assigned games' },
            { status: 500 }
        );
    }
}