# 🔐 Environment Variables cho Render Backend

Danh sách đầy đủ các environment variables cần thiết để deploy backend lên Render.

## 📋 Copy & Paste Template

Sử dụng template này để copy vào Render dashboard:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=10000

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=your-database-host-here
DB_PORT=3306
DB_USER=your-database-user-here
DB_PASSWORD=your-database-password-here
DB_NAME=constructOS
DB_CONNECTION_LIMIT=10

# ============================================
# SECURITY
# ============================================
JWT_SECRET=your-jwt-secret-here-generate-with-openssl-rand-base64-32

# ============================================
# API CONFIGURATION
# ============================================
API_BASE_URL=https://constructos-backend.onrender.com
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
```

---

## 📝 Chi Tiết Từng Biến

### 1. NODE_ENV
- **Value**: `production`
- **Secret**: ❌ No
- **Mô tả**: Môi trường chạy (production)

### 2. PORT
- **Value**: `10000`
- **Secret**: ❌ No
- **Mô tả**: ⚠️ **QUAN TRỌNG**: Render sử dụng port 10000, không đổi!

### 3. DB_HOST
- **Value**: Host của database
- **Secret**: ❌ No
- **Ví dụ**: 
  - PlanetScale: `aws.connect.psdb.cloud`
  - Railway: `containers-us-west-xxx.railway.app`
  - Custom MySQL: `your-mysql-host.com`

### 4. DB_PORT
- **Value**: `3306`
- **Secret**: ❌ No
- **Mô tả**: Port MySQL (thường là 3306)

### 5. DB_USER
- **Value**: Username database
- **Secret**: ❌ No
- **Ví dụ**: `constructos_user` hoặc username từ database service

### 6. DB_PASSWORD
- **Value**: Password database
- **Secret**: ✅ **YES - Mark as Secret!**
- **Mô tả**: Mật khẩu database, **PHẢI đánh dấu Secret**

### 7. DB_NAME
- **Value**: `constructOS`
- **Secret**: ❌ No
- **Mô tả**: Tên database

### 8. DB_CONNECTION_LIMIT
- **Value**: `10`
- **Secret**: ❌ No
- **Mô tả**: Số connection tối đa

### 9. JWT_SECRET
- **Value**: Random string (32+ characters)
- **Secret**: ✅ **YES - Mark as Secret!**
- **Cách tạo**:
  ```bash
  openssl rand -base64 32
  ```
- **Mô tả**: Secret key cho JWT tokens, **PHẢI đánh dấu Secret**

### 10. API_BASE_URL
- **Value**: URL của Render service
- **Secret**: ❌ No
- **Ví dụ**: `https://constructos-backend.onrender.com`
- **Mô tả**: URL backend (cập nhật sau khi deploy)

### 11. FRONTEND_URL
- **Value**: URL frontend (Netlify)
- **Secret**: ❌ No
- **Ví dụ**: `https://constructos.netlify.app`
- **Mô tả**: URL frontend (set sau khi deploy frontend)

### 12. CORS_ORIGIN
- **Value**: URL frontend (Netlify)
- **Secret**: ❌ No
- **Ví dụ**: `https://constructos.netlify.app`
- **Mô tả**: URL frontend cho CORS (set sau khi deploy frontend)

---

## 🔒 Biến Cần Đánh Dấu Secret

⚠️ **QUAN TRỌNG**: Các biến sau **PHẢI** được đánh dấu "Secret" trong Render:

- ✅ `DB_PASSWORD`
- ✅ `JWT_SECRET`

**Cách đánh dấu Secret**:
1. Trong Render dashboard → Environment Variables
2. Click vào biến
3. Check box **"Mark as Secret"**
4. Save

---

## 📝 Ví Dụ Với PlanetScale

Nếu bạn dùng PlanetScale MySQL:

```env
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your-planetscale-user
DB_PASSWORD=your-planetscale-password
DB_NAME=constructOS
```

Lấy thông tin từ PlanetScale dashboard → Database → Connection strings

---

## 📝 Ví Dụ Với Railway MySQL

Nếu bạn dùng Railway MySQL:

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
```

Lấy thông tin từ Railway dashboard → Database → Variables

---

## ✅ Checklist

Trước khi deploy, đảm bảo:

- [ ] Tất cả biến đã được set
- [ ] `DB_PASSWORD` đã được mark as Secret
- [ ] `JWT_SECRET` đã được mark as Secret
- [ ] `PORT=10000` (không đổi!)
- [ ] `API_BASE_URL` sẽ được cập nhật sau khi deploy
- [ ] `FRONTEND_URL` và `CORS_ORIGIN` sẽ được set sau khi deploy frontend

---

**Lưu ý**: Sau khi deploy thành công, quay lại cập nhật `API_BASE_URL` với URL thực tế của Render service.

