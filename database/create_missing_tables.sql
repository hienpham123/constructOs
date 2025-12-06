-- Tạo các tables còn thiếu (từ dòng 223 trở đi)
USE constructos;

-- ============================================
-- 11. EQUIPMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('excavator', 'crane', 'truck', 'concrete_mixer', 'generator', 'other') NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    status ENUM('available', 'in_use', 'maintenance', 'broken') NOT NULL DEFAULT 'available',
    current_project_id CHAR(36),
    current_project_name VARCHAR(255),
    current_user_id CHAR(36),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_project_id) REFERENCES projects(id),
    FOREIGN KEY (current_user_id) REFERENCES users(id),
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_current_project_id (current_project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. EQUIPMENT USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_usage (
    id CHAR(36) PRIMARY KEY,
    equipment_id CHAR(36) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    project_id CHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    user_id CHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    fuel_consumption DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_project_id (project_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. MAINTENANCE SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id CHAR(36) PRIMARY KEY,
    equipment_id CHAR(36) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    type ENUM('routine', 'repair', 'inspection') NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed', 'overdue') NOT NULL DEFAULT 'scheduled',
    description TEXT NOT NULL,
    cost DECIMAL(15, 2),
    technician VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. CONTRACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('construction', 'supply', 'service', 'labor') NOT NULL,
    client VARCHAR(255) NOT NULL,
    project_id CHAR(36),
    project_name VARCHAR(255),
    value DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'pending', 'active', 'completed', 'terminated') NOT NULL DEFAULT 'draft',
    signed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    INDEX idx_code (code),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. CONTRACT DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contract_documents (
    id CHAR(36) PRIMARY KEY,
    contract_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    uploaded_by CHAR(36) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_contract_id (contract_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. SITE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_logs (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    weather VARCHAR(100) NOT NULL,
    work_description TEXT NOT NULL,
    issues TEXT,
    photos JSON,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_id (project_id),
    INDEX idx_date (date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'All missing tables created successfully!' AS Result;

