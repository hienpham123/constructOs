# Bắt Đầu Với MySQL - Checklist

Checklist nhanh để bắt đầu sử dụng MySQL với ConstructOS.

## ✅ Checklist Setup MySQL

### Bước 1: Cài Đặt MySQL
- [ ] Cài đặt MySQL trên máy của bạn
  - macOS: `brew install mysql && brew services start mysql`
  - Linux: `sudo apt install mysql-server && sudo systemctl start mysql`
  - Windows: Download từ https://dev.mysql.com/downloads/installer/

### Bước 2: Tạo Database và User
- [ ] Đăng nhập MySQL: `mysql -u root -p`
- [ ] Tạo database:
  ```sql
  CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [ ] Tạo user và cấp quyền:
  ```sql
  CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_password';
  GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';
  FLUSH PRIVILEGES;
  EXIT;
  ```

### Bước 3: Chạy Schema
- [ ] Chạy schema SQL:
  ```bash
  cd /Users/hochihien/Code/constructOS
  mysql -u constructos_user -p constructos < database/mysql_schema.sql
  ```
- [ ] Kiểm tra tables đã tạo:
  ```bash
  mysql -u constructos_user -p constructos -e "SHOW TABLES;"
  ```
  → Nên thấy 16 tables

### Bước 4: Cài Đặt Dependencies
- [ ] Cài đặt mysql2:
  ```bash
  cd server
  npm install mysql2
  npm install --save-dev @types/mysql2
  ```

### Bước 5: Cấu Hình Environment
- [ ] Tạo file `.env` trong thư mục `server/`:
  ```bash
  cp env.example.txt .env
  ```
- [ ] Sửa file `.env` và cập nhật:
  - `DB_USER=constructos_user`
  - `DB_PASSWORD=your_password` (password bạn đã đặt ở bước 2)
  - `DB_NAME=constructos`

### Bước 6: Test Connection
- [ ] Khởi động server:
  ```bash
  cd server
  npm run dev
  ```
- [ ] Kiểm tra console → Nên thấy:
  ```
  ✅ Connected to MySQL database: constructos
  Server is running on http://localhost:2222
  ```

## 📚 Tài Liệu Chi Tiết

- **Hướng dẫn đầy đủ:** `HUONG_DAN_MYSQL.md`
- **Quick Start (5 phút):** `MYSQL_QUICK_START.md`
- **Setup chi tiết:** `MYSQL_SETUP.md`
- **Database schema:** `../database/mysql_schema.sql`

## ⚠️ Lưu Ý

1. **Password:** Nhớ password bạn đặt cho MySQL user
2. **.env file:** KHÔNG commit file `.env` vào Git
3. **MySQL Service:** Đảm bảo MySQL đang chạy trước khi start server

## 🔧 Nếu Gặp Lỗi

Xem phần **Troubleshooting** trong `HUONG_DAN_MYSQL.md`

## ✨ Sau Khi Setup Xong

1. Database connection đã sẵn sàng trong `src/config/db.ts`
2. Server sẽ tự động test connection khi start
3. Các controllers hiện tại vẫn dùng in-memory, sẽ cần cập nhật sau để query từ MySQL

---

**Chúc bạn thành công! 🚀**

