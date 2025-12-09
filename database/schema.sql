-- ConstructOS Database Schema
-- PostgreSQL Database Schema
-- Run this script to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 0. ROLES TABLE (Must be created first)
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- ============================================
-- 1. PROJECTS TABLE (Created before users due to circular dependency)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    investor VARCHAR(255),
    contact_person VARCHAR(255),
    client VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'quoting' CHECK (status IN ('quoting', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    manager_id UUID, -- Will add foreign key constraint after users table is created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_project_id ON users(project_id);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team);

-- Add foreign key constraint for projects.manager_id after users table is created
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_manager_id'
    ) THEN
        ALTER TABLE projects ADD CONSTRAINT fk_projects_manager_id FOREIGN KEY (manager_id) REFERENCES users(id);
    END IF;
END $$;

-- ============================================
-- 3. PROJECT STAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_stages (
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

CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON project_stages(project_id);

-- ============================================
-- 4. STAGE CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stage_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stage_checklists_stage_id ON stage_checklists(stage_id);

-- ============================================
-- 5. MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(15, 3) NOT NULL DEFAULT 0,
    import_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);

-- ============================================
-- 6. MATERIAL TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS material_transactions (
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
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attachment TEXT
);

CREATE INDEX IF NOT EXISTS idx_material_transactions_material_id ON material_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_project_id ON material_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_performed_at ON material_transactions(performed_at);
CREATE INDEX IF NOT EXISTS idx_material_transactions_performed_by ON material_transactions(performed_by);

-- ============================================
-- 7. TRANSACTION ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES material_transactions(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_attachments_transaction_id ON transaction_attachments(transaction_id);

-- ============================================
-- 8. PURCHASE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_purchase_requests_material_id ON purchase_requests(material_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_at ON purchase_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_project_id ON purchase_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_by ON purchase_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_approved_by ON purchase_requests(approved_by);

-- ============================================
-- 9. PURCHASE REQUEST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_request_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchase_request_comments_purchase_request_id ON purchase_request_comments(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_comments_created_by ON purchase_request_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_request_comments_created_at ON purchase_request_comments(created_at);

-- ============================================
-- 10. PURCHASE REQUEST COMMENT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_request_comment_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES purchase_request_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchase_request_comment_attachments_comment_id ON purchase_request_comment_attachments(comment_id);

-- ============================================
-- 11. PROJECT COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('contract', 'project_files')),
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_category ON project_comments(category);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_by ON project_comments(created_by);

-- ============================================
-- 12. COMMENT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comment_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES project_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment_id ON comment_attachments(comment_id);

-- ============================================
-- 13. DAILY REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    content TEXT NOT NULL,
    suggestion TEXT,
    time_slot VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_at ON daily_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_reports_time_slot ON daily_reports(time_slot);
CREATE INDEX IF NOT EXISTS idx_daily_reports_location ON daily_reports(location);

-- ============================================
-- 14. GROUP CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_chats_created_by ON group_chats(created_by);
CREATE INDEX IF NOT EXISTS idx_group_chats_created_at ON group_chats(created_at);

-- ============================================
-- 15. GROUP MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE,
    pinned BOOLEAN DEFAULT FALSE,
    pinned_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_last_read_at ON group_members(last_read_at);
CREATE INDEX IF NOT EXISTS idx_group_members_pinned ON group_members(pinned, pinned_at);

-- ============================================
-- 16. GROUP MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);

-- ============================================
-- 17. GROUP MESSAGE ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_message_attachments_message_id ON group_message_attachments(message_id);

-- ============================================
-- 18. GROUP TYPING INDICATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_typing_indicators_group_id ON group_typing_indicators(group_id);
CREATE INDEX IF NOT EXISTS idx_group_typing_indicators_user_id ON group_typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_group_typing_indicators_updated_at ON group_typing_indicators(updated_at);

-- ============================================
-- 19. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user1_last_read_at TIMESTAMP WITH TIME ZONE,
    user2_last_read_at TIMESTAMP WITH TIME ZONE,
    user1_deleted_at TIMESTAMP WITH TIME ZONE,
    user2_deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- ============================================
-- 20. DIRECT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);

-- ============================================
-- 21. DIRECT MESSAGE ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS direct_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_direct_message_attachments_message_id ON direct_message_attachments(message_id);

-- ============================================
-- 22. ROLE PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_type)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_type ON role_permissions(permission_type);

-- ============================================
-- 23. PROJECT TASKS (multi-level)
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'completed', 'blocked', 'cancelled')),
    due_date DATE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent ON project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee ON project_tasks(assigned_to);

-- ============================================
-- 24. TASK ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS task_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    note TEXT,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_activity_task ON task_activity(task_id);

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

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_stages_updated_at ON project_stages;
CREATE TRIGGER update_project_stages_updated_at BEFORE UPDATE ON project_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_chats_updated_at ON group_chats;
CREATE TRIGGER update_group_chats_updated_at BEFORE UPDATE ON group_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_messages_updated_at ON group_messages;
CREATE TRIGGER update_group_messages_updated_at BEFORE UPDATE ON group_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_request_comments_updated_at ON purchase_request_comments;
CREATE TRIGGER update_purchase_request_comments_updated_at BEFORE UPDATE ON purchase_request_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON project_comments;
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_direct_messages_updated_at ON direct_messages;
CREATE TRIGGER update_direct_messages_updated_at BEFORE UPDATE ON direct_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON role_permissions;
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
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

DROP TRIGGER IF EXISTS update_material_status_trigger ON materials;
CREATE TRIGGER update_material_status_trigger BEFORE INSERT OR UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_material_status();
