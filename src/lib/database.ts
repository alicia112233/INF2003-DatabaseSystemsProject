import mysql from 'mysql2/promise';

// Create a connection pool for efficient query handling
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Executes a SQL query with optional parameters
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(query, params);
  return rows as T;
}
