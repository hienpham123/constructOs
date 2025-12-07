-- Script to drop project_stages and stage_checklists tables
-- These tables are no longer used in the application
-- 
-- WARNING: This will permanently delete all data in these tables!
-- Make sure to backup your database before running this script.

USE constructos;

-- Disable foreign key checks temporarily to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop foreign key constraints first, then drop tables
-- Order matters: drop dependent tables first

-- Drop stage_checklists (depends on project_stages)
DROP TABLE IF EXISTS stage_checklists;

-- Drop project_stages (depends on projects, but CASCADE will handle it)
DROP TABLE IF EXISTS project_stages;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Project stages tables dropped successfully!' AS Result;

