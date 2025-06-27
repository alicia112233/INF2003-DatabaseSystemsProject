import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const genreId = searchParams.get('genre');
        const searchTerm = searchParams.get('search');
        const stockFilter = searchParams.get('stock');

        const pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();

        // Base query to fetch games with their genres
        let query = `
            SELECT 
                g.*,
                GROUP_CONCAT(DISTINCT gg.genre_id) as genre_ids,
                GROUP_CONCAT(DISTINCT gen.name) as genre_names
            FROM Game g
            LEFT JOIN GameGenre gg ON g.id = gg.game_id
            LEFT JOIN Genre gen ON gg.genre_id = gen.id
        `;

        const queryParams: any[] = [];
        const whereConditions: string[] = [];

        // Add genre filter if provided
        if (genreId) {
            whereConditions.push('gg.genre_id = ?');
            queryParams.push(parseInt(genreId));
        }

        // Add search filter if provided
        if (searchTerm) {
            whereConditions.push('(g.title LIKE ? OR g.description LIKE ?)');
            queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Add stock filter if provided
        if (stockFilter === 'inStock') {
            whereConditions.push('g.inStock = true');
        } else if (stockFilter === 'outOfStock') {
            whereConditions.push('g.inStock = false');
        }

        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' GROUP BY g.id ORDER BY g.title ASC';

        const [rows] = await connection.execute(query, queryParams);

        // Process the results to include genres array
        const gamesWithGenres = (rows as any[]).map(game => ({
            ...game,
            genres: game.genre_ids ? game.genre_ids.split(',').map((id: string) => parseInt(id)) : [],
            genreNames: game.genre_names ? game.genre_names.split(',').map((name: string) => toTitleCase(name)) : []
        }));

        connection.release();

        // Return with the same structure your frontend expects
        return NextResponse.json({ games: gamesWithGenres });
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}