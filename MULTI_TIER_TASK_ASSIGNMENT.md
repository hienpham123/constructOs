# Tính năng Giao việc Theo Từng Bậc (Multi-Tier Task Assignment)

## Tổng quan

Tính năng này cho phép quản lý công việc theo cấu trúc phân cấp (hierarchical), hỗ trợ giao việc từ cấp trên xuống cấp dưới với các quy tắc nghiệp vụ rõ ràng.

## Tính năng chính

### 1. Cấu trúc phân cấp
- **Công việc gốc**: Không có `parent_task_id`
- **Công việc con**: Có `parent_task_id` trỏ đến công việc cha
- **Độ sâu tự do**: Không giới hạn số cấp, có thể tạo nhiều cấp lồng nhau

### 2. Trạng thái công việc

Các trạng thái và quy tắc chuyển đổi:

- **pending** (Chờ xử lý): Trạng thái ban đầu khi tạo công việc
  - Có thể chuyển sang: `in_progress`, `blocked`, `cancelled`

- **in_progress** (Đang làm): Công việc đang được thực hiện
  - Có thể chuyển sang: `submitted`, `blocked`, `cancelled`

- **submitted** (Chờ duyệt): Đã hoàn thành, chờ người giao duyệt
  - Có thể chuyển sang: `completed`, `blocked`, `cancelled`

- **completed** (Hoàn thành): Đã hoàn thành và được duyệt
  - Không thể chuyển sang trạng thái khác

- **blocked** (Tắc nghẽn): Bị chặn, không thể tiếp tục
  - Có thể chuyển sang: `in_progress`, `cancelled`

- **cancelled** (Hủy): Đã hủy công việc
  - Không thể chuyển sang trạng thái khác

### 3. Quy tắc hoàn thành theo thứ tự

- **Công việc con chỉ có thể hoàn thành khi**:
  - Công việc cha chưa bị `cancelled` hoặc `blocked`
  - Công việc con có thể hoàn thành độc lập

- **Công việc cha chỉ có thể hoàn thành khi**:
  - Tất cả công việc con đã ở trạng thái `completed` hoặc `cancelled`
  - Không có công việc con nào đang ở trạng thái `pending`, `in_progress`, `submitted`, hoặc `blocked`

### 4. Người được giao (Assigned To)

- **Bắt buộc**: Mọi công việc phải có người được giao (`assigned_to`)
- **Không thể để trống**: Hệ thống sẽ từ chối tạo công việc nếu không có người được giao

### 5. Độ ưu tiên

- **low**: Ưu tiên thấp
- **normal**: Ưu tiên bình thường (mặc định)
- **high**: Ưu tiên cao

## Cấu trúc Database

### Bảng `project_tasks`

```sql
- id: UUID/CHAR(36) - ID công việc
- project_id: UUID/CHAR(36) - ID dự án (NOT NULL)
- parent_task_id: UUID/CHAR(36) - ID công việc cha (NULL nếu là công việc gốc)
- title: VARCHAR(255) - Tiêu đề công việc (NOT NULL)
- description: TEXT - Mô tả chi tiết
- status: VARCHAR(20) - Trạng thái (pending, in_progress, submitted, completed, blocked, cancelled)
- priority: VARCHAR(20) - Độ ưu tiên (low, normal, high)
- due_date: DATE - Hạn hoàn thành
- assigned_to: UUID/CHAR(36) - Người được giao (NOT NULL)
- assigned_to_name: VARCHAR(255) - Tên người được giao (denormalized)
- created_by: UUID/CHAR(36) - Người tạo (NOT NULL)
- created_by_name: VARCHAR(255) - Tên người tạo (denormalized)
- created_at: TIMESTAMP - Thời gian tạo
- updated_at: TIMESTAMP - Thời gian cập nhật
```

### Bảng `task_activity`

Lưu lịch sử hoạt động của công việc:

```sql
- id: UUID/CHAR(36) - ID hoạt động
- task_id: UUID/CHAR(36) - ID công việc
- action: VARCHAR(50) - Hành động (created, assigned, status_changed, updated, commented)
- note: TEXT - Ghi chú hoặc nội dung thay đổi
- actor_id: UUID/CHAR(36) - Người thực hiện
- actor_name: VARCHAR(255) - Tên người thực hiện (denormalized)
- created_at: TIMESTAMP - Thời gian thực hiện
```

## API Endpoints

### 1. Lấy danh sách công việc theo dự án

```
GET /api/projects/:projectId/tasks
```

**Response**: Trả về cây công việc với cấu trúc phân cấp

