# MySQL Quick Start Guide

Hướng dẫn nhanh để setup MySQL cho ConstructOS trong 5 phút.

## 🚀 Quick Setup (5 bước)

### Bước 1: Cài đặt MySQL (nếu chưa có)

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

### Bước 2: Tạo Database

```bash
mysql -u root -p
```

Trong MySQL console:
```sql
CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Bước 3: Chạy Schema

```bash
cd /Users/hochihien/Code/constructOS
mysql -u constructos_user -p constructos < database/mysql_schema.sql
```

### Bước 4: Cài đặt Dependencies

```bash
cd server
npm install mysql2
npm install --save-dev @types/mysql2
```

### Bước 5: Cấu hình .env

Copy file `.env.example` thành `.env` và cập nhật:

```bash
cp .env.example .env
```

Sửa file `.env`:
```env
DB_USER=constructos_user
DB_PASSWORD=your_password
DB_NAME=constructos
```

## ✅ Kiểm tra

```bash
cd server
npm run dev
```

Nếu thấy "✅ Connected to MySQL database: constructos" → Thành công!

## 🔧 Troubleshooting

### MySQL không chạy?
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Quên password MySQL root?
Xem: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html

### Lỗi "Access denied"?
Kiểm tra lại username/password trong `.env`

## 📚 Xem thêm

- Chi tiết: `MYSQL_SETUP.md`
- Database schema: `database/mysql_schema.sql`
- Field types: `database/FIELD_TYPES_REFERENCE.md`

