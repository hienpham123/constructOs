-- Migration: Create project_tasks and task_activity tables (PostgreSQL version)
-- Run this migration to add multi-tier task assignment feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROJECT TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    parent_task_id UUID NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'completed', 'blocked', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    due_date DATE,
    assigned_to UUID NOT NULL,
    assigned_to_name VARCHAR(255),
    created_by UUID NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent_task_id ON project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_created_at ON project_tasks(created_at);

-- ============================================
-- TASK ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    note TEXT,
    actor_id UUID NOT NULL,
    actor_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_action ON task_activity(action);
CREATE INDEX IF NOT EXISTS idx_task_activity_actor_id ON task_activity(actor_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created_at ON task_activity(created_at);

-- ============================================
-- TRIGGER FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_project_tasks_updated_at();

