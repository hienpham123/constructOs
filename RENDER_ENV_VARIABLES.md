# 🔧 Environment Variables cho Render (Dev - PostgreSQL)

Hướng dẫn cấu hình biến môi trường trên Render để deploy backend với PostgreSQL (Supabase).

## ✅ Các Biến Môi Trường Cần Thiết

### 1. Database Configuration (PostgreSQL - Supabase)

```env
# Database Type (optional - auto-detect nếu không set)
DB_TYPE=postgres

# Supabase Database Connection
DB_HOST=db.xxxxx.supabase.co
# Hoặc nếu dùng Session Pooler (khuyến nghị):
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com

DB_PORT=5432
# Hoặc nếu dùng Session Pooler:
DB_PORT=6543

DB_USER=postgres
# Hoặc nếu dùng Session Pooler:
DB_USER=postgres.xxxxx

DB_PASSWORD=your-supabase-password
DB_NAME=postgres

# SSL Configuration (bắt buộc cho Supabase)
DB_SSL=true

# Connection Pool
DB_CONNECTION_LIMIT=10
```

### 2. Server Configuration

```env
# Port (Render tự động set, nhưng có thể override)
PORT=10000

# Node Environment (QUAN TRỌNG: không được là 'production')
NODE_ENV=development
# Hoặc
NODE_ENV=staging

# API Base URL (cho avatar URLs và CORS)
API_BASE_URL=https://constructos-backend.onrender.com

# Frontend URL (cho CORS)
FRONTEND_URL=https://your-frontend.netlify.app
CORS_ORIGIN=https://your-frontend.netlify.app
```

### 3. Security

```env
# JWT Secret (PHẢI thay đổi từ default!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this
```

## 🎯 Logic Auto-Detect Database

Code sẽ tự động chọn PostgreSQL nếu:

1. ✅ **DB_TYPE=postgres** (explicit override)
2. ✅ **DB_PORT=5432** hoặc **6543** (PostgreSQL ports)
3. ✅ **DB_HOST** chứa `supabase`, `render`, hoặc `railway`
4. ✅ **NODE_ENV** không phải `production` (production sẽ dùng MySQL)

## 📋 Checklist Setup trên Render

### Bước 1: Vào Render Dashboard
1. Vào project backend của bạn trên Render
2. Click **"Environment"** tab

### Bước 2: Thêm Database Variables

Thêm các biến sau (thay giá trị bằng thông tin Supabase của bạn):

```
Key: DB_TYPE
Value: postgres
```

```
Key: DB_HOST
Value: db.xxxxx.supabase.co
# Hoặc Session Pooler: aws-0-ap-southeast-1.pooler.supabase.com
```

```
Key: DB_PORT
Value: 5432
# Hoặc Session Pooler: 6543
```

```
Key: DB_USER
Value: postgres
# Hoặc Session Pooler: postgres.xxxxx
```

```
Key: DB_PASSWORD
Value: [your-supabase-password]
```

```
Key: DB_NAME
Value: postgres
```

```
Key: DB_SSL
Value: true
```

```
Key: DB_CONNECTION_LIMIT
Value: 10
```

### Bước 3: Thêm Server Variables

```
Key: NODE_ENV
Value: development
# HOẶC staging (KHÔNG được là 'production')
```

```
Key: API_BASE_URL
Value: https://constructos-backend.onrender.com
```

```
Key: FRONTEND_URL
Value: https://your-frontend.netlify.app
```

```
Key: CORS_ORIGIN
Value: https://your-frontend.netlify.app
```

```
Key: JWT_SECRET
Value: [your-secure-jwt-secret-min-32-chars]
```

### Bước 4: Kiểm Tra

Sau khi thêm tất cả biến, server sẽ:
- ✅ Tự động detect PostgreSQL
- ✅ Log: `📦 Using PostgreSQL database`
- ✅ Kết nối đến Supabase

## ⚠️ Lưu Ý Quan Trọng

1. **NODE_ENV**: 
   - ✅ `development` hoặc `staging` → PostgreSQL
   - ❌ `production` → MySQL (sẽ không dùng Supabase)

2. **DB_HOST với Session Pooler**:
   - Nếu dùng Session Pooler (port 6543), DB_HOST sẽ khác
   - Format: `aws-0-[region].pooler.supabase.com`
   - DB_USER: `postgres.[project-ref]`

3. **DB_SSL**: 
   - Phải là `true` cho Supabase
   - Không được là `false` hoặc bỏ trống

4. **Port**:
   - Render tự động set PORT, không cần config
   - Nhưng có thể override nếu cần

## 🧪 Test Sau Khi Deploy

1. Xem logs trên Render → sẽ thấy:
   ```
   📦 Using PostgreSQL database
      Environment: development
   ✅ Database connection successful
   ```

2. Test API endpoint:
   ```bash
   curl https://constructos-backend.onrender.com/api/health
   ```

3. Test đăng ký user → sẽ tự động gán role `construction_department`

## 📝 Tóm Tắt

**Minimum Required Variables:**
- `DB_HOST` (chứa 'supabase')
- `DB_PORT` (5432 hoặc 6543)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (postgres)
- `DB_SSL` (true)
- `NODE_ENV` (development hoặc staging)
- `API_BASE_URL`
- `JWT_SECRET`

**Optional:**
- `DB_TYPE=postgres` (để chắc chắn)
- `DB_CONNECTION_LIMIT` (default: 10)
- `FRONTEND_URL` và `CORS_ORIGIN` (cho CORS)

---

**Sau khi set xong, Render sẽ tự động rebuild và deploy với PostgreSQL!** 🚀
