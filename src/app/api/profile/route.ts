import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from cookies or session
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Query both tables using UNION
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT firstName, lastName, email, contactNo, gender, avatarUrl, 'customer' as role 
      FROM customers WHERE id = ?
      UNION
      SELECT firstName, lastName, email, contactNo, gender, avatarUrl, role 
      FROM admin WHERE id = ?
      `,
      [userId, userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = rows[0];

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNo: user.contactNo,
      gender: user.gender,
      role: user.role,
      avatarUrl: user.avatarUrl || '/images/profile/user-1.jpg'
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { avatarUrl } = await req.json();

    // Update avatar URL in both tables (only one will actually update)
    await pool.query(
      'UPDATE customers SET avatarUrl = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    await pool.query(
      'UPDATE admin SET avatarUrl = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}