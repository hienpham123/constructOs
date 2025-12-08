# 🔧 Fix API URL Configuration trong Netlify

## ⚠️ Vấn Đề

Frontend đang gọi: `https://constructos-backend.onrender.com/auth/login`
Nhưng backend route là: `/api/auth/login`

**Lỗi:** 404 Not Found

## ✅ Giải Pháp

### Vấn Đề: VITE_API_URL thiếu `/api`

Frontend code:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2222/api';
```

Nếu `VITE_API_URL` trong Netlify là:
```
https://constructos-backend.onrender.com
```

Thì request sẽ là:
```
https://constructos-backend.onrender.com/auth/login  ❌ (thiếu /api)
```

### Cách Sửa

**Option 1: Thêm `/api` vào VITE_API_URL trong Netlify (Khuyến nghị)**

1. Vào Netlify dashboard → Site settings → Environment variables
2. Tìm biến `VITE_API_URL`
3. Cập nhật:
   ```
   Key: VITE_API_URL
   Value: https://constructos-backend.onrender.com/api
   ```
   ⚠️ **Quan trọng:** Phải có `/api` ở cuối!
4. Redeploy site

**Option 2: Sửa code để tự động thêm `/api`**

Nếu muốn linh hoạt hơn, có thể sửa `instance.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/api`
  : 'http://localhost:2222/api';
```

## 📋 Checklist

- [ ] Vào Netlify → Environment variables
- [ ] Kiểm tra `VITE_API_URL`
- [ ] Đảm bảo có `/api` ở cuối: `https://constructos-backend.onrender.com/api`
- [ ] Redeploy site
- [ ] Test lại login

---

**Cập nhật VITE_API_URL trong Netlify ngay!**

