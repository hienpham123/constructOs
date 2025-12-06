# 🐘 phpMyAdmin Setup Guide

## ✅ Đã Setup Xong!

phpMyAdmin đã được cài đặt và cấu hình sẵn để kết nối với MySQL database `constructos`.

## 🚀 Cách Sử Dụng

### 1. Khởi Động phpMyAdmin

```bash
./database/scripts/start_phpmyadmin.sh
```

### 2. Mở Trình Duyệt

Mở trình duyệt và truy cập:
```
http://localhost:8080
```

### 3. Đăng Nhập

phpMyAdmin đã được cấu hình tự động, bạn sẽ **tự động đăng nhập** với:
- **Server**: localhost:3306
- **User**: constructos_user
- **Password**: constructos123
- **Database**: constructos

## 📋 Tính Năng

### Xem Dữ Liệu
- Click vào database `constructos` ở sidebar bên trái
- Chọn table muốn xem (ví dụ: `personnel`, `projects`, `materials`)
- Xem dữ liệu trong tab "Browse"

### Chỉnh Sửa Dữ Liệu
- Click vào row muốn sửa
- Click nút "Edit" (biểu tượng bút chì)
- Thay đổi dữ liệu và click "Go"

### Thêm Dữ Liệu
- Chọn table
- Click tab "Insert"
- Điền thông tin và click "Go"

### Chạy SQL Query
- Click tab "SQL" ở bất kỳ đâu
- Viết query và click "Go"

### Export/Import
- **Export**: Chọn table → Tab "Export" → Chọn format → "Go"
- **Import**: Tab "Import" → Chọn file → "Go"

## 🛠️ Troubleshooting

### Port 8080 đã được sử dụng
Script sẽ tự động hỏi bạn có muốn kill process không. Hoặc bạn có thể:

```bash
# Tìm process đang dùng port 8080
lsof -ti:8080

# Kill process
kill -9 $(lsof -ti:8080)
```

### Không thể kết nối MySQL
1. Kiểm tra MySQL đang chạy:
   ```bash
   brew services list | grep mysql
   ```

2. Nếu chưa chạy, khởi động:
   ```bash
   brew services start mysql
   ```

### phpMyAdmin không load
1. Kiểm tra PHP đang chạy:
   ```bash
   php --version
   ```

2. Xem log trong terminal nơi bạn chạy `start_phpmyadmin.sh`

## 📁 Cấu Trúc File

```
database/
├── phpmyadmin/          # phpMyAdmin files
│   ├── config.inc.php   # Configuration file
│   └── ...
└── scripts/
    ├── setup_phpmyadmin.sh    # Setup script
    └── start_phpmyadmin.sh    # Start script
```

## 🔒 Bảo Mật

⚠️ **Lưu ý**: Cấu hình hiện tại dùng cho **development only**!

Để sử dụng trong production:
1. Thay đổi `blowfish_secret` trong `config.inc.php`
2. Sử dụng `auth_type = 'cookie'` thay vì `'config'`
3. Đặt password mạnh hơn
4. Sử dụng HTTPS

## 🆚 So Sánh với Adminer

| Tính Năng | phpMyAdmin | Adminer |
|-----------|------------|---------|
| Giao diện | Phong phú, nhiều tính năng | Đơn giản, nhẹ |
| Kích thước | ~12MB | ~500KB |
| Tính năng | Đầy đủ | Cơ bản |
| Phù hợp | Development & Production | Quick access |

---

**Bây giờ bạn có thể sử dụng phpMyAdmin để quản lý database một cách trực quan!** 🎉

