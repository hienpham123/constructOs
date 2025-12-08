# 🗄️ Setup Database trên PlanetScale (Miễn Phí)

Hướng dẫn nhanh để tạo MySQL database miễn phí trên PlanetScale.

## 🎯 Tại Sao PlanetScale?

- ✅ **Miễn phí** - Free tier đủ cho development
- ✅ **MySQL** - Tương thích với code hiện tại
- ✅ **Dễ setup** - Chỉ cần 5 phút
- ✅ **Không cần quản lý server**

## 📋 Bước 1: Đăng Ký PlanetScale

1. Truy cập: https://planetscale.com
2. Click **"Start for free"**
3. Đăng ký bằng GitHub (khuyến nghị) hoặc email
4. Xác thực email nếu cần

## 📋 Bước 2: Tạo Database

1. Sau khi đăng nhập, bạn sẽ thấy Dashboard
2. Click nút **"Create database"** hoặc **"New database"**
3. Điền thông tin:
   - **Name**: `constructOS` (hoặc tên bạn muốn)
   - **Region**: Chọn region gần bạn (ví dụ: `ap-southeast-1` cho Singapore)
   - **Plan**: Chọn **"Hobby"** (Free tier)
4. Click **"Create database"**

## 📋 Bước 3: Lấy Connection String

1. Sau khi database được tạo, click vào database
2. Click tab **"Connect"** hoặc **"Connection strings"**
3. Chọn **"Connect with"** → **"Node.js"** hoặc **"General"**
4. Bạn sẽ thấy connection string dạng:
   ```
   mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict
   ```

## 📋 Bước 4: Lấy Thông Tin Kết Nối

Từ connection string, bạn sẽ có:

**Ví dụ connection string**:
```
mysql://abc123xyz:pscale_pw_xxxxx@aws.connect.psdb.cloud/constructos?sslaccept=strict
```

**Phân tích**:
- **DB_HOST**: `aws.connect.psdb.cloud` (hoặc host khác)
- **DB_USER**: `abc123xyz` (username)
- **DB_PASSWORD**: `pscale_pw_xxxxx` (password)
- **DB_NAME**: `constructOS` (tên database)
- **DB_PORT**: `3306` (mặc định)

## 📋 Bước 5: Import Schema

1. Trong PlanetScale dashboard, click vào database
2. Click tab **"Console"** hoặc **"SQL Editor"**
3. Copy nội dung file `database/mysql_schema.sql`
4. Paste vào SQL editor
5. Click **"Run"** để execute

**Hoặc dùng PlanetScale CLI**:
```bash
# Cài PlanetScale CLI
brew install planetscale/tap/pscale

# Login
pscale auth login

# Connect và import
pscale connect constructOS --execute "source database/mysql_schema.sql"
```

## ✅ Sau Khi Setup Xong

Bạn sẽ có:
- **DB_HOST**: `aws.connect.psdb.cloud` (hoặc host từ PlanetScale)
- **DB_USER**: Username từ PlanetScale
- **DB_PASSWORD**: Password từ PlanetScale
- **DB_NAME**: `constructOS`
- **DB_PORT**: `3306`

## 🔐 Lưu Ý Bảo Mật

- ⚠️ **KHÔNG** commit password vào git
- ⚠️ **KHÔNG** share connection string công khai
- ✅ Chỉ dùng trong Environment Variables (mark as Secret)

---

## 🆘 Nếu Gặp Vấn Đề

### Lỗi: Cannot connect
- Kiểm tra connection string đúng chưa
- Kiểm tra database đã được tạo chưa
- Kiểm tra region có đúng không

### Lỗi: SSL required
- PlanetScale yêu cầu SSL
- Đảm bảo connection string có `?sslaccept=strict`

---

**Sau khi setup xong, quay lại Render và thêm các environment variables!**

