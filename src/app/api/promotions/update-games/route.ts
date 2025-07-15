import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { promotionId, applicableToAll, selectedGameIds } = await request.json();

        await executeTransaction(async (connection) => {
            if (applicableToAll) {
                await connection.execute(
                    'UPDATE Game SET promo_id = ? WHERE promo_id IS NULL OR promo_id != ?',
                    [promotionId, promotionId]
                );
            } else {
                await connection.execute(
                    'UPDATE Game SET promo_id = NULL WHERE promo_id = ?',
                    [promotionId]
                );

                if (selectedGameIds && selectedGameIds.length > 0) {
                    const placeholders = selectedGameIds.map(() => '?').join(',');
                    await connection.execute(
                        `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                        [promotionId, ...selectedGameIds]
                    );
                }
            }
        });

        return NextResponse.json({
            message: 'Games updated successfully',
            promotionId,
            applicableToAll,
            selectedGameIds: applicableToAll ? [] : selectedGameIds
        });

    } catch (error) {
        console.error('Error updating games with promotion:', error);
        return NextResponse.json(
            { error: 'Failed to update games with promotion' },
            { status: 500 }
        );
    }
}