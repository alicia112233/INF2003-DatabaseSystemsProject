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

// Get user's rental history
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Get user's rental records
    const [rentals] = await connection.execute(`
      SELECT 
        rr.*,
        g.title as game_title,
        g.image_url as game_image,
        g.price as game_price,
        u.email as user_email
      FROM RentalRecord rr
      JOIN users u ON rr.user_id = u.id
      JOIN Game g ON rr.game_id = g.id
      WHERE u.email = ?
      ORDER BY rr.depart_date DESC
    `, [userEmail]);
    
    // Transform data for frontend
    const rentalData = (rentals as any[]).map((row) => ({
      id: row.id,
      gameTitle: row.game_title,
      gameImage: row.game_image || '/images/products/noprodimg.png',
      rentalDate: row.depart_date,
      returnDate: row.return_date,
      daysRented: row.duration || 1,
      dailyRate: parseFloat(row.game_price) * 0.25, // Quarter of the game price
      totalCost: (parseFloat(row.game_price) * 0.25) * (row.duration || 1),
      status: row.returned ? 'Returned' : 
              (row.return_date && new Date(row.return_date) < new Date()) ? 'Overdue' : 'Active',
      gameId: row.game_id,
    }));
    
    await connection.end();
    
    return NextResponse.json(rentalData);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
  }
}

// Create a new rental for the user
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { gameId, days } = await request.json();
    
    if (!gameId || !days || days < 1) {
      return NextResponse.json({ error: 'Invalid rental parameters' }, { status: 400 });
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
    
    // Check if game exists and get its price
    const [games] = await connection.execute(
      'SELECT id, title, price, stock_count FROM Game WHERE id = ?',
      [gameId]
    );
    
    if ((games as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const game = (games as any[])[0];
    
    // Check if game is available for rental (has stock)
    if (game.stock_count <= 0) {
      await connection.end();
      return NextResponse.json({ error: 'Game not available for rental' }, { status: 400 });
    }
    
    // Calculate dates
    const rentalDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + days);
    
    // Create rental record
    const [result] = await connection.execute(`
      INSERT INTO RentalRecord (
        user_id, game_id, depart_date, return_date, duration, returned
      ) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      gameId,
      rentalDate.toISOString().split('T')[0],
      returnDate.toISOString().split('T')[0],
      days,
      false
    ]);
    
    // Update game stock (reduce by 1 for rental)
    await connection.execute(
      'UPDATE Game SET stock_count = stock_count - 1 WHERE id = ?',
      [gameId]
    );
    
    await connection.end();
    
    const dailyRate = parseFloat(game.price) * 0.25;
    const totalCost = dailyRate * days;
    
    return NextResponse.json({
      message: 'Game rented successfully',
      rental: {
        id: (result as any).insertId,
        gameTitle: game.title,
        rentalDate: rentalDate.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        daysRented: days,
        dailyRate,
        totalCost,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
}
