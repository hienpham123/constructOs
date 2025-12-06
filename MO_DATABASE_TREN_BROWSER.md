# 🌐 Mở Database Trên Browser

Hướng dẫn nhanh để xem MySQL database trên browser.

## 🚀 Cách Đơn Giản Nhất

### Bước 1: Start Server

Chạy một trong các lệnh sau:

**Cách 1: Dùng script (Khuyến nghị)**
```bash
cd /Users/hochihien/Code/constructOS
./database/scripts/start_adminer.sh
```

**Cách 2: Chạy thủ công**
```bash
cd /Users/hochihien/Code/constructOS/database/web
php -S localhost:8080
```

### Bước 2: Mở Browser

Mở trình duyệt và vào địa chỉ:
**http://localhost:8080/adminer.php**

### Bước 3: Đăng Nhập

Điền thông tin sau:

| Trường | Giá trị |
|--------|---------|
| **System** | MySQL |
| **Server** | localhost:3306 |
| **Username** | constructos_user |
| **Password** | constructos123 |
| **Database** | constructos |

Click **"Login"** → Xong! 🎉

---

## 📋 Thông Tin Đăng Nhập

```
System: MySQL
Server: localhost:3306
Username: constructos_user
Password: constructos123
Database: constructos
```

---

## 🛑 Dừng Server

Nhấn `Ctrl + C` trong terminal nơi server đang chạy.

---

## 🔧 Troubleshooting

### Port 8080 đã được dùng?

Dùng port khác:
```bash
cd /Users/hochihien/Code/constructOS/database/web
php -S localhost:8888
```

Sau đó mở: **http://localhost:8888/adminer.php**

### Không kết nối được database?

1. Kiểm tra MySQL đang chạy:
   ```bash
   brew services list | grep mysql
   ```

2. Thử kết nối bằng command line:
   ```bash
   mysql -u constructos_user -pconstructos123 constructos
   ```

---

## 💡 Tính Năng

Với Adminer, bạn có thể:
- ✅ Xem tất cả tables
- ✅ Xem dữ liệu trong tables
- ✅ Thêm/Sửa/Xóa dữ liệu
- ✅ Chạy SQL queries
- ✅ Xem cấu trúc tables
- ✅ Export/Import dữ liệu

---

## 📚 Xem Thêm

- Hướng dẫn chi tiết: `database/WEB_INTERFACE.md`

---

**Chúc bạn sử dụng tốt! 🎉**

