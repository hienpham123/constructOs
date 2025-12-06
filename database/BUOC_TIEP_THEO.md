# Bước Tiếp Theo - Setup MySQL

Bạn đã cài đặt MySQL thành công! Bây giờ làm theo các bước sau:

## Bước 1: Tạo Database và User

Mở Terminal và chạy lệnh sau:

```bash
mysql -u root
```

(Nếu MySQL yêu cầu password, nhập password của bạn)

Trong MySQL console, chạy các lệnh sau:

```sql
-- Tạo database
CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'constructos123';

-- Cấp quyền
GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';

-- Áp dụng
FLUSH PRIVILEGES;

-- Kiểm tra
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'constructos_user';

-- Thoát
EXIT;
```

**Lưu ý:** Nhớ password `constructos123` (hoặc đổi thành password khác mà bạn nhớ)

## Bước 2: Chạy Schema SQL

Sau khi tạo database, chạy schema để tạo các tables:

```bash
cd /Users/hochihien/Code/constructOS
mysql -u constructos_user -p constructos < database/mysql_schema.sql
```

Nhập password: `constructos123` (hoặc password bạn đã đặt)

## Bước 3: Kiểm tra Tables Đã Tạo

```bash
mysql -u constructos_user -p constructos -e "SHOW TABLES;"
```

Bạn sẽ thấy 16 tables được tạo.

## Bước 4: Cài Đặt Dependencies

```bash
cd server
npm install mysql2 @types/mysql2
```

## Bước 5: Tạo File .env

```bash
cd server
cp env.example.txt .env
```

Mở file `.env` và sửa:

```env
DB_USER=constructos_user
DB_PASSWORD=constructos123
DB_NAME=constructos
```

## Bước 6: Test Connection

```bash
cd server
npm run dev
```

Nếu thấy `✅ Connected to MySQL database: constructos` → Thành công! 🎉

---

## Hoặc Dùng Script Tự Động

Nếu MySQL root không có password, bạn có thể chạy:

```bash
cd /Users/hochihien/Code/constructOS
mysql -u root < database/setup_mysql.sql
```

Sau đó làm tiếp các bước 2-6 ở trên.

