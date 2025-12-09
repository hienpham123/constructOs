import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine database type
function getDatabaseType(): 'mysql' | 'postgres' {
  if (process.env.DB_TYPE) {
    if (process.env.DB_TYPE.toLowerCase() === 'mysql') return 'mysql';
    if (process.env.DB_TYPE.toLowerCase() === 'postgres' || process.env.DB_TYPE.toLowerCase() === 'postgresql') return 'postgres';
  }
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  const dbHost = process.env.DB_HOST || '';
  
  if (nodeEnv === 'production' || nodeEnv === 'local') {
    if (dbHost.includes('supabase') || dbHost.includes('render') || dbHost.includes('railway') || dbHost.includes('postgres')) {
      return 'postgres';
    }
    return 'mysql';
  }
  
  if (nodeEnv === 'development') {
    if (dbHost.includes('supabase') || dbHost.includes('render') || dbHost.includes('railway') || dbHost.includes('postgres')) {
      return 'postgres';
    }
    return 'mysql';
  }
  
  const dbPort = parseInt(process.env.DB_PORT || '3306');
  if (dbPort === 3306) return 'mysql';
  if (dbPort === 5432 || dbPort === 6543) return 'postgres';
  
  return 'mysql';
}

async function runMySQLMigration() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'constructos',
    multipleStatements: true,
  };

  console.log('🔌 Connecting to MySQL...');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);

  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connected to MySQL');

  try {
    // Go up from server/src/scripts to root, then to database/migrations
    const migrationPath = join(__dirname, '../../../database/migrations/add_manager_ids_to_projects.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Running migration...');
    await connection.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Column manager_ids already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

async function runPostgreSQLMigration() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'constructos',
    ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
  };

  console.log('🔌 Connecting to PostgreSQL...');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);

  const client = new pg.Client(dbConfig);
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  try {
    // Go up from server/src/scripts to root, then to database/migrations
    const migrationPath = join(__dirname, '../../../database/migrations/add_manager_ids_to_projects_postgres.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    if (error.code === '42701') {
      console.log('⚠️  Column manager_ids already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await client.end();
  }
}

async function main() {
  const dbType = getDatabaseType();
  console.log(`\n🚀 Running manager_ids migration for ${dbType.toUpperCase()}\n`);

  try {
    if (dbType === 'mysql') {
      await runMySQLMigration();
    } else {
      await runPostgreSQLMigration();
    }
    console.log('\n✨ All done!');
  } catch (error: any) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
