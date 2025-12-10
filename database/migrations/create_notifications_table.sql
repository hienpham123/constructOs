-- Migration: Create notifications table
-- MySQL version
-- Bảng lưu thông báo In-App cho users

CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL COMMENT 'User nhận thông báo',
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề thông báo',
    message TEXT NOT NULL COMMENT 'Nội dung thông báo',
    type VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT 'Loại: task_assignment, task_update, message, system',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'Độ ưu tiên: low, normal, high',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Đã đọc chưa',
    metadata JSON NULL COMMENT 'Metadata (taskId, projectId, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

