# 🔧 Khắc phục sự cố (Troubleshooting)

## ❌ Lỗi: "EADDRINUSE: address already in use :::2222"

### Nguyên nhân:
Port 2222 đã được sử dụng bởi một process khác (có thể là server cũ vẫn đang chạy).

### Giải pháp nhanh:

#### Cách 1: Dùng script tự động (Khuyến nghị)
```bash
npm run fix-port
# hoặc
./fix-port.sh
```

#### Cách 2: Kill thủ công
```bash
# Tìm process đang dùng port 2222
lsof -ti:2222

# Kill process
lsof -ti:2222 | xargs kill -9
```

#### Cách 3: Đổi port
```bash
# Tạo file .env trong thư mục server
echo "PORT=3001" > .env

# Chạy server với port mới
npm run dev
```

#### Cách 4: Tìm và kill tất cả process node
```bash
# Tìm tất cả process node
ps aux | grep node | grep -v grep

# Kill tất cả (cẩn thận!)
pkill -f node
```

### Sau khi fix:
```bash
npm run dev
```

---

## ❌ Lỗi: "Cannot find module"

### Giải pháp:
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Lỗi về TypeScript

### Kiểm tra Node.js version:
```bash
node --version  # Phải >= 18
```

### Nếu Node.js < 18:
Xem hướng dẫn trong `UPGRADE_NODE.md` ở thư mục root

---

## ❌ Server không khởi động

### Kiểm tra:
1. Đã cài đặt dependencies chưa?
   ```bash
   npm install
   ```

2. Đang ở đúng thư mục?
   ```bash
   pwd  # Phải ở /path/to/constructOS/server
   ```

3. File src/index.ts có tồn tại?
   ```bash
   ls -la src/index.ts
   ```

---

## 💡 Tips

- Luôn chạy `npm run dev` thay vì `node index.js`
- Nếu server bị treo, nhấn `Ctrl + C` để dừng
- Để chạy nhiều server cùng lúc, đổi port cho mỗi server
- Check log trong terminal để biết lỗi chi tiết

