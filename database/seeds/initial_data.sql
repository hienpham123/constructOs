-- Initial Data Seeding
-- Chạy sau khi tạo schema

-- ============================================
-- 1. CREATE ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hash)
-- Lưu ý: Thay đổi password_hash bằng hash thực tế từ bcrypt
INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@constructos.com', '0900000000', '$2b$10$YourBcryptHashHere', 'admin', 'active'),
('00000000-0000-0000-0000-000000000002', 'Project Manager', 'manager@constructos.com', '0900000001', '$2b$10$YourBcryptHashHere', 'project_manager', 'active'),
('00000000-0000-0000-0000-000000000003', 'Accountant', 'accountant@constructos.com', '0900000002', '$2b$10$YourBcryptHashHere', 'accountant', 'active'),
('00000000-0000-0000-0000-000000000004', 'Warehouse Manager', 'warehouse@constructos.com', '0900000003', '$2b$10$YourBcryptHashHere', 'warehouse', 'active');

-- ============================================
-- 2. SAMPLE PROJECT (Optional)
-- ============================================
-- INSERT INTO projects (id, code, name, description, client, location, start_date, end_date, status, progress, budget, manager_id) VALUES
-- ('10000000-0000-0000-0000-000000000001', 'PRJ-001', 'Sample Project', 'Sample project description', 'Sample Client', 'Sample Location', '2024-01-01', '2024-12-31', 'planning', 0, 1000000000, '00000000-0000-0000-0000-000000000002');

-- ============================================
-- NOTES
-- ============================================
-- 1. Thay thế password_hash bằng hash thực tế từ bcrypt
-- 2. Có thể thêm sample data cho testing
-- 3. Chạy script này sau khi đã tạo schema

-- ============================================
-- GENERATE BCRYPT HASH (Node.js)
-- ============================================
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);

