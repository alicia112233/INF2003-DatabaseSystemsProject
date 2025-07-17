import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function PUT(req: NextRequest) {
    try {
        const userId = req.cookies.get('userId')?.value;

        if (!userId) {
            return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        }
        if (!userId) {
            return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Missing current or new password' }, { status: 400 });
        }

        // Get existing hashed password
        const rows = await executeQuery(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        ) as { password: string }[];

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const storedHash = rows[0].password;
        const storedHash = rows[0].password;

        // Compare current password with stored hash
        const match = await bcrypt.compare(currentPassword, storedHash);
        if (!match) {
            return NextResponse.json({ message: 'Current password is incorrect!' }, { status: 401 });
        }
        // Compare current password with stored hash
        const match = await bcrypt.compare(currentPassword, storedHash);
        if (!match) {
            return NextResponse.json({ message: 'Current password is incorrect!' }, { status: 401 });
        }

        // Prevent reusing the same password
        const isSame = await bcrypt.compare(newPassword, storedHash);
        if (isSame) {
            return NextResponse.json({ message: 'New password must be different from current password.' }, { status: 400 });
        }
        // Prevent reusing the same password
        const isSame = await bcrypt.compare(newPassword, storedHash);
        if (isSame) {
            return NextResponse.json({ message: 'New password must be different from current password.' }, { status: 400 });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateResult = await executeQuery(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        if ((updateResult as any).affectedRows > 0) {
            return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export const PUT = withPerformanceTracking(putHandler);