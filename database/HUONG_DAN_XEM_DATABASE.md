# Hướng Dẫn Xem Database MySQL

Có nhiều cách để xem và quản lý database MySQL. Dưới đây là các cách phổ biến nhất:

## 1. MySQL Command Line (Terminal) - Miễn Phí

### Cách đăng nhập:

```bash
mysql -u constructos_user -p constructos
```

Nhập password: `constructos123`

### Các lệnh hữu ích:

```sql
-- Xem tất cả tables
SHOW TABLES;

-- Xem cấu trúc một table
DESCRIBE users;
-- hoặc
SHOW COLUMNS FROM users;

-- Xem dữ liệu trong table
SELECT * FROM users;
SELECT * FROM projects;
SELECT * FROM materials LIMIT 10;

-- Đếm số records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;

-- Xem với điều kiện
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM projects WHERE status = 'in_progress';

-- Thoát
EXIT;
```

### Quick Commands (không cần vào MySQL console):

```bash
# Xem tất cả tables
mysql -u constructos_user -pconstructos123 constructos -e "SHOW TABLES;"

# Xem dữ liệu users
mysql -u constructos_user -pconstructos123 constructos -e "SELECT * FROM users;"

# Xem số lượng records
mysql -u constructos_user -pconstructos123 constructos -e "SELECT COUNT(*) as total FROM users;"

# Xem cấu trúc table
mysql -u constructos_user -pconstructos123 constructos -e "DESCRIBE users;"
```

---

## 2. MySQL Workbench (GUI Tool) - Miễn Phí

### Cài đặt:

**macOS:**
```bash
brew install --cask mysql-workbench
```

**Hoặc download từ:**
https://dev.mysql.com/downloads/workbench/

### Kết nối:

1. Mở MySQL Workbench
2. Click **"+"** để tạo connection mới
3. Điền thông tin:
   - **Connection Name:** ConstructOS
   - **Hostname:** localhost
   - **Port:** 3306
   - **Username:** constructos_user
   - **Password:** constructos123 (click "Store in Keychain")
   - **Default Schema:** constructos
4. Click **"Test Connection"** → Nếu thành công, click **"OK"**
5. Double-click vào connection để kết nối

### Sử dụng:

- Click vào database `constructos` ở sidebar bên trái
- Click vào table để xem dữ liệu
- Có thể edit dữ liệu trực tiếp
- Chạy SQL queries trong tab "Query"

---

## 3. TablePlus (GUI Tool) - Có bản miễn phí

### Cài đặt:

**macOS:**
```bash
brew install --cask tableplus
```

**Hoặc download từ:**
https://tableplus.com/

### Kết nối:

1. Mở TablePlus
2. Click **"Create a new connection"**
3. Chọn **MySQL**
4. Điền thông tin:
   - **Name:** ConstructOS
   - **Host:** localhost
   - **Port:** 3306
   - **User:** constructos_user
   - **Password:** constructos123
   - **Database:** constructos
5. Click **"Test"** → **"Connect"**

### Ưu điểm:

- Giao diện đẹp, dễ sử dụng
- Hỗ trợ nhiều database types
- Có bản miễn phí (giới hạn tabs)

---

## 4. DBeaver (GUI Tool) - Miễn Phí

### Cài đặt:

**macOS:**
```bash
brew install --cask dbeaver-community
```

**Hoặc download từ:**
https://dbeaver.io/download/

### Kết nối:

1. Mở DBeaver
2. Click **"New Database Connection"** (icon ổ cắm)
3. Chọn **MySQL**
4. Điền thông tin:
   - **Host:** localhost
   - **Port:** 3306
   - **Database:** constructos
   - **Username:** constructos_user
   - **Password:** constructos123
5. Click **"Test Connection"** → **"Finish"**

---

## 5. VS Code Extension (Nếu dùng VS Code)

### Cài đặt extension:

1. Mở VS Code
2. Vào Extensions (Cmd+Shift+X)
3. Tìm và cài: **"MySQL"** hoặc **"Database Client"**

### Kết nối:

1. Click vào icon database ở sidebar
2. Click **"+"** để thêm connection
3. Chọn **MySQL**
4. Điền thông tin connection
5. Connect và xem database

---

## 6. Script Tiện Lợi

Tôi đã tạo các script để xem database dễ dàng hơn trong thư mục `database/scripts/`:

### Xem tất cả tables:
```bash
./database/scripts/show_tables.sh
```

### Xem dữ liệu một table:
```bash
./database/scripts/view_table.sh users
```

### Xem số lượng records:
```bash
./database/scripts/count_records.sh
```

---

## So Sánh Các Tool

| Tool | Miễn Phí | Dễ Sử Dụng | Tính Năng | Khuyến Nghị |
|------|----------|------------|-----------|-------------|
| MySQL CLI | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | Cho người quen terminal |
| MySQL Workbench | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Tốt nhất cho MySQL |
| TablePlus | ⚠️ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Đẹp nhất, có bản free |
| DBeaver | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Mạnh nhất, free |
| VS Code Extension | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | Tiện nếu dùng VS Code |

---

## Khuyến Nghị

- **Người mới bắt đầu:** Dùng **MySQL Workbench** hoặc **TablePlus**
- **Người quen terminal:** Dùng **MySQL CLI**
- **Developer:** Dùng **TablePlus** hoặc **DBeaver**

---

## Troubleshooting

### Lỗi: "Access denied"
- Kiểm tra lại username và password
- Đảm bảo user đã được cấp quyền

### Lỗi: "Can't connect to MySQL server"
- Kiểm tra MySQL đang chạy: `brew services list | grep mysql`
- Khởi động lại: `brew services restart mysql`

### Lỗi: "Unknown database"
- Kiểm tra database đã tồn tại: `mysql -u root -e "SHOW DATABASES;"`
- Tạo lại database nếu cần

---

**Chúc bạn xem database thành công! 🎉**

