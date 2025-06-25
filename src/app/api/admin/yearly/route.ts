// app/api/admin/yearly/route.ts
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

    const [data2024]: any = await connection.execute(
      `
      SELECT SUM(
        IF(p.discountValue IS NOT NULL,
           g.price * (1 - p.discountValue / 100),
           g.price)
      ) AS total
      FROM orders o
      JOIN game g ON g.title = o.gameTitle
      LEFT JOIN promotion p ON g.promo_id = p.id
      WHERE YEAR(o.purchase_date) = 2024;
      `
    );

    const [data2025]: any = await connection.execute(
      `
      SELECT SUM(
        IF(p.discountValue IS NOT NULL,
           g.price * (1 - p.discountValue / 100),
           g.price)
      ) AS total
      FROM orders o
      JOIN game g ON g.id = o.game_id
      LEFT JOIN promotion p ON g.promo_id = p.id
      WHERE YEAR(o.purchase_date) = 2025;
      `
    );

    await connection.end();

    const total2024 = data2024[0].total || 0;
    const total2025 = data2025[0].total || 0;

    const percentageChange = total2024 > 0
      ? (((total2025 - total2024) / total2024) * 100).toFixed(2)
      : "0";

    return NextResponse.json({
      total2025,
      total2024,
      percentageChange
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
