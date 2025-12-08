import { query } from '../config/db.js';

async function verifyMigration() {
  try {
    console.log('🔍 Đang kiểm tra các tables...\n');
    
    // Check project_comments table (PostgreSQL syntax)
    const commentsTable = await query<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      ['project_comments']
    );
    
    if (commentsTable.length > 0) {
      console.log('✅ Table project_comments đã tồn tại');
      
      // Show structure (PostgreSQL syntax)
      const structure = await query<any[]>(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        ['project_comments']
      );
      console.log('\n📋 Cấu trúc bảng project_comments:');
      structure.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('❌ Table project_comments chưa tồn tại');
    }
    
    // Check comment_attachments table (PostgreSQL syntax)
    const attachmentsTable = await query<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      ['comment_attachments']
    );
    
    if (attachmentsTable.length > 0) {
      console.log('\n✅ Table comment_attachments đã tồn tại');
      
      // Show structure (PostgreSQL syntax)
      const structure = await query<any[]>(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        ['comment_attachments']
      );
      console.log('\n📋 Cấu trúc bảng comment_attachments:');
      structure.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
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

