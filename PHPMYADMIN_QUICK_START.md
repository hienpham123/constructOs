# 🚀 phpMyAdmin Quick Start

## Bước 1: Khởi Động phpMyAdmin

```bash
./database/scripts/start_phpmyadmin.sh
```

## Bước 2: Mở Trình Duyệt

Truy cập: **http://localhost:8080**

## Bước 3: Sử Dụng

✅ **Đã tự động đăng nhập!** Bạn sẽ thấy database `constructos` ngay lập tức.

### Xem Dữ Liệu
1. Click vào `constructos` ở sidebar trái
2. Chọn table (ví dụ: `personnel`, `projects`)
3. Click tab "Browse" để xem dữ liệu

### Thêm/Sửa/Xóa
- **Thêm**: Tab "Insert" → Điền form → "Go"
- **Sửa**: Click vào row → "Edit" → Sửa → "Go"
- **Xóa**: Click vào row → "Delete" → Xác nhận

### Chạy SQL
- Click tab "SQL" → Viết query → "Go"

## Dừng phpMyAdmin

Nhấn `Ctrl+C` trong terminal, hoặc:

```bash
./database/scripts/stop_phpmyadmin.sh
```

---

**Xem hướng dẫn chi tiết tại:** `database/PHPMYADMIN_SETUP.md`

