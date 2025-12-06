# Hướng Dẫn Sử Dụng MySQL cho ConstructOS

Hướng dẫn đầy đủ từng bước để setup MySQL database cho ConstructOS server.

## 📋 Mục Lục

1. [Cài Đặt MySQL](#1-cài-đặt-mysql)
2. [Tạo Database](#2-tạo-database)
3. [Chạy Schema SQL](#3-chạy-schema-sql)
4. [Cài Đặt Dependencies](#4-cài-đặt-dependencies)
5. [Cấu Hình Environment](#5-cấu-hình-environment)
6. [Kiểm Tra Kết Nối](#6-kiểm-tra-kết-nối)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Cài Đặt MySQL

### macOS (với Homebrew)

```bash
# Cài đặt MySQL
brew install mysql

# Khởi động MySQL service
brew services start mysql

# Kiểm tra MySQL đang chạy
brew services list | grep mysql
```

### Ubuntu/Debian

```bash
# Cài đặt MySQL
sudo apt update
sudo apt install mysql-server

# Khởi động MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Kiểm tra trạng thái
sudo systemctl status mysql
```

### Windows

1. Tải MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ root password bạn đặt

### Kiểm Tra Cài Đặt

```bash
mysql --version
```

Kết quả nên hiển thị: `mysql Ver 8.x.x`

---

## 2. Tạo Database

### Bước 2.1: Đăng Nhập MySQL

```bash
mysql -u root -p
```

Nhập password root của bạn.

### Bước 2.2: Tạo Database

Trong MySQL console, chạy các lệnh sau:

```sql
-- Tạo database với encoding UTF-8
CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra database đã tạo
SHOW DATABASES;
```

Bạn sẽ thấy `constructos` trong danh sách.

### Bước 2.3: Tạo User (Khuyến Nghị)

Thay vì dùng root, tạo user riêng cho ứng dụng:

```sql
-- Tạo user mới
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;

-- Kiểm tra user
SELECT user, host FROM mysql.user WHERE user = 'constructos_user';

-- Thoát MySQL
EXIT;
```

**Lưu ý:** Thay `your_secure_password` bằng password mạnh của bạn và ghi nhớ lại!

---

## 3. Chạy Schema SQL

### Cách 1: Từ Command Line (Khuyến Nghị)

```bash
cd /Users/hochihien/Code/constructOS
mysql -u constructos_user -p constructos < database/mysql_schema.sql
```

Sẽ yêu cầu nhập password → nhập password bạn đã tạo ở bước 2.3.

### Cách 2: Từ MySQL Console

```bash
mysql -u constructos_user -p
```

Trong MySQL console:

```sql
USE constructos;
SOURCE /Users/hochihien/Code/constructOS/database/mysql_schema.sql;
```

### Kiểm Tra Tables Đã Tạo

```bash
mysql -u constructos_user -p constructos -e "SHOW TABLES;"
```

Kết quả sẽ hiển thị 16 tables:
- users
- projects
- project_stages
- stage_checklists
- project_documents
- materials
- material_transactions
- purchase_requests
- personnel
- attendance
- equipment
- equipment_usage
- maintenance_schedules
- contracts
- contract_documents
- site_logs

---

## 4. Cài Đặt Dependencies

### Bước 4.1: Cài MySQL2 Package

```bash
cd server
npm install mysql2
npm install --save-dev @types/mysql2
```

### Bước 4.2: Kiểm Tra package.json

File `package.json` đã được cập nhật tự động với:
- `mysql2`: MySQL client cho Node.js
- `@types/mysql2`: TypeScript types

---

## 5. Cấu Hình Environment

### Bước 5.1: Tạo File .env

Trong thư mục `server/`, tạo file `.env`:

```bash
cd server
touch .env
```

Hoặc copy từ file mẫu:

```bash
cp env.example.txt .env
```

### Bước 5.2: Cập Nhật .env

Mở file `.env` và điền thông tin:

```env
# Server Configuration
PORT=2222
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=constructos_user
DB_PASSWORD=your_secure_password_here
DB_NAME=constructos
DB_CONNECTION_LIMIT=10
```

**Quan trọng:**
- Thay `DB_USER` bằng username bạn đã tạo (ví dụ: `constructos_user`)
- Thay `DB_PASSWORD` bằng password bạn đã đặt
- `DB_NAME` phải là `constructos` (tên database)

### Bước 5.3: Bảo Mật .env

⚠️ **KHÔNG BAO GIỜ commit file `.env` vào Git!**

Đảm bảo file `.gitignore` có:
```
.env
```

---

## 6. Kiểm Tra Kết Nối

### Bước 6.1: Khởi Động Server

```bash
cd server
npm run dev
```

### Bước 6.2: Xem Console Output

Nếu thành công, bạn sẽ thấy:
```
✅ Connected to MySQL database: constructos
Server is running on http://localhost:2222
```

Nếu có lỗi, xem phần [Troubleshooting](#7-troubleshooting) bên dưới.

### Bước 6.3: Test Health Check

Mở browser hoặc dùng curl:

```bash
curl http://localhost:2222/api/health
```

Kết quả:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 7. Troubleshooting

### Lỗi: "Access denied for user"

**Nguyên nhân:** Username hoặc password sai.

**Giải pháp:**
1. Kiểm tra lại `DB_USER` và `DB_PASSWORD` trong `.env`
2. Test đăng nhập thủ công:
   ```bash
   mysql -u constructos_user -p
   ```
3. Nếu không đăng nhập được, tạo lại user:
   ```sql
   CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'new_password';
   GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Lỗi: "Can't connect to MySQL server"

**Nguyên nhân:** MySQL service không chạy.

**Giải pháp:**

**macOS:**
```bash
brew services start mysql
brew services list | grep mysql
```

**Linux:**
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

**Windows:**
- Mở Services (services.msc)
- Tìm "MySQL" và Start service

### Lỗi: "Unknown database 'constructos'"

**Nguyên nhân:** Database chưa được tạo.

**Giải pháp:**
```sql
CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Lỗi: "Table doesn't exist"

**Nguyên nhân:** Schema chưa được chạy.

**Giải pháp:**
```bash
mysql -u constructos_user -p constructos < database/mysql_schema.sql
```

### Lỗi: "ER_NOT_SUPPORTED_AUTH_MODE"

**Nguyên nhân:** MySQL 8.0+ dùng authentication plugin mới.

**Giải pháp:**
```sql
ALTER USER 'constructos_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Lỗi về Module 'mysql2'

**Nguyên nhân:** Chưa cài đặt dependencies.

**Giải pháp:**
```bash
cd server
npm install mysql2 @types/mysql2
```

---

## 8. Kiểm Tra Database

### Xem Tất Cả Tables

```bash
mysql -u constructos_user -p constructos -e "SHOW TABLES;"
```

### Xem Cấu Trúc Table

```bash
mysql -u constructos_user -p constructos -e "DESCRIBE users;"
```

### Xem Dữ Liệu

```bash
mysql -u constructos_user -p constructos -e "SELECT * FROM users;"
```

### Đếm Số Records

```bash
mysql -u constructos_user -p constructos -e "SELECT COUNT(*) as total_users FROM users;"
```

---

## 9. Next Steps

Sau khi setup xong MySQL:

1. ✅ Database connection đã sẵn sàng trong `server/src/config/db.ts`
2. ⏳ Cần cập nhật controllers để query từ MySQL (hiện tại đang dùng in-memory)
3. ⏳ Test các API endpoints với database thật
4. ⏳ Seed initial data (admin user, etc.)

---

## 10. Tài Liệu Tham Khảo

- **MySQL Schema:** `database/mysql_schema.sql`
- **Field Types:** `database/FIELD_TYPES_REFERENCE.md`
- **Quick Start:** `MYSQL_QUICK_START.md`
- **MySQL Docs:** https://dev.mysql.com/doc/

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra lại từng bước
2. Xem console logs để biết lỗi cụ thể
3. Kiểm tra MySQL service đang chạy
4. Xem file `MYSQL_SETUP.md` để biết chi tiết hơn

---

**Chúc bạn setup thành công! 🚀**

