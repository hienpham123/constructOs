# 🚀 Deploy ConstructOS lên Netlify (Frontend) và Render (Backend)

Hướng dẫn chi tiết để deploy frontend lên Netlify và backend lên Render.

## 📋 Tổng Quan

- **Frontend**: Deploy lên Netlify (miễn phí, CDN toàn cầu)
- **Backend**: Deploy lên Render (miễn phí tier có sẵn)
- **Database**: Có thể dùng Render PostgreSQL hoặc MySQL external (PlanetScale, Railway, AWS RDS)

## 🎯 Kiến Trúc

```
┌─────────────────────────────────┐
│   Frontend (Netlify)            │
│   https://your-app.netlify.app  │
└──────────────┬──────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────┐
│   Backend (Render)              │
│   https://your-api.onrender.com │
└──────────────┬──────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────┐
│   Database (Render/External)    │
│   MySQL hoặc PostgreSQL         │
└─────────────────────────────────┘
```

---

## 📦 PHẦN 1: Deploy Backend lên Render

### Bước 1: Chuẩn Bị Database

Render cung cấp PostgreSQL miễn phí, nhưng dự án đang dùng MySQL. Bạn có 2 lựa chọn:

#### Option A: Dùng Render PostgreSQL (Khuyến nghị - Miễn phí)

Cần migrate database từ MySQL sang PostgreSQL (hoặc dùng PostgreSQL từ đầu).

#### Option B: Dùng MySQL External (Giữ nguyên MySQL)

