# Database Schema Guide

Hướng dẫn tạo database schema cho ConstructOS khi deploy production.

## Database Recommendation

- **PostgreSQL** (khuyến nghị) - Hỗ trợ tốt JSON, arrays, và các tính năng nâng cao
- **MySQL 8.0+** - Cũng hỗ trợ tốt
- **SQLite** - Chỉ dùng cho development/testing

## Tổng quan Tables

1. `users` - Quản lý người dùng
2. `projects` - Dự án
3. `project_stages` - Giai đoạn dự án
4. `stage_checklists` - Checklist của giai đoạn
5. `project_documents` - Tài liệu dự án
6. `materials` - Vật tư
7. `material_transactions` - Giao dịch vật tư (nhập/xuất)
8. `purchase_requests` - Yêu cầu mua hàng
9. `personnel` - Nhân sự
10. `attendance` - Chấm công
11. `equipment` - Thiết bị
12. `equipment_usage` - Sử dụng thiết bị
13. `maintenance_schedules` - Lịch bảo trì
14. `contracts` - Hợp đồng
15. `site_logs` - Nhật ký công trường
16. `financial_reports` - Báo cáo tài chính (optional)

---

## PostgreSQL Schema

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Thêm field này cho authentication
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'accountant', 'warehouse', 'site_manager', 'engineer', 'client')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255) - Tên người dùng
- `email`: VARCHAR(255) - Email (unique)
- `phone`: VARCHAR(20) - Số điện thoại
- `password_hash`: VARCHAR(255) - Mật khẩu đã hash (bcrypt)
- `role`: VARCHAR(50) - Vai trò (enum)
- `status`: VARCHAR(20) - Trạng thái (enum)
- `avatar`: TEXT - URL ảnh đại diện
- `created_at`: TIMESTAMP - Ngày tạo
- `updated_at`: TIMESTAMP - Ngày cập nhật

---

### 2. Projects Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Field Types:**
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) - Mã dự án (unique)
- `name`: VARCHAR(255) - Tên dự án
- `description`: TEXT - Mô tả
- `client`: VARCHAR(255) - Khách hàng
- `location`: VARCHAR(255) - Địa điểm
- `start_date`: DATE - Ngày bắt đầu
- `end_date`: DATE - Ngày kết thúc
- `status`: VARCHAR(20) - Trạng thái (enum)
- `progress`: INTEGER - Tiến độ (0-100)
- `budget`: DECIMAL(15,2) - Ngân sách
- `actual_cost`: DECIMAL(15,2) - Chi phí thực tế
- `manager_id`: UUID - Foreign Key → users.id

---

### 3. Project Stages Table

```sql
CREATE TABLE project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Field Types:**
- `id`: UUID (Primary Key)
- `project_id`: UUID - Foreign Key → projects.id
- `name`: VARCHAR(255) - Tên giai đoạn
- `description`: TEXT - Mô tả
- `start_date`: DATE - Ngày bắt đầu
- `end_date`: DATE - Ngày kết thúc
- `progress`: INTEGER - Tiến độ (0-100)
- `status`: VARCHAR(20) - Trạng thái (enum)

---

### 4. Stage Checklists Table

```sql
CREATE TABLE stage_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stage_checklists_stage_id ON stage_checklists(stage_id);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `stage_id`: UUID - Foreign Key → project_stages.id
- `task`: TEXT - Nhiệm vụ
- `completed`: BOOLEAN - Đã hoàn thành
- `completed_by`: UUID - Foreign Key → users.id (nullable)
- `completed_at`: TIMESTAMP - Thời gian hoàn thành (nullable)

---

### 5. Project Documents Table

```sql
CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('drawing', 'contract', 'report', 'photo', 'other')),
    url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_type ON project_documents(type);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `project_id`: UUID - Foreign Key → projects.id
- `name`: VARCHAR(255) - Tên tài liệu
- `type`: VARCHAR(20) - Loại tài liệu (enum)
- `url`: TEXT - URL/đường dẫn file
- `uploaded_by`: UUID - Foreign Key → users.id
- `uploaded_at`: TIMESTAMP - Thời gian upload

---

### 6. Materials Table

```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Field Types:**
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) - Mã vật tư (unique)
- `name`: VARCHAR(255) - Tên vật tư
- `category`: VARCHAR(100) - Danh mục
- `unit`: VARCHAR(20) - Đơn vị (kg, m3, m2, etc.)
- `current_stock`: DECIMAL(15,3) - Tồn kho hiện tại
- `min_stock`: DECIMAL(15,3) - Tồn kho tối thiểu
- `max_stock`: DECIMAL(15,3) - Tồn kho tối đa
- `unit_price`: DECIMAL(15,2) - Đơn giá
- `supplier`: VARCHAR(255) - Nhà cung cấp (nullable)
- `location`: VARCHAR(255) - Vị trí trong kho (nullable)
- `barcode`: VARCHAR(100) - Mã vạch (nullable)
- `qr_code`: VARCHAR(100) - QR code (nullable)
- `status`: VARCHAR(20) - Trạng thái (enum)

