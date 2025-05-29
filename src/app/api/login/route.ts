import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { User } from '@/types/user';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'game_haven',
};

export async function POST(req: NextRequest) {
  let connection;

  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required!' },
        { status: 400 }
      );
    }

    // Create direct database connection
    connection = await mysql.createConnection(dbConfig);

    // First check if user exists in customers table
    const [customers] = await connection.query<(User & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE email = ?', [email]
    );

    // If not found in customers, check admin table
    const [admins] = await connection.query<(User & RowDataPacket)[]>(
      'SELECT * FROM admin WHERE email = ?', [email]
    );

    // Combine results
    const users = [...(Array.isArray(customers) ? customers : []), ...(Array.isArray(admins) ? admins : [])];

    if (users.length === 0) {
      console.log("No user found with this email");
      return NextResponse.json(
        { error: 'Invalid email or password!' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Compare passwords
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password!' },
          { status: 401 }
        );
      }

      // Determine user role
      const userRole = customers.length > 0 ? 'customer' : 'admin';

      // Create response with success message
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: userRole
        }
      });

      // Set cookies for authentication
      response.cookies.set('isLoggedIn', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      response.cookies.set('userRole', userRole, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      response.cookies.set('userId', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;

    } catch (bcryptError) {
      console.error("Bcrypt error:", bcryptError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
    }
  }
}