import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'game_haven',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

// Return a rented game
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { rentalId } = await request.json();
    
    if (!rentalId) {
      return NextResponse.json({ error: 'Rental ID is required' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Verify the rental belongs to the user and is not already returned
    const [rentals] = await connection.execute(`
      SELECT rr.*, u.email, g.id as game_id
      FROM RentalRecord rr
      JOIN users u ON rr.user_id = u.id
      JOIN Game g ON rr.game_id = g.id
      WHERE rr.id = ? AND u.email = ? AND rr.returned = FALSE
    `, [rentalId, userEmail]);
    
    if ((rentals as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Rental not found or already returned' }, { status: 404 });
    }
    
    const rental = (rentals as any[])[0];
    
    await connection.beginTransaction();
    
    try {
      // Mark rental as returned
      await connection.execute(
        'UPDATE RentalRecord SET returned = TRUE WHERE id = ?',
        [rentalId]
      );
      
      // Return game to stock
      await connection.execute(
        'UPDATE Game SET stock_count = stock_count + 1 WHERE id = ?',
        [rental.game_id]
      );
      
      await connection.commit();
      await connection.end();
      
      return NextResponse.json({ message: 'Game returned successfully' });
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
  } catch (error) {
    console.error('Error returning game:', error);
    return NextResponse.json({ error: 'Failed to return game' }, { status: 500 });
  }
}
