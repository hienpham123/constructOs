-- Migration: Add manager_ids field to projects table (JSON array of manager user IDs)
-- Supports both MySQL and PostgreSQL

-- Add manager_ids column as TEXT (will store JSON array)
ALTER TABLE projects 
ADD COLUMN manager_ids TEXT NULL COMMENT 'Danh sách ID quản lý dự án (JSON array)';

-- Create index for faster queries (optional, for JSON extraction if needed)
-- Note: MySQL 5.7+ and PostgreSQL support JSON functions

