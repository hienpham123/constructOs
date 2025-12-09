import dotenv from 'dotenv';

dotenv.config();

// Determine database type based on environment
// Priority: DB_TYPE env var > NODE_ENV > port detection > host detection > default
// - Local and Production: MySQL
// - Development (Render, etc.): PostgreSQL
function getDatabaseType(): 'mysql' | 'postgres' {
  // 1. Check DB_TYPE env variable first (explicit override - highest priority)
  if (process.env.DB_TYPE) {
    if (process.env.DB_TYPE.toLowerCase() === 'mysql') {
      return 'mysql';
    }
    if (process.env.DB_TYPE.toLowerCase() === 'postgres' || process.env.DB_TYPE.toLowerCase() === 'postgresql') {
      return 'postgres';
    }
  }
  
  // 2. Check NODE_ENV (second priority)
  const nodeEnv = process.env.NODE_ENV || 'development';
  const dbHost = process.env.DB_HOST || '';
  
  // Production and local environments: use MySQL
  if (nodeEnv === 'production' || nodeEnv === 'local') {
    // Exception: if host indicates cloud PostgreSQL service, use PostgreSQL
    // (Some production deployments might use PostgreSQL)
    if (dbHost.includes('supabase') || dbHost.includes('render') || dbHost.includes('railway') || dbHost.includes('postgres')) {
      return 'postgres';
    }
    return 'mysql';
  }
  
  // 3. Development environment: check host for PostgreSQL services
  if (nodeEnv === 'development') {
    // Development on cloud services (Render, etc.): use PostgreSQL
    if (dbHost.includes('supabase') || dbHost.includes('render') || dbHost.includes('railway') || dbHost.includes('postgres')) {
      return 'postgres';
    }
    // Local development: use MySQL
    return 'mysql';
  }
  
  // 4. Check port as fallback (3306 = MySQL, 5432/6543 = PostgreSQL)
  // 6543 is used by Supabase for IPv4 connections
  const dbPort = parseInt(process.env.DB_PORT || '3306');
  if (dbPort === 3306) {
    return 'mysql';
  }
  if (dbPort === 5432 || dbPort === 6543) {
    return 'postgres';
  }
  
  // 5. Default: MySQL for local development
  return 'mysql';
}

const dbType = getDatabaseType();

// Use dynamic import for ES modules compatibility
let dbModulePromise: Promise<{
  pool: any;
  query: <T = any>(sql: string, params?: any[]) => Promise<T>;
  transaction: <T>(callback: (client: any) => Promise<T>) => Promise<T>;
  default: any;
}>;

if (dbType === 'mysql') {
  console.log('📦 Using MySQL database');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  dbModulePromise = import('./db.mysql.js');
} else {
  console.log('📦 Using PostgreSQL database');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  dbModulePromise = import('./db.postgres.js');
}

// Wait for module to load and export
const dbModule = await dbModulePromise;

export const pool = dbModule.pool;
export const query = dbModule.query;
export const transaction = dbModule.transaction;
export { dbType }; // Export dbType so controllers can use it
export default dbModule.default;
