import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'game_haven',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

export async function POST() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Update all games to have stock count of 10 if they currently have 0 or null
    const [result] = await connection.execute(`
      UPDATE Game 
      SET stock_count = 10 
      WHERE stock_count = 0 OR stock_count IS NULL
    `);
    
    // Get count of games that were updated
    const [games] = await connection.execute(`
      SELECT COUNT(*) as total_games, 
             SUM(CASE WHEN stock_count > 0 THEN 1 ELSE 0 END) as games_with_stock 
      FROM Game
    `);
    
    await connection.end();
    
    return NextResponse.json({ 
      message: 'Stock updated successfully',
      result,
      gameStats: (games as any[])[0]
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
