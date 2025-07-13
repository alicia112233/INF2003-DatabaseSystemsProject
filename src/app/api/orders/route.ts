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
    // Get all orders with user info (removed status as it's not needed for digital purchases)
    const [orders] = await connection.query(
      `SELECT o.id, u.email, o.total, o.purchase_date AS createdAt, o.promotion_code
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
    const purchase_date = data.purchase_date
      ? new Date(data.purchase_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    // Debug: log the promotionCode received
    console.log('Received promotionCode:', data.promotionCode);
    // Insert order (now includes promotion_code)
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO Orders (user_id, total, purchase_date, promotion_code) VALUES (?, ?, ?, ?)`,
      [user_id, data.total, purchase_date, data.promotionCode || null]
    );
    const orderId = (result as ResultSetHeader).insertId;
    // Insert games
    for (const game of data.games) {
      await connection.query(
        `INSERT INTO OrderGame (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, game.gameId, game.quantity, game.price]
      );
    }
    // Promotion logic: check maxUsage and usedCount before incrementing
    let promoAffectedRows = undefined;
    if (data.promotionCode) {
      const [promoRows] = await connection.query<RowDataPacket[]>(
        `SELECT usedCount, maxUsage FROM Promotion WHERE code = ?`,
        [data.promotionCode]
      );
      if (!Array.isArray(promoRows) || promoRows.length === 0) {
        return NextResponse.json({ error: "Invalid promotion code" }, { status: 400 });
      }
      const promo = promoRows[0];
      if (promo.usedCount >= promo.maxUsage) {
        return NextResponse.json({ error: "Promotion code usage limit reached" }, { status: 400 });
      }
      const [updateResult] = await connection.query<ResultSetHeader>(
        `UPDATE Promotion SET usedCount = usedCount + 1 WHERE code = ?`,
        [data.promotionCode]
      );
      promoAffectedRows = updateResult.affectedRows;
    }
    return NextResponse.json({ id: orderId, ...data, user_id, purchase_date, promoAffectedRows }, { status: 201 });
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
