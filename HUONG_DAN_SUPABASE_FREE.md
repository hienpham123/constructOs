# 🆓 Hướng Dẫn Setup Supabase - Hoàn Toàn Miễn Phí

Hướng dẫn chi tiết để setup database **100% FREE** trên Supabase và cập nhật code backend.

## ✅ Đã Có Sẵn

- ✅ File schema PostgreSQL: `database/schema.sql`
- ✅ File config PostgreSQL: `server/src/config/db.postgres.ts`

## 📋 Bước 1: Đăng Ký & Tạo Project Supabase

1. Truy cập: https://supabase.com
2. Click **"Start your project"**
3. Đăng nhập bằng **GitHub** (khuyến nghị)
4. Click **"New Project"**
5. Điền thông tin:
   - **Name**: `constructOS`
   - **Database Password**: Tạo password mạnh (⚠️ **Lưu lại!**)
   - **Region**: **"Southeast Asia (Singapore)"** (gần Việt Nam nhất)
6. Click **"Create new project"**
7. Đợi project được tạo (~2 phút)

## 📋 Bước 2: Lấy Connection Info

1. Vào project vừa tạo
2. Click **"Settings"** (icon bánh răng) ở sidebar trái
3. Click **"Database"** trong Settings
4. Scroll xuống phần **"Connection string"**
5. Chọn tab **"URI"**

Bạn sẽ thấy connection string dạng:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Lấy thông tin từ connection string**:
- **DB_HOST**: `db.xxxxx.supabase.co` (thay xxxxx bằng ID project của bạn)
- **DB_PORT**: `5432`
- **DB_USER**: `postgres`
- **DB_PASSWORD**: Password bạn đã tạo ở bước 1
- **DB_NAME**: `postgres`

**Hoặc lấy từ "Connection pooling"** (khuyến nghị cho production):
- Copy connection string từ tab "Connection pooling"
- Format tương tự nhưng có thêm `?pgbouncer=true`

## 📋 Bước 3: Import Schema

1. Trong Supabase dashboard, click **"SQL Editor"** ở sidebar trái
2. Click **"New query"**
3. Mở file `database/schema.sql` trong project của bạn
4. Copy **toàn bộ** nội dung file
5. Paste vào Supabase SQL Editor
6. Click **"Run"** hoặc nhấn `Ctrl+Enter` (hoặc `Cmd+Enter` trên Mac)
7. Đợi schema được tạo (~10-30 giây)

**Kiểm tra**:
- Click **"Table Editor"** ở sidebar
- Bạn sẽ thấy các tables: `users`, `projects`, `materials`, etc.

## 📋 Bước 4: Cập Nhật Backend Code

### 4.1. Cài PostgreSQL Client

```bash
cd server
npm install pg @types/pg
```

### 4.2. Thay Đổi Database Config

**Option A: Thay thế file hiện tại** (Khuyến nghị)

1. Backup file cũ:
   ```bash
   mv src/config/db.ts src/config/db.mysql.ts
   ```

2. Đổi tên file PostgreSQL:
   ```bash
   mv src/config/db.postgres.ts src/config/db.ts
   ```

3. Cập nhật import trong các file khác (nếu cần):
   - File `db.ts` đã có cùng interface, nên không cần thay đổi imports

**Option B: Giữ cả 2 và chọn theo environment**

Giữ nguyên và thêm logic chọn database type trong `db.ts` (phức tạp hơn)

### 4.3. Cập Nhật package.json (Optional)

Có thể xóa MySQL dependencies nếu không dùng nữa:
```bash
npm uninstall mysql2 @types/mysql2
```

## 📋 Bước 5: Cập Nhật Environment Variables

Trong Render dashboard, cập nhật các biến:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
DB_CONNECTION_LIMIT=10
DB_SSL=true
```

⚠️ **Lưu ý**:
- `DB_PORT` = `5432` (PostgreSQL port, không phải 3306)
- `DB_SSL=true` (Supabase yêu cầu SSL)
- `DB_PASSWORD` - **Mark as Secret!**

## 📋 Bước 6: Test Connection

1. Deploy lại backend trên Render
2. Kiểm tra logs trong Render dashboard
3. Bạn sẽ thấy: `✅ Connected to PostgreSQL database: postgres`

## ✅ Hoàn Thành!

Bây giờ bạn có:
- ✅ Database **hoàn toàn miễn phí** trên Supabase
- ✅ Backend đã được cập nhật để dùng PostgreSQL
- ✅ Không mất chi phí nào!

## 🆘 Troubleshooting

### Lỗi: SSL required
- Đảm bảo `DB_SSL=true` trong environment variables
- Hoặc set `ssl: { rejectUnauthorized: false }` trong code

### Lỗi: Schema không tương thích
- Kiểm tra file `database/schema.sql` có đúng format PostgreSQL không
- Một số syntax có thể cần điều chỉnh

### Lỗi: Connection timeout
- Kiểm tra `DB_HOST` đúng chưa
- Kiểm tra firewall/network
- Thử dùng "Connection pooling" URL thay vì "URI"

---

**Sau khi setup xong, quay lại Render và deploy backend! 🚀**

