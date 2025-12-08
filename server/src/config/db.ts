import dotenv from 'dotenv';

dotenv.config();

// Auto-detect database type based on port
const dbPort = parseInt(process.env.DB_PORT || '5432');
const useMySQL = dbPort === 3306;

// Re-export the appropriate database module based on port
// This is a runtime decision, so we need to use dynamic imports
let dbModule: {
  pool: any;
  query: <T = any>(sql: string, params?: any[]) => Promise<T>;
  transaction: <T>(callback: (client: any) => Promise<T>) => Promise<T>;
  default: any;
};

if (useMySQL) {
  // Use MySQL for local development (port 3306)
  console.log('📦 Using MySQL database (port 3306)');
  dbModule = require('./db.mysql.js') as typeof dbModule;
} else {
  // Use PostgreSQL for production/Supabase (port 5432 or other)
  console.log('📦 Using PostgreSQL database');
  dbModule = require('./db.postgres.js') as typeof dbModule;
}

export const pool = dbModule.pool;
export const query = dbModule.query;
export const transaction = dbModule.transaction;
export default dbModule.default;
