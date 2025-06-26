import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: "game_haven",
  port: Number(process.env.MYSQL_PORT) || 3306,
};

// GET: Fetch all orders
export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT o.id, u.email, o.game_title AS gameTitle, o.total, o.status, o.purchase_date AS createdAt
       FROM Orders o
       JOIN users u ON o.user_id = u.id`
    );
    // Ensure createdAt is always an ISO string
    const safeRows = Array.isArray(rows)
      ? rows.map((row: any) => ({
          ...row,
          total: Number(row.total),
          createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null
        }))
      : rows;
    return NextResponse.json(safeRows);
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    // Always return an array on error to prevent frontend .filter errors
    return NextResponse.json([], { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Create a new order
export async function POST(req: NextRequest) {
  let connection;
  try {
    const data = await req.json();
    connection = await mysql.createConnection(dbConfig);
    // Look up user_id by email
    const [users] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ?`,
      [data.email]
    );
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "User with this email not found" }, { status: 400 });
    }
    const user_id = users[0].id;
    // Always use ISO string for purchase_date
    const purchase_date = data.purchase_date ? new Date(data.purchase_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO Orders (user_id, game_title, total, status, purchase_date) VALUES (?, ?, ?, ?, ?)` ,
      [user_id, data.gameTitle, data.total, data.status || 'Pending', purchase_date]
    );
    return NextResponse.json({ id: result.insertId, ...data, user_id, purchase_date }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// PUT: Update an order (only purchase_date for demo)
export async function PUT(req: NextRequest) {
  let connection;
  try {
    const data = await req.json();
    connection = await mysql.createConnection(dbConfig);
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
    if (connection) await connection.end();
  }
}

// DELETE: Delete an order
export async function DELETE(req: NextRequest) {
  let connection;
  try {
    const { id } = await req.json();
    connection = await mysql.createConnection(dbConfig);
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
    if (connection) await connection.end();
  }
}
