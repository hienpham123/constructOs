# Quick View Database - Xem Nhanh Database

## 🚀 Cách Nhanh Nhất

### 1. Mở MySQL Console (Terminal)

```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/open_mysql.sh
```

Hoặc thủ công:
```bash
mysql -u constructos_user -pconstructos123 constructos
```

### 2. Xem Tất Cả Tables

```bash
./database/scripts/show_tables.sh
```

Hoặc trong MySQL console:
```sql
SHOW TABLES;
```

### 3. Xem Dữ Liệu Một Table

```bash
./database/scripts/view_table.sh users
./database/scripts/view_table.sh projects
./database/scripts/view_table.sh materials
```

Hoặc trong MySQL console:
```sql
SELECT * FROM users;
SELECT * FROM projects;
SELECT * FROM materials LIMIT 10;
```

### 4. Xem Số Lượng Records

```bash
./database/scripts/count_records.sh
```

---

## 📱 Dùng GUI Tool (Dễ Nhất)

### Option 1: TablePlus (Khuyến Nghị - Đẹp Nhất)

```bash
brew install --cask tableplus
```

Mở TablePlus → New Connection → MySQL:
- Host: `localhost`
- Port: `3306`
- User: `constructos_user`
- Password: `constructos123`
- Database: `constructos`

### Option 2: MySQL Workbench

```bash
brew install --cask mysql-workbench
```

Mở MySQL Workbench → Tạo connection mới với thông tin trên.

---

## 💡 Các Lệnh MySQL Thường Dùng

```sql
-- Xem tables
SHOW TABLES;

-- Xem cấu trúc table
DESCRIBE users;

-- Xem dữ liệu
SELECT * FROM users;
SELECT * FROM projects LIMIT 10;

-- Đếm records
SELECT COUNT(*) FROM users;

-- Xem với điều kiện
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM projects WHERE status = 'in_progress';

-- Thoát
EXIT;
```

---

## 🔗 Thông Tin Connection

- **Host:** localhost
- **Port:** 3306
- **Database:** constructos
- **User:** constructos_user
- **Password:** constructos123

---

Xem hướng dẫn chi tiết: `HUONG_DAN_XEM_DATABASE.md`

