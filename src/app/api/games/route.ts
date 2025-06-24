import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: NextRequest) {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'game_haven',
    port: Number(process.env.MYSQL_PORT) || 3306,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [games] = await connection.query(
      `SELECT id, title, description, price, image_url, platform FROM Game ORDER BY RAND() LIMIT 12`
    );
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}