import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
    let connection;

    try {
        const { orderId, gameId } = await req.json();

        if (!orderId || !gameId) {
            return NextResponse.json(
                { error: "Order ID and Game ID are required" },
                { status: 400 }
            );
        }

        // Get DB connection
        connection = await pool.getConnection();
        await connection.beginTransaction();

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

        // Recalculate the order total
        const [remainingGames] = await connection.query<RowDataPacket[]>(
            `SELECT SUM(quantity * price) AS total FROM OrderGame WHERE order_id = ?`,
            [orderId]
        );

        const newTotal = remainingGames[0]?.total || 0;

        // Update the order total
        await connection.query(
            `UPDATE Orders SET total = ? WHERE id = ?`,
            [newTotal, orderId]
        );

        await connection.commit();

        return NextResponse.json(
            {
                message: "Game cancelled successfully",
                success: true,
                newTotal,
                cancelledGame: {
                    gameId: gameData.game_id,
                    quantity: gameData.quantity,
                    price: gameData.price,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("POST /api/orders/cancel-game error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to cancel game" },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}