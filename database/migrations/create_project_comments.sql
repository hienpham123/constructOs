-- Create project_comments table for comments on contracts and project files
CREATE TABLE IF NOT EXISTS project_comments (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    category ENUM('contract', 'project_files') NOT NULL COMMENT 'contract = Hợp đồng, project_files = Hồ sơ dự án',
    content TEXT NOT NULL COMMENT 'Nội dung comment',
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create comment_attachments table for files attached to comments
CREATE TABLE IF NOT EXISTS comment_attachments (
    id CHAR(36) PRIMARY KEY,
    comment_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type',
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES project_comments(id) ON DELETE CASCADE,
    INDEX idx_comment_id (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

