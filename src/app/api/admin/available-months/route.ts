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

    const [rows]: any = await connection.execute(`
      SELECT DISTINCT
        DATE_FORMAT(purchase_date, '%Y-%m') AS date_refined
      FROM orders

      UNION

      SELECT DISTINCT
        DATE_FORMAT(depart_date, '%Y-%m') AS date_refined
      FROM rentalrecord

      ORDER BY date_refined DESC
    `);

    await connection.end();

    const months = rows.map((row: { date_refined: string }) => {
      const [year, month] = row.date_refined.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      return { value: row.date_refined, label };
    });

    return NextResponse.json({ months });
  } catch (error) {
    console.error('Error fetching available months:', error);
    return NextResponse.json({ months: [] }, { status: 500 });
  }
}
