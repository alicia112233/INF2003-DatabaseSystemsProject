import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Helper to get user ID from cookie or session (update this for your auth logic)
function getUserIdFromRequest(req: NextRequest): number | null {
  const cookie = req.cookies.get('userId');
  if (cookie) return Number(cookie.value);
  return null;
}

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'game_haven',
  port: Number(process.env.MYSQL_PORT) || 3306,
};

// GET: Fetch the user's wishlist (full game details)
export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const [rows] = await connection.query(
      `SELECT g.id, g.title, g.description, g.price, g.image_url
         FROM Wishlist w
         JOIN Game g ON w.game_id = g.id
        WHERE w.user_id = ?`,
      [userId]
    );
    return NextResponse.json({ wishlist: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST: Add a game to wishlist
export async function POST(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { gameId } = await req.json();

    // Prevent duplicates
    const [exists] = await connection.query(
      'SELECT 1 FROM Wishlist WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );
    if ((exists as any[]).length > 0) {
      return NextResponse.json({ message: 'Already in wishlist' });
    }

    await connection.query(
      'INSERT INTO Wishlist (user_id, game_id) VALUES (?, ?)',
      [userId, gameId]
    );
    return NextResponse.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// DELETE: Remove a game from wishlist
export async function DELETE(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Expects: /api/wishlist/[gameId]
    const urlParts = req.nextUrl.pathname.split('/');
    const gameId = Number(urlParts[urlParts.length - 1]);
    if (!gameId) return NextResponse.json({ error: 'No gameId provided' }, { status: 400 });

    await connection.query(
      'DELETE FROM Wishlist WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );
    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
