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

    const [results]: any = await connection.execute(
      `
      SELECT 
        g.id,
        g.title,
        ROUND(SUM(
          IF(p.discountValue IS NOT NULL,
             g.price * (1 - p.discountValue / 100),
             g.price)
        ), 2) AS total_earnings
      FROM game g
      LEFT JOIN orders o ON o.gameTitle = g.id
      LEFT JOIN promotion p ON g.promo_id = p.id
      GROUP BY g.id, g.title
      ORDER BY total_earnings DESC;
      `
    );

    await connection.end();

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
