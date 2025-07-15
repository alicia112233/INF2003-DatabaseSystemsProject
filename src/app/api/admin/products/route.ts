import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE!,
};

export async function GET(req: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [results]: any = await connection.execute(
      `
    SELECT
      g.id,
      g.title,
      ROUND(
        COALESCE(order_earnings.total_orders, 0) + COALESCE(rental_earnings.total_rentals, 0),
        2
      ) AS earnings
    FROM game g
    LEFT JOIN (
      SELECT 
        og.game_id,
        SUM(
          IF(p.discountValue IS NOT NULL,
              g.price * (1 - p.discountValue / 100) * og.quantity,
              g.price * og.quantity
          )
        ) AS total_orders
      FROM ordergame og
      JOIN orders o ON o.id = og.order_id
      JOIN game g ON g.id = og.game_id
      LEFT JOIN promotion p ON g.promo_id = p.id
      GROUP BY og.game_id
    ) order_earnings ON order_earnings.game_id = g.id
    LEFT JOIN (
      SELECT 
        r.game_id,
        SUM(g.price * 0.25 * r.duration) AS total_rentals
      FROM rentalrecord r
      JOIN game g ON g.id = r.game_id
      GROUP BY r.game_id
    ) rental_earnings ON rental_earnings.game_id = g.id
    ORDER BY earnings DESC
	  LIMIT 5;
  `
    );
    await connection.end();
    return NextResponse.json(results);
    
  } catch (err) {
    console.error('Error fetching product performance:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
