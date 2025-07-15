import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST() {
    try {
        // Update all games to have stock count of 10 if they currently have 0 or null
        const result = await executeQuery(`
            UPDATE Game 
            SET stock_count = 10 
            WHERE stock_count = 0 OR stock_count IS NULL
        `);

        // Get count of games that were updated
        const games = await executeQuery(`
            SELECT COUNT(*) as total_games, 
                    SUM(CASE WHEN stock_count > 0 THEN 1 ELSE 0 END) as games_with_stock 
            FROM Game
        `);

        return NextResponse.json({
            message: 'Stock updated successfully',
            result,
            gameStats: (games as any[])[0]
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }
}