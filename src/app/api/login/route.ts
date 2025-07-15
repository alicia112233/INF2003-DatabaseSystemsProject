import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

async function postHandler(req: NextRequest) {
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
        connection = await pool.getConnection();

        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            console.log("No user found with this email");
            return NextResponse.json(
                { error: 'Invalid email or password!' },
                { status: 401 }
            );
        }

        const user = rows[0];

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid email or password!' },
                { status: 401 }
            );
        }

        if (user.is_Deleted === 'T') {
            return NextResponse.json(
                { error: 'This account has been deleted! Please contact support.' },
                { status: 403 }
            );
        }

        const userRole = user.is_admin === 'T' ? 'admin' : 'customer';

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
            isDeleted: user.is_Deleted === 'F',
            createdAt: user.createdAt
        };

        const response = NextResponse.json(
            {
                message: 'Login successful!',
                user: userResponse
            },
            { status: 200 }
        );

        // Set cookies
        response.cookies.set('userId', user.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400
        });

        response.cookies.set('userRole', userRole, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400
        });

        response.cookies.set('isLoggedIn', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400
        });

        response.cookies.set('userEmail', email, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login!' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export const POST = withPerformanceTracking(postHandler);