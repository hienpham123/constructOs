# 📊 Database - Tổng Quan

## 🚀 Xem Database Nhanh

### 🌐 Trên Browser (Dễ Nhất)

```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/start_adminer.sh
```

Mở browser: **http://localhost:8080/adminer.php**

**Thông tin đăng nhập:**
- System: MySQL
- Server: localhost:3306
- Username: constructos_user
- Password: constructos123
- Database: constructos

### 💻 Trên Terminal

```bash
mysql -u constructos_user -pconstructos123 constructos
```

---

## 📋 Thông Tin Database

- **Host:** localhost
- **Port:** 3306
- **Database:** constructos
- **User:** constructos_user
- **Password:** constructos123
- **Tables:** 16 tables

---

## 📚 Tài Liệu

- **Xem trên browser:** `MO_DATABASE_TREN_BROWSER.md`
- **Hướng dẫn đầy đủ:** `database/HUONG_DAN_XEM_DATABASE.md`
- **Web interface:** `database/WEB_INTERFACE.md`
- **Quick view:** `XEM_DATABASE_NHANH.md`

---

## 🛠️ Scripts Tiện Ích

Tất cả scripts trong: `database/scripts/`

- `start_adminer.sh` - Start web interface
- `show_tables.sh` - Xem tables
- `view_table.sh` - Xem dữ liệu
- `open_mysql.sh` - Mở MySQL console

---

## ✅ Database Schema

16 tables đã được tạo:
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

Xem schema: `database/mysql_schema.sql`

---

**Chúc bạn làm việc với database vui vẻ! 🎉**

