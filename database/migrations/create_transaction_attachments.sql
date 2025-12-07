-- Create transaction_attachments table for files attached to transactions
CREATE TABLE IF NOT EXISTS transaction_attachments (
    id CHAR(36) PRIMARY KEY,
    transaction_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type',
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES material_transactions(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

