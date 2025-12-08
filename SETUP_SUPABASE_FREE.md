# 🆓 Setup Database trên Supabase - Hoàn Toàn Miễn Phí

Hướng dẫn setup PostgreSQL database trên Supabase - **100% FREE** không giới hạn thời gian!

## 🎯 Tại Sao Supabase?

- ✅ **Hoàn toàn miễn phí** - 500MB database, 2GB bandwidth/tháng
- ✅ **Không giới hạn thời gian** - Free tier vĩnh viễn
- ✅ **PostgreSQL** - Database mạnh mẽ
- ✅ **Dashboard đẹp** - Dễ quản lý
- ✅ **Auto backup** - Tự động backup

## ⚠️ Lưu Ý Quan Trọng

Code hiện tại dùng **MySQL**, nhưng Supabase dùng **PostgreSQL**. Cần:
1. Convert schema từ MySQL sang PostgreSQL
2. Cập nhật connection trong code (hoặc dùng PostgreSQL client)

## 📋 Bước 1: Đăng Ký Supabase

1. Truy cập: https://supabase.com
2. Click **"Start your project"**
3. Đăng nhập bằng **GitHub** (khuyến nghị)

## 📋 Bước 2: Tạo Project

1. Click **"New Project"**
2. Điền thông tin:
   - **Name**: `constructOS`
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Chọn **"Southeast Asia (Singapore)"** (gần Việt Nam nhất)
3. Click **"Create new project"**
4. Đợi project được tạo (~2 phút)

## 📋 Bước 3: Lấy Connection Info

1. Vào project vừa tạo
2. Click **"Settings"** (icon bánh răng) ở sidebar trái
3. Click **"Database"** trong Settings
4. Scroll xuống phần **"Connection string"**
5. Chọn **"URI"** hoặc **"Connection pooling"**

Bạn sẽ thấy connection string dạng:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Phân tích connection string**:
- **DB_HOST**: `db.xxxxx.supabase.co` (thay xxxxx bằng ID project)
- **DB_PORT**: `5432`
- **DB_USER**: `postgres`
- **DB_PASSWORD**: Password bạn đã tạo
- **DB_NAME**: `postgres`

## 📋 Bước 4: Convert Schema MySQL → PostgreSQL

### Cách 1: Dùng Supabase SQL Editor (Khuyến nghị)

1. Trong Supabase dashboard, click **"SQL Editor"** ở sidebar
2. Click **"New query"**
3. Tôi sẽ tạo file schema PostgreSQL cho bạn (xem file `database/postgres_schema.sql`)
4. Copy nội dung file `database/postgres_schema.sql`
5. Paste vào Supabase SQL Editor
6. Click **"Run"** hoặc nhấn `Ctrl+Enter`

### Cách 2: Import từng phần

Nếu schema lớn, có thể import từng phần nhỏ.

## 📋 Bước 5: Cập Nhật Code Backend

Cần cập nhật backend để dùng PostgreSQL thay vì MySQL:

1. **Cài PostgreSQL client**:
   ```bash
   cd server
   npm install pg @types/pg
   npm uninstall mysql2 @types/mysql2
   ```

2. **Cập nhật `server/src/config/db.ts`**:
   - Thay MySQL connection bằng PostgreSQL connection
   - (Tôi sẽ tạo file mới cho bạn)

## ✅ Sau Khi Setup Xong

Bạn sẽ có:
- ✅ **DB_HOST**: `db.xxxxx.supabase.co`
- ✅ **DB_PORT**: `5432`
- ✅ **DB_USER**: `postgres`
- ✅ **DB_PASSWORD**: Password bạn đã tạo
- ✅ **DB_NAME**: `postgres`

## 🆘 Nếu Gặp Vấn Đề

### Lỗi: Schema không tương thích
- Một số syntax MySQL không tương thích với PostgreSQL
- Cần convert thủ công một số phần

### Lỗi: Connection failed
- Kiểm tra password đúng chưa
- Kiểm tra connection string đúng chưa
- Kiểm tra firewall/network

---

**Lưu ý**: Vì cần convert schema và cập nhật code, quá trình này sẽ mất thời gian hơn Railway. Nhưng **hoàn toàn miễn phí**!

---

**Bạn có muốn tôi tạo file schema PostgreSQL và cập nhật code backend không?**

