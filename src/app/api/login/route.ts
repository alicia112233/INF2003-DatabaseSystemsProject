import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/db';
import bcrypt from 'bcrypt';
import { User } from '@/types/user';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const [users] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: userData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}