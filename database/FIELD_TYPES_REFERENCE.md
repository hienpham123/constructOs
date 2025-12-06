# Database Field Types Reference

Tài liệu tham khảo nhanh về các field types trong database.

## Tổng hợp Field Types

### UUID / ID Fields
- **PostgreSQL**: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- **MySQL**: `CHAR(36) PRIMARY KEY`
- **Mô tả**: Định danh duy nhất cho mỗi record

### String Fields

| Field Name | Type | Length | Nullable | Description |
|------------|-------|--------|---------|-------------|
| `name` | VARCHAR(255) | 255 | NO | Tên (người dùng, dự án, vật tư, etc.) |
| `code` | VARCHAR(50) | 50 | NO | Mã định danh (unique) |
| `email` | VARCHAR(255) | 255 | NO | Email (unique) |
| `phone` | VARCHAR(20) | 20 | NO | Số điện thoại |
| `description` | TEXT | - | YES | Mô tả chi tiết |
| `reason` | TEXT | - | NO | Lý do (cho transactions, requests) |
| `notes` | TEXT | - | YES | Ghi chú |
| `url` | TEXT | - | NO | URL/đường dẫn file |
| `avatar` | TEXT | - | YES | URL ảnh đại diện |
| `location` | VARCHAR(255) | 255 | YES | Địa điểm/vị trí |
| `supplier` | VARCHAR(255) | 255 | YES | Nhà cung cấp |
| `category` | VARCHAR(100) | 100 | NO | Danh mục |
| `unit` | VARCHAR(20) | 20 | NO | Đơn vị (kg, m3, m2, etc.) |
| `brand` | VARCHAR(100) | 100 | NO | Hãng (thiết bị) |
| `model` | VARCHAR(100) | 100 | NO | Model |
| `serial_number` | VARCHAR(100) | 100 | NO | Số serial (unique) |
| `barcode` | VARCHAR(100) | 100 | YES | Mã vạch |
| `qr_code` | VARCHAR(100) | 100 | YES | QR code |
| `team` | VARCHAR(100) | 100 | YES | Tổ đội |
| `client` | VARCHAR(255) | 255 | NO | Khách hàng |
| `weather` | VARCHAR(100) | 100 | NO | Thời tiết |
| `technician` | VARCHAR(255) | 255 | YES | Kỹ thuật viên |

### Numeric Fields

| Field Name | Type | Precision | Nullable | Description |
|------------|-------|-----------|---------|-------------|
| `progress` | INTEGER | - | NO | Tiến độ (0-100) |
| `budget` | DECIMAL(15,2) | 15,2 | NO | Ngân sách (VND) |
| `actual_cost` | DECIMAL(15,2) | 15,2 | NO | Chi phí thực tế (VND) |
| `value` | DECIMAL(15,2) | 15,2 | NO | Giá trị hợp đồng (VND) |
| `current_stock` | DECIMAL(15,3) | 15,3 | NO | Tồn kho hiện tại |
| `min_stock` | DECIMAL(15,3) | 15,3 | NO | Tồn kho tối thiểu |
| `max_stock` | DECIMAL(15,3) | 15,3 | NO | Tồn kho tối đa |
| `unit_price` | DECIMAL(15,2) | 15,2 | NO | Đơn giá (VND) |
| `quantity` | DECIMAL(15,3) | 15,3 | NO | Số lượng |
| `hours` | DECIMAL(5,2) | 5,2 | NO | Số giờ làm việc |
| `total_hours` | DECIMAL(10,2) | 10,2 | NO | Tổng giờ sử dụng |
| `fuel_consumption` | DECIMAL(10,2) | 10,2 | YES | Lượng nhiên liệu |
| `cost` | DECIMAL(15,2) | 15,2 | YES | Chi phí bảo trì |
| `location_lat` | DECIMAL(10,8) | 10,8 | YES | Vĩ độ GPS |
| `location_lng` | DECIMAL(11,8) | 11,8 | YES | Kinh độ GPS |

