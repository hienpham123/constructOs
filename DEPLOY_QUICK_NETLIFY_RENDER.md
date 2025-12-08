# ⚡ Deploy Nhanh: Netlify + Render

Hướng dẫn deploy nhanh trong 10 phút!

## 🎯 Tổng Quan

- **Frontend** → Netlify (miễn phí)
- **Backend** → Render (miễn phí)
- **Database** → PlanetScale MySQL (miễn phí) hoặc Render PostgreSQL

---

## 📦 BƯỚC 1: Setup Database (5 phút)

### Option A: PlanetScale MySQL (Khuyến nghị)

1. Đăng ký: https://planetscale.com
2. Tạo database: `constructOS`
3. Copy connection string từ dashboard
4. Import schema:
   ```bash
   # Dùng PlanetScale CLI hoặc MySQL client
   mysql -h <host> -u <user> -p < database/mysql_schema.sql
   ```

### Option B: Render PostgreSQL

1. Trong Render dashboard → **New +** → **PostgreSQL**
2. Tạo database
3. Copy connection string
4. Convert và import schema (cần convert từ MySQL sang PostgreSQL)

---

## 🚀 BƯỚC 2: Deploy Backend lên Render (3 phút)

1. **Đăng nhập**: https://render.com
2. **New +** → **Web Service**
3. **Connect repository** (GitHub/GitLab)
4. **Cấu hình**:
   - Name: `constructos-backend`
   - Root Directory: `server`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Plan: `Starter` (free)

5. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   DB_HOST=<your-db-host>
   DB_PORT=3306
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   DB_NAME=constructOS
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   API_BASE_URL=https://constructos-backend.onrender.com
   FRONTEND_URL=https://constructos.netlify.app
   CORS_ORIGIN=https://constructos.netlify.app
   ```

6. **Deploy** → Copy URL (ví dụ: `https://constructos-backend.onrender.com`)

---

## 🌐 BƯỚC 3: Deploy Frontend lên Netlify (2 phút)

1. **Đăng nhập**: https://app.netlify.com
2. **Add new site** → **Import project**
3. **Connect repository**
4. **Build settings**:
   - Base directory: `client`
   - Build: `npm run build`
   - Publish: `client/dist`

5. **Environment Variables**:
   ```env
   VITE_API_URL=https://constructos-backend.onrender.com/api
   ```

6. **Deploy** → Copy URL (ví dụ: `https://constructos.netlify.app`)

---

## 🔄 BƯỚC 4: Cập Nhật CORS

Quay lại Render, cập nhật:
```env
FRONTEND_URL=https://constructos.netlify.app
CORS_ORIGIN=https://constructos.netlify.app
```

Restart service.

---

## ✅ Kiểm Tra

```bash
# Backend health
curl https://constructos-backend.onrender.com/api/health

# Frontend
# Mở https://constructos.netlify.app trong browser
```

---

## 🎉 Xong!

- Frontend: https://your-app.netlify.app
- Backend: https://your-backend.onrender.com

**Xem hướng dẫn chi tiết**: `DEPLOY_NETLIFY_RENDER.md`

