import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

// GET - Fetch all promotions
async function getHandler() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM promotion ORDER BY id DESC'
        );
        connection.release();

        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        );
    }
}

// POST - Create new promotion
async function postHandler(request: NextRequest) {
    let connection;

    try {
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

        connection = connection = await pool.getConnection();

        // Insert new promotion
        const [result] = await connection.execute(
            `INSERT INTO promotion 
        (code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            ]
        );

        const promotionId = (result as any).insertId;

        // Update games with the new promotion ID
        if (applicableToAll) {
            await connection.execute('UPDATE Game SET promo_id = ?', [promotionId]);
        } else if (selectedGameIds && selectedGameIds.length > 0) {
            const placeholders = selectedGameIds.map(() => '?').join(',');
            await connection.execute(
                `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                [promotionId, ...selectedGameIds]
            );
        }

        connection.release();

        return NextResponse.json({ message: 'Promotion created', id: promotionId });
    } catch (error) {
        console.error('Error creating promotion:', error);
        if (connection) connection.release(); // Ensure cleanup even on error

        return NextResponse.json(
            { error: 'Failed to create promotion' },
            { status: 500 }
        );
    }
}

export const GET = withPerformanceTracking(getHandler);
export const POST = withPerformanceTracking(postHandler);