### Date/Time Fields

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `created_at` | TIMESTAMP | NO | Ngày tạo |
| `updated_at` | TIMESTAMP | NO | Ngày cập nhật |
| `start_date` | DATE | NO | Ngày bắt đầu |
| `end_date` | DATE | NO | Ngày kết thúc |
| `date` | DATE | NO | Ngày (chấm công, nhật ký) |
| `hire_date` | DATE | NO | Ngày tuyển dụng |
| `purchase_date` | DATE | NO | Ngày mua |
| `signed_date` | DATE | YES | Ngày ký hợp đồng |
| `scheduled_date` | DATE | NO | Ngày lên lịch |
| `completed_date` | DATE | YES | Ngày hoàn thành |
| `last_maintenance_date` | DATE | YES | Ngày bảo trì cuối |
| `next_maintenance_date` | DATE | YES | Ngày bảo trì tiếp theo |
| `check_in` | TIME | NO | Giờ vào |
| `check_out` | TIME | YES | Giờ ra |
| `start_time` | TIMESTAMP | NO | Thời gian bắt đầu |
| `end_time` | TIMESTAMP | YES | Thời gian kết thúc |
| `performed_at` | TIMESTAMP | NO | Thời gian thực hiện |
| `requested_at` | TIMESTAMP | NO | Thời gian yêu cầu |
| `approved_at` | TIMESTAMP | YES | Thời gian duyệt |
| `uploaded_at` | TIMESTAMP | NO | Thời gian upload |
| `completed_at` | TIMESTAMP | YES | Thời gian hoàn thành |

### Boolean Fields

| Field Name | Type | Default | Description |
|------------|------|---------|-------------|
| `completed` | BOOLEAN | FALSE | Đã hoàn thành |

### Enum Fields

| Field Name | Values | Default | Description |
|------------|--------|---------|-------------|
| `role` | admin, project_manager, accountant, warehouse, site_manager, engineer, client | - | Vai trò người dùng |
| `status` | active, inactive, banned | active | Trạng thái người dùng |
| `project_status` | planning, in_progress, on_hold, completed, cancelled | planning | Trạng thái dự án |
| `stage_status` | not_started, in_progress, completed | not_started | Trạng thái giai đoạn |
| `material_status` | available, low_stock, out_of_stock | available | Trạng thái vật tư |
| `transaction_type` | import, export, adjustment | - | Loại giao dịch |
| `request_status` | pending, approved, rejected, ordered | pending | Trạng thái yêu cầu |
| `position` | worker, engineer, supervisor, team_leader | - | Vị trí nhân sự |
| `personnel_status` | active, inactive, on_leave | active | Trạng thái nhân sự |
| `attendance_status` | present, absent, late, early_leave | - | Trạng thái chấm công |
| `shift` | morning, afternoon, night, full_day | - | Ca làm việc |
| `equipment_type` | excavator, crane, truck, concrete_mixer, generator, other | - | Loại thiết bị |
| `equipment_status` | available, in_use, maintenance, broken | available | Trạng thái thiết bị |
| `maintenance_type` | routine, repair, inspection | - | Loại bảo trì |
| `maintenance_status` | scheduled, in_progress, completed, overdue | scheduled | Trạng thái bảo trì |
| `contract_type` | construction, supply, service, labor | - | Loại hợp đồng |
| `contract_status` | draft, pending, active, completed, terminated | draft | Trạng thái hợp đồng |
| `document_type` | drawing, contract, report, photo, other | - | Loại tài liệu |

### Array/JSON Fields

| Field Name | Type (PostgreSQL) | Type (MySQL) | Description |
|------------|-------------------|--------------|-------------|
| `photos` | TEXT[] | JSON | Mảng URL ảnh |
| `documents` | TEXT[] | JSON | Mảng URL tài liệu |

### Foreign Key Fields

