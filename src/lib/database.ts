import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'game_haven',
  port: Number(process.env.MYSQL_PORT) || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  maxIdle: 5
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to get connection from pool
export async function getConnection() {
  return await pool.getConnection();
}

// Helper function to execute query with automatic connection management
export async function executeQuery(query: string, params: any[] = []) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(query, params);
    return result;
  } finally {
    connection.release();
  }
}

// Helper function to execute transaction
export async function executeTransaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
}

export default pool;
