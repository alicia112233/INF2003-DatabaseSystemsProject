import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
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

    // Query the unified users table
    const [users] = await connection.query<(RowDataPacket)[]>(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
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

      // Determine user role based on is_admin field
      const userRole = user.is_admin === 'T' ? 'admin' : 'customer';

      // Create user object without sensitive data
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        contactNo: user.contactNo,
        email: user.email,
        isAdmin: user.is_admin === 'T',
        avatarUrl: user.avatarUrl,
        loyaltyPoints: user.loyaltyPoints,
        role: userRole,
        createdAt: user.createdAt
      };

      // Create response with cookies
      const response = NextResponse.json(
        { 
          message: 'Login successful!',
          user: userResponse
        },
        { status: 200 }
      );

      // Set cookies on the server side
      response.cookies.set('userId', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      response.cookies.set('userRole', userRole, {
        httpOnly: false, // Allow client-side access for this cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      response.cookies.set('isLoggedIn', 'true', {
        httpOnly: false, // Allow client-side access for this cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      response.cookies.set('userEmail', email, {
        httpOnly: false, // Allow client-side access for this cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      return response;

    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return NextResponse.json(
        { error: 'Authentication failed!' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login!' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}