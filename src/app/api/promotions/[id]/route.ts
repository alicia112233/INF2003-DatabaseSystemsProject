import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

// GET single promotion
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before using
        const { id } = await params;

        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT * FROM promotion WHERE id = ?',
            [id]
        );

        await connection.end();

        const promotions = rows as any[];
        if (promotions.length === 0) {
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
        }

        return NextResponse.json(promotions[0]);
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
    try {
        // Await params before using
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
            applicableToAll
        } = body;

        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            `UPDATE promotion SET 
        code = ?, description = ?, discountValue = ?, discountType = ?, maxUsage = ?, 
        startDate = ?, endDate = ?, isActive = ?, applicableToAll = ?
        WHERE id = ?`,
            [code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll, id]
        );

        await connection.end();

        return NextResponse.json({ message: 'Promotion updated successfully' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
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

        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            'DELETE FROM promotion WHERE id = ?',
            [id]
        );

        await connection.end();

        return NextResponse.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
    }
}