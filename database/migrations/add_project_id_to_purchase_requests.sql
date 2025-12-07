-- Add project_id column to purchase_requests table
ALTER TABLE purchase_requests 
ADD COLUMN project_id CHAR(36) NULL AFTER material_id,
ADD INDEX idx_project_id (project_id),
ADD FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

