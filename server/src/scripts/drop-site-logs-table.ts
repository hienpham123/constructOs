import { query } from '../config/db.js';

async function dropSiteLogsTable() {
  console.log('🔄 Bắt đầu xóa bảng site_logs...');

  try {
    // Drop indexes first
    console.log('\n📋 Xóa indexes...');
    try {
      await query('DROP INDEX IF EXISTS idx_site_logs_project_id ON site_logs');
      await query('DROP INDEX IF EXISTS idx_site_logs_date ON site_logs');
      await query('DROP INDEX IF EXISTS idx_site_logs_created_at ON site_logs');
      console.log('✅ Đã xóa các indexes');
    } catch (error: any) {
      console.log('⚠️  Không tìm thấy indexes hoặc đã bị xóa:', error.message);
    }

    // Drop triggers if they exist
    console.log('\n📋 Xóa triggers...');
    try {
      await query('DROP TRIGGER IF EXISTS update_site_logs_updated_at');
      console.log('✅ Đã xóa triggers');
    } catch (error: any) {
      console.log('⚠️  Không tìm thấy triggers hoặc đã bị xóa:', error.message);
    }

    // Drop the table
    console.log('\n📋 Xóa bảng site_logs...');
    await query('DROP TABLE IF EXISTS site_logs');
    console.log('✅ Đã xóa bảng site_logs');

    // Verify deletion
    try {
      await query('SELECT 1 FROM site_logs LIMIT 1');
      console.log('⚠️  Cảnh báo: Bảng site_logs vẫn còn tồn tại!');
    } catch (error: any) {
      console.log('✅ Xác nhận: Bảng site_logs đã được xóa thành công');
    }

    console.log('\n✅ Hoàn tất! Bảng site_logs đã được xóa khỏi database.');

  } catch (error: any) {
    console.error('❌ Lỗi trong quá trình xóa bảng:', error.message);
    process.exit(1);
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
}

dropSiteLogsTable();

