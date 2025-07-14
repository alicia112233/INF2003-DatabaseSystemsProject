import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/database";
import { pool } from "@/app/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withPerformanceTracking } from "@/middleware/trackPerformance";

// GET: Fetch all orders
async function getHandler() {
  try {
    // Get all orders with user info
    const orders = await executeQuery(
      `SELECT o.id, u.email, o.total, o.purchase_date AS createdAt, o.promotion_code
       FROM Orders o
       JOIN users u ON o.user_id = u.id`
    ) as any[];

    // For each order, get its games
    for (const order of orders) {
      const games = await executeQuery(
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
  }
}

// POST: Create a new order
async function postHandler(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Look up user_id by email
    const users = await executeQuery(
      `SELECT id FROM users WHERE email = ?`,
      [data.email]
    ) as RowDataPacket[];
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "User with this email not found" }, { status: 400 });
    }
    
    const user_id = users[0].id;
    const purchase_date = data.purchase_date
      ? new Date(data.purchase_date).toLocaleDateString('en-CA')
      : new Date().toLocaleDateString('en-CA');

    // Debug: log the promotionCode received
    console.log('Received promotionCode:', data.promotionCode);

    // Use transaction for order creation
    const result = await executeTransaction(async (connection) => {
      // Insert order (now includes promotion_code)
      const [orderResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO Orders (user_id, total, purchase_date, promotion_code) VALUES (?, ?, ?, ?)`,
        [user_id, data.total, purchase_date, data.promotionCode || null]
      );
      
      const orderId = (orderResult as ResultSetHeader).insertId;

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
          throw new Error("Invalid promotion code");
        }
        
        const promo = promoRows[0];
        if (promo.usedCount >= promo.maxUsage) {
          throw new Error("Promotion code usage limit reached");
        }
        
        const [updateResult] = await connection.query<ResultSetHeader>(
          `UPDATE Promotion SET usedCount = usedCount + 1 WHERE code = ?`,
          [data.promotionCode]
        );
        promoAffectedRows = updateResult.affectedRows;
      }

      return { orderId, promoAffectedRows };
    });

    return NextResponse.json({ 
      id: result.orderId, 
      ...data, 
      user_id, 
      purchase_date, 
      promoAffectedRows: result.promoAffectedRows 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

// PUT: Update an order
async function putHandler(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Look up user_id by email if provided
    let user_id = undefined;
    if (data.email) {
      const users = await executeQuery(
        `SELECT id FROM users WHERE email = ?`,
        [data.email]
      ) as RowDataPacket[];
      
      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: "User with this email not found" }, { status: 400 });
      }
      user_id = users[0].id;
    }

    // Use transaction for order update
    const result = await executeTransaction(async (connection) => {
      // Update order details if provided
      if (data.total !== undefined || user_id !== undefined) {
        const updateFields = [];
        const updateParams = [];
        
        if (data.total !== undefined) {
          updateFields.push('total = ?');
          updateParams.push(data.total);
        }
        
        if (user_id !== undefined) {
          updateFields.push('user_id = ?');
          updateParams.push(user_id);
        }
        
        if (updateFields.length > 0) {
          updateParams.push(data.id);
          const [orderResult] = await connection.query<ResultSetHeader>(
            `UPDATE Orders SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
          );
          
          if (orderResult.affectedRows === 0) {
            throw new Error("Order not found");
          }
        }
      }

      // Update games if provided
      if (data.games && Array.isArray(data.games)) {
        // Delete existing games for this order
        await connection.query(
          `DELETE FROM OrderGame WHERE order_id = ?`,
          [data.id]
        );

        // Insert new games
        for (const game of data.games) {
          await connection.query(
            `INSERT INTO OrderGame (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)`,
            [data.id, game.gameId, game.quantity, game.price]
          );
        }
      }

      return { success: true };
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PUT /api/orders error:', error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}

// DELETE: Delete an order
async function deleteHandler(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    const result = await executeQuery(
      `DELETE FROM Orders WHERE id = ?`,
      [id]
    ) as ResultSetHeader;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/orders error:', error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

// Export wrapped handlers
export const GET = withPerformanceTracking(getHandler);
export const POST = withPerformanceTracking(postHandler);
export const PUT = withPerformanceTracking(putHandler);
export const DELETE = withPerformanceTracking(deleteHandler);