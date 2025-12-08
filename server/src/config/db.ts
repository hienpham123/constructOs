import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'constructos',
  max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Handle pool errors gracefully
pool.on('error', (err, client) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
  // Don't crash the server on pool errors
});

// Helper function to convert MySQL placeholders (?) to PostgreSQL placeholders ($1, $2, ...)
function convertMySQLToPostgreSQL(sql: string, params?: any[]): string {
  if (!params || params.length === 0) {
    return sql;
  }
  
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Helper function to execute queries
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    // Validate SQL is not empty
    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      throw new Error('SQL query cannot be empty');
    }

    // Convert MySQL placeholders to PostgreSQL placeholders
    const pgSql = convertMySQLToPostgreSQL(sql, params);
    
    // Validate converted SQL
    if (!pgSql || pgSql.trim().length === 0) {
      throw new Error('Converted SQL query cannot be empty');
    }

    const result = await pool.query(pgSql, params);
    return result.rows as T;
  } catch (error: any) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Helper function for transactions
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  await client.query('BEGIN');

  try {
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;

