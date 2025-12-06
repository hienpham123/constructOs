-- Migration script to update projects table
-- Remove code, rename client to investor, add contact_person, update status enum

-- For MySQL
-- Step 1: Add new columns
ALTER TABLE projects 
  ADD COLUMN investor VARCHAR(255) AFTER description,
  ADD COLUMN contact_person VARCHAR(255) AFTER investor;

-- Step 2: Migrate data from client to investor
UPDATE projects SET investor = client WHERE investor IS NULL OR investor = '';

-- Step 3: Update status enum to support new statuses
-- Note: MySQL doesn't support direct ENUM modification, so we need to alter the column
ALTER TABLE projects 
  MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'quoting';

-- Step 4: Remove old columns (optional - comment out if you want to keep for migration period)
-- ALTER TABLE projects DROP COLUMN code;
-- ALTER TABLE projects DROP COLUMN client;

-- Step 5: Remove index on code if it exists
-- DROP INDEX idx_projects_code ON projects;

-- For PostgreSQL (uncomment if using PostgreSQL)
/*
-- Step 1: Add new columns
ALTER TABLE projects 
  ADD COLUMN investor VARCHAR(255),
  ADD COLUMN contact_person VARCHAR(255);

-- Step 2: Migrate data from client to investor
UPDATE projects SET investor = client WHERE investor IS NULL OR investor = '';

-- Step 3: Update status constraint
ALTER TABLE projects 
  DROP CONSTRAINT IF EXISTS projects_status_check;
  
ALTER TABLE projects 
  ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('quoting', 'contract_signed_in_progress', 'completed', 'on_hold', 'design_consulting', 'in_progress', 'design_appraisal', 'preparing_acceptance', 'failed'));

-- Step 4: Remove old columns (optional)
-- ALTER TABLE projects DROP COLUMN code;
-- ALTER TABLE projects DROP COLUMN client;

-- Step 5: Remove index on code if it exists
-- DROP INDEX IF EXISTS idx_projects_code;
*/

