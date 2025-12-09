# 🔧 Fix: Ảnh Upload Bị Mất Trên Render

## ❌ Vấn Đề

Khi upload ảnh lên Render, sau một thời gian (khi server restart), ảnh không còn xem được nữa.

**Nguyên nhân:**
- Trên Render, filesystem là **ephemeral** (tạm thời)
- Files trong thư mục `uploads/` sẽ **bị mất** khi:
  - Server restart
  - Server deploy lại
  - Server idle và bị sleep
  - Sau một khoảng thời gian nhất định

## ✅ Giải Pháp

Có 3 giải pháp chính:

### 1. Supabase Storage (Khuyến nghị) ⭐

**Ưu điểm:**
- ✅ Đã có Supabase setup sẵn cho database
- ✅ Free tier: 1GB storage
- ✅ Dễ tích hợp
- ✅ CDN tự động
- ✅ Files tồn tại vĩnh viễn

**Nhược điểm:**
- Cần migrate code

### 2. AWS S3

**Ưu điểm:**
- ✅ Rất ổn định
- ✅ Scalable
- ✅ CDN (CloudFront)

**Nhược điểm:**
- Cần setup AWS account
- Có thể tốn phí khi scale

### 3. Cloudinary

**Ưu điểm:**
- ✅ Free tier: 25GB storage
- ✅ Image optimization tự động
- ✅ Dễ sử dụng

**Nhược điểm:**
- Cần thêm service

## 🚀 Hướng Dẫn Migrate Sang Supabase Storage

### Bước 1: Setup Supabase Storage

1. **Vào Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Tạo Storage Buckets**
   - Vào **Storage** → **Buckets**
   - Tạo các buckets sau:
     - `avatars` (public)
     - `transactions` (public)
     - `comments` (public)
     - `purchase-request-comments` (public)
     - `group-avatars` (public)
     - `group-messages` (public)
     - `direct-messages` (public)

3. **Lấy Supabase Credentials**
   - Vào **Settings** → **API**
   - Copy:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY` (hoặc `SUPABASE_SERVICE_ROLE_KEY` cho server-side)

### Bước 2: Cài Đặt Package

```bash
cd server
npm install @supabase/supabase-js
```

### Bước 3: Thêm Environment Variables

Trên Render, thêm các biến sau:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 4: Update Code

Code đã được update để sử dụng Supabase Storage. Xem file:
- `server/src/utils/supabaseStorage.ts` - Helper functions
- `server/src/middleware/upload.ts` - Updated upload middleware

### Bước 5: Test

1. Upload một ảnh mới
2. Kiểm tra ảnh có trong Supabase Storage
3. Kiểm tra URL ảnh có hoạt động không

## 📝 Lưu Ý

### Files Cũ

Files đã upload trước khi migrate sẽ vẫn dùng URL cũ (local filesystem). Có 2 cách xử lý:

1. **Giữ nguyên** - Files cũ sẽ mất khi server restart
2. **Migrate files cũ** - Upload lại files cũ lên Supabase Storage (cần script migration)

### URL Format

Sau khi migrate, URL sẽ thay đổi từ:
```
https://constructos-backend.onrender.com/uploads/avatars/abc123.jpg
```

Thành:
```
https://xxxxx.supabase.co/storage/v1/object/public/avatars/abc123.jpg
```

## 🔄 Rollback

Nếu muốn quay lại filesystem storage:
1. Xóa environment variables `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`
2. Code sẽ tự động fallback về filesystem storage

## ⚠️ Quan Trọng

- **Backup database** trước khi migrate
- **Test kỹ** trên staging trước khi deploy production
- **Monitor** storage usage trên Supabase dashboard

