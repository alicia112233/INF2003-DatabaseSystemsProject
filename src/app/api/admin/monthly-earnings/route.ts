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

    // Query: Get earnings per day from orders and rental records, combined
    const [rows]: any = await connection.execute(
      `
      SELECT day, SUM(earnings) AS earnings
      FROM (
        -- Orders revenue
        SELECT 
          DAY(o.purchase_date) AS day,
          SUM(
            IF(p.discountValue IS NOT NULL,
              og.price * (1 - p.discountValue / 100) * og.quantity,
              og.price * og.quantity
            )
          ) AS earnings
        FROM orders o
        JOIN ordergame og ON o.id = og.order_id
        JOIN game g ON g.id = og.game_id
        LEFT JOIN promotion p ON g.promo_id = p.id
        WHERE MONTH(o.purchase_date) = ? AND YEAR(o.purchase_date) = ?
        GROUP BY day

        UNION ALL

        -- Rental revenue
        SELECT 
          DAY(r.depart_date) AS day,
          SUM(g.price * 0.25 * r.duration) AS earnings
        FROM rentalrecord r
        JOIN game g ON g.id = r.game_id
        WHERE MONTH(r.depart_date) = ? AND YEAR(r.depart_date) = ?
        GROUP BY day
      ) AS combined
      GROUP BY day
      ORDER BY day;
      `,
      [month, year, month, year]
    );

    await connection.end();

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
