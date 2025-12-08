# ✅ Checklist: Deploy Backend lên Render

Checklist từng bước để deploy backend thành công!

## 📋 Pre-Deployment

- [ ] Đã có tài khoản Render: https://render.com
- [ ] Code đã được push lên GitHub/GitLab
- [ ] Đã test build local: `cd server && npm run build` ✅
- [ ] Đã có database (PlanetScale, Railway, hoặc MySQL external)
- [ ] Đã có database credentials (host, user, password, database name)

## 🎯 Bước 1: Tạo Service

- [ ] Đã đăng nhập Render
- [ ] Đã click "New +" → "Web Service"
- [ ] Đã connect repository (GitHub/GitLab)
- [ ] Đã chọn đúng repository

## 🎯 Bước 2: Cấu Hình Service

- [ ] Name: `constructos-backend`
- [ ] Region: `Singapore` (hoặc region gần bạn)
- [ ] Branch: `main` (hoặc branch bạn muốn)
- [ ] **Root Directory**: `server` ⚠️ QUAN TRỌNG!
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Plan: `Starter` (free)

## 🎯 Bước 3: Environment Variables

### Server Config
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` ⚠️ QUAN TRỌNG!

### Database Config
- [ ] `DB_HOST=<your-db-host>`
- [ ] `DB_PORT=3306`
- [ ] `DB_USER=<your-db-user>`
- [ ] `DB_PASSWORD=<your-db-password>` ✅ Mark as Secret
- [ ] `DB_NAME=constructOS`
- [ ] `DB_CONNECTION_LIMIT=10`

### Security
- [ ] `JWT_SECRET=<generated-secret>` ✅ Mark as Secret
  - Đã tạo bằng: `openssl rand -base64 32`
  - Hoặc dùng: `uuf6aCoozahV6OvS7ASWrehuf8X0EX+0fiE1XVTHJN4=`

### API Config (có thể set sau)
- [ ] `API_BASE_URL=https://constructos-backend.onrender.com` (cập nhật sau)
- [ ] `FRONTEND_URL=https://your-app.netlify.app` (set sau khi deploy frontend)
- [ ] `CORS_ORIGIN=https://your-app.netlify.app` (set sau khi deploy frontend)

## 🎯 Bước 4: Deploy

- [ ] Đã kiểm tra lại tất cả cấu hình
- [ ] Đã click "Create Web Service"
- [ ] Đã chờ deploy hoàn thành (5-10 phút)
- [ ] Build thành công (không có errors)

## 🎯 Bước 5: Test & Verify

- [ ] Đã copy URL backend (ví dụ: `https://constructos-backend.onrender.com`)
- [ ] Đã test health endpoint:
  ```bash
  curl https://your-backend.onrender.com/api/health
  ```
- [ ] Kết quả: `{"status":"ok","message":"Server is running"}`
- [ ] Đã kiểm tra logs (không có database connection errors)

## 🎯 Bước 6: Cập Nhật (Sau Khi Deploy)

- [ ] Đã cập nhật `API_BASE_URL` với URL thực tế
- [ ] Service đã restart sau khi cập nhật

## ✅ Hoàn Thành!

- [ ] Backend đã deploy thành công
- [ ] Health check hoạt động
- [ ] Đã lưu URL backend để dùng cho frontend

---

## 📝 Ghi Chú

**JWT Secret đã tạo sẵn**:
```
uuf6aCoozahV6OvS7ASWrehuf8X0EX+0fiE1XVTHJN4=
```

Bạn có thể dùng secret này hoặc tạo mới bằng:
```bash
openssl rand -base64 32
```

**URL Backend của bạn**: 
```
https://____________________.onrender.com
```
(Ghi lại URL sau khi deploy)

---

## 🆘 Nếu Có Lỗi

### Build Failed
- [ ] Kiểm tra build logs
- [ ] Test build local: `cd server && npm run build`
- [ ] Fix errors và push lại

### Database Connection Error
- [ ] Kiểm tra database credentials
- [ ] Kiểm tra database có cho phép connection từ Render
- [ ] Xem logs trong Render dashboard

### Service Keeps Restarting
- [ ] Xem logs để tìm lỗi
- [ ] Kiểm tra `PORT=10000`
- [ ] Kiểm tra tất cả environment variables

---

**Xem hướng dẫn chi tiết**: [DEPLOY_BACKEND_RENDER_STEP_BY_STEP.md](./DEPLOY_BACKEND_RENDER_STEP_BY_STEP.md)

