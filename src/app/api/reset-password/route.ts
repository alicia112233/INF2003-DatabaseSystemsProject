import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import bcrypt from 'bcrypt';
import { withPerformanceTracking } from '@/middleware/trackPerformance';

async function postHandler(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Create database connection
        const connection = await pool.getConnection();

        try {
            // Find user with valid reset token
            const [rows] = await connection.execute(
                'SELECT id, email, resetToken, resetTokenExpiry FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()',
                [token]
            );

            const users = rows as any[];

            if (users.length === 0) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset token' },
                    { status: 400 }
                );
            }

            const user = users[0];

            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Update user's password and clear reset token
            await connection.execute(
                'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
                [hashedPassword, user.id]
            );

            return NextResponse.json(
                { message: 'Password reset successfully' },
                { status: 200 }
            );

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const POST = withPerformanceTracking(postHandler);