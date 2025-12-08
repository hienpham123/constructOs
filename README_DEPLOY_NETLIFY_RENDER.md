# 🚀 Deploy ConstructOS: Netlify + Render

Tổng hợp tất cả tài liệu và hướng dẫn để deploy frontend lên Netlify và backend lên Render.

## 📚 Tài Liệu

### 🎯 Bắt Đầu Nhanh
- **[DEPLOY_QUICK_NETLIFY_RENDER.md](./DEPLOY_QUICK_NETLIFY_RENDER.md)** - Deploy trong 10 phút ⚡
- **[CHECKLIST_DEPLOY_NETLIFY_RENDER.md](./CHECKLIST_DEPLOY_NETLIFY_RENDER.md)** - Checklist từng bước ✅

### 📖 Hướng Dẫn Chi Tiết
- **[DEPLOY_NETLIFY_RENDER.md](./DEPLOY_NETLIFY_RENDER.md)** - Hướng dẫn đầy đủ với troubleshooting

### 🔧 Cấu Hình
- **`client/netlify.toml`** - Cấu hình Netlify
- **`render.yaml`** - Cấu hình Render (optional)

## 🎯 Quick Start (3 Bước)

### 1️⃣ Setup Database
```bash
# Tạo database trên PlanetScale hoặc MySQL service khác
# Import schema: database/mysql_schema.sql
```

### 2️⃣ Deploy Backend (Render)
1. Đăng nhập: https://render.com
2. New + → Web Service
3. Connect repo → Cấu hình:
   - Root: `server`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Set environment variables (xem DEPLOY_NETLIFY_RENDER.md)
5. Deploy → Copy URL

### 3️⃣ Deploy Frontend (Netlify)
1. Đăng nhập: https://app.netlify.com
2. Add new site → Import project
3. Cấu hình:
   - Base: `client`
   - Build: `npm run build`
   - Publish: `client/dist`
4. Set `VITE_API_URL` = backend URL
5. Deploy → Copy URL

### 4️⃣ Update CORS
Quay lại Render, cập nhật:
- `FRONTEND_URL` = Netlify URL
- `CORS_ORIGIN` = Netlify URL

## 📋 Environment Variables

### Render (Backend)
```env
NODE_ENV=production
PORT=10000
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=constructOS
JWT_SECRET=<generate-with-openssl-rand-base64-32>
API_BASE_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
```

### Netlify (Frontend)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## ✅ Checklist Nhanh

- [ ] Database đã setup
- [ ] Backend đã deploy trên Render
- [ ] Frontend đã deploy trên Netlify
- [ ] CORS đã được cập nhật
- [ ] Test thành công

## 🆘 Troubleshooting

### Backend không start
- Kiểm tra `PORT=10000`
- Kiểm tra database connection
- Xem logs trong Render dashboard

### Frontend không kết nối backend
- Kiểm tra `VITE_API_URL` trong Netlify
- Kiểm tra CORS settings trong Render
- Kiểm tra browser console (F12)

### Build failed
- Test build local trước
- Kiểm tra build logs
- Kiểm tra Node version

## 📖 Xem Chi Tiết

👉 **[DEPLOY_NETLIFY_RENDER.md](./DEPLOY_NETLIFY_RENDER.md)** - Hướng dẫn đầy đủ

---

**Chúc bạn deploy thành công! 🎉**