---

### 7. Material Transactions Table

```sql
CREATE TABLE material_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id),
    material_name VARCHAR(255) NOT NULL, -- Denormalized for performance
    type VARCHAR(20) NOT NULL CHECK (type IN ('import', 'export', 'adjustment')),
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255), -- Denormalized
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_transactions_material_id ON material_transactions(material_id);
CREATE INDEX idx_material_transactions_project_id ON material_transactions(project_id);
CREATE INDEX idx_material_transactions_performed_at ON material_transactions(performed_at);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `material_id`: UUID - Foreign Key → materials.id
- `material_name`: VARCHAR(255) - Tên vật tư (denormalized)
- `type`: VARCHAR(20) - Loại giao dịch (enum)
- `quantity`: DECIMAL(15,3) - Số lượng
- `unit`: VARCHAR(20) - Đơn vị
- `project_id`: UUID - Foreign Key → projects.id (nullable)
- `project_name`: VARCHAR(255) - Tên dự án (denormalized, nullable)
- `reason`: TEXT - Lý do
- `performed_by`: UUID - Foreign Key → users.id
- `performed_at`: TIMESTAMP - Thời gian thực hiện

---

### 8. Purchase Requests Table

```sql
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id),
    material_name VARCHAR(255) NOT NULL, -- Denormalized
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
```

**Field Types:**
- `id`: UUID (Primary Key)
- `material_id`: UUID - Foreign Key → materials.id
- `material_name`: VARCHAR(255) - Tên vật tư (denormalized)
- `quantity`: DECIMAL(15,3) - Số lượng
- `unit`: VARCHAR(20) - Đơn vị
- `reason`: TEXT - Lý do
- `requested_by`: UUID - Foreign Key → users.id
- `requested_at`: TIMESTAMP - Thời gian yêu cầu
- `status`: VARCHAR(20) - Trạng thái (enum)
- `approved_by`: UUID - Foreign Key → users.id (nullable)
- `approved_at`: TIMESTAMP - Thời gian duyệt (nullable)

---

### 9. Personnel Table

```sql
CREATE TABLE personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    position UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    team VARCHAR(100),
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255), -- Denormalized
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    hire_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personnel_code ON personnel(code);
CREATE INDEX idx_personnel_project_id ON personnel(project_id);
CREATE INDEX idx_personnel_status ON personnel(status);
CREATE INDEX idx_personnel_position ON personnel(position);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) - Mã nhân sự (unique)
- `name`: VARCHAR(255) - Họ và tên
- `phone`: VARCHAR(20) - Số điện thoại
- `email`: VARCHAR(255) - Email (nullable)
- `position`: UUID - Foreign Key → roles.id (role ID from roles table)
- `team`: VARCHAR(100) - Tổ đội (nullable)
- `project_id`: UUID - Foreign Key → projects.id (nullable)
- `project_name`: VARCHAR(255) - Tên dự án (denormalized, nullable)
- `status`: VARCHAR(20) - Trạng thái (enum)
- `hire_date`: DATE - Ngày tuyển dụng
- `created_at`: TIMESTAMP - Ngày tạo
- `updated_at`: TIMESTAMP - Ngày cập nhật

---

### 10. Attendance Table

```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personnel_id UUID NOT NULL REFERENCES personnel(id),
    personnel_name VARCHAR(255) NOT NULL, -- Denormalized
    project_id UUID NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL, -- Denormalized
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    location_lat DECIMAL(10, 8), -- Latitude
    location_lng DECIMAL(11, 8), -- Longitude
    hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night', 'full_day')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'early_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_personnel_id ON attendance(personnel_id);
CREATE INDEX idx_attendance_project_id ON attendance(project_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(personnel_id, project_id, date);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `personnel_id`: UUID - Foreign Key → personnel.id
- `personnel_name`: VARCHAR(255) - Tên nhân sự (denormalized)
- `project_id`: UUID - Foreign Key → projects.id
- `project_name`: VARCHAR(255) - Tên dự án (denormalized)
- `date`: DATE - Ngày chấm công
- `check_in`: TIME - Giờ vào
- `check_out`: TIME - Giờ ra (nullable)
- `location_lat`: DECIMAL(10,8) - Vĩ độ GPS (nullable)
- `location_lng`: DECIMAL(11,8) - Kinh độ GPS (nullable)
- `hours`: DECIMAL(5,2) - Số giờ làm việc
- `shift`: VARCHAR(20) - Ca làm việc (enum)
- `status`: VARCHAR(20) - Trạng thái (enum)

---

### 11. Equipment Table

```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('excavator', 'crane', 'truck', 'concrete_mixer', 'generator', 'other')),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'broken')),
    current_project_id UUID REFERENCES projects(id),
    current_project_name VARCHAR(255), -- Denormalized
    current_user UUID REFERENCES users(id),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_code ON equipment(code);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_current_project_id ON equipment(current_project_id);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) - Mã thiết bị (unique)
