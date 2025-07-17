import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { id } = await context.params;
        const promotionId = parseInt(id);


        if (isNaN(promotionId)) {
            return NextResponse.json({ error: 'Invalid promotion ID' }, { status: 400 });
        }

        const rows = await executeQuery(
            'SELECT id, title FROM Game WHERE promo_id = ?',
            [promotionId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching assigned games:', error);
        return NextResponse.json({ error: 'Failed to fetch assigned games' }, { status: 500 });
    }
}