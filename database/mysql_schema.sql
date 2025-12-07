-- ConstructOS Database Schema
-- MySQL 8.0+ Database Schema
-- Run this script to create all tables

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NULL COMMENT 'Mã nhân sự (có thể null cho user đăng ký)',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role CHAR(36) NOT NULL COMMENT 'Role ID from roles table',
    team VARCHAR(100) NULL COMMENT 'Tổ đội',
    project_id CHAR(36) NULL COMMENT 'Dự án đang làm',
    project_name VARCHAR(255) NULL COMMENT 'Tên dự án (denormalized)',
    status ENUM('active', 'inactive', 'on_leave', 'banned') NOT NULL DEFAULT 'active',
    hire_date DATE NULL COMMENT 'Ngày tuyển dụng',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_email (email),
    INDEX idx_code (code),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_project_id (project_id),
    INDEX idx_team (team)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0 CHECK (progress <= 100),
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    manager_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id),
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_manager_id (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PROJECT STAGES TABLE
-- ============================================
CREATE TABLE project_stages (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0 CHECK (progress <= 100),
    status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. STAGE CHECKLISTS TABLE
-- ============================================
CREATE TABLE stage_checklists (
    id CHAR(36) PRIMARY KEY,
    stage_id CHAR(36) NOT NULL,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by CHAR(36),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES project_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES users(id),
    INDEX idx_stage_id (stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. MATERIALS TABLE
-- ============================================
CREATE TABLE materials (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    min_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    max_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    location VARCHAR(255),
    barcode VARCHAR(100),
    qr_code VARCHAR(100),
    status ENUM('available', 'low_stock', 'out_of_stock') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. MATERIAL TRANSACTIONS TABLE
-- ============================================
CREATE TABLE material_transactions (
    id CHAR(36) PRIMARY KEY,
    material_id CHAR(36) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    type ENUM('import', 'export', 'adjustment') NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    project_id CHAR(36),
    project_name VARCHAR(255),
    reason TEXT NOT NULL,
    performed_by CHAR(36) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    INDEX idx_material_id (material_id),
    INDEX idx_project_id (project_id),
    INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. PURCHASE REQUESTS TABLE
-- ============================================
CREATE TABLE purchase_requests (
    id CHAR(36) PRIMARY KEY,
    material_id CHAR(36) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    requested_by CHAR(36) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'ordered') NOT NULL DEFAULT 'pending',
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. PERSONNEL TABLE (MERGED INTO USERS)
-- ============================================
-- Personnel table has been merged into users table
-- All personnel are now users with additional fields: code, team, project_id, project_name, hire_date

-- ============================================
-- 10. SITE LOGS TABLE
-- ============================================
-- Note: MySQL không hỗ trợ arrays, dùng JSON hoặc bảng riêng
CREATE TABLE site_logs (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    weather VARCHAR(100) NOT NULL,
    work_description TEXT NOT NULL,
    issues TEXT,
    photos JSON, -- MySQL JSON type để lưu array
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_date (date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. DAILY REPORTS TABLE (Báo cáo ngày)
-- ============================================
CREATE TABLE daily_reports (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL COMMENT 'Nhân viên báo cáo',
    report_date DATE NOT NULL COMMENT 'Ngày báo cáo',
    content TEXT NOT NULL COMMENT 'Nội dung báo cáo',
    suggestion TEXT COMMENT 'Đề xuất',
    time_slot VARCHAR(100) NULL COMMENT 'Khung giờ',
    location VARCHAR(255) NULL COMMENT 'Vị trí',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_report (user_id, report_date),
    INDEX idx_user_id (user_id),
    INDEX idx_report_date (report_date),
    INDEX idx_created_at (created_at),
    INDEX idx_time_slot (time_slot),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. PROJECT REPORTS TABLE (Báo cáo dự án)
-- ============================================
CREATE TABLE project_reports (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL COMMENT 'Dự án',
    report_date DATE NOT NULL COMMENT 'Ngày báo cáo',
    content TEXT NOT NULL COMMENT 'Nội dung báo cáo',
    comment TEXT COMMENT 'Comment (text)',
    created_by CHAR(36) NOT NULL COMMENT 'Người tạo báo cáo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_report_date (report_date),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. PROJECT REPORT ATTACHMENTS TABLE (File đính kèm)
-- ============================================
CREATE TABLE project_report_attachments (
    id CHAR(36) PRIMARY KEY,
    report_id CHAR(36) NOT NULL COMMENT 'Báo cáo dự án',
    file_name VARCHAR(255) NOT NULL COMMENT 'Tên file',
    file_url TEXT NOT NULL COMMENT 'URL file',
    file_size BIGINT COMMENT 'Kích thước file (bytes)',
    file_type VARCHAR(100) COMMENT 'Loại file',
    uploaded_by CHAR(36) NOT NULL COMMENT 'Người upload',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES project_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_report_id (report_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

