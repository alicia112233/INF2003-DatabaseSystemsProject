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
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || '1';
  const year = searchParams.get('year') || '2025';

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Query total earnings from orders (assuming discount value is in %)
    const [orders] = await connection.execute(
      `
        SELECT 
        DATE(o.purchase_date) AS day,
        SUM(
            IF(p.discountValue IS NOT NULL,
            g.price * (1 - p.discountValue / 100),
            g.price
            )
        ) AS earnings
        FROM orders o
        JOIN users u ON u.id = o.user_id
        JOIN game g ON g.title = o.gameTitle
        LEFT JOIN promotion p ON g.promo_id = p.id
        WHERE MONTH(o.purchase_date) = ? AND YEAR(o.purchase_date) = ?
        GROUP BY day
        ORDER BY day;

      `,
      [month, year]
    );

    // Query expenses from rental records, adjust 0.1 if rental fee is different rate
    const [rentals] = await connection.execute(
      `
        SELECT 
        DATE(r.depart_date) AS day,
        SUM(
            g.price * 0.1 * r.duration
        ) AS rental_revenue
        FROM rentalrecord r
        JOIN game g ON g.id = r.game_id
        WHERE MONTH(r.depart_date) = ? AND YEAR(r.depart_date) = ?
        GROUP BY day
        ORDER BY day;

      `,
      [month, year]
    );

    await connection.end();

    return NextResponse.json({ orders, rentals });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
