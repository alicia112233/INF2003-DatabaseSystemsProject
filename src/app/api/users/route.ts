import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

// GET - Fetch all users
async function getHandler(req: NextRequest) {
    let connection;

    try {
        const userRole = req.cookies.get('userRole')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        connection = await pool.getConnection();

        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM users ORDER BY createdAt DESC`
        );

        return NextResponse.json({ users: rows });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// POST - Create new user
async function postHandler(req: NextRequest) {
    let connection;

    try {
        const userRole = req.cookies.get('userRole')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        const { firstName, lastName, gender, contactNo, email, password, is_admin } = await req.json();

        // Validate input
        const errors: Record<string, string> = {};

        if (!firstName?.trim()) errors.firstName = 'First name is required';
        if (!lastName?.trim()) errors.lastName = 'Last name is required';
        if (!gender || !['M', 'F'].includes(gender)) errors.gender = 'Valid gender is required';
        if (!contactNo?.trim()) errors.contactNo = 'Contact number is required';
        if (!email?.trim()) errors.email = 'Email is required';
        if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.email = 'Invalid email format';
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        connection = await pool.getConnection();

        // Check if email already exists
        const [existingUsers] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Check if email already exists in users but the user is deleted
        const [deletedUsers] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ? AND is_deleted = "T"',
            [email]
        );

        if (Array.isArray(deletedUsers) && deletedUsers.length > 0) {
            return NextResponse.json(
                { error: 'Account Deleted Previously. Please contact support.' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user (trigger will set default avatar based on gender)
        await connection.execute(
            `INSERT INTO users (firstName, lastName, gender, contactNo, email, password, is_admin) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName.trim(), lastName.trim(), gender, contactNo.trim(), email.trim(), hashedPassword, is_admin || 'F']
        );

        return NextResponse.json({ message: 'User created successfully!' });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user!' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export const GET = withPerformanceTracking(getHandler);
export const POST = withPerformanceTracking(postHandler);