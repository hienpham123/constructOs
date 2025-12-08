# 🔧 Setup Roles trong Supabase

Hướng dẫn thêm roles vào Supabase database để fix lỗi "No roles found in database" khi đăng ký.

## ⚠️ Vấn Đề

Khi đăng ký user mới, hệ thống cần tìm role `construction_department` để gán mặc định. Nếu bảng `roles` trống, sẽ báo lỗi:
```
No roles found in database. Please create at least one role first.
```

## ✅ Giải Pháp

### Cách 1: Dùng Supabase SQL Editor (Khuyến nghị)

1. **Vào Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Mở SQL Editor**
   - Click **"SQL Editor"** ở sidebar trái
   - Click **"New query"**

3. **Chạy Script Insert Roles**
   - Copy nội dung file `database/seeds/insert_roles.sql`
   - Paste vào SQL Editor
   - Click **"Run"** hoặc nhấn `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify**
   - Script sẽ hiển thị danh sách roles đã insert
   - Kiểm tra có role `construction_department` trong danh sách

### Cách 2: Dùng psql Command Line

Nếu bạn có psql installed:

```bash
# Connect to Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Run script
\i database/seeds/insert_roles.sql

# Verify
SELECT id, name, description FROM roles ORDER BY name;
```

### Cách 3: Copy SQL Trực Tiếp

Nếu không muốn dùng file, copy SQL này vào Supabase SQL Editor:

```sql
-- Insert Initial Roles for ConstructOS
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Quản trị viên - Toàn quyền', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'director', 'Giám đốc', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'project_manager', 'Quản lý dự án', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'design_department', 'Phòng thiết kế', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'construction_department', 'Phòng thi công', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'accountant', 'Kế toán', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000007', 'qs', 'QS - Quantity Surveyor', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();
```

## 📋 Roles Được Tạo

Sau khi chạy script, bạn sẽ có các roles sau:

1. **admin** - Quản trị viên - Toàn quyền
2. **director** - Giám đốc
3. **project_manager** - Quản lý dự án
4. **design_department** - Phòng thiết kế
5. **construction_department** - Phòng thi công ⭐ (Role mặc định khi đăng ký)
6. **accountant** - Kế toán
7. **qs** - QS - Quantity Surveyor

## ✅ Kiểm Tra Sau Khi Insert

1. **Trong Supabase SQL Editor**, chạy query:
   ```sql
   SELECT id, name, description FROM roles ORDER BY name;
   ```

2. **Test đăng ký** trên frontend:
   - Vào trang đăng ký
   - Điền thông tin và submit
   - Không còn lỗi "No roles found"
   - User mới sẽ tự động được gán role `construction_department`

## 🔄 Nếu Đã Có Roles

Script sử dụng `ON CONFLICT DO UPDATE`, nên:
- ✅ Nếu role chưa tồn tại → Insert mới
- ✅ Nếu role đã tồn tại → Update description và updated_at
- ✅ Không bị duplicate errors

## 🆘 Troubleshooting

### Lỗi: "relation 'roles' does not exist"
- **Nguyên nhân**: Bảng `roles` chưa được tạo
- **Giải pháp**: Chạy `database/schema.sql` trước

### Lỗi: "duplicate key value violates unique constraint"
- **Nguyên nhân**: Role đã tồn tại (nhưng script đã handle với ON CONFLICT)
- **Giải pháp**: Script sẽ tự động update, không cần lo

### Vẫn báo "No roles found" sau khi insert
- **Kiểm tra**: Query có đúng database không?
- **Kiểm tra**: Connection string trên Render có đúng không?
- **Kiểm tra**: Logs trên Render xem database connection có OK không?

---

**Sau khi insert roles, đăng ký sẽ hoạt động bình thường!** 🎉

