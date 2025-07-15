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

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // 1️⃣ Orders revenue grouped by year
    const [orderRows]: any = await connection.execute(
      `
      SELECT
        YEAR(o.purchase_date) AS year,
        SUM(
          IF(p.discountValue IS NOT NULL,
             og.price * (1 - p.discountValue / 100),
             og.price)
        ) AS total
      FROM orders o
      JOIN ordergame og ON o.id = og.order_id
      JOIN game g ON g.id = og.game_id
      LEFT JOIN promotion p ON g.promo_id = p.id
      WHERE YEAR(o.purchase_date) IN (?, ?)
      GROUP BY YEAR(o.purchase_date)
      `,
      [lastYear, currentYear]
    );

    // 2️⃣ Rental revenue grouped by year
    const [rentalRows]: any = await connection.execute(
      `
      SELECT
        YEAR(r.depart_date) AS year,
        SUM(
          g.price * 0.25 * r.duration
        ) AS total
      FROM rentalrecord r
      JOIN game g ON g.id = r.game_id
      WHERE YEAR(r.depart_date) IN (?, ?)
      GROUP BY YEAR(r.depart_date)
      `,
      [lastYear, currentYear]
    );

    await connection.end();

    // 3️⃣ Initialize totals
    const revenueMap: Record<number, number> = {
      [currentYear]: 0,
      [lastYear]: 0,
    };

    // Add order totals
    for (const row of orderRows) {
      if (row.year === currentYear || row.year === lastYear) {
        revenueMap[row.year] += Number(row.total) || 0;
      }
    }

    // Add rental totals
    for (const row of rentalRows) {
      if (row.year === currentYear || row.year === lastYear) {
        revenueMap[row.year] += Number(row.total) || 0;
      }
    }

    const totalCurrentYear = revenueMap[currentYear];
    const totalLastYear = revenueMap[lastYear];

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
