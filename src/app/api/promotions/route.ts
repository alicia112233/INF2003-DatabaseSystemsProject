import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import type { ResultSetHeader } from 'mysql2';

// GET - Fetch all promotions
export async function GET() {
    try {
        const rows = await executeQuery(
            'SELECT * FROM promotion ORDER BY id DESC'
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error('GET /api/promotions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        );
    }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
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

        const result = await executeTransaction(async (connection) => {
            // Insert new promotion
            const [promotionResult] = await connection.execute(
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

            const promotionId = (promotionResult as ResultSetHeader).insertId;

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

            return { promotionId };
        });

        return NextResponse.json({ message: 'Promotion created', id: result.promotionId });
    } catch (error) {
        console.error('POST /api/promotions error:', error);
        return NextResponse.json(
            { error: 'Failed to create promotion' },
            { status: 500 }
        );
    }
}