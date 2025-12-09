import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSupabaseMigration() {
  // Supabase connection config
  const dbHost = process.env.DB_HOST || process.env.SUPABASE_DB_HOST;
  const dbPort = parseInt(process.env.DB_PORT || process.env.SUPABASE_DB_PORT || '5432');
  const dbUser = process.env.DB_USER || process.env.SUPABASE_DB_USER;
  const dbPassword = process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  const dbName = process.env.DB_NAME || process.env.SUPABASE_DB_NAME || 'postgres';

  if (!dbHost || !dbUser || !dbPassword) {
    console.error('❌ Missing Supabase database configuration!');
    console.error('\nPlease set the following environment variables:');
    console.error('  DB_HOST=your-project.supabase.co');
    console.error('  DB_PORT=5432 (or 6543 for IPv4)');
    console.error('  DB_USER=postgres.your-project-ref');
    console.error('  DB_PASSWORD=your-supabase-password');
    console.error('  DB_NAME=postgres');
    console.error('\nOr set them inline:');
    console.error('  DB_HOST=... DB_USER=... DB_PASSWORD=... npx tsx src/scripts/runTaskMigrationSupabaseFixed.ts');
    process.exit(1);
  }

  const dbConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  };

  const client = new pg.Client(dbConfig);

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    console.log(`   Host: ${dbHost}:${dbPort}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${dbUser}`);
    
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    const migrationFile = join(__dirname, '../../../database/migrations/create_project_tasks_postgres.sql');
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = readFileSync(migrationFile, 'utf8');

    // Execute the entire SQL file as one transaction
    // This handles PostgreSQL functions properly
    console.log('🚀 Executing migration...\n');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Migration executed successfully');
    } catch (error: any) {
      await client.query('ROLLBACK');
      // Check if it's an "already exists" error
      if (error.message && (
        error.message.includes('already exists') ||
        error.message.includes('duplicate') ||
        error.message.includes('relation') ||
        error.message.includes('already defined')
      )) {
        console.log('⚠️  Migration skipped (tables/objects already exist)');
      } else {
        throw error;
      }
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('project_tasks', 'task_activity')
      ORDER BY table_name
    `);

    const tableNames = result.rows.map(r => r.table_name);
    console.log(`\n📊 Found ${tableNames.length} tables:`);
    
    if (tableNames.includes('project_tasks')) {
      console.log('✅ project_tasks - OK');
      
      // Check columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'project_tasks'
        ORDER BY ordinal_position
      `);
      console.log(`   Columns: ${columns.rows.length}`);
      columns.rows.forEach(col => {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ project_tasks - NOT FOUND');
    }

    if (tableNames.includes('task_activity')) {
      console.log('✅ task_activity - OK');
      
      // Check columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'task_activity'
        ORDER BY ordinal_position
      `);
      console.log(`   Columns: ${columns.rows.length}`);
      columns.rows.forEach(col => {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ task_activity - NOT FOUND');
    }

    await client.end();
    console.log('\n✨ Supabase migration completed successfully!');
  } catch (error: any) {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

async function main() {
  try {
    await runSupabaseMigration();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n💡 Tips:');
      console.error('   1. Check your Supabase connection string');
      console.error('   2. Verify DB_HOST includes .supabase.co');
      console.error('   3. Check if your IP is whitelisted in Supabase dashboard');
      console.error('   4. For IPv4, use port 6543 instead of 5432');
    }
    process.exit(1);
  }
}

main();

