import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

// GET handler - fetch single promotion
async function getHandler(request: NextRequest) {
    // Extract the ID from the URL pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query(
            'SELECT * FROM Promotion WHERE id = ?',
            [id]
        );
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(rows[0]);
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
        
        const [result] = await connection.query(
            'UPDATE Promotion SET ? WHERE id = ?',
            [body, id]
        );
        
        return NextResponse.json({ success: true, result });
    } catch (error) {
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
        );
        
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