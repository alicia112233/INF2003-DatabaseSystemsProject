import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { withPerformanceTracking } from '@/middleware/trackPerformance';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET handler - fetch single promotion
async function getHandler(request: NextRequest) {
    // Extract the ID from the URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        // Get the promotion
        const [rows] = await connection.query(
            'SELECT * FROM Promotion WHERE id = ?',
            [id]
        ) as [RowDataPacket[], any];
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }
        
        const promotion: any = rows[0];
        
        // Get games that have this promotion
        const [gameRows] = await connection.query(
            'SELECT id, title FROM Game WHERE promo_id = ?',
            [id]
        ) as [RowDataPacket[], any];
        
        // Add selectedGameIds and selectedGames to match the frontend interface
        promotion.selectedGameIds = Array.isArray(gameRows) ? gameRows.map((game: any) => game.id) : [];
        promotion.selectedGames = Array.isArray(gameRows) ? gameRows : [];
        
        return NextResponse.json(promotion);
    } catch (error) {
        console.error('GET /api/promotions/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotion' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

// PUT handler - update promotion
async function putHandler(request: NextRequest) {
    // Extract the ID from the URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    let connection;
    
    try {
        const body = await request.json();
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();
        
        // Remove fields that don't exist in the database or shouldn't be updated
        const { 
            id: bodyId, 
            created_at, 
            updated_at, 
            selectedGameIds,  // Handle this separately
            selectedGames,    // Handle this separately
            ...updateData 
        } = body;
        
        // Define allowed fields that exist in the Promotion table
        const allowedFields = [
            'code',
            'description', 
            'discountValue',
            'discountType',
            'maxUsage',
            'usedCount',
            'startDate',
            'endDate',
            'isActive',
            'applicableToAll'
        ];
        
        // Filter updateData to only include allowed fields
        const filteredUpdateData: { [key: string]: any } = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdateData[key] = updateData[key];
            }
        });
        
        // Update promotion if there are fields to update
        if (Object.keys(filteredUpdateData).length > 0) {
            const setClause = Object.keys(filteredUpdateData)
                .map(key => `\`${key}\` = ?`)
                .join(', ');
            
            const values = Object.values(filteredUpdateData);
            
            await connection.query(
                `UPDATE Promotion SET ${setClause} WHERE id = ?`,
                [...values, id]
            ) as [ResultSetHeader, any];
        }
        
        // Handle game-promotion relationship
        if (body.selectedGameIds !== undefined) {
            // First, remove existing promotion from all games that had this promotion
            await connection.query(
                'UPDATE Game SET promo_id = NULL WHERE promo_id = ?',
                [id]
            ) as [ResultSetHeader, any];
            
            // Then, if there are selected games, assign this promotion to them
            if (Array.isArray(body.selectedGameIds) && body.selectedGameIds.length > 0) {
                const gameIds = body.selectedGameIds.map((gameId: any) => parseInt(gameId)).filter((gameId: number) => !isNaN(gameId));
                if (gameIds.length > 0) {
                    const placeholders = gameIds.map(() => '?').join(',');
                    await connection.query(
                        `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
                        [id, ...gameIds]
                    ) as [ResultSetHeader, any];
                }
            }
        }
        
        // Commit transaction
        await connection.commit();
        
        // Fetch and return the updated promotion with selected games
        const [updatedRows] = await connection.query(
            'SELECT * FROM Promotion WHERE id = ?',
            [id]
        ) as [RowDataPacket[], any];
        
        const updatedPromotion = updatedRows[0];
        
        // Get games that have this promotion
        const [gameRows] = await connection.query(
            'SELECT id, title FROM Game WHERE promo_id = ?',
            [id]
        ) as [RowDataPacket[], any];
        
        // Add selectedGameIds and selectedGames to match the frontend interface
        updatedPromotion.selectedGameIds = Array.isArray(gameRows) ? gameRows.map((game: any) => game.id) : [];
        updatedPromotion.selectedGames = Array.isArray(gameRows) ? gameRows : [];
        
        return NextResponse.json({ 
            success: true, 
            promotion: updatedPromotion 
        });
        
    } catch (error) {
        // Rollback transaction on error
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }
        console.error('PUT /api/promotions/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update promotion' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

// DELETE handler - delete promotion
async function deleteHandler(request: NextRequest) {
    // Extract the ID from the URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'DELETE FROM Promotion WHERE id = ?',
            [id]
        ) as [ResultSetHeader, any];
        
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('DELETE /api/promotions/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete promotion' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

export const GET = withPerformanceTracking(getHandler);
export const PUT = withPerformanceTracking(putHandler);
export const DELETE = withPerformanceTracking(deleteHandler);