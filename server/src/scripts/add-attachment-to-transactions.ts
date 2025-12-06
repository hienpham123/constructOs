import { query } from '../config/db.js';

async function addAttachmentToTransactions() {
  console.log('🔄 Bắt đầu thêm cột attachment vào material_transactions...');

  try {
    // Check if column exists
    const columns = await query<any[]>(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'material_transactions' 
       AND COLUMN_NAME = 'attachment'`
    );

    if (columns.length === 0) {
      console.log('\n📋 Thêm cột attachment...');
      await query(`
        ALTER TABLE material_transactions 
        ADD COLUMN attachment TEXT NULL
      `);
      console.log('✅ Đã thêm cột attachment');
    } else {
      console.log('✅ Cột attachment đã tồn tại');
    }

    // Update type column to remove 'adjustment' option
    console.log('\n📋 Cập nhật cột type (xóa option adjustment)...');
    
    // First, update existing 'adjustment' records to 'import'
    const adjustmentCount = await query<any[]>(
      `SELECT COUNT(*) as count FROM material_transactions WHERE type = 'adjustment'`
    );
    
    if (adjustmentCount[0]?.count > 0) {
      console.log(`⚠️  Tìm thấy ${adjustmentCount[0].count} bản ghi có type = 'adjustment', đang chuyển sang 'import'...`);
      await query(`
        UPDATE material_transactions 
        SET type = 'import' 
        WHERE type = 'adjustment'
      `);
      console.log('✅ Đã cập nhật các bản ghi adjustment → import');
    }

    // Modify type column to VARCHAR (remove ENUM constraint)
    await query(`
      ALTER TABLE material_transactions 
      MODIFY COLUMN type VARCHAR(20) NOT NULL
    `);
    console.log('✅ Đã cập nhật cột type thành VARCHAR(20)');

    // Verify changes
    const describeResult = await query<any[]>('DESCRIBE material_transactions');
    console.log('\n📊 Kiểm tra kết quả:');
    describeResult.forEach((col) => {
      if (col.Field === 'attachment' || col.Field === 'type') {
        console.log(`  - ${col.Field}: ${col.Type} (null: ${col.Null === 'YES' ? 'YES' : 'NO'})`);
      }
    });

    const sampleTransactions = await query<any[]>(
      "SELECT id, type, attachment FROM material_transactions LIMIT 3"
    );
    console.log('\n🔍 Dữ liệu mẫu sau migration:');
    console.table(sampleTransactions);

    console.log('\n✅ Migration hoàn tất!');

  } catch (error: any) {
    console.error('❌ Lỗi trong quá trình migration:', error.message);
    process.exit(1);
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
}

addAttachmentToTransactions();

