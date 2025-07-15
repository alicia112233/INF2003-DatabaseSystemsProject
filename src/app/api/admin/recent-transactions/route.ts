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

    // Latest 5 orders
    const [orders]: any = await connection.execute(`
      SELECT 
        o.id,
        o.purchase_date AS datetime,
        CONCAT(
          'Order #', o.id, ' placed by ',
          CONCAT(UCASE(LEFT(u.firstName, 1)), LCASE(SUBSTRING(u.firstName, 2))), ' ',
          CONCAT(UCASE(LEFT(u.lastName, 1)), LCASE(SUBSTRING(u.lastName, 2)))
        ) AS description
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.purchase_date DESC
      LIMIT 5;
    `);

    // Latest 5 rentals
    const [rentals]: any = await connection.execute(`
      SELECT 
        r.id,
        r.depart_date AS datetime,
        CONCAT(
          'Rental #', r.id, ' loaned by ',
          CONCAT(UCASE(LEFT(u.firstName, 1)), LCASE(SUBSTRING(u.firstName, 2))), ' ',
          CONCAT(UCASE(LEFT(u.lastName, 1)), LCASE(SUBSTRING(u.lastName, 2)))
        ) AS description
      FROM rentalrecord r
      INNER JOIN users u ON u.id = r.user_id
      ORDER BY r.depart_date DESC
      LIMIT 5;
    `);

    await connection.end();

    // Merge & sort
    const combined = [...orders, ...rentals].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    const formatted = combined.map((txn: any) => ({
      time: new Date(txn.datetime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      type: 'sale',
      description: txn.description,
      color: txn.description.startsWith('Order') ? 'success' : 'info',
      link: `/sales/${txn.id}`,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
