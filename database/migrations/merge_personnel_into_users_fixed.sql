-- Migration: Merge personnel table into users table (Fixed)
-- This script adds missing personnel-specific fields to users and migrates data

-- Step 1: Add personnel-specific columns to users table (only if they don't exist)
-- Check and add team
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'team');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN team VARCHAR(100) NULL AFTER role', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add project_id
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'project_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN project_id CHAR(36) NULL AFTER team', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add project_name
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'project_name');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN project_name VARCHAR(255) NULL AFTER project_id', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add hire_date
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'hire_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN hire_date DATE NULL AFTER project_name', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Update status ENUM to include 'on_leave' from personnel (if not already updated)
ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'on_leave', 'banned') NOT NULL DEFAULT 'active';

-- Step 3: Add foreign key for project_id (if not exists)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'project_id' 
  AND REFERENCED_TABLE_NAME IS NOT NULL);
SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE users ADD CONSTRAINT fk_users_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add indexes (if not exist)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_project_id');
SET @sql = IF(@idx_exists = 0, 'ALTER TABLE users ADD INDEX idx_project_id (project_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = 'constructos' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_team');
SET @sql = IF(@idx_exists = 0, 'ALTER TABLE users ADD INDEX idx_team (team)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Migrate personnel data to users
-- Only migrate personnel that don't already exist in users (by email or id)
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

-- Step 7: Update attendance table to reference users instead of personnel
-- Drop foreign key from attendance to personnel
SET @fk_attendance = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'attendance' 
  AND COLUMN_NAME = 'personnel_id' 
  AND REFERENCED_TABLE_NAME = 'personnel'
  LIMIT 1);

SET @sql_attendance = IF(@fk_attendance IS NOT NULL, CONCAT('ALTER TABLE attendance DROP FOREIGN KEY ', @fk_attendance), 'SELECT 1');
PREPARE stmt_attendance FROM @sql_attendance;
EXECUTE stmt_attendance;
DEALLOCATE PREPARE stmt_attendance;

-- Add foreign key from attendance to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'constructos' 
  AND TABLE_NAME = 'attendance' 
  AND COLUMN_NAME = 'personnel_id' 
  AND REFERENCED_TABLE_NAME = 'users');
SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE attendance ADD CONSTRAINT fk_attendance_user FOREIGN KEY (personnel_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Drop foreign key constraints from personnel table
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

-- Step 9: Drop personnel table
DROP TABLE IF EXISTS personnel;

