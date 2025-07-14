import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

// GET single promotion which includes selected games
export async function GET(
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const connection = await pool.getConnection();

        // Get promotion details
        const [promotionRows] = await connection.execute(
            'SELECT * FROM Promotion WHERE id = ?',
            [id]
        );

        const promotions = promotionRows as any[];
        if (promotions.length === 0) {
            await connection.release();
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
        }

        const promotion = promotions[0];

        // Get selected games for this promotion (if not applicable to all)
        let selectedGameIds: number[] = [];
        if (!promotion.applicableToAll) {
            const [gameRows] = await connection.execute(
                'SELECT id FROM Game WHERE promo_id = ?',
                [id]
            );
            selectedGameIds = (gameRows as any[]).map(row => row.id);
        }

        await connection.release();

        return NextResponse.json({
            ...promotion,
            selectedGameIds
        });
    } catch (error) {
        console.error('Error fetching promotion:', error);
        return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 });
    }
}

// PUT (Update) promotion
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let connection;

    try {
        const { id } = await params;
        const body = await request.json();
        const {
            code,
            description,
            discountValue,
            discountType,
            maxUsage,
            startDate,
            endDate,
            isActive,
            applicableToAll,
            selectedGameIds,
        } = body;

        connection = await pool.getConnection();

        // Update the promotion
        await connection.execute(
            `UPDATE Promotion SET 
       code = ?, description = ?, discountValue = ?, discountType = ?, maxUsage = ?, 
       startDate = ?, endDate = ?, isActive = ?, applicableToAll = ?
       WHERE id = ?`,
            [
                code,
                description,
                discountValue,
                discountType,
                maxUsage,
                startDate,
                endDate,
                isActive,
                applicableToAll,
                id,
            ]
        );

        // Unset this promotion from all games
        await connection.execute(
            'UPDATE Game SET promo_id = NULL WHERE promo_id = ?',
            [id]
        );

        // Apply the promotion again
        if (applicableToAll) {
            await connection.execute('UPDATE Game SET promo_id = ?', [id]);
        } else if (selectedGameIds && selectedGameIds.length > 0) {
            const placeholders = selectedGameIds.map(() => '?').join(',');
            await connection.execute(
                `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                [id, ...selectedGameIds]
            );
        }

        return NextResponse.json({ message: 'Promotion updated successfully' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        return NextResponse.json(
            { error: 'Failed to update promotion' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.release();
        }
    }
}

// DELETE promotion
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;

        const connection = await pool.getConnection();

        await connection.execute(
            'DELETE FROM promotion WHERE id = ?',
            [id]
        );

        await connection.release();

        return NextResponse.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
    }
}