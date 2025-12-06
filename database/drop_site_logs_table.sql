-- Script to drop site_logs table and related objects
-- Run this script to completely remove site_logs functionality

-- Drop indexes first (MySQL syntax)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'site_logs' 
               AND index_name = 'idx_site_logs_project_id');
SET @sqlstmt := IF(@exist > 0, 'DROP INDEX idx_site_logs_project_id ON site_logs', 'SELECT "Index idx_site_logs_project_id does not exist"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'site_logs' 
               AND index_name = 'idx_site_logs_date');
SET @sqlstmt := IF(@exist > 0, 'DROP INDEX idx_site_logs_date ON site_logs', 'SELECT "Index idx_site_logs_date does not exist"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'site_logs' 
               AND index_name = 'idx_site_logs_created_at');
SET @sqlstmt := IF(@exist > 0, 'DROP INDEX idx_site_logs_created_at ON site_logs', 'SELECT "Index idx_site_logs_created_at does not exist"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_site_logs_updated_at;

-- Finally, drop the table
DROP TABLE IF EXISTS site_logs;

-- Verify deletion
SELECT 'site_logs table dropped successfully' AS status;

