import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/db';
import bcrypt from 'bcrypt';
import { User } from '@/types/user';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log("Login attempt for email:", email);
    
    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: 'Email and password are required!' },
        { status: 400 }
      );
    }
    
    // First check if user exists in customers table
    const [customers] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );
    
    console.log("Found in customers table:", customers.length > 0);
    
    // If not found in customers, check admin table
    const [admins] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT * FROM admin WHERE email = ?',
      [email]
    );
    
    console.log("Found in admin table:", admins.length > 0);
    
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
    console.log("User found:", { email: user.email, hasPassword: !!user.password });
    
    // Compare passwords
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", passwordMatch);
      
      if (!passwordMatch) {
        console.log("Password doesn't match");
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
  }
}