- `name`: VARCHAR(255) - Tên thiết bị
- `type`: VARCHAR(20) - Loại thiết bị (enum)
- `brand`: VARCHAR(100) - Hãng
- `model`: VARCHAR(100) - Model
- `serial_number`: VARCHAR(100) - Số serial (unique)
- `purchase_date`: DATE - Ngày mua
- `status`: VARCHAR(20) - Trạng thái (enum)
- `current_project_id`: UUID - Foreign Key → projects.id (nullable)
- `current_project_name`: VARCHAR(255) - Tên dự án (denormalized, nullable)
- `current_user`: UUID - Foreign Key → users.id (nullable)
- `last_maintenance_date`: DATE - Ngày bảo trì cuối (nullable)
- `next_maintenance_date`: DATE - Ngày bảo trì tiếp theo (nullable)
- `total_hours`: DECIMAL(10,2) - Tổng giờ sử dụng
- `created_at`: TIMESTAMP - Ngày tạo
- `updated_at`: TIMESTAMP - Ngày cập nhật

---

### 12. Equipment Usage Table

```sql
CREATE TABLE equipment_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    equipment_name VARCHAR(255) NOT NULL, -- Denormalized
    project_id UUID NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL, -- Denormalized
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL, -- Denormalized
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    fuel_consumption DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_usage_equipment_id ON equipment_usage(equipment_id);
CREATE INDEX idx_equipment_usage_project_id ON equipment_usage(project_id);
CREATE INDEX idx_equipment_usage_start_time ON equipment_usage(start_time);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `equipment_id`: UUID - Foreign Key → equipment.id
- `equipment_name`: VARCHAR(255) - Tên thiết bị (denormalized)
- `project_id`: UUID - Foreign Key → projects.id
- `project_name`: VARCHAR(255) - Tên dự án (denormalized)
- `user_id`: UUID - Foreign Key → users.id
- `user_name`: VARCHAR(255) - Tên người dùng (denormalized)
- `start_time`: TIMESTAMP - Thời gian bắt đầu
- `end_time`: TIMESTAMP - Thời gian kết thúc (nullable)
- `fuel_consumption`: DECIMAL(10,2) - Lượng nhiên liệu (nullable)
- `notes`: TEXT - Ghi chú (nullable)

---

### 13. Maintenance Schedules Table

```sql
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    equipment_name VARCHAR(255) NOT NULL, -- Denormalized
    type VARCHAR(20) NOT NULL CHECK (type IN ('routine', 'repair', 'inspection')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue')),
    description TEXT NOT NULL,
    cost DECIMAL(15, 2),
    technician VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_schedules_equipment_id ON maintenance_schedules(equipment_id);
CREATE INDEX idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `equipment_id`: UUID - Foreign Key → equipment.id
- `equipment_name`: VARCHAR(255) - Tên thiết bị (denormalized)
- `type`: VARCHAR(20) - Loại bảo trì (enum)
- `scheduled_date`: DATE - Ngày lên lịch
- `completed_date`: DATE - Ngày hoàn thành (nullable)
- `status`: VARCHAR(20) - Trạng thái (enum)
- `description`: TEXT - Mô tả
- `cost`: DECIMAL(15,2) - Chi phí (nullable)
- `technician`: VARCHAR(255) - Kỹ thuật viên (nullable)

---

### 14. Contracts Table

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('construction', 'supply', 'service', 'labor')),
    client VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255), -- Denormalized
    value DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'terminated')),
    signed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_code ON contracts(code);
CREATE INDEX idx_contracts_project_id ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) - Mã hợp đồng (unique)
- `name`: VARCHAR(255) - Tên hợp đồng
- `type`: VARCHAR(20) - Loại hợp đồng (enum)
- `client`: VARCHAR(255) - Khách hàng
- `project_id`: UUID - Foreign Key → projects.id (nullable)
- `project_name`: VARCHAR(255) - Tên dự án (denormalized, nullable)
- `value`: DECIMAL(15,2) - Giá trị hợp đồng
- `start_date`: DATE - Ngày bắt đầu
- `end_date`: DATE - Ngày kết thúc
- `status`: VARCHAR(20) - Trạng thái (enum)
- `signed_date`: DATE - Ngày ký (nullable)

