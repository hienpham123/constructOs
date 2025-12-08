# 🚀 Hướng Dẫn Deploy Backend lên Render - Từng Bước Chi Tiết

Hướng dẫn chi tiết từng bước để deploy backend ConstructOS lên Render.

## 📋 Chuẩn Bị Trước

- [ ] Đã có tài khoản GitHub/GitLab (để connect repository)
- [ ] Code đã được push lên repository
- [ ] Đã test build local thành công: `cd server && npm run build`
- [ ] Đã có database (PlanetScale, Railway, hoặc MySQL external)

---

## 🎯 BƯỚC 1: Đăng Ký/Đăng Nhập Render

1. Truy cập: https://render.com
2. Click **"Get Started for Free"** hoặc **"Sign In"**
3. Đăng nhập bằng GitHub/GitLab (khuyến nghị) hoặc email

---

## 🎯 BƯỚC 2: Tạo Web Service

1. Sau khi đăng nhập, bạn sẽ thấy Dashboard
2. Click nút **"New +"** ở góc trên bên trái
3. Chọn **"Web Service"**

---

## 🎯 BƯỚC 3: Connect Repository

1. Render sẽ hỏi bạn connect repository
2. Chọn **GitHub** hoặc **GitLab**
3. Authorize Render để truy cập repositories
4. Chọn repository chứa code ConstructOS
5. Click **"Connect"**

---

## 🎯 BƯỚC 4: Cấu Hình Service

Sau khi connect repository, bạn sẽ thấy form cấu hình:

### 4.1. Basic Settings

**Name**: 
```
constructos-backend
```
(hoặc tên bạn muốn)

**Region**: 
Chọn region gần bạn nhất:
- `Singapore` (cho Việt Nam - khuyến nghị)
- `Oregon` (US West)
- `Frankfurt` (Europe)

**Branch**: 
```
main
```
(hoặc branch bạn muốn deploy)

**Root Directory**: 
```
server
```
⚠️ **QUAN TRỌNG**: Phải là `server` vì code backend nằm trong thư mục này!

**Runtime**: 
```
Node
```
(hoặc để Render tự detect)

**Build Command**: 
```bash
npm install && npm run build
```

**Start Command**: 
```bash
npm start
```

**Plan**: 
Chọn **"Starter"** (Free tier - đủ cho development)

---

## 🎯 BƯỚC 5: Cấu Hình Environment Variables

Scroll xuống phần **"Environment Variables"** và thêm các biến sau:

### 5.1. Server Configuration

| Key | Value | Ghi Chú |
|-----|-------|---------|
| `NODE_ENV` | `production` | Môi trường production |
| `PORT` | `10000` | ⚠️ **QUAN TRỌNG**: Render dùng port 10000 |

### 5.2. Database Configuration

| Key | Value | Ghi Chú |
|-----|-------|---------|
| `DB_HOST` | `<your-db-host>` | Host của database (ví dụ: `aws.connect.psdb.cloud`) |
| `DB_PORT` | `3306` | Port MySQL (thường là 3306) |
| `DB_USER` | `<your-db-user>` | Username database |
| `DB_PASSWORD` | `<your-db-password>` | ⚠️ **Mark as Secret** |
| `DB_NAME` | `constructOS` | Tên database |
| `DB_CONNECTION_LIMIT` | `10` | Số connection tối đa |

**Lưu ý**: 
- Thay `<your-db-host>`, `<your-db-user>`, `<your-db-password>` bằng thông tin thực tế
- Click checkbox **"Mark as Secret"** cho `DB_PASSWORD`

### 5.3. Security Configuration

| Key | Value | Ghi Chú |
|-----|-------|---------|
| `JWT_SECRET` | `<generate-secret>` | ⚠️ **Mark as Secret** |

**Tạo JWT_SECRET**:
```bash
# Chạy lệnh này trong terminal để tạo secret
openssl rand -base64 32
```

Copy kết quả và paste vào `JWT_SECRET`, **đánh dấu Secret**.

### 5.4. API Configuration

| Key | Value | Ghi Chú |
|-----|-------|---------|
| `API_BASE_URL` | `https://constructos-backend.onrender.com` | ⚠️ Thay bằng URL thực tế sau khi deploy |
| `FRONTEND_URL` | `https://your-app.netlify.app` | URL frontend (set sau khi deploy frontend) |
| `CORS_ORIGIN` | `https://your-app.netlify.app` | URL frontend cho CORS (set sau) |

