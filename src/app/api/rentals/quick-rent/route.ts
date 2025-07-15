import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'game_haven',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

// Quick rent a game (simplified rental process)
export async function POST(request: NextRequest) {
  try {
    const { gameId, userEmail, days = 7 } = await request.json();
    
    if (!gameId || !userEmail) {
      return NextResponse.json({ error: 'Game ID and user email are required' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Get user ID
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if ((users as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = (users as any[])[0].id;
    
    // Get game information
    const [games] = await connection.execute(
      'SELECT id, title, price, stock_count FROM Game WHERE id = ?',
      [gameId]
    );
    
    if ((games as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const game = (games as any[])[0];
    
    if (game.stock_count <= 0) {
      await connection.end();
      return NextResponse.json({ error: 'Game not available for rental' }, { status: 400 });
    }
    
    // Calculate dates
    const rentalDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + days);
    
    await connection.beginTransaction();
    
    try {
      // Create rental record
      const [result] = await connection.execute(`
        INSERT INTO RentalRecord (
          user_id, game_id, depart_date, return_date, duration, returned
        ) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        gameId,
        rentalDate.toLocaleDateString('en-CA'),
        returnDate.toLocaleDateString('en-CA'),
        days,
        false
      ]);
      
      // Update game stock
      await connection.execute(
        'UPDATE Game SET stock_count = stock_count - 1 WHERE id = ?',
        [gameId]
      );
      
      await connection.commit();
      
      const dailyRate = parseFloat(game.price) * 0.25;
      const totalCost = dailyRate * days;
      
      await connection.end();
      
      return NextResponse.json({
        message: 'Game rented successfully',
        rental: {
          id: (result as any).insertId,
          gameTitle: game.title,
          dailyRate,
          totalCost,
          rentalDate: rentalDate.toLocaleDateString('en-CA'),
          returnDate: returnDate.toLocaleDateString('en-CA'),
          daysRented: days,
        }
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating quick rental:', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
}
