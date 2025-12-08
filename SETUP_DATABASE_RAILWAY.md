# 🗄️ Setup Database trên Railway (Miễn Phí)

Hướng dẫn tạo MySQL database trên Railway (alternative cho PlanetScale).

## 🎯 Tại Sao Railway?

- ✅ **Miễn phí** - $5 credit/tháng (đủ cho development)
- ✅ **MySQL** - Tương thích với code hiện tại
- ✅ **Dễ setup** - Chỉ cần vài phút

## 📋 Bước 1: Đăng Ký Railway

1. Truy cập: https://railway.app
2. Click **"Start a New Project"**
3. Đăng nhập bằng GitHub (khuyến nghị)

## 📋 Bước 2: Tạo MySQL Database

1. Trong Railway dashboard, click **"New Project"**
2. Click **"Provision MySQL"** hoặc **"Add Service"** → **"Database"** → **"MySQL"**
3. Railway sẽ tự động tạo MySQL database

## 📋 Bước 3: Lấy Connection Info

1. Click vào MySQL service vừa tạo
2. Click tab **"Variables"** hoặc **"Connect"**
3. Bạn sẽ thấy các biến:
   - `MYSQLHOST` → Đây là **DB_HOST**
   - `MYSQLPORT` → Đây là **DB_PORT** (thường 3306)
   - `MYSQLUSER` → Đây là **DB_USER**
   - `MYSQLPASSWORD` → Đây là **DB_PASSWORD**
   - `MYSQLDATABASE` → Đây là **DB_NAME**

## 📋 Bước 4: Import Schema

1. Click tab **"Data"** hoặc **"MySQL"**
2. Click **"Query"** hoặc **"SQL Editor"**
3. Copy nội dung file `database/mysql_schema.sql`
4. Paste và execute

**Hoặc dùng MySQL client**:
```bash
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/mysql_schema.sql
```

## ✅ Sau Khi Setup Xong

Bạn sẽ có các giá trị từ Railway Variables:
- **DB_HOST**: Giá trị từ `MYSQLHOST`
- **DB_PORT**: Giá trị từ `MYSQLPORT` (thường 3306)
- **DB_USER**: Giá trị từ `MYSQLUSER`
- **DB_PASSWORD**: Giá trị từ `MYSQLPASSWORD`
- **DB_NAME**: Giá trị từ `MYSQLDATABASE`

---

**Sau khi setup xong, quay lại Render và thêm các environment variables!**

