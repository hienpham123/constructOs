import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../config/db.js';

async function runMigration() {
  try {
    console.log('🔄 Đang chạy migration: create_project_comments.sql');
    
    // Read migration file
    const migrationPath = join(process.cwd(), '..', 'database', 'migrations', 'create_project_comments.sql');
    console.log('📁 Migration file path:', migrationPath);
    
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Remove comments and split by semicolon
    const cleanedSql = sql
      .split('\n')
      .map(line => {
        // Remove inline comments
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n');
    
    // Split by semicolon and filter empty statements
    const statements = cleanedSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 [${i + 1}/${statements.length}] Executing statement...`);
        console.log(`   ${statement.substring(0, 100)}...`);
        try {
          await query(statement + ';');
          console.log(`   ✅ Statement ${i + 1} executed successfully\n`);
        } catch (err: any) {
          console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
          throw err;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - project_comments');
    console.log('   - comment_attachments');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();

