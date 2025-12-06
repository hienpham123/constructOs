-- Migration: Change users.role from ENUM to role_id (CHAR(36))
-- This script safely migrates existing data and updates the column structure

-- Step 1: Check if roles table exists and has data
-- If not, this migration will fail (which is expected - roles must exist first)

-- Step 2: Drop existing foreign key constraint if exists
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

-- Step 3: Migrate existing data (map ENUM values to role_ids)
-- Update based on role names in your roles table
-- This assumes you have roles with names matching the ENUM values
UPDATE users u
INNER JOIN roles r ON (
  (u.role = 'admin' AND r.name = 'admin') OR
  (u.role = 'project_manager' AND r.name = 'project_manager') OR
  (u.role = 'accountant' AND r.name = 'accountant') OR
  (u.role = 'warehouse' AND r.name = 'warehouse') OR
  (u.role = 'site_manager' AND r.name = 'site_manager') OR
  (u.role = 'engineer' AND r.name = 'engineer') OR
  (u.role = 'client' AND r.name = 'client')
)
SET u.role_id = r.id
WHERE u.role_id IS NULL;

-- Step 4: If there are any NULL values, set to first available role
UPDATE users u
SET u.role_id = (SELECT id FROM roles LIMIT 1)
WHERE u.role_id IS NULL;

-- Step 5: Make role_id NOT NULL
ALTER TABLE users MODIFY COLUMN role_id CHAR(36) NOT NULL;

-- Step 6: Drop old role ENUM column
ALTER TABLE users DROP COLUMN role;

-- Step 7: Rename role_id to role
ALTER TABLE users CHANGE COLUMN role_id role CHAR(36) NOT NULL;

-- Step 8: Add foreign key constraint
ALTER TABLE users 
  ADD CONSTRAINT fk_users_role FOREIGN KEY (role) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Update index (drop old and create new if needed)
ALTER TABLE users DROP INDEX IF EXISTS idx_role;
ALTER TABLE users ADD INDEX idx_role (role);