```json
{
  "data": [
    {
      "id": "...",
      "title": "Công việc gốc",
      "status": "in_progress",
      "children": [
        {
          "id": "...",
          "title": "Công việc con",
          "status": "pending",
          "children": []
        }
      ]
    }
  ]
}
```

### 2. Tạo công việc mới

```
POST /api/projects/:projectId/tasks
```

**Body**:
```json
{
  "title": "Tiêu đề công việc",
  "description": "Mô tả chi tiết",
  "priority": "normal",
  "dueDate": "2025-12-31",
  "assignedTo": "user-id",
  "parentTaskId": null  // null nếu là công việc gốc
}
```

### 3. Cập nhật thông tin công việc

```
PUT /api/tasks/:taskId
```

**Body**:
```json
{
  "title": "Tiêu đề mới",
  "description": "Mô tả mới",
  "priority": "high",
  "dueDate": "2025-12-31",
  "assignedTo": "user-id"
}
```

### 4. Cập nhật trạng thái công việc

```
POST /api/tasks/:taskId/status
```

**Body**:
```json
{
  "status": "in_progress",
  "note": "Ghi chú về thay đổi trạng thái"
}
```

**Validation**:
- Kiểm tra quy tắc chuyển đổi trạng thái
- Kiểm tra quy tắc hoàn thành theo thứ tự (cha-con)
- Tự động ghi lại hoạt động vào `task_activity`

## Cài đặt

### 1. Chạy Migration

**MySQL**:
```bash
mysql -u username -p database_name < database/migrations/create_project_tasks.sql
```

**PostgreSQL**:
```bash
psql -U username -d database_name -f database/migrations/create_project_tasks_postgres.sql
```

### 2. Khởi động lại Server

Sau khi chạy migration, khởi động lại server để load các route mới:

```bash
cd server
npm run dev
```

### 3. Sử dụng trên Frontend

Tính năng đã được tích hợp vào trang chi tiết dự án (`ProjectDetail`). Mở tab "Công việc" để:

- Xem cây công việc
- Tạo công việc mới (gốc hoặc con)
- Cập nhật trạng thái công việc
- Xem lịch sử hoạt động

## Ví dụ sử dụng

### Tạo công việc gốc

1. Vào trang chi tiết dự án
2. Chọn tab "Công việc"
3. Click "Tạo công việc mới"
4. Điền thông tin:
   - Tiêu đề: "Thiết kế kiến trúc"
   - Mô tả: "Thiết kế mặt bằng và mặt đứng"
   - Độ ưu tiên: High
   - Hạn hoàn thành: 2025-12-15
   - Người được giao: [Chọn người]
5. Click "Tạo"

### Tạo công việc con

1. Tìm công việc cha trong danh sách
2. Click icon "+" bên cạnh công việc cha
3. Điền thông tin tương tự như tạo công việc gốc
4. Hệ thống tự động gán `parent_task_id`

### Hoàn thành công việc

1. Tìm công việc cần hoàn thành
2. Click vào trạng thái hiện tại
3. Chọn trạng thái mới:
   - `pending` → `in_progress` → `submitted` → `completed`
4. Nếu là công việc cha, hệ thống sẽ kiểm tra:
   - Tất cả công việc con đã hoàn thành hoặc hủy chưa?
   - Nếu chưa, sẽ từ chối và hiển thị thông báo

## Lưu ý

1. **Xóa công việc**: Khi xóa công việc cha, tất cả công việc con sẽ tự động bị xóa (CASCADE)

2. **Lịch sử hoạt động**: Mọi thay đổi trạng thái đều được ghi lại trong `task_activity` để theo dõi

3. **Performance**: Với dự án có nhiều công việc, hệ thống sẽ tối ưu query để load cây công việc hiệu quả

4. **Permissions**: Hiện tại chưa có kiểm tra quyền chi tiết. Mọi user đều có thể tạo và cập nhật công việc trong dự án.

## Troubleshooting

### Lỗi: "Không thể hoàn thành công việc cha khi còn công việc con chưa hoàn thành"

**Nguyên nhân**: Còn công việc con ở trạng thái `pending`, `in_progress`, `submitted`, hoặc `blocked`

**Giải pháp**: Hoàn thành hoặc hủy tất cả công việc con trước

### Lỗi: "Phải chọn người được giao"

**Nguyên nhân**: Trường `assignedTo` bị để trống

**Giải pháp**: Chọn người được giao từ dropdown trước khi tạo công việc

### Lỗi: "Không thể chuyển từ trạng thái X sang trạng thái Y"

**Nguyên nhân**: Vi phạm quy tắc chuyển đổi trạng thái

**Giải pháp**: Xem lại quy tắc chuyển đổi trạng thái ở phần trên

