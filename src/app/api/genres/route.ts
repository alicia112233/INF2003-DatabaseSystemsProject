import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

function toProperCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function GET() {
    try {
        const pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();

        const [rows] = await connection.execute(`
        SELECT DISTINCT id, name 
        FROM Genre 
        ORDER BY name ASC
        `);

        connection.release();

        // Format the genre names to proper case
        const formattedGenres = (rows as any[]).map(genre => ({
            ...genre,
            name: toProperCase(genre.name)
        }));

        return NextResponse.json(formattedGenres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        return NextResponse.json(
            { error: 'Failed to fetch genres' },
            { status: 500 }
        );
    }
}