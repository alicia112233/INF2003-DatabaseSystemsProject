import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

export async function GET(req: NextRequest) {
  let connection;

  try {
    const userId = req.cookies.get('userId')?.value;
    const userRole = req.cookies.get('userRole')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [resultRows] = await connection.query<RowDataPacket[]>(
      'SELECT firstName, lastName, email, contactNo, gender, is_admin, avatarUrl FROM users WHERE id = ?',
      [userId]
    );

    if (Array.isArray(resultRows) && resultRows.length > 0) {
      const user = resultRows[0];
      return NextResponse.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNo: user.contactNo,
        gender: user.gender,
        is_admin: user.is_admin,
        avatarUrl: user.avatarUrl || '/images/profile/user-1.jpg',
        userRole: userRole || (user.is_admin === 'T' ? 'admin' : 'customer')
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
    const userRole = req.cookies.get('userRole')?.value;

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

    const [resultRows] = await connection.execute(
      'UPDATE users SET avatarUrl = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    if (Array.isArray(resultRows) === false && (resultRows as any).affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Avatar updated successfully',
        userRole: userRole
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