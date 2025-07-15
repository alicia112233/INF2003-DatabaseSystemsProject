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

    // Union query combining orders and rentals, sorted by datetime desc, limited to 10 total
    const [results]: any = await connection.execute(`
      SELECT
        id,
        datetime,
        description,
        type
      FROM (
        SELECT
          o.id,
          o.purchase_date AS datetime,
          CONCAT(
            'Order #', o.id, ' placed by ',
            CONCAT(UCASE(LEFT(u.firstName, 1)), LCASE(SUBSTRING(u.firstName, 2))), ' ',
            CONCAT(UCASE(LEFT(u.lastName, 1)), LCASE(SUBSTRING(u.lastName, 2)))
          ) AS description,
          'order' AS type
        FROM orders o
        INNER JOIN users u ON u.id = o.user_id

        UNION ALL

        SELECT
          r.id,
          r.depart_date AS datetime,
          CONCAT(
            'Rental #', r.id, ' loaned by ',
            CONCAT(UCASE(LEFT(u.firstName, 1)), LCASE(SUBSTRING(u.firstName, 2))), ' ',
            CONCAT(UCASE(LEFT(u.lastName, 1)), LCASE(SUBSTRING(u.lastName, 2)))
          ) AS description,
          'rental' AS type
        FROM rentalrecord r
        INNER JOIN users u ON u.id = r.user_id
      ) combined
      ORDER BY datetime DESC
      LIMIT 10;
    `);

    await connection.end();

    const formatted = results.map((txn: any) => ({
      time: new Date(txn.datetime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      type: 'sale', // or you can keep txn.type if you want distinction
      description: txn.description,
      color: txn.type === 'order' ? 'success' : 'info',
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
