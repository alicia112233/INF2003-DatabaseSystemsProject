import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { firstName, lastName, gender, contactNo, email, is_admin, password } = await req.json();

        const userRole = req.cookies.get('userRole')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const existingUsers = await executeQuery(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, id]
        ) as RowDataPacket[];

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        let updateQuery = `UPDATE users SET firstName = ?, lastName = ?, gender = ?, contactNo = ?, email = ?, is_admin = ?`;
        const updateParams: any[] = [firstName, lastName, gender, contactNo, email, is_admin];

        if (password?.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, password = ?`;
            updateParams.push(hashedPassword);
        }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(id);

        await executeQuery(updateQuery, updateParams);

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Soft delete user by setting is_Deleted = true
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userRole = req.cookies.get('userRole')?.value;
        const currentUserId = req.cookies.get('userId')?.value;
        const { id } = await params;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        if (currentUserId === id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await executeQuery('UPDATE users SET is_Deleted = "T" WHERE id = ?', [id]);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}