**Lưu ý**: 
- `API_BASE_URL` sẽ là URL của Render service (ví dụ: `https://constructos-backend.onrender.com`)
- `FRONTEND_URL` và `CORS_ORIGIN` sẽ set sau khi deploy frontend

---

## 🎯 BƯỚC 6: Advanced Settings (Optional)

### 6.1. Health Check Path

Trong phần **"Advanced"**, tìm **"Health Check Path"**:
```
/api/health
```

### 6.2. Auto-Deploy

Đảm bảo **"Auto-Deploy"** được bật (mặc định là bật):
- ✅ **Auto-Deploy**: `Yes` - Tự động deploy khi có commit mới

---

## 🎯 BƯỚC 7: Deploy

1. Kiểm tra lại tất cả cấu hình
2. Click nút **"Create Web Service"** ở cuối trang
3. Render sẽ bắt đầu build và deploy
4. Bạn sẽ thấy logs real-time của quá trình build

---

## 🎯 BƯỚC 8: Chờ Deploy Hoàn Thành

1. Quá trình build sẽ mất **5-10 phút** lần đầu
2. Bạn sẽ thấy logs:
   - Installing dependencies
   - Building TypeScript
   - Starting server
3. Khi thấy **"Your service is live"** → Deploy thành công!

---

## 🎯 BƯỚC 9: Lấy URL và Test

1. Sau khi deploy thành công, bạn sẽ thấy URL của service
   - Ví dụ: `https://constructos-backend.onrender.com`
2. Copy URL này
3. Test health endpoint:
   ```bash
   curl https://constructos-backend.onrender.com/api/health
   ```
   
   Kết quả mong đợi:
   ```json
   {"status":"ok","message":"Server is running"}
   ```

---

## 🎯 BƯỚC 10: Cập Nhật API_BASE_URL

1. Quay lại Render dashboard
2. Vào service → **"Environment"** tab
3. Tìm `API_BASE_URL`
4. Cập nhật với URL thực tế của service
5. Click **"Save Changes"**
6. Service sẽ tự động restart

---

## ✅ Checklist Sau Khi Deploy

- [ ] Service đã deploy thành công
- [ ] Health check endpoint hoạt động: `/api/health`
- [ ] Tất cả environment variables đã được set
- [ ] Database connection thành công (kiểm tra logs)
- [ ] Đã copy URL backend để dùng cho frontend

---

## 🆘 Troubleshooting

### Lỗi: Build Failed

**Nguyên nhân**: TypeScript errors hoặc missing dependencies

**Giải pháp**:
1. Kiểm tra build logs trong Render dashboard
2. Test build local:
   ```bash
   cd server
   npm install
   npm run build
   ```
3. Fix errors và push lại code

### Lỗi: Cannot connect to database

**Nguyên nhân**: Sai database credentials hoặc database không cho phép connection từ Render IP

**Giải pháp**:
1. Kiểm tra database credentials trong Environment Variables
2. Với PlanetScale: Đảm bảo database đã được tạo và connection string đúng
3. Với MySQL external: Kiểm tra firewall/security groups cho phép connection từ Render

### Lỗi: Port already in use

**Nguyên nhân**: PORT không phải 10000

**Giải pháp**:
- Đảm bảo `PORT=10000` trong Environment Variables

### Lỗi: Service keeps restarting

**Nguyên nhân**: Code crash hoặc database connection failed

**Giải pháp**:
1. Xem logs trong Render dashboard
2. Kiểm tra database connection
3. Kiểm tra tất cả environment variables

---

## 📊 Xem Logs

1. Vào Render dashboard
2. Click vào service `constructos-backend`
3. Tab **"Logs"** → Xem real-time logs
4. Tab **"Events"** → Xem deployment history

---

## 🔄 Update Code

Sau khi deploy, mỗi khi push code lên repository:
1. Render tự động detect changes
2. Tự động build và deploy
3. Bạn có thể xem progress trong dashboard

Hoặc manual trigger:
1. Vào service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎉 Hoàn Thành!

Backend đã được deploy thành công lên Render!

**URL Backend**: `https://constructos-backend.onrender.com` (hoặc URL của bạn)

**Bước tiếp theo**: 
- Deploy frontend lên Netlify (xem `DEPLOY_NETLIFY_RENDER.md`)
- Cập nhật `FRONTEND_URL` và `CORS_ORIGIN` sau khi có frontend URL

---

**Chúc bạn deploy thành công! 🚀**

