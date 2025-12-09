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

  let connection: mysql.Connection | null = null;

  try {
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL: ${dbConfig.database}`);

    const migrationFile = join(__dirname, '../../../database/migrations/create_project_tasks.sql');
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = readFileSync(migrationFile, 'utf8');

    console.log('🚀 Executing migration...');
    await connection.query(sql);

    console.log('✅ Migration executed successfully');

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES LIKE ?', ['project_tasks']);
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('✅ Table project_tasks exists');
    } else {
      console.log('❌ Table project_tasks not found');
    }

    const [activityTables] = await connection.query('SHOW TABLES LIKE ?', ['task_activity']);
    if (Array.isArray(activityTables) && activityTables.length > 0) {
      console.log('✅ Table task_activity exists');
    } else {
      console.log('❌ Table task_activity not found');
    }

    await connection.end();
    console.log('\n✨ Migration completed successfully!');
  } catch (error: any) {
    if (connection) await connection.end();
    throw error;
  }
}

async function runPostgresMigration() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbConfig = {
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'constructos',
    // Enable SSL for Supabase (production), but allow non-SSL for local dev
    ssl: process.env.DB_SSL === 'true' || dbHost.includes('supabase') 
      ? { rejectUnauthorized: false } 
      : false,
  };

  const client = new pg.Client(dbConfig);

  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log(`✅ Connected to PostgreSQL: ${dbConfig.database}`);

    const migrationFile = join(__dirname, '../../../database/migrations/create_project_tasks_postgres.sql');
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = readFileSync(migrationFile, 'utf8');

    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

    console.log(`🚀 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        await client.query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('relation')
        )) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = current_schema() 
      AND table_name IN ('project_tasks', 'task_activity')
    `);

    const tableNames = result.rows.map(r => r.table_name);
    if (tableNames.includes('project_tasks')) {
      console.log('✅ Table project_tasks exists');
    } else {
      console.log('❌ Table project_tasks not found');
    }

    if (tableNames.includes('task_activity')) {
      console.log('✅ Table task_activity exists');
    } else {
      console.log('❌ Table task_activity not found');
    }

    await client.end();
    console.log('\n✨ Migration completed successfully!');
  } catch (error: any) {
    await client.end();
    throw error;
  }
}

async function main() {
  try {
    const dbType = getDatabaseType();
    console.log(`📦 Database type detected: ${dbType}\n`);

    if (dbType === 'mysql') {
      await runMySQLMigration();
    } else {
      await runPostgresMigration();
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();

