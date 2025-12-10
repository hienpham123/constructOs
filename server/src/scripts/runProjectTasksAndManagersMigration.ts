import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL: ${dbConfig.database}`);

    const migrationFile = join(__dirname, '../../../database/migrations/create_project_tasks_and_add_managers.sql');
    console.log(`\n📄 Reading migration file: ${migrationFile}`);
    const sql = readFileSync(migrationFile, 'utf8');

    console.log('🚀 Executing migration...\n');
    
    // Execute CREATE TABLE statements separately
    console.log('📝 [1/3] Creating project_tasks table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_tasks (
          id CHAR(36) PRIMARY KEY,
          project_id CHAR(36) NOT NULL COMMENT 'Dự án',
          parent_task_id CHAR(36) NULL COMMENT 'Công việc cha (null nếu là công việc gốc)',
          title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề công việc',
          description TEXT NULL COMMENT 'Mô tả chi tiết',
          status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái: pending, in_progress, submitted, completed, blocked, cancelled',
          priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'Độ ưu tiên: low, normal, high',
          due_date DATE NULL COMMENT 'Hạn hoàn thành',
          assigned_to CHAR(36) NOT NULL COMMENT 'Người được giao (bắt buộc)',
          assigned_to_name VARCHAR(255) NULL COMMENT 'Tên người được giao (denormalized)',
          created_by CHAR(36) NOT NULL COMMENT 'Người tạo',
          created_by_name VARCHAR(255) NULL COMMENT 'Tên người tạo (denormalized)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_project_id (project_id),
          INDEX idx_parent_task_id (parent_task_id),
          INDEX idx_assigned_to (assigned_to),
          INDEX idx_status (status),
          INDEX idx_priority (priority),
          INDEX idx_due_date (due_date),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ project_tasks table created\n');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
        console.log('   ⚠️  project_tasks table already exists\n');
      } else {
        console.error('   ❌ Error:', error.message);
        throw error;
      }
    }

    console.log('📝 [2/3] Creating task_activity table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS task_activity (
          id CHAR(36) PRIMARY KEY,
          task_id CHAR(36) NOT NULL COMMENT 'Công việc',
          action VARCHAR(50) NOT NULL COMMENT 'Hành động: created, assigned, status_changed, updated, commented',
          note TEXT NULL COMMENT 'Ghi chú hoặc nội dung thay đổi',
          actor_id CHAR(36) NOT NULL COMMENT 'Người thực hiện',
          actor_name VARCHAR(255) NULL COMMENT 'Tên người thực hiện (denormalized)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_task_id (task_id),
          INDEX idx_action (action),
          INDEX idx_actor_id (actor_id),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ task_activity table created\n');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
        console.log('   ⚠️  task_activity table already exists\n');
      } else {
        console.error('   ❌ Error:', error.message);
        throw error;
      }
    }

    console.log('📝 [3/3] Adding manager_ids column to projects table...');
    try {
      await connection.query(`
        ALTER TABLE projects 
        ADD COLUMN manager_ids TEXT NULL COMMENT 'Danh sách ID quản lý dự án (JSON array)'
      `);
      console.log('   ✅ manager_ids column added\n');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  manager_ids column already exists\n');
      } else {
        console.error('   ❌ Error:', error.message);
        throw error;
      }
    }

    console.log('\n✅ Migration executed successfully');

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

    // Verify manager_ids column
    console.log('\n🔍 Verifying manager_ids column...');
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'projects' 
       AND COLUMN_NAME = 'manager_ids'`,
      [dbConfig.database]
    );
    
    if (Array.isArray(columns) && columns.length > 0) {
      const col = columns[0] as any;
      console.log(`✅ Column manager_ids exists (${col.DATA_TYPE}, ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
      console.log(`   Comment: ${col.COLUMN_COMMENT || ''}`);
    } else {
      console.log('❌ Column manager_ids not found');
    }

    await connection.end();
    console.log('\n✨ Migration completed successfully!');
  } catch (error: any) {
    if (connection) await connection.end();
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('📦 Running migration: Create project_tasks, task_activity tables and add manager_ids field\n');
    await runMySQLMigration();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();

