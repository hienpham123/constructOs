# ⚡ Deploy Backend lên Render - Quick Guide

Hướng dẫn nhanh 5 phút để deploy backend!

## 🎯 5 Bước Đơn Giản

### 1️⃣ Đăng Nhập Render
👉 https://render.com → Sign In

### 2️⃣ Tạo Web Service
- Click **"New +"** → **"Web Service"**
- Connect repository (GitHub/GitLab)

### 3️⃣ Cấu Hình
```
Name: constructos-backend
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
Plan: Starter (free)
```

### 4️⃣ Set Environment Variables
Copy từ file: **[RENDER_ENV_VARIABLES.md](./RENDER_ENV_VARIABLES.md)**

**Tối thiểu cần set**:
- `NODE_ENV=production`
- `PORT=10000` ⚠️
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (tạo bằng: `openssl rand -base64 32`)

### 5️⃣ Deploy
- Click **"Create Web Service"**
- Đợi 5-10 phút
- Copy URL (ví dụ: `https://constructos-backend.onrender.com`)

## ✅ Test

```bash
curl https://your-backend.onrender.com/api/health
```

Kết quả: `{"status":"ok","message":"Server is running"}`

## 🎉 Xong!

**Xem hướng dẫn chi tiết**: [DEPLOY_BACKEND_RENDER_STEP_BY_STEP.md](./DEPLOY_BACKEND_RENDER_STEP_BY_STEP.md)

