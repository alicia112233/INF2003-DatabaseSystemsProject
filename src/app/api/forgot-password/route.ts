import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // 1. Check if the user exists
        const rows = await executeQuery(
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

        // 2. Generate a reset token
        const resetToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        // 3. Set token expiration time (1 hour from now)
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // 4. Store the token in the DB
        await executeQuery(
            'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
            [resetToken, tokenExpiry, email]
        );

        // 5. Create reset link
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/authentication/reset-password?token=${resetToken}`;

        // 6. Log link (or send via email later)
        console.log('Password reset link for', email, ':', resetLink);

        return NextResponse.json(
            {
                message: 'Password reset instructions sent successfully',
                ...(process.env.NODE_ENV === 'development' && { resetLink })
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}