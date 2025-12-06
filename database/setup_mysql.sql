-- Setup MySQL Database và User cho ConstructOS
-- Chạy file này với: mysql -u root -p < database/setup_mysql.sql

-- Tạo database
CREATE DATABASE IF NOT EXISTS constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (thay đổi password nếu cần)
CREATE USER IF NOT EXISTS 'constructos_user'@'localhost' IDENTIFIED BY 'constructos123';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;

-- Hiển thị thông tin
SELECT 'Database và User đã được tạo thành công!' AS Message;
SELECT 'Database: constructos' AS Info;
SELECT 'User: constructos_user@localhost' AS Info;
SELECT 'Bước tiếp theo: Chạy schema SQL' AS NextStep;

