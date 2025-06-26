import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

export async function POST(request: NextRequest) {
    let connection;
    
    try {
        const { promotionId, applicableToAll, selectedGameIds } = await request.json();

        connection = await mysql.createConnection(dbConfig);
        
        // Start transaction
        await connection.beginTransaction();

        if (applicableToAll) {
            // Update all games with this promotion ID
            await connection.execute(
                'UPDATE Game SET promo_id = ? WHERE promo_id IS NULL OR promo_id != ?',
                [promotionId, promotionId]
            );
        } else {
            // First, remove this promotion from all games
            await connection.execute(
                'UPDATE Game SET promo_id = NULL WHERE promo_id = ?',
                [promotionId]
            );

            // Then apply promotion to selected games
            if (selectedGameIds && selectedGameIds.length > 0) {
                const placeholders = selectedGameIds.map(() => '?').join(',');
                await connection.execute(
                    `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                    [promotionId, ...selectedGameIds]
                );
            }
        }

        // Commit transaction
        await connection.commit();

        return NextResponse.json({ 
            message: 'Games updated successfully',
            promotionId,
            applicableToAll,
            selectedGameIds: applicableToAll ? [] : selectedGameIds
        });

    } catch (error) {
        // Rollback transaction on error
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating games with promotion:', error);
        return NextResponse.json(
            { error: 'Failed to update games with promotion' }, 
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}