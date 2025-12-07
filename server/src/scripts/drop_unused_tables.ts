import { query } from '../config/db.js';

async function dropUnusedTables() {
  try {
    console.log('🔄 Starting to drop unused tables (attendance, project_documents)...');
    
    // Disable foreign key checks temporarily
    await query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled');
    
    // Drop attendance table
    try {
      await query('DROP TABLE IF EXISTS attendance');
      console.log('✅ Dropped table: attendance');
    } catch (error: any) {
      console.log('⚠️  attendance table may not exist:', error.message);
    }
    
    // Drop project_documents table
    try {
      await query('DROP TABLE IF EXISTS project_documents');
      console.log('✅ Dropped table: project_documents');
    } catch (error: any) {
      console.log('⚠️  project_documents table may not exist:', error.message);
    }
    
    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks re-enabled');
    
    console.log('✅ Successfully dropped unused tables!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropUnusedTables();

