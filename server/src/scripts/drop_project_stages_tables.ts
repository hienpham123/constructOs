import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dropProjectStagesTables() {
  try {
    console.log('🔄 Starting to drop project_stages and stage_checklists tables...');
    
    // Disable foreign key checks temporarily
    await query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Foreign key checks disabled');
    
    // Drop stage_checklists first (depends on project_stages)
    try {
      await query('DROP TABLE IF EXISTS stage_checklists');
      console.log('✅ Dropped table: stage_checklists');
    } catch (error: any) {
      console.log('⚠️  stage_checklists table may not exist:', error.message);
    }
    
    // Drop project_stages
    try {
      await query('DROP TABLE IF EXISTS project_stages');
      console.log('✅ Dropped table: project_stages');
    } catch (error: any) {
      console.log('⚠️  project_stages table may not exist:', error.message);
    }
    
    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Foreign key checks re-enabled');
    
    console.log('✅ Successfully dropped project stages tables!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropProjectStagesTables();

