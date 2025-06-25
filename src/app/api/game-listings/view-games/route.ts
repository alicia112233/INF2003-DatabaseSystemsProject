// /app/api/game-listings/view-digitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

export async function GET(req: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT g.id, g.title, g.description, g.image_url, g.price, gen.name AS genre
      FROM game g
      JOIN gamegenre gg ON gg.game_id = g.id
      JOIN genre gen ON gen.id = gg.genre_id
      GROUP BY g.id 
      ORDER BY RAND()
    `);

    await connection.end();

    return NextResponse.json({ games: rows });
  } catch (err) {
    console.error("Failed to fetch digital games:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
