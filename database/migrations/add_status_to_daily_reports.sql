-- Add status column to daily_reports table
-- Status values: active, inactive, on_leave, banned

ALTER TABLE daily_reports 
ADD COLUMN status ENUM('active', 'inactive', 'on_leave', 'banned') NOT NULL DEFAULT 'active' 
AFTER suggestion;

-- Add index for status
CREATE INDEX idx_daily_reports_status ON daily_reports(status);

