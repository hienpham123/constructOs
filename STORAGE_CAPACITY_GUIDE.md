# 💾 Hướng Dẫn Dung Lượng Storage

## 📊 File Size Limits Hiện Tại

### Trong Code (Multer Limits)

| Loại File | Giới Hạn | File |
|-----------|----------|------|
| **Avatar** | 5MB | `server/src/middleware/upload.ts` |
| **Transaction Attachments** | 10MB | `server/src/middleware/upload.ts` |
| **Message Attachments** | 10MB | `server/src/controllers/*MessageController.ts` |
| **Comment Attachments** | 10MB | `server/src/controllers/*CommentController.ts` |
| **Group Avatar** | 5MB | `server/src/controllers/groupChatController.ts` |

### Supabase Storage Limits

#### Free Tier (Miễn Phí)
- ✅ **1GB storage** tổng cộng
- ✅ **2GB bandwidth** mỗi tháng
- ✅ Không giới hạn số lượng files
- ✅ File size limit: **50MB** mỗi file

#### Pro Tier ($25/tháng)
- ✅ **100GB storage**
- ✅ **200GB bandwidth** mỗi tháng
- ✅ File size limit: **5GB** mỗi file

## 📈 Ước Tính Dung Lượng

### Ví Dụ Tính Toán

**Scenario 1: Nhỏ (Startup)**
- 50 users × 5MB avatar = **250MB**
- 100 transactions × 2 files × 5MB = **1GB**
- 500 messages × 1 file × 2MB = **1GB**
- **Tổng: ~2.25GB** → Cần Pro Tier

**Scenario 2: Vừa (SMB)**
- 200 users × 5MB = **1GB**
- 500 transactions × 3 files × 5MB = **7.5GB**
- 2000 messages × 1 file × 2MB = **4GB**
- **Tổng: ~12.5GB** → Cần Pro Tier

**Scenario 3: Lớn (Enterprise)**
- 1000 users × 5MB = **5GB**
- 5000 transactions × 5 files × 5MB = **125GB**
- 10000 messages × 2 files × 3MB = **60GB**
- **Tổng: ~190GB** → Cần Pro Tier hoặc upgrade

## 🎯 Tối Ưu Dung Lượng

### 1. Compress Images Trước Khi Upload

Thêm image compression vào frontend:

```typescript
// client/src/utils/imageCompression.ts
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original if compression fails
  }
}
```

### 2. Giảm File Size Limits

Có thể giảm limits trong code nếu cần:

```typescript
// server/src/middleware/upload.ts
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Giảm từ 5MB xuống 2MB
  },
  fileFilter,
});
```

### 3. Xóa Files Cũ

Tạo script để xóa files cũ không còn sử dụng:

```typescript
// server/src/scripts/cleanupOldFiles.ts
import { query } from '../config/db.js';
import { deleteFromSupabaseStorage, isSupabaseStorageEnabled } from '../utils/supabaseStorage.js';
import fs from 'fs';
import path from 'path';

// Xóa files cũ hơn 1 năm
async function cleanupOldFiles() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // Lấy danh sách files cũ từ database
  const oldFiles = await query(`
    SELECT file_url FROM transaction_attachments 
    WHERE created_at < ?
  `, [oneYearAgo]);
  
  for (const file of oldFiles) {
    // Xóa từ Supabase Storage hoặc filesystem
    if (isSupabaseStorageEnabled() && file.file_url.startsWith('http')) {
      // Extract filename from URL
      const filename = file.file_url.split('/').pop();
      await deleteFromSupabaseStorage('transactions', filename);
    } else {
      // Delete from filesystem
      const filePath = path.join(process.cwd(), 'uploads', 'transactions', file.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
```

### 4. Sử Dụng CDN/Image Optimization

Supabase Storage tự động có CDN, nhưng có thể thêm image optimization:

```typescript
// Thêm query params để resize images
function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!width && !height) return url;
  
  // Supabase Storage không hỗ trợ resize tự động
  // Cần dùng service như Cloudinary hoặc ImageKit
  // Hoặc resize trên server trước khi upload
  return url;
}
```

## 💰 Chi Phí Supabase Storage

### Free Tier
- ✅ **1GB storage** - Đủ cho project nhỏ
- ✅ **2GB bandwidth/tháng** - Đủ cho ~1000 views/ngày

### Pro Tier ($25/tháng)
- ✅ **100GB storage** - Đủ cho project vừa
- ✅ **200GB bandwidth/tháng** - Đủ cho ~10,000 views/ngày
- ✅ **5GB file size limit**

### Team Tier ($599/tháng)
- ✅ **1TB storage**
- ✅ **2TB bandwidth/tháng**
- ✅ **5GB file size limit**

