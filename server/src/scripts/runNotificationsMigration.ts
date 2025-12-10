import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

async function runMigration() {
  // Database configuration từ .env
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'constructos',
    multipleStatements: true, // Cho phép chạy nhiều câu lệnh SQL
  };

  let connection: mysql.Connection | null = null;

  try {
    console.log('🔌 Đang kết nối đến database...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Đã kết nối database thành công!\n');

    // Đọc file migration
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = join(__dirname, '../..', '..');
    const migrationFile = join(projectRoot, 'database', 'migrations', 'create_notifications_table.sql');
    
    console.log(`📄 Đang đọc file migration: ${migrationFile}`);
    const sqlContent = readFileSync(migrationFile, 'utf8');
    console.log('✅ Đã đọc file migration thành công!\n');

    // Kiểm tra xem bảng đã tồn tại chưa
    const [tables] = await connection.execute<any[]>(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'`,
      [dbConfig.database]
    );

    if (tables.length > 0) {
      console.log('⚠️  Bảng `notifications` đã tồn tại.');
      console.log('   Bạn có muốn tiếp tục? (Migration sẽ không tạo lại bảng nếu đã tồn tại)');
    }

    console.log('🚀 Đang chạy migration...\n');
    console.log('SQL:');
    console.log('─'.repeat(60));
    console.log(sqlContent);
    console.log('─'.repeat(60));
    console.log('');

    // Chạy migration
    await connection.query(sqlContent);

    console.log('✅ Migration đã chạy thành công!\n');

    // Kiểm tra lại bảng đã được tạo
    const [checkTables] = await connection.execute<any[]>(
      `SELECT TABLE_NAME, TABLE_ROWS
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'`,
      [dbConfig.database]
    );

    if (checkTables.length > 0) {
      console.log('✅ Bảng `notifications` đã được tạo thành công!');
      console.log(`   Số dòng hiện tại: ${checkTables[0].TABLE_ROWS || 0}`);
    } else {
      console.log('⚠️  Không tìm thấy bảng `notifications` sau khi chạy migration.');
    }

    // Kiểm tra các cột trong bảng
    const [columns] = await connection.execute<any[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
       ORDER BY ORDINAL_POSITION`,
      [dbConfig.database]
    );

    if (columns.length > 0) {
      console.log('\n📋 Các cột trong bảng `notifications`:');
      columns.forEach((col) => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    console.log('\n🎉 Hoàn tất!');
  } catch (error: any) {
    console.error('\n❌ Lỗi khi chạy migration:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Đã đóng kết nối database.');
    }
  }
}

runMigration().catch(console.error);

