import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/database";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// POST: Cancel a specific game from an order
export async function POST(req: NextRequest) {
  try {
    const { orderId, gameId } = await req.json();
    
    if (!orderId || !gameId) {
      return NextResponse.json({ error: "Order ID and Game ID are required" }, { status: 400 });
    }

    // Use transaction for game cancellation
    const result = await executeTransaction(async (connection) => {
      // Check if the game exists in the order
      const [gameRows] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM OrderGame WHERE order_id = ? AND game_id = ?`,
        [orderId, gameId]
      );
      
      if (!Array.isArray(gameRows) || gameRows.length === 0) {
        throw new Error("Game not found in this order");
      }

      const gameData = gameRows[0];
      
      // Remove the game from the order
      const [deleteResult] = await connection.query<ResultSetHeader>(
        `DELETE FROM OrderGame WHERE order_id = ? AND game_id = ?`,
        [orderId, gameId]
      );

      if (deleteResult.affectedRows === 0) {
        throw new Error("Failed to cancel game");
      }

      // Recalculate order total
      const [remainingGames] = await connection.query<RowDataPacket[]>(
        `SELECT SUM(quantity * price) as total FROM OrderGame WHERE order_id = ?`,
        [orderId]
      );

      const newTotal = remainingGames[0]?.total || 0;

      // Update order total
      await connection.query(
        `UPDATE Orders SET total = ? WHERE id = ?`,
        [newTotal, orderId]
      );

      // If no games left, we could optionally delete the entire order
      // For now, we'll keep the order with 0 total
      
      return { 
        success: true, 
        newTotal,
        cancelledGame: {
          gameId: gameData.game_id,
          quantity: gameData.quantity,
          price: gameData.price
        }
      };
    });

    return NextResponse.json({ 
      message: "Game cancelled successfully",
      ...result
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('POST /api/orders/cancel-game error:', error);
    return NextResponse.json({ error: error.message || "Failed to cancel game" }, { status: 500 });
  }
}
