import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'constructos',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
  })
  .catch((error) => {
    console.error('❌ MySQL connection error:', error.message);
    console.error('Please check your database configuration in .env file');
  });

// Helper function to execute queries
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Helper function for transactions
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
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

export default pool;

