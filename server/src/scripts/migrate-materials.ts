import { query } from '../config/db.js';

async function migrateMaterials() {
  try {
    console.log('🔄 Bắt đầu migration materials table...\n');

    // Step 1: Check if columns already exist
    console.log('📋 Kiểm tra cấu trúc table...');
    const columns = await query<any[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'materials' 
       AND COLUMN_NAME IN ('type', 'import_price')`
    );

    const hasType = columns.some((col) => col.COLUMN_NAME === 'type');
    const hasImportPrice = columns.some((col) => col.COLUMN_NAME === 'import_price');

    // Step 2: Add new columns if they don't exist
    if (!hasType) {
      console.log('➕ Thêm cột type...');
      await query(
        `ALTER TABLE materials 
         ADD COLUMN type VARCHAR(100) AFTER name`
      );
      console.log('✅ Đã thêm cột type');
    } else {
      console.log('ℹ️  Cột type đã tồn tại');
    }

    if (!hasImportPrice) {
      console.log('➕ Thêm cột import_price...');
      await query(
        `ALTER TABLE materials 
         ADD COLUMN import_price DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER current_stock`
      );
      console.log('✅ Đã thêm cột import_price');
    } else {
      console.log('ℹ️  Cột import_price đã tồn tại');
    }

    // Step 3: Migrate data from category to type
    if (!hasType) {
      console.log('📦 Migrate dữ liệu từ category sang type...');
      await query(
        `UPDATE materials 
         SET type = category 
         WHERE (type IS NULL OR type = '') AND category IS NOT NULL`
      );
      console.log('✅ Đã migrate dữ liệu category → type');
    }

    // Step 4: Migrate data from unit_price to import_price
    if (!hasImportPrice) {
      console.log('📦 Migrate dữ liệu từ unit_price sang import_price...');
      await query(
        `UPDATE materials 
         SET import_price = unit_price 
         WHERE import_price = 0 AND unit_price > 0`
      );
      console.log('✅ Đã migrate dữ liệu unit_price → import_price');
    }

    console.log('\n✅ Migration hoàn tất!');
    console.log('\n📊 Kiểm tra kết quả:');
    const checkColumns = await query<any[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'materials' 
       AND COLUMN_NAME IN ('type', 'import_price')`
    );
    
    checkColumns.forEach((col) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (default: ${col.COLUMN_DEFAULT || 'NULL'})`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Lỗi migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateMaterials();

