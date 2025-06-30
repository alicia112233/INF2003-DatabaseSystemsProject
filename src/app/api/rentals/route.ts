import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'game_haven',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

// Get all rentals
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // First, let's get all rental records with user information
    const [rentals] = await connection.execute(`
      SELECT 
        rr.*,
        u.email as customer_email,
        g.title as game_title,
        g.price as game_price
      FROM RentalRecord rr
      JOIN users u ON rr.user_id = u.id
      JOIN Game g ON rr.game_id = g.id
      ORDER BY rr.depart_date DESC
    `);      // Transform the data to match our frontend structure
    const rentalData = (rentals as any[]).map((row) => ({
      id: row.id,
      customerEmail: row.customer_email,
      games: [{
        gameId: row.game_id,
        title: row.game_title,
        quantity: 1, // RentalRecord doesn't have quantity, default to 1
        dailyRate: parseFloat(row.game_price) * 0.25, // Quarter of game price as daily rate
      }],
      totalCost: row.duration ? parseFloat(row.game_price) * 0.25 * row.duration : 0,
      status: row.returned ? 'Returned' : 
              (row.return_date && new Date(row.return_date) < new Date()) ? 'Overdue' : 'Active',
      rentalDate: row.depart_date,
      returnDate: row.return_date,
      actualReturnDate: row.returned ? row.return_date : null,
      daysRented: row.duration || 1,
    }));
    
    await connection.end();
    
    return NextResponse.json(rentalData);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
  }
}

// Create new rental
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.beginTransaction();
    
    // Find user by email
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [data.customerEmail]
    );
    
    if ((users as any[]).length === 0) {
      await connection.rollback();
      await connection.end();
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const userId = (users as any[])[0].id;
    
    // Insert rental records for each game
    const rentalIds = [];
    for (const game of data.games) {
      for (let i = 0; i < game.quantity; i++) {
        const [result] = await connection.execute(`
          INSERT INTO RentalRecord (
            user_id, game_id, depart_date, return_date, duration, returned
          ) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          userId,
          game.gameId,
          data.rentalDate,
          data.returnDate,
          data.daysRented,
          data.status === 'Returned'
        ]);
        
        rentalIds.push((result as any).insertId);
      }
    }
    
    await connection.commit();
    await connection.end();
    
    return NextResponse.json({ 
      message: 'Rental created successfully', 
      ids: rentalIds 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
}

// Update rental
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);
    
    // Update the rental record
    await connection.execute(`
      UPDATE RentalRecord 
      SET return_date = ?, duration = ?, returned = ?
      WHERE id = ?
    `, [
      data.returnDate,
      data.daysRented,
      data.status === 'Returned',
      data.id,
    ]);
    
    await connection.end();
    
    return NextResponse.json({ message: 'Rental updated successfully' });
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 });
  }
}

// Delete rental
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const connection = await mysql.createConnection(dbConfig);
    
    // Delete rental record
    await connection.execute('DELETE FROM RentalRecord WHERE id = ?', [id]);
    
    await connection.end();
    
    return NextResponse.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental:', error);
    return NextResponse.json({ error: 'Failed to delete rental' }, { status: 500 });
  }
}