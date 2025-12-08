# ⚡ Setup Supabase - 5 Bước Nhanh

Hướng dẫn nhanh để có database **100% FREE**!

## 🎯 5 Bước Đơn Giản

### 1️⃣ Đăng Ký Supabase
👉 https://supabase.com → "Start your project" → Đăng nhập GitHub

### 2️⃣ Tạo Project
- Name: `constructOS`
- Password: Tạo password mạnh (⚠️ **Lưu lại!**)
- Region: **Southeast Asia (Singapore)**
- Click "Create new project"
- Đợi ~2 phút

### 3️⃣ Lấy Connection Info
- Settings → Database → Connection string (URI)
- Copy connection string hoặc lấy:
  - **DB_HOST**: `db.xxxxx.supabase.co`
  - **DB_PORT**: `5432`
  - **DB_USER**: `postgres`
  - **DB_PASSWORD**: Password bạn đã tạo
  - **DB_NAME**: `postgres`

### 4️⃣ Import Schema
- SQL Editor → New query
- Copy nội dung file `database/schema.sql`
- Paste và click "Run"

### 5️⃣ Cập Nhật Backend
```bash
cd server
npm install pg @types/pg
mv src/config/db.ts src/config/db.mysql.ts
mv src/config/db.postgres.ts src/config/db.ts
```

## ✅ Quay Lại Render

Thêm environment variables:
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password (Mark as Secret!)
DB_NAME=postgres
DB_SSL=true
```

## 🎉 Xong!

**Xem hướng dẫn chi tiết**: `HUONG_DAN_SUPABASE_FREE.md`

