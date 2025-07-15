import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

// GET - Fetch all promotions
async function getHandler() {
    try {
        const [rows] = await pool.query('SELECT * FROM promotion ORDER BY id DESC') as [RowDataPacket[], any];

        for (let promotion of rows) {
            const [gameRows] = await pool.query(
                'SELECT id, title FROM Game WHERE promo_id = ?',
                [promotion.id]
            ) as [RowDataPacket[], any];
            
            promotion.selectedGameIds = Array.isArray(gameRows) ? gameRows.map((game: any) => game.id) : [];
            promotion.selectedGames = Array.isArray(gameRows) ? gameRows : [];
        }

        return NextResponse.json(rows);
    } catch (error) {
        console.error('GET /api/promotions error:', error);
        return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
    }
}

// POST - Create new promotion
async function postHandler(request: NextRequest) {
    const conn = await pool.getConnection();
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

        await conn.beginTransaction();

        const [promotionResult] = await conn.execute<ResultSetHeader>(
            `INSERT INTO promotion 
             (code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll]
        );

        const promotionId = promotionResult.insertId;

        if (applicableToAll) {
            await conn.execute('UPDATE Game SET promo_id = ?', [promotionId]);
        } else if (selectedGameIds && selectedGameIds.length > 0) {
            const placeholders = selectedGameIds.map(() => '?').join(',');
            await conn.execute(
                `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                [promotionId, ...selectedGameIds]
            );
        }

        await conn.commit();

        return NextResponse.json({ message: 'Promotion created', id: promotionId });
    } catch (error) {
        await conn.rollback();
        console.error('POST /api/promotions error:', error);
        return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
    } finally {
        conn.release();
    }
}

export const GET = withPerformanceTracking(getHandler);
export const POST = withPerformanceTracking(postHandler);