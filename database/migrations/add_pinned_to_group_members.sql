-- Add pinned column to group_members table
ALTER TABLE group_members 
ADD COLUMN pinned BOOLEAN DEFAULT FALSE COMMENT 'Ghim nhóm chat lên đầu',
ADD COLUMN pinned_at TIMESTAMP NULL COMMENT 'Thời điểm ghim nhóm';

-- Add index for pinned groups
CREATE INDEX idx_pinned ON group_members(pinned, pinned_at);

