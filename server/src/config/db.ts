import dotenv from 'dotenv';

dotenv.config();

// Determine database type based on environment
// Priority: DB_TYPE env var > port detection > NODE_ENV > default
function getDatabaseType(): 'mysql' | 'postgres' {
  // 1. Check DB_TYPE env variable first (explicit override)
  if (process.env.DB_TYPE) {
    if (process.env.DB_TYPE.toLowerCase() === 'mysql') {
      return 'mysql';
    }
    if (process.env.DB_TYPE.toLowerCase() === 'postgres' || process.env.DB_TYPE.toLowerCase() === 'postgresql') {
      return 'postgres';
    }
  }
  
  // 2. Check port (3306 = MySQL, 5432 = PostgreSQL)
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  if (dbPort === 3306) {
    return 'mysql';
  }
  if (dbPort === 5432) {
    return 'postgres';
  }
  
  // 3. Check NODE_ENV and host
  const nodeEnv = process.env.NODE_ENV || 'development';
  const dbHost = process.env.DB_HOST || '';
  
  // Production: use MySQL
  if (nodeEnv === 'production') {
    return 'mysql';
  }
  
  // Development/Staging: check if Supabase (PostgreSQL) or local (MySQL)
  if (dbHost.includes('supabase') || dbHost.includes('render') || dbHost.includes('railway')) {
    return 'postgres';
  }
  
  // Default: MySQL for local development
  return 'mysql';
}

const dbType = getDatabaseType();

// Re-export the appropriate database module based on environment
let dbModule: {
  pool: any;
  query: <T = any>(sql: string, params?: any[]) => Promise<T>;
  transaction: <T>(callback: (client: any) => Promise<T>) => Promise<T>;
  default: any;
};

if (dbType === 'mysql') {
  console.log('📦 Using MySQL database');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  dbModule = require('./db.mysql.js') as typeof dbModule;
} else {
  console.log('📦 Using PostgreSQL database');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  dbModule = require('./db.postgres.js') as typeof dbModule;
}

export const pool = dbModule.pool;
export const query = dbModule.query;
export const transaction = dbModule.transaction;
export default dbModule.default;
