import { query } from '../config/db.js';

async function verifyMigration() {
  try {
    console.log('🔍 Đang kiểm tra các tables...\n');
    
    // Check project_comments table
    const commentsTable = await query<any[]>(
      `SHOW TABLES LIKE 'project_comments'`
    );
    
    if (commentsTable.length > 0) {
      console.log('✅ Table project_comments đã tồn tại');
      
      // Show structure
      const structure = await query<any[]>(
        `DESCRIBE project_comments`
      );
      console.log('\n📋 Cấu trúc bảng project_comments:');
      structure.forEach((col) => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('❌ Table project_comments chưa tồn tại');
    }
    
    // Check comment_attachments table
    const attachmentsTable = await query<any[]>(
      `SHOW TABLES LIKE 'comment_attachments'`
    );
    
    if (attachmentsTable.length > 0) {
      console.log('\n✅ Table comment_attachments đã tồn tại');
      
      // Show structure
      const structure = await query<any[]>(
        `DESCRIBE comment_attachments`
      );
      console.log('\n📋 Cấu trúc bảng comment_attachments:');
      structure.forEach((col) => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('\n❌ Table comment_attachments chưa tồn tại');
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
    process.exit(1);
  }
}

verifyMigration();

