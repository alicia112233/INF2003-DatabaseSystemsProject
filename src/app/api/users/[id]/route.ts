import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
};

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let connection;

    try {
        const { id } = await params;
        const { firstName, lastName, gender, contactNo, email, is_admin, password } = await req.json();

        const userRole = req.cookies.get('userRole')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        connection = await mysql.createConnection(dbConfig);

        // Check if email already exists for another user
        const [existingUsers] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, id]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        let updateQuery = `UPDATE users SET firstName = ?, lastName = ?, gender = ?, 
                       contactNo = ?, email = ?, is_admin = ?`;
        const updateParams: any[] = [firstName, lastName, gender, contactNo, email, is_admin];

        // Include password only if it's provided and non-empty
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, password = ?`;
            updateParams.push(hashedPassword);
        }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(id);

        await connection.execute(updateQuery, updateParams);

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

// DELETE - Soft delete user by setting is_Deleted = true
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let connection;

    try {
        const userRole = req.cookies.get('userRole')?.value;
        const currentUserId = req.cookies.get('userId')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Prevent admin from deleting themselves
        if (currentUserId === id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        await connection.execute('UPDATE users SET is_Deleted = "T" WHERE id = ?', [id]);

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}