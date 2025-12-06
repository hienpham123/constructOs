# 🚀 Cách Chạy phpMyAdmin

## ⚠️ Lưu Ý Quan Trọng

Bạn **PHẢI** chạy script từ thư mục project `constructOS`!

## ✅ Cách 1: Chạy Từ Thư Mục Project (Khuyến Nghị)

```bash
# Bước 1: Di chuyển vào thư mục project
cd /Users/hochihien/Code/constructOS

# Bước 2: Chạy script
./database/scripts/start_phpmyadmin.sh
```

Hoặc dùng script wrapper ở root:

```bash
cd /Users/hochihien/Code/constructOS
./start_phpmyadmin.sh
```

## ✅ Cách 2: Chạy Từ Bất Kỳ Đâu (Dùng Absolute Path)

```bash
/Users/hochihien/Code/constructOS/database/scripts/start_phpmyadmin.sh
```

Hoặc:

```bash
/Users/hochihien/Code/constructOS/start_phpmyadmin.sh
```

## ❌ Lỗi Thường Gặp

### Lỗi: `zsh: no such file or directory`

**Nguyên nhân**: Bạn đang chạy từ thư mục khác (ví dụ: `~`)

**Giải pháp**: 
1. Di chuyển vào thư mục project trước:
   ```bash
   cd /Users/hochihien/Code/constructOS
   ```
2. Sau đó chạy script:
   ```bash
   ./database/scripts/start_phpmyadmin.sh
   ```

## 🎯 Quick Commands

### Khởi Động
```bash
cd /Users/hochihien/Code/constructOS && ./start_phpmyadmin.sh
```

### Dừng
```bash
cd /Users/hochihien/Code/constructOS && ./stop_phpmyadmin.sh
```

Hoặc nhấn `Ctrl+C` trong terminal đang chạy phpMyAdmin.

## 📍 Kiểm Tra Bạn Đang Ở Đâu

```bash
pwd
```

Nếu không thấy `/Users/hochihien/Code/constructOS`, hãy chạy:
```bash
cd /Users/hochihien/Code/constructOS
```

---

**Sau khi khởi động thành công, mở browser: http://localhost:8080**

