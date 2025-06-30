import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();
        
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
        
        const formattedGames = (rows as any[]).map(game => ({
            ...game,
            title: toTitleCase(game.title),
            promo_code: game.promo_code ? toTitleCase(game.promo_code) : game.promo_code
        }));
        
        return NextResponse.json(formattedGames);
    } catch (error) {
        console.error('Error fetching games with promotions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games with promotions' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}