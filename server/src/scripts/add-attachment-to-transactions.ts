import { query } from '../config/db.js';

async function addAttachmentToTransactions() {
  console.log('🔄 Bắt đầu thêm cột attachment vào material_transactions...');

  try {
    // Check if column exists (PostgreSQL syntax)
    const columns = await query<any[]>(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       AND table_name = $1 
       AND column_name = $2`,
      ['material_transactions', 'attachment']
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

    // Modify type column to VARCHAR (PostgreSQL syntax)
    await query(`
      ALTER TABLE material_transactions 
      ALTER COLUMN type TYPE VARCHAR(20),
      ALTER COLUMN type SET NOT NULL
    `);
    console.log('✅ Đã cập nhật cột type thành VARCHAR(20)');

    // Verify changes (PostgreSQL syntax)
    const describeResult = await query<any[]>(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1
       AND column_name IN ($2, $3)
       ORDER BY column_name`,
      ['material_transactions', 'attachment', 'type']
    );
    console.log('\n📊 Kiểm tra kết quả:');
    describeResult.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (null: ${col.is_nullable === 'YES' ? 'YES' : 'NO'})`);
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

