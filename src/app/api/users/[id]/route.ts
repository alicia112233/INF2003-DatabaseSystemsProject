import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let connection;

  try {
    const userRole = req.cookies.get('userRole')?.value;
    const currentUserId = req.cookies.get('userId')?.value;

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { firstName, lastName, gender, contactNo, email, is_admin, password } = await req.json();

    connection = await mysql.createConnection(dbConfig);

    // Check if email already exists for other users
    const [existingUsers] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    let updateQuery = `UPDATE users SET firstName = ?, lastName = ?, gender = ?, 
                       contactNo = ?, email = ?, is_admin = ? WHERE id = ?`;
    let updateParams = [firstName, lastName, gender, contactNo, email, is_admin, userId];

    // If password is provided, hash and update it
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `UPDATE users SET firstName = ?, lastName = ?, gender = ?, 
                     contactNo = ?, email = ?, is_admin = ?, password = ? WHERE id = ?`;
      updateParams = [firstName, lastName, gender, contactNo, email, is_admin, hashedPassword, userId];
    }

    await connection.execute(updateQuery, updateParams);

    return NextResponse.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Error updating user:', error);
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

// DELETE - Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let connection;

  try {
    const userRole = req.cookies.get('userRole')?.value;
    const currentUserId = req.cookies.get('userId')?.value;

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Prevent admin from deleting themselves
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
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