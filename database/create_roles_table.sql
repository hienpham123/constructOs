-- Create roles and role_permissions tables for role-based access control
-- MySQL 8.0+ Database Schema

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id CHAR(36) PRIMARY KEY,
    role_id CHAR(36) NOT NULL,
    permission_type VARCHAR(50) NOT NULL, -- 'view_drawing', 'view_contract', 'view_report', 'view_daily_report', 'view_project_report'
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_type),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_type (permission_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE USERS TABLE TO REFERENCE ROLES
-- ============================================
-- Add role_id column if it doesn't exist (keeping role enum for backward compatibility)
-- Note: Run these ALTER statements separately if column already exists
-- ALTER TABLE users ADD COLUMN role_id CHAR(36) NULL;
-- ALTER TABLE users ADD INDEX idx_role_id (role_id);
-- ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- Check if column exists before adding (MySQL doesn't support IF NOT EXISTS for ALTER TABLE)
-- You may need to run this manually:
-- ALTER TABLE users ADD COLUMN role_id CHAR(36) NULL;
-- ALTER TABLE users ADD INDEX idx_role_id (role_id);
-- ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- ============================================
-- INSERT DEFAULT ROLES
-- ============================================
INSERT INTO roles (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Quản trị viên - Toàn quyền'),
('00000000-0000-0000-0000-000000000002', 'director', 'Giám đốc'),
('00000000-0000-0000-0000-000000000003', 'project_manager', 'Quản lý dự án'),
('00000000-0000-0000-0000-000000000004', 'design_department', 'Phòng thiết kế'),
('00000000-0000-0000-0000-000000000005', 'construction_department', 'Phòng thi công'),
('00000000-0000-0000-0000-000000000006', 'accountant', 'Kế toán'),
('00000000-0000-0000-0000-000000000007', 'qs', 'QS - Quantity Surveyor')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================
-- Admin: All permissions
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_project_report', TRUE)
ON DUPLICATE KEY UPDATE allowed=allowed;

-- Director, Project Manager, Design Department, Construction Department: View drawing and daily report, NOT contracts
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_project_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_project_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_project_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_project_report', FALSE)
ON DUPLICATE KEY UPDATE allowed=allowed;

-- Accountant and QS: View contracts and project reports, NOT drawings
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_drawing', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_daily_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_project_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_drawing', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_daily_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_project_report', TRUE)
ON DUPLICATE KEY UPDATE allowed=allowed;