### Overages (Vượt Quá)
- Storage: **$0.021/GB/tháng**
- Bandwidth: **$0.09/GB**

## 🔍 Cách Kiểm Tra Dung Lượng

### 1. Trong Supabase Dashboard

1. Vào **Storage** → **Buckets**
2. Click vào từng bucket để xem:
   - **Total size** của bucket
   - **Number of files**
   - **Last modified**

### 2. Qua API

```typescript
// server/src/scripts/checkStorageUsage.ts
import { getSupabaseClient } from '../utils/supabaseStorage.js';

async function checkStorageUsage() {
  const client = getSupabaseClient();
  if (!client) return;
  
  const buckets = ['avatars', 'transactions', 'group-messages', 'direct-messages'];
  
  for (const bucket of buckets) {
    const { data, error } = await client.storage.from(bucket).list();
    
    if (error) {
      console.error(`Error listing ${bucket}:`, error);
      continue;
    }
    
    let totalSize = 0;
    for (const file of data) {
      totalSize += file.metadata?.size || 0;
    }
    
    console.log(`${bucket}: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${data.length} files)`);
  }
}
```

## ⚠️ Cảnh Báo Khi Gần Hết Dung Lượng

### Tạo Alert System

```typescript
// server/src/utils/storageMonitor.ts
import { getSupabaseClient } from './supabaseStorage.js';

export async function checkStorageQuota(): Promise<{
  used: number;
  limit: number;
  percentage: number;
  warning: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { used: 0, limit: 0, percentage: 0, warning: false };
  }
  
  // Get storage usage (cần implement API call)
  // Supabase không có API trực tiếp để check quota
  // Cần tính tổng size của tất cả buckets
  
  const buckets = ['avatars', 'transactions', 'comments', 'group-messages', 'direct-messages'];
  let totalSize = 0;
  
  for (const bucket of buckets) {
    const { data } = await client.storage.from(bucket).list();
    for (const file of data || []) {
      totalSize += file.metadata?.size || 0;
    }
  }
  
  const limit = 1024 * 1024 * 1024; // 1GB for free tier
  const percentage = (totalSize / limit) * 100;
  const warning = percentage > 80;
  
  return {
    used: totalSize,
    limit,
    percentage,
    warning,
  };
}
```

## 🚀 Giải Pháp Thay Thế Nếu Vượt Quá Free Tier

### 1. AWS S3
- ✅ **5GB free** (12 tháng đầu)
- ✅ **$0.023/GB/tháng** sau đó
- ✅ Rất ổn định và scalable

### 2. Cloudinary
- ✅ **25GB free storage**
- ✅ **25GB bandwidth/tháng**
- ✅ Image optimization tự động
- ✅ **$99/tháng** cho Pro

### 3. Google Cloud Storage
- ✅ **5GB free** (vĩnh viễn)
- ✅ **$0.020/GB/tháng**
- ✅ Tích hợp tốt với Google services

### 4. Azure Blob Storage
- ✅ **5GB free** (12 tháng đầu)
- ✅ **$0.0184/GB/tháng**
- ✅ Tích hợp tốt với Azure services

## 📝 Khuyến Nghị

### Cho Project Nhỏ (< 1GB)
- ✅ Dùng **Supabase Free Tier** (1GB)
- ✅ Compress images trước khi upload
- ✅ Giới hạn file size: 2-5MB

### Cho Project Vừa (1-50GB)
- ✅ Upgrade lên **Supabase Pro** ($25/tháng)
- ✅ Hoặc migrate sang **AWS S3** (rẻ hơn)
- ✅ Implement cleanup script cho files cũ

### Cho Project Lớn (> 50GB)
- ✅ Dùng **AWS S3** hoặc **Google Cloud Storage**
- ✅ Implement CDN (CloudFront hoặc Cloud CDN)
- ✅ Image optimization service (Cloudinary hoặc ImageKit)
- ✅ Automated cleanup và archiving

## 🔧 Code Example: Thêm Storage Monitoring

Thêm endpoint để check storage usage:

```typescript
// server/src/routes/storageRoutes.ts
import { Router } from 'express';
import { checkStorageQuota } from '../utils/storageMonitor.js';

const router = Router();

router.get('/usage', async (req, res) => {
  try {
    const usage = await checkStorageQuota();
    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: 'Cannot check storage usage' });
  }
});

export default router;
```

## ✅ Checklist

- [ ] Kiểm tra file size limits hiện tại
- [ ] Estimate tổng dung lượng cần thiết
- [ ] Setup Supabase Storage buckets
- [ ] Implement image compression (nếu cần)
- [ ] Setup storage monitoring
- [ ] Tạo cleanup script cho files cũ
- [ ] Plan cho upgrade khi cần

