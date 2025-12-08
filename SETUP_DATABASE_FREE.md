# 🆓 Setup Database Miễn Phí - Các Lựa Chọn

PlanetScale đã bỏ free tier. Đây là các lựa chọn miễn phí thực sự:

## 🎯 Option 1: Railway MySQL (Khuyến Nghị - Dễ Nhất)

### ✅ Ưu điểm:
- **$5 credit/tháng miễn phí** (đủ cho development)
- MySQL native - không cần migrate
- Dễ setup
- Tự động backup

### 📋 Cách Setup:

1. **Đăng ký**: https://railway.app
   - Click "Start a New Project"
   - Đăng nhập bằng GitHub

2. **Tạo MySQL Database**:
   - Click "New Project"
   - Click "Provision MySQL" hoặc "Add Service" → "Database" → "MySQL"
   - Railway tự động tạo MySQL

3. **Lấy Connection Info**:
   - Click vào MySQL service
   - Tab "Variables" → Bạn sẽ thấy:
     - `MYSQLHOST` → **DB_HOST**
     - `MYSQLPORT` → **DB_PORT** (thường 3306)
     - `MYSQLUSER` → **DB_USER**
     - `MYSQLPASSWORD` → **DB_PASSWORD**
     - `MYSQLDATABASE` → **DB_NAME**

4. **Import Schema**:
   - Tab "Data" → "Query"
   - Copy nội dung `database/mysql_schema.sql`
   - Paste và execute

---

## 🎯 Option 2: Supabase PostgreSQL (Free Tier)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí** (500MB database, 2GB bandwidth)
- PostgreSQL (cần convert schema từ MySQL)
- Có dashboard đẹp
- Auto backup

### ⚠️ Nhược điểm:
- Cần convert schema từ MySQL sang PostgreSQL

### 📋 Cách Setup:

1. **Đăng ký**: https://supabase.com
   - Click "Start your project"
   - Đăng nhập bằng GitHub

2. **Tạo Project**:
   - Click "New Project"
   - Name: `constructOS`
   - Database Password: Tạo password mạnh
   - Region: Chọn gần bạn (Southeast Asia)

3. **Lấy Connection Info**:
   - Vào Project Settings → Database
   - Bạn sẽ thấy:
     - **DB_HOST**: `db.xxxxx.supabase.co`
     - **DB_PORT**: `5432`
     - **DB_USER**: `postgres`
     - **DB_PASSWORD**: Password bạn đã tạo
     - **DB_NAME**: `postgres`

4. **Convert & Import Schema**:
   - Cần convert `database/mysql_schema.sql` sang PostgreSQL
   - Hoặc dùng Supabase SQL Editor để tạo tables thủ công

---

## 🎯 Option 3: Neon PostgreSQL (Free Tier)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí** (3GB storage)
- PostgreSQL serverless
- Auto-scaling

### ⚠️ Nhược điểm:
- Cần convert schema từ MySQL sang PostgreSQL

### 📋 Cách Setup:

1. **Đăng ký**: https://neon.tech
   - Click "Sign Up"
   - Đăng nhập bằng GitHub

2. **Tạo Project**:
   - Click "Create Project"
   - Name: `constructOS`
   - Region: Chọn gần bạn

3. **Lấy Connection String**:
   - Vào Project → Connection Details
   - Copy connection string hoặc lấy:
     - **DB_HOST**: `ep-xxxxx.us-east-2.aws.neon.tech`
     - **DB_PORT**: `5432`
     - **DB_USER**: `neondb_owner`
     - **DB_PASSWORD**: Từ connection string
     - **DB_NAME**: `neondb`

---

## 🎯 Option 4: Aiven MySQL (Free Trial)

### ✅ Ưu điểm:
- **Free trial** (có thể extend)
- MySQL native
- Managed service

### 📋 Cách Setup:

1. **Đăng ký**: https://aiven.io
   - Click "Start Free Trial"
   - Đăng nhập

2. **Tạo MySQL Service**:
   - Click "Create Service"
   - Chọn "MySQL"
   - Plan: Chọn free tier nếu có

---

## 🎯 Option 5: Dùng MySQL Local + ngrok (Chỉ để Test)

Nếu chỉ muốn test deploy:

1. **Chạy MySQL local**:
   ```bash
   # macOS
   brew install mysql
   brew services start mysql
   
   # Tạo database
   mysql -u root -p
   CREATE DATABASE constructOS;
   ```

2. **Expose qua ngrok**:
   ```bash
   # Cài ngrok
   brew install ngrok
   
   # Expose MySQL
   ngrok tcp 3306
   # Sẽ có URL như: tcp://0.tcp.ngrok.io:12345
   ```

3. **Dùng trong Render**:
   - **DB_HOST**: `0.tcp.ngrok.io` (từ ngrok URL)
   - **DB_PORT**: Port từ ngrok (ví dụ: `12345`)
   - **DB_USER**: `root`
   - **DB_PASSWORD**: Password MySQL local
   - **DB_NAME**: `constructOS`

⚠️ **Lưu ý**: Ngrok free tier có giới hạn, chỉ để test!

---

## 🏆 Khuyến Nghị

### Cho Development:
👉 **Railway MySQL** - Dễ nhất, $5 credit/tháng (đủ dùng)

### Cho Production Nhỏ:
👉 **Supabase PostgreSQL** - Free tier tốt, nhưng cần convert schema

### Chỉ để Test:
👉 **MySQL Local + ngrok** - Nhanh nhất, nhưng không ổn định

---

## 📝 So Sánh Nhanh

| Service | Free Tier | Database | Setup | Khuyến Nghị |
|---------|-----------|----------|-------|-------------|
| **Railway** | $5 credit/tháng | MySQL | ⭐⭐⭐ Dễ | ✅ Cho dev |
| **Supabase** | 500MB | PostgreSQL | ⭐⭐ Trung bình | ✅ Cho production nhỏ |
| **Neon** | 3GB | PostgreSQL | ⭐⭐ Trung bình | ✅ Alternative |
| **Aiven** | Free trial | MySQL | ⭐⭐ Trung bình | ⚠️ Trial only |
| **Local + ngrok** | Free | MySQL | ⭐⭐⭐ Dễ | ⚠️ Chỉ test |

---

## 🚀 Bắt Đầu Ngay

**Khuyến nghị**: Dùng **Railway MySQL** - dễ nhất và không cần convert schema!

👉 Xem hướng dẫn chi tiết: `SETUP_DATABASE_RAILWAY.md`

