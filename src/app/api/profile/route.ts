import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'game_haven',
};

export async function GET(req: NextRequest) {
  let connection;

  try {
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // First check if user is admin
    const [adminRows] = await connection.query<RowDataPacket[]>(
      'SELECT firstName, lastName, email, contactNo, gender, avatarUrl, role FROM admin WHERE id = ?',
      [userId]
    );

    if (Array.isArray(adminRows) && adminRows.length > 0) {
      const user = adminRows[0];
      return NextResponse.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNo: user.contactNo,
        gender: user.gender,
        role: user.role,
        avatarUrl: user.avatarUrl || '/images/profile/user-1.jpg'
      });
    }

    // If not admin, check customers table
    const [customerRows] = await connection.query<RowDataPacket[]>(
      'SELECT firstName, lastName, email, contactNo, gender, avatarUrl FROM customers WHERE id = ?',
      [userId]
    );

    if (Array.isArray(customerRows) && customerRows.length > 0) {
      const user = customerRows[0];
      return NextResponse.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNo: user.contactNo,
        gender: user.gender,
        role: 'customer',
        avatarUrl: user.avatarUrl || '/images/profile/user-1.jpg'
      });
    }

    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(req: NextRequest) {
  let connection;

  try {
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // First try to update admin table
    const [adminResult] = await connection.execute(
      'UPDATE admin SET avatarUrl = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    // Check if admin was updated
    if (Array.isArray(adminResult) === false && (adminResult as any).affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Avatar updated successfully'
      });
    }

    // If not admin, try customers table
    const [customerResult] = await connection.execute(
      'UPDATE customers SET avatarUrl = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    if (Array.isArray(customerResult) === false && (customerResult as any).affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Avatar updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}