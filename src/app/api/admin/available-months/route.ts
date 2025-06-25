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

    // Query distinct year-month combinations from orders table (or wherever you store purchase dates)
    const [rows]: any = await connection.execute(`
      SELECT DISTINCT DATE_FORMAT(purchase_date, '%Y-%m') AS year_month
      FROM orders
      WHERE purchase_date IS NOT NULL
      ORDER BY year_month DESC
    `);

    await connection.end();

    // Map result to an array of { value, label } for frontend dropdown
    const months = rows.map((row: { year_month: string }) => {
      const [year, month] = row.year_month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g. "March 2025"
      return { value: row.year_month, label };
    });

    return NextResponse.json({ months });
  } catch (error) {
    console.error('Error fetching available months:', error);
    return NextResponse.json({ months: [] }, { status: 500 });
  }
}
