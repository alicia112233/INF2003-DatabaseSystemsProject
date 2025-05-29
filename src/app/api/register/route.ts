import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'game_haven',
};

export async function POST(request: NextRequest) {
  let connection;

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

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set default avatar based on gender
    const defaultAvatarUrl = gender === 'M' ? '/images/profile/user-1.jpg' : '/images/profile/user-2.jpg';

    // Insert new user
    await connection.execute(
      'INSERT INTO customers (firstName, lastName, gender, contactNo, email, password, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [firstName, lastName, gender, contactNo, email, hashedPassword, defaultAvatarUrl]
    );

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}