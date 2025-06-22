import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const promotionId = parseInt(id);
        
        if (isNaN(promotionId)) {
            return NextResponse.json(
                { error: 'Invalid promotion ID' },
                { status: 400 }
            );
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Fetch games that have this promotion assigned
        const [rows] = await connection.execute(
            'SELECT id, title FROM Game WHERE promo_id = ?',
            [promotionId]
        );
        
        await connection.end();
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching assigned games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assigned games' },
            { status: 500 }
        );
    }
}