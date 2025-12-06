-- Migration: Rename users.role_id to role and add foreign key constraint
-- This script completes the migration from ENUM role to role_id

-- Step 1: Drop existing foreign key constraint if exists
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role_id' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1);

SET @sql = IF(@fk_name IS NOT NULL, 
  CONCAT('ALTER TABLE users DROP FOREIGN KEY ', @fk_name), 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: If there are any NULL values in role_id, set to first available role
UPDATE users u
SET u.role_id = (SELECT id FROM roles LIMIT 1)
WHERE u.role_id IS NULL;

-- Step 3: Make role_id NOT NULL
ALTER TABLE users MODIFY COLUMN role_id CHAR(36) NOT NULL;

-- Step 4: Rename role_id to role
ALTER TABLE users CHANGE COLUMN role_id role CHAR(36) NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE users 
  ADD CONSTRAINT fk_users_role FOREIGN KEY (role) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Update index
ALTER TABLE users DROP INDEX IF EXISTS idx_role;
ALTER TABLE users ADD INDEX idx_role (role);

