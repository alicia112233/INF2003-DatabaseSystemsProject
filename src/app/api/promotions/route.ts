import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

// GET - Fetch all promotions
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM promotion ORDER BY id DESC'
    );
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const {
      code,
      description,
      discountValue,
      discountType,
      maxUsage,
      startDate,
      endDate,
      isActive,
      applicableToAll,
      selectedGameIds,
    } = body;

    connection = await mysql.createConnection(dbConfig);

    // Insert new promotion
    const [result] = await connection.execute(
      `INSERT INTO promotion 
        (code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        description,
        discountValue,
        discountType,
        maxUsage,
        startDate,
        endDate,
        isActive,
        applicableToAll,
      ]
    );

    const promotionId = (result as any).insertId;

    // Update games with the new promotion ID
    if (applicableToAll) {
      await connection.execute('UPDATE Game SET promo_id = ?', [promotionId]);
    } else if (selectedGameIds && selectedGameIds.length > 0) {
      const placeholders = selectedGameIds.map(() => '?').join(',');
      await connection.execute(
        `UPDATE Game SET promo_id = ? WHERE id IN (${placeholders})`,
        [promotionId, ...selectedGameIds]
      );
    }

    await connection.end();

    return NextResponse.json({ message: 'Promotion created', id: promotionId });
  } catch (error) {
    console.error('Error creating promotion:', error);
    if (connection) await connection.end(); // Ensure cleanup even on error

    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}