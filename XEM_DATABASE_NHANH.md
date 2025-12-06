# 👀 Xem Database Nhanh - 3 Cách Đơn Giản

## 🚀 Cách 1: Dùng Script (Nhanh Nhất)

### Xem tất cả tables:
```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/show_tables.sh
```

### Xem dữ liệu một table:
```bash
./database/scripts/view_table.sh users
./database/scripts/view_table.sh projects
```

### Mở MySQL console:
```bash
./database/scripts/open_mysql.sh
```

---

## 💻 Cách 2: Dùng Terminal (Command Line)

### Mở MySQL console:
```bash
mysql -u constructos_user -pconstructos123 constructos
```

Sau đó trong MySQL console:
```sql
-- Xem tables
SHOW TABLES;

-- Xem dữ liệu
SELECT * FROM users;
SELECT * FROM projects;

-- Thoát
EXIT;
```

### Hoặc chạy trực tiếp (không vào console):
```bash
# Xem tables
mysql -u constructos_user -pconstructos123 constructos -e "SHOW TABLES;"

# Xem dữ liệu users
mysql -u constructos_user -pconstructos123 constructos -e "SELECT * FROM users;"

# Đếm số users
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) FROM users;"
```

---

## 🖥️ Cách 3: Dùng GUI Tool (Dễ Nhất Cho Người Mới)

### Option A: TablePlus (Đẹp, Dễ Dùng)

**Cài đặt:**
```bash
brew install --cask tableplus
```

**Kết nối:**
1. Mở TablePlus
2. Click "Create a new connection"
3. Chọn MySQL
4. Điền:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **User:** `constructos_user`
   - **Password:** `constructos123`
   - **Database:** `constructos`
5. Click "Test" → "Connect"

### Option B: MySQL Workbench

**Cài đặt:**
```bash
brew install --cask mysql-workbench
```

**Kết nối:**
1. Mở MySQL Workbench
2. Click "+" để tạo connection
3. Điền thông tin giống như TablePlus
4. Test connection → OK

---

## 📋 Thông Tin Connection

| Thông tin | Giá trị |
|-----------|---------|
| Host | localhost |
| Port | 3306 |
| Database | constructos |
| User | constructos_user |
| Password | constructos123 |

---

## 🔍 Các Lệnh Hữu Ích

### Xem tất cả tables:
```sql
SHOW TABLES;
```

### Xem cấu trúc table:
```sql
DESCRIBE users;
DESCRIBE projects;
```

### Xem dữ liệu:
```sql
SELECT * FROM users;
SELECT * FROM projects LIMIT 10;
SELECT * FROM materials LIMIT 5;
```

### Đếm số records:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
```

### Xem với điều kiện:
```sql
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM projects WHERE status = 'in_progress';
```

---

## 💡 Khuyến Nghị

- **Người mới:** Dùng **TablePlus** (đẹp, dễ dùng)
- **Quen terminal:** Dùng **scripts** hoặc **MySQL CLI**
- **Professional:** Dùng **MySQL Workbench**

---

## 📚 Tài Liệu Chi Tiết

- Hướng dẫn đầy đủ: `database/HUONG_DAN_XEM_DATABASE.md`
- Quick view: `database/QUICK_VIEW.md`

---

**Chọn cách bạn thích nhất và bắt đầu xem database! 🎉**

