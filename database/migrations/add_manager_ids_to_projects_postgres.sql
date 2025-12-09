-- Migration: Add manager_ids field to projects table (PostgreSQL version)
-- JSON array of manager user IDs

-- Add manager_ids column as JSONB (PostgreSQL native JSON type)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS manager_ids JSONB DEFAULT '[]'::jsonb;

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_projects_manager_ids ON projects USING GIN (manager_ids);

