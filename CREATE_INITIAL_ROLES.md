# 🔧 Tạo Initial Roles trong Supabase

## ⚠️ Vấn Đề

Lỗi: `Invalid role_id: invalid input syntax for type uuid: "accountant"`

**Nguyên nhân:** Database chưa có roles, nên backend không thể map role name → UUID.

## ✅ Giải Pháp: Tạo Roles trong Supabase

### Bước 1: Vào Supabase Table Editor

1. Vào Supabase dashboard
2. Click "Table Editor" (sidebar trái)
3. Chọn table `roles`

### Bước 2: Tạo các Roles cần thiết

Click "Insert row" và thêm các roles sau:

**1. Admin:**
- `name`: `admin`
- `description`: `Quản trị viên` (optional)

**2. Project Manager:**
- `name`: `project_manager`
- `description`: `Quản lý dự án` (optional)

**3. Accountant:**
- `name`: `accountant`
- `description`: `Kế toán` (optional)

**4. Warehouse:**
- `name`: `warehouse`
- `description`: `Kho` (optional)

**5. Site Manager:**
- `name`: `site_manager`
- `description`: `Quản lý công trường` (optional)

**6. Engineer:**
- `name`: `engineer`
- `description`: `Kỹ sư` (optional)

**7. Client:**
- `name`: `client`
- `description`: `Khách hàng` (optional)

### Bước 3: Hoặc dùng SQL (Nhanh hơn)

Vào Supabase SQL Editor và chạy:

```sql
INSERT INTO roles (name, description) VALUES
('admin', 'Quản trị viên'),
('project_manager', 'Quản lý dự án'),
('accountant', 'Kế toán'),
('warehouse', 'Kho'),
('site_manager', 'Quản lý công trường'),
('engineer', 'Kỹ sư'),
('client', 'Khách hàng')
ON CONFLICT (name) DO NOTHING;
```

## ✅ Sau khi tạo Roles

1. Test lại đăng ký
2. Backend sẽ tự động map role name → UUID
3. Đăng ký sẽ thành công!

---

**Tạo roles ngay để có thể đăng ký được!**

