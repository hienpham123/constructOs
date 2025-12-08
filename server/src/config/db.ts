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
  connectionTimeoutMillis: 5000, // Increase timeout
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create connection pool with lazy initialization
let poolInstance: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new Pool(dbConfig);
    
    // Handle pool errors gracefully - catch all errors silently
    // This prevents handleEmptyQuery and other non-critical errors from crashing server
    poolInstance.on('error', (err: Error, client: any) => {
      // Suppress all pg client internal errors that don't affect functionality
      const errorMsg = err.message || '';
      if (
        errorMsg.includes('handleEmptyQuery') ||
        errorMsg.includes('Cannot read properties of undefined') ||
        errorMsg.includes('activeQuery')
      ) {
        // Silently ignore - these are often pg client internal issues
        // that don't affect actual database operations
        return;
      }
      // Only log real database errors
      console.error('❌ PostgreSQL pool error:', errorMsg);
    });
  }
  return poolInstance;
}

export const pool = new Proxy({} as pg.Pool, {
  get(target, prop) {
    return getPool()[prop as keyof pg.Pool];
  }
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
  let retries = 3;
  let lastError: any;
  
  while (retries > 0) {
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

      // Get pool instance
      const pool = getPool();
      
      // Ensure pool is ready before querying
      if (!pool || pool.ended) {
        throw new Error('Database pool is not available');
      }

      try {
        const result = await pool.query(pgSql, params);
        return result.rows as T;
      } catch (queryError: any) {
        // Handle connection errors - retry with new connection
        if (queryError.message && (
          queryError.message.includes('Connection terminated') ||
          queryError.message.includes('Connection ended') ||
          queryError.message.includes('Client has encountered a connection error') ||
          queryError.message.includes('server closed the connection')
        )) {
          lastError = queryError;
          retries--;
          if (retries > 0) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            // Force pool to create new connection
            continue;
          }
        }
        
        // Handle specific pg client errors (handleEmptyQuery is often non-critical)
        if (queryError.message && (
          queryError.message.includes('handleEmptyQuery') ||
          (queryError.message.includes('Cannot read properties of undefined') && 
           queryError.message.includes('handleEmptyQuery'))
        )) {
          // This is often a pg client internal issue, try once more with small delay
          try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            const result = await pool.query(pgSql, params);
            return result.rows as T;
          } catch (retryError: any) {
            // If retry fails, log and throw original error
            console.warn('Query retry failed after handleEmptyQuery error');
            throw queryError;
          }
        }
        throw queryError;
      }
    } catch (error: any) {
      lastError = error;
      // Don't retry for validation errors
      if (error.message && (
        error.message.includes('cannot be empty') ||
        error.message.includes('not available')
      )) {
        throw error;
      }
      
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      console.error('Database query error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Database query failed after retries');
}

// Helper function for transactions
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
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

