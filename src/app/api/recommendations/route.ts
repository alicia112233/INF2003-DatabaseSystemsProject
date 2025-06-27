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

    // For demo/testing: just get random games with all fields
    const [games] = await connection.query(
      `SELECT id, title, description, price, image_url, platform FROM Game ORDER BY RAND() LIMIT 5`
    );

    // for testing to see what is returned
    // console.log('Recommended games:', games);

    return NextResponse.json({ recommendations: games });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}