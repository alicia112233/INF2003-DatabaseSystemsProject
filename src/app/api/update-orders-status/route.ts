import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: "game_haven",
  port: Number(process.env.MYSQL_PORT) || 3306,
};

export async function POST(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Update all existing 'Pending' orders to 'Completed'
    const [result] = await connection.query(
      `UPDATE Orders SET status = 'Completed' WHERE status = 'Pending'`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${(result as any).affectedRows} orders from Pending to Completed` 
    });
    
  } catch (error: any) {
    console.error('Update orders status error:', error);
    return NextResponse.json({ 
      error: "Failed to update orders status", 
      details: error.message 
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
