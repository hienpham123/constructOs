-- Insert Initial Roles for ConstructOS
-- PostgreSQL/Supabase compatible
-- Run this script in Supabase SQL Editor after creating schema

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert roles (using INSERT ... ON CONFLICT to avoid duplicates)
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Quản trị viên - Toàn quyền', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'director', 'Giám đốc', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'project_manager', 'Quản lý dự án', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'design_department', 'Phòng thiết kế', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'construction_department', 'Phòng thi công', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'accountant', 'Kế toán', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000007', 'qs', 'QS - Quantity Surveyor', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify roles were inserted
SELECT id, name, description FROM roles ORDER BY name;

