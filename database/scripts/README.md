# Database Scripts

Các script tiện ích để làm việc với database.

## 📋 Danh Sách Scripts

### 1. `setup_adminer.sh` - Setup Adminer Web Interface
Cài đặt Adminer để xem database trên browser.

```bash
./database/scripts/setup_adminer.sh
```

### 2. `start_adminer.sh` - Start Adminer Server
Khởi động web server để xem database trên browser.

```bash
./database/scripts/start_adminer.sh
# Hoặc dùng port khác:
./database/scripts/start_adminer.sh 8888
```

Sau đó mở browser: **http://localhost:8080/adminer.php**

### 3. `show_tables.sh` - Xem Tất Cả Tables
Hiển thị danh sách tất cả tables trong database.

```bash
./database/scripts/show_tables.sh
```

### 4. `view_table.sh` - Xem Dữ Liệu Table
Xem dữ liệu trong một table cụ thể.

```bash
./database/scripts/view_table.sh users
./database/scripts/view_table.sh projects 5
```

### 5. `count_records.sh` - Đếm Số Records
Đếm số lượng records trong tất cả tables.

```bash
./database/scripts/count_records.sh
```

### 6. `open_mysql.sh` - Mở MySQL Console
Mở MySQL command line console.

```bash
./database/scripts/open_mysql.sh
```

### 7. `setup_phpmyadmin.sh` - Setup phpMyAdmin
Cài đặt phpMyAdmin để xem database trên browser (giao diện phong phú hơn Adminer).

```bash
./database/scripts/setup_phpmyadmin.sh
```

### 8. `start_phpmyadmin.sh` - Start phpMyAdmin Server
Khởi động phpMyAdmin web server.

```bash
./database/scripts/start_phpmyadmin.sh
```

Sau đó mở browser: **http://localhost:8080**

### 9. `stop_phpmyadmin.sh` - Stop phpMyAdmin Server
Dừng phpMyAdmin web server.

```bash
./database/scripts/stop_phpmyadmin.sh
```

---

## 🚀 Quick Start

### Xem Database Trên Browser

#### Option 1: phpMyAdmin (Khuyến Nghị - Giao diện phong phú)
```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/start_phpmyadmin.sh
```
Mở browser: **http://localhost:8080**
- ✅ Tự động đăng nhập
- ✅ Giao diện đầy đủ tính năng

#### Option 2: Adminer (Nhẹ, đơn giản)
```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/start_adminer.sh
```
Mở browser: **http://localhost:8080/adminer.php**

Thông tin đăng nhập (cho Adminer):
- System: MySQL
- Server: localhost:3306
- Username: constructos_user
- Password: constructos123
- Database: constructos

---

Xem hướng dẫn chi tiết trong các file:
- `PHPMYADMIN_QUICK_START.md` - Quick start cho phpMyAdmin
- `database/PHPMYADMIN_SETUP.md` - Hướng dẫn đầy đủ phpMyAdmin
- `MO_DATABASE_TREN_BROWSER.md` - Xem database trên browser
- `HUONG_DAN_XEM_DATABASE.md` - Hướng dẫn đầy đủ
- `WEB_INTERFACE.md` - Web interface options

