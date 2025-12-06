-- Tạo bảng roles đơn giản
-- MySQL 8.0+

-- ============================================
-- 1. TẠO BẢNG ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Tên vai trò (ví dụ: admin, director, project_manager)',
    description TEXT COMMENT 'Mô tả vai trò',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý các vai trò trong hệ thống';

-- ============================================
-- 2. TẠO BẢNG ROLE_PERMISSIONS (Quyền của từng vai trò)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id CHAR(36) PRIMARY KEY,
    role_id CHAR(36) NOT NULL COMMENT 'ID của vai trò',
    permission_type VARCHAR(50) NOT NULL COMMENT 'Loại quyền: view_drawing, view_contract, view_daily_report, view_project_report',
    allowed BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Có được phép hay không (TRUE/FALSE)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_type),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_type (permission_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý quyền của từng vai trò';

-- ============================================
-- 3. THÊM CỘT role_id VÀO BẢNG users (nếu chưa có)
-- ============================================
-- Lưu ý: Nếu cột đã tồn tại, bỏ qua bước này
ALTER TABLE users 
ADD COLUMN role_id CHAR(36) NULL COMMENT 'ID của vai trò (tham chiếu đến bảng roles)',
ADD INDEX idx_users_role_id (role_id),
ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- ============================================
-- 4. CHÈN DỮ LIỆU MẪU - CÁC VAI TRÒ
-- ============================================
INSERT INTO roles (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Quản trị viên - Toàn quyền'),
('00000000-0000-0000-0000-000000000002', 'director', 'Giám đốc'),
('00000000-0000-0000-0000-000000000003', 'project_manager', 'Quản lý dự án'),
('00000000-0000-0000-0000-000000000004', 'design_department', 'Phòng thiết kế'),
('00000000-0000-0000-0000-000000000005', 'construction_department', 'Phòng thi công'),
('00000000-0000-0000-0000-000000000006', 'accountant', 'Kế toán'),
('00000000-0000-0000-0000-000000000007', 'qs', 'QS - Quantity Surveyor')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- 5. CHÈN DỮ LIỆU MẪU - QUYỀN CỦA ADMIN
-- ============================================
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000001', 'view_project_report', TRUE)
ON DUPLICATE KEY UPDATE allowed=allowed;

-- ============================================
-- 6. CHÈN DỮ LIỆU MẪU - QUYỀN CỦA GIÁM ĐỐC, QUẢN LÝ DỰ ÁN, PHÒNG THIẾT KẾ, PHÒNG THI CÔNG
-- ============================================
-- Các vai trò này: Xem bản vẽ và báo cáo ngày, KHÔNG xem hợp đồng
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
-- Giám đốc
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000002', 'view_project_report', FALSE),
-- Quản lý dự án
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000003', 'view_project_report', FALSE),
-- Phòng thiết kế
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000004', 'view_project_report', FALSE),
-- Phòng thi công
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_drawing', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_contract', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_daily_report', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000005', 'view_project_report', FALSE)
ON DUPLICATE KEY UPDATE allowed=allowed;

-- ============================================
-- 7. CHÈN DỮ LIỆU MẪU - QUYỀN CỦA KẾ TOÁN VÀ QS
-- ============================================
-- Các vai trò này: Xem hợp đồng và báo cáo dự án, KHÔNG xem bản vẽ
INSERT INTO role_permissions (id, role_id, permission_type, allowed) VALUES
-- Kế toán
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_drawing', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_daily_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000006', 'view_project_report', TRUE),
-- QS
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_drawing', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_contract', TRUE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_daily_report', FALSE),
(UUID(), '00000000-0000-0000-0000-000000000007', 'view_project_report', TRUE)
ON DUPLICATE KEY UPDATE allowed=allowed;

