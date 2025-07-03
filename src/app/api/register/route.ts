import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

export async function POST(request: NextRequest) {
    let connection;

    try {
        const body = await request.json();
        const { firstName, lastName, gender, contactNo, email, password } = body;

        // Validate input
        const errors: Record<string, string> = {};

        if (!firstName?.trim()) errors.firstName = 'First name is required';
        if (!lastName?.trim()) errors.lastName = 'Last name is required';
        if (!gender || !['M', 'F'].includes(gender)) errors.gender = 'Valid gender is required';
        if (!contactNo?.trim()) errors.contactNo = 'Contact number is required';
        if (!email?.trim()) errors.email = 'Email is required';
        if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';

        // Validate gender format (should be 'M' or 'F' based on schema)
        if (gender && !['M', 'F'].includes(gender)) {
            errors.gender = 'Gender must be M or F';
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);

        // Check if email already exists and is deleted
        const [deletedUsers] = await connection.execute(
            'SELECT * FROM users WHERE email = ? AND is_Deleted = "T"',
            [email]
        );

        if (Array.isArray(deletedUsers) && deletedUsers.length > 0) {
            return NextResponse.json({ error: 'Email has been registered before but deleted. Please Contact Admin!' }, { status: 400 });
        }
        
        // Check if email already exists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user (trigger will set default avatar based on gender)
        await connection.execute(
            'INSERT INTO users (firstName, lastName, gender, contactNo, email, password, is_admin, loyaltyPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, gender, contactNo, email, hashedPassword, 'F', '0']
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