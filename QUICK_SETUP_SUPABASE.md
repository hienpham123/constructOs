# ⚡ Setup Supabase - Hoàn Toàn Miễn Phí - 10 Phút

Hướng dẫn nhanh để setup database hoàn toàn miễn phí trên Supabase.

## 🎯 Tại Sao Supabase?

- ✅ **100% FREE** - 500MB database, 2GB bandwidth/tháng
- ✅ **Không giới hạn thời gian** - Free tier vĩnh viễn
- ✅ **Không cần credit card**
- ✅ **PostgreSQL** - Database mạnh mẽ

## ⚠️ Lưu Ý

Code hiện tại dùng MySQL, Supabase dùng PostgreSQL. Cần convert schema và cập nhật code.

## 📋 5 Bước Đơn Giản

### 1️⃣ Đăng Ký Supabase
👉 https://supabase.com → "Start your project" → Đăng nhập GitHub

### 2️⃣ Tạo Project
- Name: `constructOS`
- Password: Tạo password mạnh (lưu lại!)
- Region: **Southeast Asia (Singapore)**
- Click "Create new project"
- Đợi ~2 phút

### 3️⃣ Lấy Connection Info
- Settings → Database → Connection string
- Copy connection string hoặc lấy:
  - **DB_HOST**: `db.xxxxx.supabase.co`
  - **DB_PORT**: `5432`
  - **DB_USER**: `postgres`
  - **DB_PASSWORD**: Password bạn đã tạo
  - **DB_NAME**: `postgres`

### 4️⃣ Convert & Import Schema
- SQL Editor → New query
- Tôi sẽ tạo file `database/postgres_schema.sql` cho bạn
- Copy và paste vào Supabase SQL Editor
- Click "Run"

### 5️⃣ Cập Nhật Backend Code
- Cài PostgreSQL client: `npm install pg @types/pg`
- Cập nhật `server/src/config/db.ts` để dùng PostgreSQL
- (Tôi sẽ tạo file mới cho bạn)

## ✅ Xong!

Bây giờ bạn có database **hoàn toàn miễn phí**!

**Bước tiếp theo**: Quay lại Render và thêm environment variables với thông tin Supabase.

---

**Bạn có muốn tôi tạo file schema PostgreSQL và cập nhật code backend ngay bây giờ không?**

