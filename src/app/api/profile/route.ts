import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
    try {
        const userId = req.cookies.get('userId')?.value;
        const userRole = req.cookies.get('userRole')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT firstName, lastName, email, contactNo, gender, is_admin, avatarUrl FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length > 0) {
            const user = rows[0];
            return NextResponse.json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contactNo: user.contactNo,
                gender: user.gender,
                is_admin: user.is_admin,
                avatarUrl: user.avatarUrl || '/images/profile/user-1.jpg',
                userRole: userRole || (user.is_admin === 'T' ? 'admin' : 'customer')
            });
        }

        return NextResponse.json({ error: 'User not found' }, { status: 404 });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = req.cookies.get('userId')?.value;
        const userRole = req.cookies.get('userRole')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const body = await req.json();
        const { avatarUrl } = body;

        if (!avatarUrl) {
            return NextResponse.json({ error: 'Avatar URL is required' }, { status: 400 });
        }

        const [result] = await pool.execute(
            'UPDATE users SET avatarUrl = ? WHERE id = ?',
            [avatarUrl, userId]
        );

        const updateResult = result as any;
        if (updateResult.affectedRows > 0) {
            return NextResponse.json({
                success: true,
                message: 'Avatar updated successfully',
                userRole: userRole
            });
        }

        return NextResponse.json({ error: 'User not found' }, { status: 404 });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}