# ✅ Checklist Deploy Avatar - Production

## 🔧 Cần Sửa Trước Khi Deploy

### 1. Environment Variables (`.env`)

Thêm vào file `.env` trên production server:

```env
# API Base URL - QUAN TRỌNG cho avatar URLs
API_BASE_URL=https://your-api-domain.com

# JWT Secret - PHẢI thay đổi!
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Node Environment
NODE_ENV=production
```

### 2. Kiểm Tra Static Files

Đảm bảo trong `server/src/index.ts` có:

```typescript
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

### 3. Tạo Uploads Directory

Trên production server:

```bash
mkdir -p uploads/avatars
chmod 755 uploads/avatars
```

### 4. CORS (Nếu FE và BE khác domain)

Nếu frontend và backend ở domain khác nhau, cần config CORS:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
  credentials: true,
}));
```

## 🎯 Quick Setup

### Bước 1: Set Environment Variables

```bash
# Trên production server
cd /path/to/your/server
nano .env
```

Thêm:
```env
API_BASE_URL=https://api.yourdomain.com
JWT_SECRET=your-secure-secret-key-here
NODE_ENV=production
```

### Bước 2: Tạo Uploads Folder

```bash
mkdir -p uploads/avatars
chmod 755 uploads/avatars
```

### Bước 3: Restart Server

```bash
pm2 restart all
# hoặc
systemctl restart your-app
```

## ✅ Test Sau Khi Deploy

1. Upload avatar mới
2. Kiểm tra avatar URL trong response
3. Kiểm tra avatar hiển thị trên frontend
4. Refresh page → avatar vẫn hiển thị

## 🚨 Lưu Ý

- **API_BASE_URL** phải là domain thật, không phải localhost
- **JWT_SECRET** phải mạnh và unique
- **uploads/** folder cần backup định kỳ
- Nếu dùng multiple servers, nên dùng cloud storage (S3, Cloudinary)

---

**Tóm lại:** Chỉ cần set `API_BASE_URL` trong `.env` là được! 🎉

