# Hướng Dẫn Test Sau Khi Migration

## ✅ Đã Hoàn Thành

Tất cả controllers đã được cập nhật để lưu vào **MySQL database**.

## 🧪 Cách Test

### Bước 1: Restart Server

```bash
cd server
npm run dev
```

Kiểm tra console → Nên thấy:
```
✅ Connected to MySQL database: constructos
Server is running on http://localhost:2222
```

### Bước 2: Tạo Dữ Liệu Trên Frontend

1. Mở browser: `http://localhost:5173` (hoặc port của frontend)
2. Vào trang **Personnel**
3. Click **"Thêm nhân sự"**
4. Điền thông tin và lưu

### Bước 3: Kiểm Tra Trong Database

**Cách 1: Qua Adminer (Browser)**
1. Mở Adminer: `http://localhost:8080/adminer.php`
2. Đăng nhập với thông tin:
   - System: MySQL
   - Server: localhost:3306
   - Username: constructos_user
   - Password: constructos123
   - Database: constructos
3. Click vào table **personnel**
4. **Sẽ thấy dữ liệu bạn vừa tạo!** ✅

**Cách 2: Qua Terminal**
```bash
mysql -u constructos_user -pconstructos123 constructos -e "SELECT * FROM personnel;"
```

**Cách 3: Qua API**
```bash
curl http://localhost:2222/api/personnel
```

## 📊 Test Các Modules Khác

### Materials
1. Tạo material trên FE
2. Kiểm tra: `SELECT * FROM materials;`

### Projects
1. Tạo project trên FE
2. Kiểm tra: `SELECT * FROM projects;`

### Equipment
1. Tạo equipment trên FE
2. Kiểm tra: `SELECT * FROM equipment;`

### Contracts
1. Tạo contract trên FE
2. Kiểm tra: `SELECT * FROM contracts;`

### Site Logs
1. Tạo site log trên FE
2. Kiểm tra: `SELECT * FROM site_logs;`

## ✅ Kết Quả Mong Đợi

- ✅ Tạo dữ liệu trên FE → Thành công
- ✅ Xem qua API → Thấy dữ liệu
- ✅ Xem trên Adminer → **Thấy dữ liệu trong database!**
- ✅ Restart server → Dữ liệu vẫn còn (không mất)

## 🔍 Kiểm Tra Nhanh

```bash
# Xem số lượng records trong các tables
mysql -u constructos_user -pconstructos123 constructos -e "
SELECT 
    'personnel' as table_name, COUNT(*) as total FROM personnel
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'site_logs', COUNT(*) FROM site_logs;
"
```

## ⚠️ Lưu Ý

1. **Dữ liệu cũ trong memory đã mất** - Cần tạo lại
2. **Tất cả dữ liệu mới sẽ lưu vào MySQL**
3. **Backup database thường xuyên**

---

**Bây giờ bạn có thể tạo dữ liệu và sẽ thấy trong Adminer! 🎉**

