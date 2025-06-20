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
      applicableToAll
    } = body;

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `INSERT INTO promotion (code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, description, discountValue, discountType, maxUsage, startDate, endDate, isActive, applicableToAll]
    );
    await connection.end();

    return NextResponse.json({ message: 'Promotion created successfully!', id: (result as any).insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Promotion code already exists!' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create promotion!' },
      { status: 500 }
    );
  }
}