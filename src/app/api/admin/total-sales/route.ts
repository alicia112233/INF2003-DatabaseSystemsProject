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
  const url = new URL(req.url);
  const month = url.searchParams.get('month') ?? '1';
  const year = url.searchParams.get('year') ?? '2025';

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Query orders earnings grouped by day
    const [orders] = await connection.execute(`
        SELECT 
          DAY(o.purchase_date) AS day,
          ROUND(SUM(
            IF(p.discountValue IS NOT NULL,
              og.price * (1 - p.discountValue / 100) * og.quantity,
              og.price * og.quantity
            )
          ), 2) AS earnings
        FROM orders o
        JOIN ordergame og ON o.id = og.order_id
        JOIN game g ON g.id = og.game_id
        LEFT JOIN promotion p ON g.promo_id = p.id
        WHERE MONTH(o.purchase_date) = ? AND YEAR(o.purchase_date) = ?
        GROUP BY day
        ORDER BY day;
    `, [month, year]);

    // Query rentals revenue grouped by day
    const [rentals] = await connection.execute(`
      SELECT 
        DAY(r.depart_date) AS day,
        ROUND(SUM(g.price * 0.25 * r.duration), 2) AS rental_revenue
      FROM rentalrecord r
      JOIN game g ON g.id = r.game_id
      WHERE MONTH(r.depart_date) = ? AND YEAR(r.depart_date) = ?
      GROUP BY day
      ORDER BY day;
    `, [month, year]);

    // Merge the two datasets on day
    const earningsMap: Record<number, number> = {};
    (orders as any[]).forEach(({ day, earnings }) => {
      earningsMap[day] = earnings;
    });

    const expenseMap: Record<number, number> = {};
    (rentals as any[]).forEach(({ day, rental_revenue }) => {
      expenseMap[day] = rental_revenue;
    });

    // Collect all unique days from both
    const allDays = Array.from(new Set([
      ...Object.keys(earningsMap).map(Number),
      ...Object.keys(expenseMap).map(Number)
    ])).sort((a, b) => a - b);

    // Build final arrays aligned by day
    const response = allDays.map(day => ({
      day,
      earnings: earningsMap[day] ?? 0,
      expense: expenseMap[day] ?? 0,
    }));

    await connection.end();

    return NextResponse.json(response);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
