# Hướng dẫn Setup MySQL cho ConstructOS Server

Hướng dẫn chi tiết để setup và kết nối MySQL database với ConstructOS server.

## Bước 1: Cài đặt MySQL

### macOS (với Homebrew)
```bash
brew install mysql
brew services start mysql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Windows
Download MySQL Installer từ: https://dev.mysql.com/downloads/installer/

### Kiểm tra MySQL đã cài đặt
```bash
mysql --version
```

## Bước 2: Tạo Database và User

### Đăng nhập MySQL
```bash
mysql -u root -p
```

### Tạo Database
```sql
CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Tạo User và Cấp quyền (Khuyến nghị)
```sql
-- Tạo user mới
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON constructos.* TO 'constructos_user'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;

-- Thoát
EXIT;
```

## Bước 3: Chạy Schema SQL

### Từ command line:
```bash
cd /Users/hochihien/Code/constructOS
mysql -u constructos_user -p constructos < database/mysql_schema.sql
```

Hoặc từ MySQL CLI:
```sql
USE constructos;
SOURCE /Users/hochihien/Code/constructOS/database/mysql_schema.sql;
```

### Kiểm tra tables đã tạo
```bash
mysql -u constructos_user -p constructos -e "SHOW TABLES;"
```

Kết quả sẽ hiển thị các tables:
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

## Bước 4: Cài đặt Dependencies cho Server

```bash
cd server
npm install mysql2
npm install --save-dev @types/mysql2
```

## Bước 5: Cấu hình Environment Variables

Tạo hoặc cập nhật file `.env` trong thư mục `server/`:

```env
# Server
PORT=2222
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=constructos_user
DB_PASSWORD=your_secure_password
DB_NAME=constructos
DB_CONNECTION_LIMIT=10
```

## Bước 6: Tạo Database Connection Module

File này đã được tạo trong `server/src/config/db.ts`. 

## Bước 7: Test Connection

```bash
cd server
npm run dev
```

Kiểm tra console để xem thông báo:
- ✅ "Connected to MySQL database"
- ❌ Nếu có lỗi, kiểm tra lại credentials trong `.env`

## Bước 8: Seed Initial Data (Optional)

```bash
mysql -u constructos_user -p constructos < database/seeds/initial_data.sql
```

**Lưu ý**: Nhớ thay đổi password hash trong file seed trước khi chạy.

## Troubleshooting

### Lỗi: "Access denied for user"
- Kiểm tra username và password trong `.env`
- Đảm bảo user đã được cấp quyền: `GRANT ALL PRIVILEGES ON constructos.* TO 'user'@'localhost';`

### Lỗi: "Can't connect to MySQL server"
- Kiểm tra MySQL service đang chạy: `brew services list` (macOS) hoặc `sudo systemctl status mysql` (Linux)
- Kiểm tra port MySQL: `netstat -an | grep 3306`
- Kiểm tra `DB_HOST` trong `.env` (nên là `localhost` hoặc `127.0.0.1`)

### Lỗi: "Unknown database 'constructos'"
- Đảm bảo đã tạo database: `CREATE DATABASE constructos;`
- Kiểm tra `DB_NAME` trong `.env`

### Lỗi: "Table doesn't exist"
- Chạy lại schema: `mysql -u user -p constructos < database/mysql_schema.sql`
- Kiểm tra tables: `mysql -u user -p constructos -e "SHOW TABLES;"`

## Kiểm tra Database

### Xem tất cả tables
```bash
mysql -u constructos_user -p constructos -e "SHOW TABLES;"
```

### Xem cấu trúc một table
```bash
mysql -u constructos_user -p constructos -e "DESCRIBE users;"
```

### Xem dữ liệu
```bash
mysql -u constructos_user -p constructos -e "SELECT * FROM users;"
```

## Next Steps

Sau khi setup xong, bạn cần:
1. ✅ Cập nhật controllers để query từ database
2. ✅ Test các API endpoints
3. ✅ Migrate dữ liệu từ mock data (nếu cần)

## Migration từ In-Memory sang MySQL

Hiện tại server đang dùng in-memory storage. Để chuyển sang MySQL:

1. Database connection module đã sẵn sàng
2. Cần cập nhật các controllers để query từ MySQL
3. Cần cập nhật dataStore để dùng MySQL thay vì arrays

Xem file `MYSQL_MIGRATION.md` để biết chi tiết.

## Security Notes

⚠️ **QUAN TRỌNG:**
- KHÔNG commit file `.env` vào Git
- Sử dụng password mạnh cho database user
- Trong production, dùng connection pooling
- Backup database thường xuyên
- Sử dụng SSL connection trong production

