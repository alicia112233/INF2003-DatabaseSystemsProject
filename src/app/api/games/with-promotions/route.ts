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
        
        // Updated query to include promotion details and promo code
        const [rows] = await connection.execute(`
            SELECT 
                g.id,
                g.title,
                g.description,
                g.price,
                g.image_url,
                g.stock_count,
                g.promo_id,
                p.code as promo_code,
                p.discountValue,
                p.discountType,
                GROUP_CONCAT(genre.name) as genreNames
            FROM Game g
            LEFT JOIN Promotion p ON g.promo_id = p.id
            LEFT JOIN GameGenre gg ON g.id = gg.game_id
            LEFT JOIN Genre genre ON gg.genre_id = genre.id
            GROUP BY g.id, g.title, g.description, g.price, g.image_url, g.stock_count, g.promo_id, p.code, p.discountValue, p.discountType
            ORDER BY g.title
        `);
        
        const formattedGames = (rows as any[]).map(game => ({
            id: game.id,
            title: toTitleCase(game.title),
            description: game.description,
            price: game.price,
            image_url: game.image_url,
            inStock: game.inStock,
            promo_code: game.promo_code ? toTitleCase(game.promo_code) : null,
            genreNames: game.genreNames ? game.genreNames.split(',').map((genre: string) => toTitleCase(genre.trim())) : [],
            promotion: game.discount_value && game.discount_type ? {
                discountValue: game.discount_value,
                discountType: game.discount_type
            } : null
        }));
        
        return NextResponse.json(formattedGames);
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}