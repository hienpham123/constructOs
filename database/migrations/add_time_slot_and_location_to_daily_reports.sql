-- Add time_slot and location columns to daily_reports table
-- time_slot: Khung giờ (e.g., "08:00-12:00", "13:00-17:00")
-- location: Vị trí (e.g., "Công trường A", "Văn phòng")

ALTER TABLE daily_reports 
ADD COLUMN time_slot VARCHAR(100) NULL COMMENT 'Khung giờ' 
AFTER suggestion;

ALTER TABLE daily_reports 
ADD COLUMN location VARCHAR(255) NULL COMMENT 'Vị trí' 
AFTER time_slot;

-- Add indexes for better query performance
CREATE INDEX idx_daily_reports_time_slot ON daily_reports(time_slot);
CREATE INDEX idx_daily_reports_location ON daily_reports(location);

