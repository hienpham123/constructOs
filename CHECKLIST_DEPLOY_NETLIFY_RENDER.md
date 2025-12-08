# ✅ Checklist Deploy: Netlify + Render

Checklist từng bước để deploy thành công!

## 📋 Pre-Deployment

- [ ] Đã có tài khoản GitHub/GitLab (để connect repository)
- [ ] Code đã được push lên repository
- [ ] Đã test build local thành công
  - [ ] `cd client && npm run build` ✅
  - [ ] `cd server && npm run build` ✅

## 🗄️ Database Setup

- [ ] Đã tạo tài khoản PlanetScale (hoặc database service khác)
- [ ] Đã tạo database `constructOS`
- [ ] Đã import schema: `database/mysql_schema.sql`
- [ ] Đã test kết nối database
- [ ] Đã copy connection string (host, user, password, database name)

## 🚀 Backend (Render)

- [ ] Đã tạo tài khoản Render: https://render.com
- [ ] Đã tạo Web Service
- [ ] Đã connect repository
- [ ] Đã cấu hình:
  - [ ] Root Directory: `server`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
- [ ] Đã set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DB_HOST=<your-db-host>`
  - [ ] `DB_PORT=3306`
  - [ ] `DB_USER=<your-db-user>`
  - [ ] `DB_PASSWORD=<your-db-password>` (mark as secret)
  - [ ] `DB_NAME=constructOS`
  - [ ] `JWT_SECRET=<generated-secret>` (mark as secret)
  - [ ] `API_BASE_URL=https://your-backend.onrender.com`
  - [ ] `FRONTEND_URL=https://your-app.netlify.app` (set sau)
  - [ ] `CORS_ORIGIN=https://your-app.netlify.app` (set sau)
- [ ] Đã deploy thành công
- [ ] Đã test health endpoint: `curl https://your-backend.onrender.com/api/health`
- [ ] Đã copy backend URL

## 🌐 Frontend (Netlify)

- [ ] Đã tạo tài khoản Netlify: https://app.netlify.com
- [ ] Đã tạo site mới
- [ ] Đã connect repository
- [ ] Đã cấu hình build settings:
  - [ ] Base directory: `client`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `client/dist`
- [ ] Đã set environment variable:
  - [ ] `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] Đã deploy thành công
- [ ] Đã copy frontend URL

## 🔄 Cập Nhật CORS

- [ ] Đã quay lại Render
- [ ] Đã cập nhật `FRONTEND_URL` với URL Netlify
- [ ] Đã cập nhật `CORS_ORIGIN` với URL Netlify
- [ ] Đã restart Render service

## ✅ Testing

- [ ] Frontend load được: https://your-app.netlify.app
- [ ] Không có lỗi trong browser console (F12)
- [ ] API calls hoạt động (test đăng nhập/đăng ký)
- [ ] Không có CORS errors
- [ ] Backend health check: https://your-backend.onrender.com/api/health

## 🎉 Hoàn Thành!

- [ ] Đã lưu các URLs:
  - [ ] Frontend: _______________________
  - [ ] Backend: _______________________
- [ ] Đã test tất cả tính năng chính
- [ ] Đã share URLs với team (nếu có)

---

## 🆘 Nếu Có Lỗi

### Backend không start
- [ ] Kiểm tra logs trong Render dashboard
- [ ] Kiểm tra `PORT=10000`
- [ ] Kiểm tra database connection

### Frontend không kết nối backend
- [ ] Kiểm tra `VITE_API_URL` trong Netlify
- [ ] Kiểm tra CORS settings trong Render
- [ ] Kiểm tra browser console (F12)

### Build failed
- [ ] Kiểm tra build logs
- [ ] Test build local trước
- [ ] Kiểm tra Node version

---

**Xem hướng dẫn chi tiết**: [DEPLOY_NETLIFY_RENDER.md](./DEPLOY_NETLIFY_RENDER.md)

