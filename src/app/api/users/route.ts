import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// GET - Fetch all users
export async function GET(req: NextRequest) {
    try {
        const userRole = req.cookies.get('userRole')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Execute query — no destructuring
        const rows = await executeQuery(
            `SELECT * FROM users ORDER BY createdAt DESC`
        ) as RowDataPacket[];

        return NextResponse.json({ users: rows });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new user
export async function POST(req: NextRequest) {
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

        // Check if email already exists (no destructuring)
        const existingUsers = await executeQuery(
            'SELECT id FROM users WHERE email = ?',
            [email]
        ) as RowDataPacket[];

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Check if email exists but deleted (no destructuring)
        const deletedUsers = await executeQuery(
            'SELECT id FROM users WHERE email = ? AND is_deleted = "T"',
            [email]
        ) as RowDataPacket[];

        if (Array.isArray(deletedUsers) && deletedUsers.length > 0) {
            return NextResponse.json(
                { error: 'Account Deleted Previously. Please contact support.' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle is_admin flag (ensure string 'T' or 'F')
        const adminFlag = (is_admin === true || is_admin === 'T') ? 'T' : 'F';

        // Insert new user
        await executeQuery(
            `INSERT INTO users (firstName, lastName, gender, contactNo, email, password, is_admin) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName.trim(), lastName.trim(), gender, contactNo.trim(), email.trim(), hashedPassword, adminFlag]
        );

        return NextResponse.json({ message: 'User created successfully!' });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user!' },
            { status: 500 }
        );
    }
}