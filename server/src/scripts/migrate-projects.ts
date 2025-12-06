import { query } from '../config/db.js';

async function migrateProjects() {
  try {
    console.log('🔄 Bắt đầu migration projects table...\n');

    // Step 1: Check if columns already exist
    console.log('📋 Kiểm tra cấu trúc table...');
    const columns = await query<any[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'projects' 
       AND COLUMN_NAME IN ('investor', 'contact_person')`
    );

    const hasInvestor = columns.some((col) => col.COLUMN_NAME === 'investor');
    const hasContactPerson = columns.some((col) => col.COLUMN_NAME === 'contact_person');

    // Step 2: Add new columns if they don't exist
    if (!hasInvestor) {
      console.log('➕ Thêm cột investor...');
      await query(
        `ALTER TABLE projects 
         ADD COLUMN investor VARCHAR(255) AFTER description`
      );
      console.log('✅ Đã thêm cột investor');
    } else {
      console.log('ℹ️  Cột investor đã tồn tại');
    }

    if (!hasContactPerson) {
      console.log('➕ Thêm cột contact_person...');
      await query(
        `ALTER TABLE projects 
         ADD COLUMN contact_person VARCHAR(255) AFTER investor`
      );
      console.log('✅ Đã thêm cột contact_person');
    } else {
      console.log('ℹ️  Cột contact_person đã tồn tại');
    }

    // Step 3: Migrate data from client to investor
    console.log('📦 Migrate dữ liệu từ client sang investor...');
    const migrateResult = await query<any[]>(
      `UPDATE projects 
       SET investor = client 
       WHERE (investor IS NULL OR investor = '') AND client IS NOT NULL`
    );
    console.log('✅ Đã migrate dữ liệu');

    // Step 4: Update status column to VARCHAR
    console.log('🔄 Cập nhật cột status...');
    await query(
      `ALTER TABLE projects 
       MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'quoting'`
    );
    console.log('✅ Đã cập nhật cột status');

    // Step 5: Update existing status values to new format
    console.log('🔄 Cập nhật giá trị status cũ...');
    await query(
      `UPDATE projects 
       SET status = 'quoting' 
       WHERE status = 'planning'`
    );
    await query(
      `UPDATE projects 
       SET status = 'failed' 
       WHERE status = 'cancelled'`
    );
    console.log('✅ Đã cập nhật giá trị status');

    console.log('\n✅ Migration hoàn tất!');
    console.log('\n📊 Kiểm tra kết quả:');
    const checkColumns = await query<any[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'projects' 
       AND COLUMN_NAME IN ('investor', 'contact_person', 'status')`
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

migrateProjects();