**Note:** Documents được lưu trong bảng `project_documents` với type='contract'

---

### 15. Site Logs Table

```sql
CREATE TABLE site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL, -- Denormalized
    date DATE NOT NULL,
    weather VARCHAR(100) NOT NULL,
    work_description TEXT NOT NULL,
    issues TEXT,
    photos TEXT[], -- Array of photo URLs
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_logs_project_id ON site_logs(project_id);
CREATE INDEX idx_site_logs_date ON site_logs(date);
CREATE INDEX idx_site_logs_created_at ON site_logs(created_at);
```

**Field Types:**
- `id`: UUID (Primary Key)
- `project_id`: UUID - Foreign Key → projects.id
- `project_name`: VARCHAR(255) - Tên dự án (denormalized)
- `date`: DATE - Ngày ghi nhật ký
- `weather`: VARCHAR(100) - Thời tiết
- `work_description`: TEXT - Mô tả công việc
- `issues`: TEXT - Vấn đề (nullable)
- `photos`: TEXT[] - Mảng URL ảnh (PostgreSQL array)
- `created_by`: UUID - Foreign Key → users.id
- `created_at`: TIMESTAMP - Ngày tạo
- `updated_at`: TIMESTAMP - Ngày cập nhật

---

### 16. Contract Documents Table (Optional - nếu cần lưu riêng)

```sql
CREATE TABLE contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_documents_contract_id ON contract_documents(contract_id);
```

---

## MySQL Schema (Alternative)

Nếu sử dụng MySQL, một số thay đổi cần lưu ý:

1. **UUID**: MySQL không có UUID type, dùng `CHAR(36)` hoặc `BINARY(16)`
2. **Arrays**: MySQL không hỗ trợ arrays, dùng JSON hoặc bảng riêng
3. **CHECK constraints**: MySQL 8.0+ mới hỗ trợ

Ví dụ cho MySQL:

```sql
-- Users table (MySQL)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'project_manager', 'accountant', 'warehouse', 'site_manager', 'engineer', 'client') NOT NULL,
    status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Migration Script

Tạo file `database/migrations/001_initial_schema.sql` với tất cả các CREATE TABLE statements ở trên.

---

## Indexes và Performance

### Indexes đã tạo:
- Primary keys (tự động)
- Foreign keys (tự động)
- Unique constraints
- Indexes trên các field thường query:
  - `email`, `code` (unique identifiers)
  - `status` (filtering)
  - `project_id`, `material_id`, etc. (joins)
  - `date`, `created_at` (time-based queries)

### Thêm indexes nếu cần:
```sql
-- Full-text search cho materials
CREATE INDEX idx_materials_name_search ON materials USING gin(to_tsvector('english', name));

-- Composite indexes cho queries phức tạp
CREATE INDEX idx_material_transactions_date_type ON material_transactions(performed_at, type);
```

---

## Triggers (Optional)

### Auto-update timestamps:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Áp dụng cho các tables có updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (lặp lại cho các tables khác)
```

### Auto-update material status:
```sql
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
```

---

## Seeding Data

Tạo file `database/seeds/initial_data.sql` để seed dữ liệu ban đầu:

```sql
-- Insert admin user
INSERT INTO users (id, name, email, phone, password_hash, role, status)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@constructos.com',
    '0900000000',
    '$2b$10$...', -- bcrypt hash của password
    'admin',
    'active'
);
```

---

## Backup và Restore

### Backup:
```bash
pg_dump -U username -d constructos > backup.sql
```

### Restore:
```bash
psql -U username -d constructos < backup.sql
```

---

## Lưu ý khi Deploy

1. **Environment Variables**: Lưu connection string trong biến môi trường
2. **Migrations**: Chạy migrations theo thứ tự
3. **Backup**: Backup database trước khi deploy
4. **Indexes**: Tạo indexes sau khi insert dữ liệu lớn để tăng tốc
5. **Connection Pooling**: Sử dụng connection pooling (pgBouncer cho PostgreSQL)
6. **Monitoring**: Setup monitoring cho database performance

---

## Next Steps

1. Chọn database (PostgreSQL khuyến nghị)
2. Tạo database: `CREATE DATABASE constructos;`
3. Chạy migration script
4. Seed initial data
5. Cập nhật server code để kết nối với database thay vì in-memory storage

