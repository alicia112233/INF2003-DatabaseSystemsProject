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

    // Get current year and last year dynamically in JS
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Query to get totals grouped by year, filtered to last year and current year
    const [rows]: any = await connection.execute(
      `
      SELECT
        YEAR(o.purchase_date) AS order_year,
        SUM(
          IF(p.discountValue IS NOT NULL,
             g.price * (1 - p.discountValue / 100),
             g.price)
        ) AS total
      FROM orders o
      JOIN ordergame og ON o.id = og.order_id
      JOIN game g ON g.id = og.game_id
      LEFT JOIN promotion p ON g.promo_id = p.id
      WHERE YEAR(o.purchase_date) IN (?, ?)
      GROUP BY YEAR(o.purchase_date);
      `,
      [lastYear, currentYear]
    );

    await connection.end();

    // Initialize totals
    let totalCurrentYear = 0;
    let totalLastYear = 0;

    for (const row of rows) {
      if (row.order_year === currentYear) totalCurrentYear = Number(row.total) || 0;
      else if (row.order_year === lastYear) totalLastYear = Number(row.total) || 0;
    }

    const percentageChange = totalLastYear > 0
      ? (((totalCurrentYear - totalLastYear) / totalLastYear) * 100).toFixed(2)
      : "0";

    return NextResponse.json({
      [currentYear]: totalCurrentYear,
      [lastYear]: totalLastYear,
      percentageChange,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
