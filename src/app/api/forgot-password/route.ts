import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Check if user exists
      const [rows] = await connection.execute(
        'SELECT id, email FROM users WHERE email = ?',
        [email]
      );

      const users = rows as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'No account found with this email address!' },
          { status: 404 }
        );
      }

      const user = users[0];

      // Generate a reset token (in production, use a proper token generation library)
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      
      // Set token expiration (1 hour from now)
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store the reset token in database
      await connection.execute(
        'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
        [resetToken, tokenExpiry, email]
      );

      // For now, we just log the reset link, we will implement the email service later
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/authentication/reset-password?token=${resetToken}`;
      
      console.log('Password reset link for', email, ':', resetLink);

      // TODO: Implement email sending service here
      // Example: await sendResetEmail(user.email, user.firstName, resetLink);

      return NextResponse.json(
        { 
          message: 'Password reset instructions sent successfully',
          // In development, you might want to return the link for testing
          ...(process.env.NODE_ENV === 'development' && { resetLink })
        },
        { status: 200 }
      );

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}