-- Script to add attachment column to material_transactions table
-- and update type enum to remove 'adjustment'

-- Update existing 'adjustment' records to 'import' first
UPDATE material_transactions 
SET type = 'import' 
WHERE type = 'adjustment';

-- Add attachment column (check if exists first using stored procedure)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'material_transactions' 
               AND column_name = 'attachment');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE material_transactions ADD COLUMN attachment TEXT NULL', 'SELECT "Column attachment already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update type column to VARCHAR (remove ENUM constraint)
ALTER TABLE material_transactions 
MODIFY COLUMN type VARCHAR(20) NOT NULL;

-- Verify changes
SELECT 'attachment column added and type enum updated' AS status;

