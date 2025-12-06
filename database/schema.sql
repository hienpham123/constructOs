-- ConstructOS Database Schema
-- PostgreSQL Database Schema
-- Run this script to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    team VARCHAR(100),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE,
    project_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'banned')),
    hire_date DATE,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_code ON users(code);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_project_id ON users(project_id);
CREATE INDEX idx_users_team ON users(team);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);

-- ============================================
-- 3. PROJECT STAGES TABLE
-- ============================================
CREATE TABLE project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_stages_project_id ON project_stages(project_id);

-- ============================================
-- 4. STAGE CHECKLISTS TABLE
-- ============================================
CREATE TABLE stage_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stage_checklists_stage_id ON stage_checklists(stage_id);

-- ============================================
-- 5. PROJECT DOCUMENTS TABLE
-- ============================================
CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('drawing', 'contract', 'report', 'photo', 'other')),
    url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_type ON project_documents(type);

-- ============================================
-- 6. MATERIALS TABLE
-- ============================================
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    min_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    max_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    location VARCHAR(255),
    barcode VARCHAR(100),
    qr_code VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);

-- ============================================
-- 7. MATERIAL TRANSACTIONS TABLE
-- ============================================
CREATE TABLE material_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    material_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('import', 'export', 'adjustment')),
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255),
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_transactions_material_id ON material_transactions(material_id);
CREATE INDEX idx_material_transactions_project_id ON material_transactions(project_id);
CREATE INDEX idx_material_transactions_performed_at ON material_transactions(performed_at);

-- ============================================
-- 8. PURCHASE REQUESTS TABLE
-- ============================================
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    material_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_purchase_requests_material_id ON purchase_requests(material_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_requested_at ON purchase_requests(requested_at);

-- ============================================
-- 9. PERSONNEL TABLE (MERGED INTO USERS)
-- ============================================
-- Personnel table has been merged into users table
-- All personnel are now users with additional fields: code, team, project_id, project_name, hire_date

-- ============================================
-- 10. ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    personnel_name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night', 'full_day')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'early_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_personnel_id ON attendance(personnel_id);
CREATE INDEX idx_attendance_project_id ON attendance(project_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(personnel_id, project_id, date);

-- ============================================
-- 11. SITE LOGS TABLE
-- ============================================
CREATE TABLE site_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    weather VARCHAR(100) NOT NULL,
    work_description TEXT NOT NULL,
    issues TEXT,
    photos TEXT[], -- PostgreSQL array
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_logs_project_id ON site_logs(project_id);
CREATE INDEX idx_site_logs_date ON site_logs(date);
CREATE INDEX idx_site_logs_created_at ON site_logs(created_at);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_logs_updated_at BEFORE UPDATE ON site_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR AUTO-UPDATE MATERIAL STATUS
-- ============================================
CREATE OR REPLACE FUNCTION update_material_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_stock <= NEW.min_stock THEN
        NEW.status = 'low_stock';
    ELSIF NEW.current_stock = 0 THEN
        NEW.status = 'out_of_stock';
    ELSE
        NEW.status = 'available';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_status_trigger BEFORE INSERT OR UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_material_status();

