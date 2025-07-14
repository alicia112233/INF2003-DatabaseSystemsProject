import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withPerformanceTracking } from "@/middleware/trackPerformance";

// GET: Fetch all orders
async function getHandler() {
    let connection;
    try {
        connection = await pool.getConnection();
        // Get all orders with user info (removed status as it's not needed for digital purchases)
        const [orders] = await connection.query(
            `SELECT o.id, u.email, o.total, o.purchase_date AS createdAt
       FROM Orders o
       JOIN users u ON o.user_id = u.id`
        );
        // For each order, get its games
        for (const order of orders as any[]) {
            const [games] = await connection.query(
                `SELECT og.game_id, g.title, og.quantity, og.price
         FROM OrderGame og
         JOIN Game g ON og.game_id = g.id
         WHERE og.order_id = ?`,
                [order.id]
            );
            order.games = games;
        }
        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('GET /api/orders error:', error);
        return NextResponse.json([], { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// POST: Create a new order
async function postHandler(req: NextRequest) {
    let connection;
    try {
        const data = await req.json();
        connection = await pool.getConnection();
        // Look up user_id by email
        const [users] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM users WHERE email = ?`,
            [data.email]
        );
        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "User with this email not found" }, { status: 400 });
        }
        const user_id = users[0].id;
        const purchase_date = data.purchase_date
            ? new Date(data.purchase_date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);
        // Insert order (digital purchases don't need status tracking)
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO Orders (user_id, total, purchase_date) VALUES (?, ?, ?)`,
            [user_id, data.total, purchase_date]
        );
        const orderId = (result as ResultSetHeader).insertId;
        // Insert games
        for (const game of data.games) {
            await connection.query(
                `INSERT INTO OrderGame (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, game.gameId, game.quantity, game.price]
            );
        }
        return NextResponse.json({ id: orderId, ...data, user_id, purchase_date }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// PUT: Update an order (only purchase_date for demo)
async function putHandler(req: NextRequest) {
    let connection;
    try {
        const data = await req.json();
        connection = await pool.getConnection();
        const [result] = await connection.query<ResultSetHeader>(
            `UPDATE Orders SET purchase_date = ? WHERE id = ?`,
            [data.purchase_date, data.id]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// DELETE: Delete an order
async function deleteHandler(req: NextRequest) {
    let connection;
    try {
        const { id } = await req.json();
        connection = await pool.getConnection();
        const [result] = await connection.query<ResultSetHeader>(
            `DELETE FROM Orders WHERE id = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Export wrapped handlers
export const GET = withPerformanceTracking(getHandler);
export const POST = withPerformanceTracking(postHandler);
export const PUT = withPerformanceTracking(putHandler);
export const DELETE = withPerformanceTracking(deleteHandler);