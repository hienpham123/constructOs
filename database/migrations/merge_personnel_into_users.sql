-- Migration: Merge personnel table into users table
-- This script adds personnel-specific fields to users and migrates data

-- Step 1: Add personnel-specific columns to users table
ALTER TABLE users 
  ADD COLUMN code VARCHAR(50) UNIQUE NULL AFTER id,
  ADD COLUMN team VARCHAR(100) NULL AFTER role,
  ADD COLUMN project_id CHAR(36) NULL AFTER team,
  ADD COLUMN project_name VARCHAR(255) NULL AFTER project_id,
  ADD COLUMN hire_date DATE NULL AFTER project_name;

-- Step 2: Update status ENUM to include 'on_leave' from personnel
ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'on_leave', 'banned') NOT NULL DEFAULT 'active';

-- Step 3: Add foreign key for project_id
ALTER TABLE users 
  ADD CONSTRAINT fk_users_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Add indexes
ALTER TABLE users ADD INDEX idx_code (code);
ALTER TABLE users ADD INDEX idx_project_id (project_id);
ALTER TABLE users ADD INDEX idx_team (team);

-- Step 5: Migrate personnel data to users
-- Only migrate personnel that don't already exist in users (by email or id)
-- Generate a temporary password hash for personnel without accounts
INSERT INTO users (
  id, code, name, phone, email, password_hash, role, team, project_id, project_name, status, hire_date, created_at, updated_at
)
SELECT 
  p.id,
  p.code,
  p.name,
  p.phone,
  COALESCE(p.email, CONCAT('personnel_', p.id, '@temp.local')) as email,
  '$2a$10$TemporaryPasswordHashForPersonnelMigration123456789012345678901234567890' as password_hash,
  p.position as role,
  p.team,
  p.project_id,
  p.project_name,
  CASE 
    WHEN p.status = 'on_leave' THEN 'on_leave'
    ELSE p.status
  END as status,
  p.hire_date,
  p.created_at,
  p.updated_at
FROM personnel p
LEFT JOIN users u ON (u.id = p.id OR u.email = p.email)
WHERE u.id IS NULL;

-- Step 6: For personnel that already exist in users, update their fields
UPDATE users u
INNER JOIN personnel p ON (u.id = p.id OR (u.email = p.email AND p.email IS NOT NULL))
SET 
  u.code = COALESCE(u.code, p.code),
  u.team = COALESCE(u.team, p.team),
  u.project_id = COALESCE(u.project_id, p.project_id),
  u.project_name = COALESCE(u.project_name, p.project_name),
  u.hire_date = COALESCE(u.hire_date, p.hire_date),
  u.status = CASE 
    WHEN p.status = 'on_leave' THEN 'on_leave'
    WHEN u.status = 'banned' THEN 'banned'
    ELSE p.status
  END
WHERE p.id IS NOT NULL;

-- Step 7: Drop foreign key constraints from personnel table
SET @fk1 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'personnel' 
  AND COLUMN_NAME = 'position' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1);

SET @fk2 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'personnel' 
  AND COLUMN_NAME = 'project_id' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1);

SET @sql1 = IF(@fk1 IS NOT NULL, CONCAT('ALTER TABLE personnel DROP FOREIGN KEY ', @fk1), 'SELECT 1');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @sql2 = IF(@fk2 IS NOT NULL, CONCAT('ALTER TABLE personnel DROP FOREIGN KEY ', @fk2), 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Step 8: Drop personnel table
DROP TABLE IF EXISTS personnel;