Các dịch vụ MySQL miễn phí:
- **PlanetScale** (https://planetscale.com) - MySQL miễn phí
- **Railway** (https://railway.app) - MySQL miễn phí
- **AWS RDS** - Có free tier
- **Clever Cloud** - MySQL miễn phí

**Hướng dẫn dùng PlanetScale (Khuyến nghị):**

1. Đăng ký tại https://planetscale.com
2. Tạo database mới
3. Lấy connection string từ dashboard
4. Import schema:
   ```bash
   # Convert MySQL schema sang PlanetScale (thường tương thích)
   # Hoặc dùng PlanetScale CLI
   ```

### Bước 2: Tạo Service trên Render

1. Đăng nhập vào https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect repository GitHub/GitLab của bạn
4. Cấu hình như sau:

   **Name**: `constructos-backend`
   
   **Environment**: `Node`
   
   **Region**: Chọn region gần bạn (Singapore, Oregon, Frankfurt)
   
   **Branch**: `main` (hoặc branch bạn muốn deploy)
   
   **Root Directory**: `server` (quan trọng!)
   
   **Build Command**: 
   ```bash
   npm install && npm run build
   ```
   
   **Start Command**:
   ```bash
   npm start
   ```
   
   **Plan**: Chọn `Starter` (free tier có giới hạn)

### Bước 3: Cấu Hình Environment Variables

Trong Render dashboard, vào **Environment** tab và thêm các biến sau:

```env
NODE_ENV=production
PORT=10000
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=constructOS
DB_CONNECTION_LIMIT=10
JWT_SECRET=your-super-secret-jwt-key-generate-with-openssl-rand-base64-32
API_BASE_URL=https://your-backend-name.onrender.com
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
```

**Lưu ý quan trọng**:
- `PORT` phải là `10000` (Render tự động set port này)
- `JWT_SECRET`: Tạo bằng `openssl rand -base64 32`
- `API_BASE_URL`: Sẽ là URL của Render service (ví dụ: `https://constructos-backend.onrender.com`)
- `FRONTEND_URL` và `CORS_ORIGIN`: Sẽ là URL Netlify (set sau khi deploy frontend)

### Bước 4: Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động build và deploy
3. Đợi deploy hoàn thành (5-10 phút lần đầu)
4. Copy URL của service (ví dụ: `https://constructos-backend.onrender.com`)

### Bước 5: Import Database Schema

Sau khi database đã setup, import schema:

```bash
# Nếu dùng PlanetScale
pscale connect constructOS --execute "source database/mysql_schema.sql"

# Nếu dùng MySQL external khác
mysql -h your-host -u your-user -p constructOS < database/mysql_schema.sql
```

### Bước 6: Kiểm Tra Backend

```bash
# Test health endpoint
curl https://your-backend-name.onrender.com/api/health

# Kết quả mong đợi:
# {"status":"ok","message":"Server is running"}
```

---

## 🌐 PHẦN 2: Deploy Frontend lên Netlify

### Bước 1: Tạo Site trên Netlify

1. Đăng nhập vào https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect repository GitHub/GitLab của bạn
4. Cấu hình build settings:

   **Base directory**: `client`
   
   **Build command**: `npm run build`
   
   **Publish directory**: `client/dist`
   
   **Node version**: `20` (hoặc version bạn đang dùng)

### Bước 2: Cấu Hình Environment Variables

Trong Netlify dashboard, vào **Site settings** → **Environment variables** và thêm:

```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Lưu ý**: Thay `your-backend-name.onrender.com` bằng URL backend thực tế từ Render.

### Bước 3: Deploy

1. Click **"Deploy site"**
2. Netlify sẽ tự động build và deploy
3. Đợi deploy hoàn thành (3-5 phút)
4. Copy URL của site (ví dụ: `https://constructos.netlify.app`)

### Bước 4: Cập Nhật CORS trên Backend

Sau khi có URL Netlify, quay lại Render và cập nhật:

```env
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
```

Sau đó restart service trên Render.

### Bước 5: Kiểm Tra Frontend

1. Mở URL Netlify trong browser
2. Kiểm tra console (F12) xem có lỗi CORS không
3. Thử đăng nhập/đăng ký

---

## 🔧 Cấu Hình Bổ Sung

### Custom Domain (Optional)

#### Netlify:
1. Vào **Domain settings** → **Add custom domain**
2. Thêm domain của bạn
3. Follow hướng dẫn để cấu hình DNS
4. Netlify tự động cài SSL

#### Render:
1. Vào **Settings** → **Custom Domains**
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn
4. Render tự động cài SSL

### File Uploads

Render không lưu trữ files persistent. Cần dùng external storage:

**Option 1: Cloudinary** (Miễn phí)
```bash
npm install cloudinary
```

**Option 2: AWS S3** (Có free tier)

**Option 3: Netlify Blobs** (Miễn phí)

Cập nhật code backend để upload lên cloud storage thay vì local filesystem.

### WebSocket (Socket.io)

Render hỗ trợ WebSocket, nhưng cần cấu hình:

1. Trong Render dashboard, enable **WebSocket** trong service settings
2. Cập nhật frontend để connect tới Render WebSocket URL

---

## 📊 Monitoring & Logs

### Render Logs
- Vào service dashboard → **Logs** tab
- Xem real-time logs

### Netlify Logs
- Vào site dashboard → **Functions** → **Logs**
- Hoặc **Deploys** → Click vào deploy → Xem build logs

---

## 🔄 Update Code

### Backend (Render)
- Push code lên GitHub/GitLab
- Render tự động detect và deploy
- Hoặc manual trigger từ dashboard

### Frontend (Netlify)
- Push code lên GitHub/GitLab
- Netlify tự động detect và deploy
- Hoặc manual trigger từ dashboard

---

## 🆘 Troubleshooting

### Backend không start được

**Lỗi**: `Port already in use`

**Giải pháp**: Đảm bảo `PORT=10000` trong environment variables

**Lỗi**: `Database connection error`

**Giải pháp**: 
- Kiểm tra database credentials
- Kiểm tra database có cho phép connection từ Render IP
- Với PlanetScale: Kiểm tra connection string

### Frontend không kết nối được Backend

**Lỗi**: CORS error

**Giải pháp**:
- Kiểm tra `CORS_ORIGIN` trong Render có đúng URL Netlify không
- Kiểm tra `VITE_API_URL` trong Netlify có đúng URL Render không

**Lỗi**: 404 khi navigate

**Giải pháp**: File `netlify.toml` đã có redirect rule cho SPA, đảm bảo file này được commit

### Build Failed

**Frontend build failed**:
- Kiểm tra Node version trong Netlify
- Kiểm tra build logs trong Netlify dashboard
- Test build local: `cd client && npm run build`

**Backend build failed**:
- Kiểm tra TypeScript errors
- Kiểm tra build logs trong Render dashboard
- Test build local: `cd server && npm run build`

---

## 💰 Chi Phí

### Netlify Free Tier
- ✅ 100GB bandwidth/tháng
- ✅ 300 build minutes/tháng
- ✅ Unlimited sites
- ✅ SSL tự động
- ✅ CDN toàn cầu

### Render Free Tier
- ✅ 750 hours/tháng (đủ cho 1 service chạy 24/7)
- ⚠️ Service sẽ sleep sau 15 phút không có traffic (wake up mất ~30s)
- ✅ SSL tự động
- ⚠️ Database: PostgreSQL free, MySQL cần external

**Lưu ý**: Render free tier có thể sleep, nên lần đầu truy cập sau khi sleep sẽ mất ~30s để wake up.

---

## ✅ Checklist

### Backend (Render)
- [ ] Đã tạo Render account
- [ ] Đã tạo Web Service
- [ ] Đã setup database (PlanetScale hoặc external)
- [ ] Đã cấu hình tất cả environment variables
- [ ] Đã import database schema
- [ ] Backend đã deploy thành công
- [ ] Health check endpoint hoạt động

### Frontend (Netlify)
- [ ] Đã tạo Netlify account
- [ ] Đã connect repository
- [ ] Đã cấu hình build settings
- [ ] Đã set `VITE_API_URL` environment variable
- [ ] Frontend đã deploy thành công
- [ ] Đã cập nhật CORS trên backend

### Testing
- [ ] Frontend load được
- [ ] API calls hoạt động
- [ ] Đăng nhập/đăng ký hoạt động
- [ ] Không có CORS errors
- [ ] File uploads hoạt động (nếu đã setup cloud storage)

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả các bước:

- **Frontend**: https://your-app.netlify.app
- **Backend API**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/api/health

**Chúc bạn deploy thành công! 🚀**

