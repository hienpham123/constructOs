# Hướng dẫn thiết lập hệ thống phân quyền (Roles)

## Tổng quan

Hệ thống phân quyền cho phép quản lý quyền truy cập của các vai trò khác nhau trong hệ thống. Mỗi vai trò có thể có các quyền khác nhau để xem các loại tài liệu khác nhau.

## Các vai trò mặc định

1. **Admin** - Quản trị viên: Toàn quyền truy cập
2. **Director** - Giám đốc: Xem hồ sơ bản vẽ và báo cáo ngày, KHÔNG xem hợp đồng
3. **Project Manager** - Quản lý dự án: Xem hồ sơ bản vẽ và báo cáo ngày, KHÔNG xem hợp đồng
4. **Design Department** - Phòng thiết kế: Xem hồ sơ bản vẽ và báo cáo ngày, KHÔNG xem hợp đồng
5. **Construction Department** - Phòng thi công: Xem hồ sơ bản vẽ và báo cáo ngày, KHÔNG xem hợp đồng
6. **Accountant** - Kế toán: Xem hợp đồng và báo cáo dự án, KHÔNG xem bản vẽ
7. **QS** - Quantity Surveyor: Xem hợp đồng và báo cáo dự án, KHÔNG xem bản vẽ

## Các loại quyền

- `view_drawing`: Xem hồ sơ bản vẽ
- `view_contract`: Xem hợp đồng
- `view_report`: Xem báo cáo (tổng quát)
- `view_daily_report`: Xem báo cáo ngày
- `view_project_report`: Xem báo cáo dự án

## Cài đặt

### Bước 1: Tạo bảng roles và role_permissions

Chạy file SQL:
```bash
mysql -u root -p constructos < database/create_roles_table.sql
```

### Bước 2: Thêm cột role_id vào bảng users (nếu chưa có)

Chạy file migration:
```bash
mysql -u root -p constructos < database/migrate_add_role_id.sql
```

Hoặc chạy thủ công:
```sql
ALTER TABLE users ADD COLUMN role_id CHAR(36) NULL;
ALTER TABLE users ADD INDEX idx_role_id (role_id);
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
```

### Bước 3: Gán vai trò cho người dùng

Có 2 cách:

**Cách 1: Sử dụng role_id (khuyến nghị)**
```sql
UPDATE users SET role_id = '00000000-0000-0000-0000-000000000002' WHERE email = 'director@example.com';
```

**Cách 2: Sử dụng role name (tương thích ngược)**
Hệ thống sẽ tự động tìm role_id dựa trên role name nếu role_id chưa được set.

## Sử dụng

### Quản lý vai trò qua giao diện

1. Đăng nhập với tài khoản admin
2. Vào menu "Vai trò" trong sidebar
3. Có thể:
   - Xem danh sách tất cả vai trò
   - Thêm vai trò mới
   - Chỉnh sửa vai trò và phân quyền
   - Xóa vai trò (nếu không có người dùng nào đang sử dụng)

### API Endpoints

- `GET /api/roles` - Lấy danh sách tất cả vai trò
- `GET /api/roles/:id` - Lấy thông tin một vai trò
- `POST /api/roles` - Tạo vai trò mới
- `PUT /api/roles/:id` - Cập nhật vai trò
- `DELETE /api/roles/:id` - Xóa vai trò
- `GET /api/roles/my-permissions` - Lấy quyền của người dùng hiện tại

### Kiểm tra quyền trong code

**Frontend:**
```typescript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { canViewDrawing, canViewContract, canViewDocumentType } = usePermissions();
  
  // Kiểm tra quyền xem bản vẽ
  if (canViewDrawing) {
    // Hiển thị bản vẽ
  }
  
  // Kiểm tra quyền xem một loại tài liệu cụ thể
  if (canViewDocumentType('contract', documentName)) {
    // Hiển thị hợp đồng
  }
}
```

## Lưu ý

1. **Phân biệt báo cáo ngày và báo cáo dự án:**
   - Hệ thống tự động phân biệt dựa trên tên tài liệu
   - Báo cáo ngày: chứa từ khóa "báo cáo ngày", "daily report", "nhật ký"
   - Báo cáo dự án: chứa từ khóa "báo cáo dự án", "project report", "báo cáo"

2. **Tương thích ngược:**
   - Nếu user chưa có `role_id`, hệ thống sẽ tìm role dựa trên `role` name
   - Admin mặc định có toàn quyền nếu không tìm thấy role

3. **Xóa vai trò:**
   - Không thể xóa vai trò nếu có người dùng đang sử dụng
   - Cần gán vai trò khác cho người dùng trước khi xóa

## Troubleshooting

### Lỗi: "Cannot add foreign key constraint"
- Đảm bảo bảng `roles` đã được tạo trước
- Kiểm tra xem cột `role_id` đã tồn tại chưa

### Người dùng không thấy tài liệu
- Kiểm tra quyền của vai trò trong bảng `role_permissions`
- Kiểm tra xem user đã được gán `role_id` chưa
- Kiểm tra tên tài liệu có đúng định dạng không (cho báo cáo)

### Quyền không được cập nhật
- Đảm bảo đã refresh permissions: `refreshPermissions()` trong hook
- Kiểm tra API response từ `/api/roles/my-permissions`

