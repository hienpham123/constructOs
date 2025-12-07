const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { readFileSync } = require('fs');
const { join } = require('path');

dotenv.config();

const __dirname = __dirname || require('path').dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'constructos',
  multipleStatements: true, // Allow multiple SQL statements
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    
    // Read migration file
    const migrationPath = join(__dirname, '../../database/migrations/add_time_slot_and_location_to_daily_reports.sql');
    console.log('📄 Reading migration file:', migrationPath);
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    console.log('🚀 Running migration...');
    await connection.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Added columns: time_slot, location to daily_reports table');
    
    // Verify the columns were added
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'daily_reports' 
       AND COLUMN_NAME IN ('time_slot', 'location')
       ORDER BY ORDINAL_POSITION`,
      [dbConfig.database]
    );
    
    if (columns.length > 0) {
      console.log('\n📋 New columns:');
      columns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}) - ${col.COLUMN_COMMENT || ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('⚠️  Columns already exist. Migration may have been run before.');
    } else {
      console.error('Error details:', error);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();