| Field Name | References | Description |
|------------|------------|-------------|
| `manager_id` | users.id | Quản lý dự án |
| `project_id` | projects.id | Dự án liên quan |
| `material_id` | materials.id | Vật tư liên quan |
| `equipment_id` | equipment.id | Thiết bị liên quan |
| `personnel_id` | personnel.id | Nhân sự liên quan |
| `user_id` | users.id | Người dùng |
| `stage_id` | project_stages.id | Giai đoạn dự án |
| `contract_id` | contracts.id | Hợp đồng |
| `performed_by` | users.id | Người thực hiện |
| `requested_by` | users.id | Người yêu cầu |
| `approved_by` | users.id | Người duyệt |
| `uploaded_by` | users.id | Người upload |
| `created_by` | users.id | Người tạo |
| `completed_by` | users.id | Người hoàn thành |
| `current_user` | users.id | Người dùng hiện tại |

### Denormalized Fields

Các field này được lưu để tăng performance, tránh join:

- `material_name` - Tên vật tư (trong transactions, purchase_requests)
- `project_name` - Tên dự án (trong nhiều tables)
- `equipment_name` - Tên thiết bị (trong usage, maintenance)
- `personnel_name` - Tên nhân sự (trong attendance)
- `user_name` - Tên người dùng (trong equipment_usage)

---

## Data Type Mapping

### PostgreSQL → MySQL

| PostgreSQL | MySQL | Notes |
|------------|-------|-------|
| UUID | CHAR(36) | Hoặc BINARY(16) |
| TEXT | TEXT | Giống nhau |
| VARCHAR(n) | VARCHAR(n) | Giống nhau |
| DECIMAL(p,s) | DECIMAL(p,s) | Giống nhau |
| INTEGER | INT | Giống nhau |
| BOOLEAN | BOOLEAN/TINYINT(1) | MySQL dùng TINYINT(1) |
| TIMESTAMP WITH TIME ZONE | TIMESTAMP | MySQL tự động convert |
| TEXT[] | JSON | MySQL không có arrays |
| CHECK constraint | ENUM | MySQL dùng ENUM thay vì CHECK |

---

## Indexes Strategy

### Primary Indexes (Auto)
- Tất cả `id` fields (PRIMARY KEY)

### Unique Indexes
- `users.email`
- `projects.code`
- `materials.code`
- `personnel.code`
- `equipment.code`, `equipment.serial_number`
- `contracts.code`
- `attendance` (personnel_id, project_id, date) - composite unique

### Foreign Key Indexes (Auto)
- Tất cả foreign key fields

### Performance Indexes
- `status` fields (cho filtering)
- `date`, `created_at` (cho time-based queries)
- `email`, `code` (cho lookups)
- Composite indexes cho queries phức tạp

---

## Constraints

### Check Constraints
- `progress` >= 0 AND <= 100
- Enum values (thông qua CHECK hoặc ENUM)

### Foreign Key Constraints
- ON DELETE CASCADE cho child tables (stages, checklists, documents)
- ON DELETE RESTRICT cho parent tables (users, projects, materials)

### Unique Constraints
- Email, code fields
- Composite unique (attendance)

---

## Best Practices

1. **UUID vs Auto-increment**: Dùng UUID để tránh expose thông tin và dễ scale
2. **Denormalization**: Lưu tên (name) fields để tránh join khi query list
3. **Indexes**: Tạo indexes trên fields thường query, nhưng không quá nhiều (ảnh hưởng write performance)
4. **Timestamps**: Luôn có `created_at` và `updated_at`
5. **Soft Delete**: Có thể thêm `deleted_at` TIMESTAMP NULL để soft delete thay vì hard delete
6. **Text Fields**: Dùng TEXT cho description, reason, notes (không giới hạn length)
7. **Decimal Precision**: 
   - Money: DECIMAL(15,2) - đủ cho VND
   - Quantity: DECIMAL(15,3) - đủ cho số lượng vật tư
   - Hours: DECIMAL(5,2) hoặc DECIMAL(10,2)

