# ⚡ Setup Database trên Railway - 5 Phút

Hướng dẫn nhanh để tạo MySQL database miễn phí trên Railway.

## 🎯 Tại Sao Railway?

- ✅ **$5 credit/tháng miễn phí** (đủ cho development)
- ✅ **MySQL native** - Không cần convert schema
- ✅ **Dễ setup** - Chỉ 5 phút
- ✅ **Auto backup**

## 📋 Bước 1: Đăng Ký Railway

1. Truy cập: https://railway.app
2. Click **"Start a New Project"**
3. Đăng nhập bằng **GitHub** (khuyến nghị)

## 📋 Bước 2: Tạo MySQL Database

1. Sau khi đăng nhập, bạn sẽ thấy Dashboard
2. Click **"New Project"**
3. Click **"Provision MySQL"** hoặc:
   - Click **"New"** → **"Database"** → **"MySQL"**
4. Railway sẽ tự động tạo MySQL database (mất ~1 phút)

## 📋 Bước 3: Lấy Connection Info

1. Click vào **MySQL service** vừa tạo
2. Click tab **"Variables"** (hoặc **"Connect"**)
3. Bạn sẽ thấy các biến môi trường:

| Railway Variable | Dùng cho Render |
|-----------------|-----------------|
| `MYSQLHOST` | **DB_HOST** |
| `MYSQLPORT` | **DB_PORT** |
| `MYSQLUSER` | **DB_USER** |
| `MYSQLPASSWORD` | **DB_PASSWORD** |
| `MYSQLDATABASE` | **DB_NAME** |

**Ví dụ**:
```
MYSQLHOST = containers-us-west-123.railway.app
MYSQLPORT = 3306
MYSQLUSER = root
MYSQLPASSWORD = xxxxxx
MYSQLDATABASE = railway
```

## 📋 Bước 4: Import Schema

### Cách 1: Dùng Railway SQL Editor (Dễ nhất)

1. Click vào MySQL service
2. Click tab **"Data"** hoặc **"MySQL"**
3. Click **"Query"** hoặc **"SQL Editor"**
4. Mở file `database/mysql_schema.sql` trong editor của bạn
5. Copy toàn bộ nội dung
6. Paste vào Railway SQL Editor
7. Click **"Run"** hoặc **"Execute"**

### Cách 2: Dùng MySQL Client (Nếu có)

```bash
# Lấy connection info từ Railway Variables
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/mysql_schema.sql
```

## ✅ Hoàn Thành!

Bây giờ bạn đã có:

- ✅ **DB_HOST**: Giá trị từ `MYSQLHOST` (ví dụ: `containers-us-west-123.railway.app`)
- ✅ **DB_PORT**: Giá trị từ `MYSQLPORT` (thường `3306`)
- ✅ **DB_USER**: Giá trị từ `MYSQLUSER` (thường `root`)
- ✅ **DB_PASSWORD**: Giá trị từ `MYSQLPASSWORD`
- ✅ **DB_NAME**: Giá trị từ `MYSQLDATABASE` (thường `railway`)

## 🚀 Quay Lại Render

Bây giờ quay lại Render dashboard và thêm các environment variables:

1. **DB_HOST**: Copy từ `MYSQLHOST` trong Railway
2. **DB_PORT**: Copy từ `MYSQLPORT` (thường `3306`)
3. **DB_USER**: Copy từ `MYSQLUSER`
4. **DB_PASSWORD**: Copy từ `MYSQLPASSWORD` ⚠️ **Mark as Secret!**
5. **DB_NAME**: Copy từ `MYSQLDATABASE`
6. **DB_CONNECTION_LIMIT**: `10`

## 💰 Chi Phí

- **Free tier**: $5 credit/tháng
- **MySQL**: ~$5-10/tháng (tùy usage)
- **Kết luận**: Đủ cho development, có thể hết credit nếu dùng nhiều

## 🆘 Troubleshooting

### Không thấy Variables?
- Đợi database tạo xong (1-2 phút)
- Refresh page
- Click vào MySQL service → Tab "Variables"

### Import schema bị lỗi?
- Kiểm tra file `mysql_schema.sql` có đúng format không
- Thử import từng phần nhỏ
- Kiểm tra logs trong Railway

---

**Sau khi setup xong, quay lại Render và deploy backend! 🚀**

