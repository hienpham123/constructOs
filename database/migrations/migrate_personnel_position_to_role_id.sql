-- Migration: Change personnel.position from ENUM to role_id (CHAR(36))
-- This script safely migrates existing data and updates the column structure

-- Step 1: Check if roles table exists and has data
-- If not, this migration will fail (which is expected - roles must exist first)

-- Step 2: For existing data, we need to map old ENUM values to role_ids
-- This assumes you have roles with names matching: 'worker', 'engineer', 'supervisor', 'team_leader'
-- If you don't have these roles, create them first or update the mapping below

-- Step 3: Temporarily add a new column for role_id
ALTER TABLE personnel 
  ADD COLUMN position_role_id CHAR(36) NULL AFTER position;

-- Step 4: Migrate existing data (map ENUM values to role_ids)
-- Update based on role names in your roles table
UPDATE personnel p
INNER JOIN roles r ON (
  (p.position = 'worker' AND r.name = 'worker') OR
  (p.position = 'engineer' AND r.name = 'engineer') OR
  (p.position = 'supervisor' AND r.name = 'supervisor') OR
  (p.position = 'team_leader' AND r.name = 'team_leader')
)
SET p.position_role_id = r.id
WHERE p.position_role_id IS NULL;

-- Step 5: If there are any NULL values, set to first available role
UPDATE personnel p
SET p.position_role_id = (SELECT id FROM roles LIMIT 1)
WHERE p.position_role_id IS NULL;

-- Step 6: Drop old position column
ALTER TABLE personnel DROP COLUMN position;

-- Step 7: Rename new column to position
ALTER TABLE personnel CHANGE COLUMN position_role_id position CHAR(36) NOT NULL;

-- Step 8: Add foreign key constraint
ALTER TABLE personnel 
  ADD CONSTRAINT fk_personnel_role FOREIGN KEY (position) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Add index
ALTER TABLE personnel ADD INDEX idx_personnel_position (position);

