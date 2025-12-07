-- Create purchase_request_comments table for comments on purchase requests
CREATE TABLE IF NOT EXISTS purchase_request_comments (
    id CHAR(36) PRIMARY KEY,
    purchase_request_id CHAR(36) NOT NULL,
    content TEXT NOT NULL COMMENT 'Nội dung comment',
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_purchase_request_id (purchase_request_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create purchase_request_comment_attachments table for files attached to comments
CREATE TABLE IF NOT EXISTS purchase_request_comment_attachments (
    id CHAR(36) PRIMARY KEY,
    comment_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type',
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES purchase_request_comments(id) ON DELETE CASCADE,
    INDEX idx_comment_id (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

