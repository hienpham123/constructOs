# 🚀 Hướng Dẫn Deploy Avatar - Production

## ⚠️ Các Vấn Đề Cần Sửa Khi Deploy

### 1. Avatar URL - Quan Trọng Nhất!

**Vấn đề:** Hiện tại avatar URL đang hardcode `localhost:2222`

**File cần sửa:** `server/src/middleware/upload.ts`

```typescript
// ❌ Hiện tại (Development)
export const getAvatarUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:2222';
  return `${baseUrl}/uploads/avatars/${filename}`;
};
```

**Giải pháp:** Thêm environment variable

```typescript
// ✅ Production
export const getAvatarUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  // Sử dụng environment variable
  const baseUrl = process.env.API_BASE_URL || process.env.SERVER_URL || 'http://localhost:2222';
  return `${baseUrl}/uploads/avatars/${filename}`;
};
```

### 2. Environment Variables

**File:** `.env` (production)

```env
# Server
PORT=2222
NODE_ENV=production

# API Base URL (cho avatar URLs)
API_BASE_URL=https://your-api-domain.com
# Hoặc
SERVER_URL=https://your-api-domain.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=constructos_user
DB_PASSWORD=your-secure-password
DB_NAME=constructos
DB_CONNECTION_LIMIT=10

# JWT Secret (QUAN TRỌNG - phải thay đổi!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Static Files Serving

**File:** `server/src/index.ts`

Đảm bảo static files được serve đúng:

```typescript
// Serve static files (avatars)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

**Lưu ý:**
- Trong production, có thể cần reverse proxy (nginx) để serve static files
- Hoặc dùng CDN/Cloud Storage (khuyến nghị)

### 4. Uploads Directory

**Đảm bảo:**
- Thư mục `server/uploads/avatars/` tồn tại trên server
- Có quyền write cho Node.js process
- Backup định kỳ (hoặc dùng cloud storage)

### 5. CORS Settings (Nếu FE và BE khác domain)

**File:** `server/src/index.ts`

```typescript
// Development
app.use(cors());

// Production - nên chỉ định domain cụ thể
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:2025',
  credentials: true,
}));
```

## 🎯 Các Tùy Chọn Deploy

### Option 1: Local Storage (Đơn Giản)

**Ưu điểm:**
- Dễ setup
- Không cần service bên ngoài

**Nhược điểm:**
- Khó scale
- Cần backup thủ công
- Không tốt cho multiple servers

**Cần làm:**
1. Set `API_BASE_URL` trong `.env`
2. Đảm bảo `uploads/` folder có quyền write
3. Setup backup cho `uploads/` folder

### Option 2: Cloud Storage (Khuyến Nghị) ⭐

**Sử dụng:** AWS S3, Google Cloud Storage, Cloudinary, etc.

**Ưu điểm:**
- Scale tốt
- CDN tự động
- Backup tự động
- Hoạt động với multiple servers

**Cần làm:**
1. Tạo account cloud storage
2. Cài package (ví dụ: `aws-sdk`, `@aws-sdk/client-s3`)
3. Sửa `upload.ts` để upload lên cloud
4. Sửa `getAvatarUrl()` để trả về cloud URL

## 📝 Checklist Deploy

### Trước Khi Deploy:
- [ ] Set `API_BASE_URL` trong `.env`
- [ ] Set `JWT_SECRET` mạnh (không dùng default)
- [ ] Set `NODE_ENV=production`
- [ ] Kiểm tra database connection
- [ ] Tạo thư mục `uploads/avatars/` trên server
- [ ] Set quyền write cho `uploads/` folder

### Sau Khi Deploy:
- [ ] Test upload avatar
- [ ] Kiểm tra avatar URL trả về đúng
- [ ] Test hiển thị avatar trên frontend
- [ ] Kiểm tra CORS nếu FE/BE khác domain

## 🔧 Quick Fix Cho Production

### 1. Sửa `server/src/middleware/upload.ts`:

```typescript
export const getAvatarUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // Production: dùng environment variable
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://your-api-domain.com' 
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/avatars/${filename}`;
};
```

### 2. Thêm vào `.env` (production):

```env
API_BASE_URL=https://api.yourdomain.com
```

### 3. Nếu dùng Reverse Proxy (nginx):

```nginx
# Serve static files
location /uploads {
    alias /path/to/your/server/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 Lưu Ý Quan Trọng

1. **Avatar URL phải là absolute URL** trong production
2. **CORS** phải được config đúng nếu FE/BE khác domain
3. **File size limit** - đảm bảo server có thể handle 5MB files
4. **Backup** - backup `uploads/` folder định kỳ
5. **Security** - không cho phép upload file không phải ảnh

---

**Tóm lại:** Chủ yếu cần sửa `API_BASE_URL` trong environment variable để avatar URL đúng trong production!

