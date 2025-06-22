import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

export async function GET() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Join games with promotions to get promotion information
        const [rows] = await connection.execute(`
            SELECT 
                g.id,
                g.title,
                g.promo_id,
                p.code as promo_code
            FROM Game g
            LEFT JOIN Promotion p ON g.promo_id = p.id
            ORDER BY g.title
        `);
        
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching games with promotions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games with promotions' },
            { status: 500 }
        );
    }
}