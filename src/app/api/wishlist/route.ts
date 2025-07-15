import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// Helper to get user ID from cookie or session (update this for your auth logic)
function getUserIdFromRequest(req: NextRequest): number | null {
    const cookie = req.cookies.get('userId');
    if (cookie) return Number(cookie.value);
    return null;
}

// GET: Fetch the user's wishlist (full game details)
export async function GET(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const rows = await executeQuery(
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
    }
}

// POST: Add a game to wishlist
export async function POST(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const { gameId } = await req.json();

        // Prevent duplicates
        const exists = await executeQuery(
            'SELECT 1 FROM Wishlist WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );
        if ((exists as any[]).length > 0) {
            return NextResponse.json({ message: 'Already in wishlist' });
        }

        await executeQuery(
            'INSERT INTO Wishlist (user_id, game_id) VALUES (?, ?)',
            [userId, gameId]

        );
        return NextResponse.json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

// DELETE: Remove a game from wishlist (gameId in request body)
export async function DELETE(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const body = await req.json();

        const { gameId } = body;
        if (!gameId) return NextResponse.json({ error: 'No gameId provided' }, { status: 400 });

        const result = await executeQuery(
            'DELETE FROM Wishlist WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );
        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
