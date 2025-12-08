-- Create conversations table for direct messages (1-1 chats)
-- Each conversation represents a chat between 2 users
CREATE TABLE IF NOT EXISTS conversations (
    id CHAR(36) PRIMARY KEY,
    user1_id CHAR(36) NOT NULL COMMENT 'User ID 1 (sorted alphabetically)',
    user2_id CHAR(36) NOT NULL COMMENT 'User ID 2 (sorted alphabetically)',
    user1_last_read_at TIMESTAMP NULL COMMENT 'Last read time for user1',
    user2_last_read_at TIMESTAMP NULL COMMENT 'Last read time for user2',
    user1_deleted_at TIMESTAMP NULL COMMENT 'When user1 deleted this conversation',
    user2_deleted_at TIMESTAMP NULL COMMENT 'When user2 deleted this conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation (user1_id, user2_id),
    INDEX idx_user1_id (user1_id),
    INDEX idx_user2_id (user2_id),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
    id CHAR(36) PRIMARY KEY,
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL COMMENT 'Người gửi',
    receiver_id CHAR(36) NOT NULL COMMENT 'Người nhận',
    content TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create direct_message_attachments table
CREATE TABLE IF NOT EXISTS direct_message_attachments (
    id CHAR(36) PRIMARY KEY,
    message_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type',
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES direct_messages(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

