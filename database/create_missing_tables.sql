-- Tạo các tables còn thiếu
USE constructos;

-- ============================================
-- 11. SITE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_logs (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    weather VARCHAR(100) NOT NULL,
    work_description TEXT NOT NULL,
    issues TEXT,
    photos JSON,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_date (date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'All missing tables created successfully!' AS Result;

