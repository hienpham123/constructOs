-- Create Reports Tables
-- Daily Reports and Project Reports

-- ============================================
-- 1. DAILY REPORTS TABLE (Báo cáo ngày)
-- ============================================
CREATE TABLE daily_reports (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL COMMENT 'Nhân viên báo cáo',
    report_date DATE NOT NULL COMMENT 'Ngày báo cáo',
    content TEXT NOT NULL COMMENT 'Nội dung báo cáo',
    suggestion TEXT COMMENT 'Đề xuất',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_report (user_id, report_date),
    INDEX idx_user_id (user_id),
    INDEX idx_report_date (report_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. PROJECT REPORTS TABLE (Báo cáo dự án)
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
-- 3. PROJECT REPORT ATTACHMENTS TABLE (File đính kèm)
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

