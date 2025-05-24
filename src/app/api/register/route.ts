import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../utils/db';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, gender, contactNo, email, password } = body;

    // Validate input
    const errors: Record<string, string> = {};
    
    if (!firstName) errors.firstname = 'First name is required';
    if (!lastName) errors.lastname = 'Last name is required';
    if (!gender) errors.gender = 'Gender is required';
    if (!contactNo) errors.contactNumber = 'Contact number is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    await pool.query(
      'INSERT INTO customers (firstName, lastName, gender, contactNo, email, password) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, gender, contactNo, email, hashedPassword]
    );

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}