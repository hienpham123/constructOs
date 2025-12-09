-- Migration: Create project_tasks and task_activity tables
-- Supports both MySQL and PostgreSQL
-- Run this migration to add multi-tier task assignment feature

-- ============================================
-- PROJECT TASKS TABLE
-- ============================================
-- MySQL version
CREATE TABLE IF NOT EXISTS project_tasks (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL COMMENT 'Dự án',
    parent_task_id CHAR(36) NULL COMMENT 'Công việc cha (null nếu là công việc gốc)',
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề công việc',
    description TEXT NULL COMMENT 'Mô tả chi tiết',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái: pending, in_progress, submitted, completed, blocked, cancelled',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'Độ ưu tiên: low, normal, high',
    due_date DATE NULL COMMENT 'Hạn hoàn thành',
    assigned_to CHAR(36) NOT NULL COMMENT 'Người được giao (bắt buộc)',
    assigned_to_name VARCHAR(255) NULL COMMENT 'Tên người được giao (denormalized)',
    created_by CHAR(36) NOT NULL COMMENT 'Người tạo',
    created_by_name VARCHAR(255) NULL COMMENT 'Tên người tạo (denormalized)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_project_id (project_id),
    INDEX idx_parent_task_id (parent_task_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TASK ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_activity (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36) NOT NULL COMMENT 'Công việc',
    action VARCHAR(50) NOT NULL COMMENT 'Hành động: created, assigned, status_changed, updated, commented',
    note TEXT NULL COMMENT 'Ghi chú hoặc nội dung thay đổi',
    actor_id CHAR(36) NOT NULL COMMENT 'Người thực hiện',
    actor_name VARCHAR(255) NULL COMMENT 'Tên người thực hiện (denormalized)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_task_id (task_id),
    INDEX idx_action (action),
    INDEX idx_actor_id (actor_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

