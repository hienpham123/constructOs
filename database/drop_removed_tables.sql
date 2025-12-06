-- Script to drop tables that have been removed from the application
-- Equipment, Contract, and related tables
-- 
-- WARNING: This will permanently delete all data in these tables!
-- Make sure to backup your database before running this script.

USE constructos;

-- Disable foreign key checks temporarily to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop foreign key constraints first, then drop tables
-- Order matters: drop dependent tables first

-- Drop maintenance_schedules (depends on equipment)
DROP TABLE IF EXISTS maintenance_schedules;

-- Drop equipment_usage (depends on equipment)
DROP TABLE IF EXISTS equipment_usage;

-- Drop equipment table
DROP TABLE IF EXISTS equipment;

-- Drop contract_documents (depends on contracts)
DROP TABLE IF EXISTS contract_documents;

-- Drop contracts table
DROP TABLE IF EXISTS contracts;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All removed tables dropped successfully!' AS Result;

