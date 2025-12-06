import { query } from '../config/db.js';

/**
 * Script để xóa các cột cũ (code, client) sau khi đã migrate xong
 * CHẠY CẨN THẬN - Script này sẽ xóa vĩnh viễn các cột cũ
 */
async function cleanupOldColumns() {
  try {
    console.log('⚠️  CẢNH BÁO: Script này sẽ xóa các cột code và client');
    console.log('📋 Kiểm tra cấu trúc table hiện tại...\n');

    const columns = await query<any[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'projects' 
       AND COLUMN_NAME IN ('code', 'client')`
    );

    if (columns.length === 0) {
      console.log('✅ Các cột cũ đã được xóa rồi');
      process.exit(0);
    }

    console.log('Các cột sẽ bị xóa:');
    columns.forEach((col) => {
      console.log(`  - ${col.COLUMN_NAME}`);
    });

    // Uncomment các dòng dưới để thực sự xóa
    // console.log('\n🗑️  Đang xóa cột code...');
    // await query('DROP INDEX idx_projects_code ON projects');
    // await query('ALTER TABLE projects DROP COLUMN code');
    // console.log('✅ Đã xóa cột code');

    // console.log('🗑️  Đang xóa cột client...');
    // await query('ALTER TABLE projects DROP COLUMN client');
    // console.log('✅ Đã xóa cột client');

    console.log('\n⚠️  Script đã được comment để an toàn.');
    console.log('💡 Nếu muốn xóa, hãy uncomment các dòng trong script này và chạy lại.');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

cleanupOldColumns();

