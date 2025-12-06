# Hướng dẫn Chạy Server Nhanh

## ❌ SAI - Đừng làm như thế này:

```bash
node index.js  # ❌ Sẽ báo lỗi vì không có file này
```

## ✅ ĐÚNG - Cách chạy server:

### Bước 1: Vào thư mục server
```bash
cd server
```

### Bước 2: Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### Bước 3: Chạy server (development mode)
```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:2222**

## 🔍 Giải thích:

- Server được viết bằng **TypeScript** (`.ts` files)
- File chính là `src/index.ts`, không phải `index.js`
- `npm run dev` sẽ tự động compile và chạy TypeScript bằng `tsx`
- Hot reload được bật, tự động restart khi code thay đổi

## 🚀 Lệnh khác:

### Build cho production:
```bash
npm run build    # Compile TypeScript thành JavaScript
npm start        # Chạy file đã build (dist/index.js)
```

## 🐛 Nếu gặp lỗi:

1. **Lỗi "Cannot find module"**: 
   - Chạy lại `npm install`
   - Đảm bảo bạn đang ở trong thư mục `server/`

2. **Lỗi về TypeScript**:
   - Kiểm tra Node.js version >= 18
   - Xóa `node_modules` và chạy lại `npm install`

3. **Port đã được sử dụng (EADDRINUSE)**:
   ```bash
   # Cách 1: Dùng script tự động
   ./fix-port.sh
   
   # Cách 2: Kill thủ công
   lsof -ti:2222 | xargs kill -9
   
   # Cách 3: Đổi port trong file .env
   PORT=3001 npm run dev
   ```

