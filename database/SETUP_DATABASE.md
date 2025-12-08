# 📦 Hướng Dẫn Setup Database Cho Máy Mới

Khi clone code về máy mới, bạn cần setup database để có thể chạy ứng dụng. Có 2 cách:

## 🚀 Cách 1: Import Database Từ File Export (Khuyến nghị)

### Bước 1: Export Database Từ Máy Hiện Tại

Trên máy đang có database, chạy script export:

```bash
cd database/scripts
chmod +x export_database.sh
./export_database.sh
```

Script sẽ tự động:
- Đọc cấu hình database từ `server/.env`
- Export 3 file:
  - **Full export**: Schema + Data (để backup hoàn chỉnh)
  - **Schema only**: Chỉ cấu trúc bảng (để setup máy mới)
  - **Data only**: Chỉ dữ liệu (để import vào schema có sẵn)

Files sẽ được lưu trong `database/exports/` với tên:
- `constructOS_export_YYYYMMDD_HHMMSS.sql` (full)
- `constructOS_schema_YYYYMMDD_HHMMSS.sql` (schema only)
- `constructOS_data_YYYYMMDD_HHMMSS.sql` (data only)

### Bước 2: Chia Sẻ File Export

Có 3 cách chia sẻ:

#### Option A: Commit vào Git (nếu file nhỏ < 10MB)
```bash
git add database/exports/constructOS_schema_*.sql
git commit -m "chore: Add database schema export"
git push
```

#### Option B: Upload lên Cloud Storage
- Upload file `constructOS_schema_*.sql` lên Google Drive / Dropbox / OneDrive
- Chia sẻ link với team

#### Option C: Sử dụng Git LFS (cho file lớn)
```bash
git lfs track "*.sql"
git add .gitattributes
git add database/exports/constructOS_schema_*.sql
git commit -m "chore: Add database schema export via LFS"
git push
```

### Bước 3: Import Database Trên Máy Mới

Trên máy mới, sau khi clone code:

```bash
# 1. Copy file export vào thư mục database/exports/
# (hoặc download từ cloud storage)

# 2. Cài đặt MySQL (nếu chưa có)
# macOS:
brew install mysql
brew services start mysql

# Ubuntu/Debian:
sudo apt-get install mysql-server
sudo systemctl start mysql

# Windows: Download từ https://dev.mysql.com/downloads/mysql/

# 3. Tạo database và user (nếu chưa có)
mysql -u root -p
```

```sql
CREATE DATABASE constructOS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON constructOS.* TO 'constructos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 4. Tạo file .env cho server
cd server
cp env.example.txt .env
# Chỉnh sửa .env với thông tin MySQL của bạn
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=constructos_user
DB_PASSWORD=your_password
DB_NAME=constructOS
```

```bash
# 5. Import database
cd ../database/scripts
chmod +x import_database.sh
./import_database.sh ../exports/constructOS_schema_YYYYMMDD_HHMMSS.sql
```

Nếu muốn import cả data (có dữ liệu từ máy cũ):
```bash
./import_database.sh ../exports/constructOS_export_YYYYMMDD_HHMMSS.sql
```

---

## 🛠️ Cách 2: Tạo Database Từ Schema File

Nếu không có file export, bạn có thể tạo database từ schema file:

### Bước 1: Setup MySQL

```bash
# Cài đặt MySQL (nếu chưa có)
# macOS:
brew install mysql
brew services start mysql

# Ubuntu/Debian:
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Bước 2: Tạo Database và User

```bash
mysql -u root -p
```

```sql
CREATE DATABASE constructOS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'constructos_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON constructOS.* TO 'constructos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Bước 3: Import Schema

```bash
cd database
mysql -u constructos_user -p constructOS < mysql_schema.sql
```

### Bước 4: Chạy Migrations (nếu có)

```bash
# Chạy các migration files
mysql -u constructos_user -p constructOS < migrations/create_group_chat.sql
mysql -u constructos_user -p constructOS < migrations/create_direct_messages.sql
# ... các migration khác
```

Hoặc chạy tất cả migrations:
```bash
for file in migrations/*.sql; do
    echo "Running: $file"
    mysql -u constructos_user -p constructOS < "$file"
done
```

### Bước 5: Import Initial Data (Optional)

```bash
mysql -u constructos_user -p constructOS < seeds/initial_data.sql
```

### Bước 6: Cấu Hình .env

```bash
cd server
cp env.example.txt .env
```

Chỉnh sửa `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=constructos_user
DB_PASSWORD=your_password
DB_NAME=constructOS
```

---

## ✅ Kiểm Tra Database

Sau khi setup xong, kiểm tra database:

```bash
# Xem danh sách tables
mysql -u constructos_user -p constructOS -e "SHOW TABLES;"

# Hoặc dùng script
cd database/scripts
./show_tables.sh
```

---

## 🔄 Đồng Bộ Database Giữa Các Máy

### Khi có thay đổi schema mới:

1. **Máy có thay đổi**: Export lại database
```bash
cd database/scripts
./export_database.sh
```

2. **Chia sẻ file export** với team

3. **Máy khác**: Import file mới
```bash
cd database/scripts
./import_database.sh ../exports/constructOS_export_YYYYMMDD_HHMMSS.sql
```

### Khi chỉ cần đồng bộ data (không thay đổi schema):

1. Export chỉ data:
```bash
cd database/scripts
./export_database.sh
# Sử dụng file constructOS_data_*.sql
```

2. Import data vào database có sẵn:
```bash
./import_database.sh ../exports/constructOS_data_YYYYMMDD_HHMMSS.sql
```

---

## 🆘 Troubleshooting

### Lỗi: "Access denied for user"
- Kiểm tra username/password trong `.env`
- Đảm bảo user có quyền trên database

### Lỗi: "Unknown database"
- Đảm bảo đã tạo database trước khi import
- Kiểm tra tên database trong `.env`

### Lỗi: "Table already exists"
- Database đã có schema, chỉ cần import data
- Hoặc drop database và tạo lại

### File export quá lớn
- Sử dụng Git LFS: `git lfs track "*.sql"`
- Hoặc chia sẻ qua cloud storage
- Hoặc chỉ export schema (không có data) để chia sẻ

---

## 📝 Quick Reference

### Export Database
```bash
cd database/scripts
chmod +x export_database.sh
./export_database.sh                    # Tự động đọc từ .env
./export_database.sh constructOS        # Chỉ định tên database
```

### Import Database
```bash
cd database/scripts
chmod +x import_database.sh
./import_database.sh ../exports/file.sql                    # Tự động đọc từ .env
./import_database.sh ../exports/file.sql constructOS        # Chỉ định tên database
```

### Xem Database
```bash
cd database/scripts
./start_phpmyadmin.sh        # Mở phpMyAdmin trên browser
# Hoặc
./start_adminer.sh           # Mở Adminer trên browser
```

---

## 💡 Tips

1. **Backup thường xuyên**: Export database định kỳ để có backup
2. **Chia sẻ schema**: Khi có thay đổi schema, export và commit vào git
3. **Data riêng**: Mỗi developer có thể có data riêng, chỉ cần đồng bộ schema
4. **Environment variables**: Luôn dùng `.env` để quản lý cấu hình database
5. **Migrations**: Tạo migration files cho mỗi thay đổi schema lớn

---

**Need help?** Xem thêm trong:
- `database/README.md` - Database setup guide
- `database/scripts/README.md` - Database scripts guide
- `server/HUONG_DAN_MYSQL.md` - Chi tiết MySQL setup

