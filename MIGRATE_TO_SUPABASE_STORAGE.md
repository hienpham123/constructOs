# 🔄 Hướng Dẫn Migrate Sang Supabase Storage

## ✅ Đã Hoàn Thành

1. ✅ Tạo Supabase Storage utility (`server/src/utils/supabaseStorage.ts`)
2. ✅ Update upload middleware để hỗ trợ Supabase Storage
3. ✅ Update `userController.ts` để sử dụng Supabase Storage cho avatar
4. ✅ Thêm `@supabase/supabase-js` vào `package.json`

## 📋 Các Bước Tiếp Theo

### Bước 1: Cài Đặt Package

```bash
cd server
npm install
```

### Bước 2: Setup Supabase Storage

1. **Vào Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Tạo Storage Buckets**
   - Vào **Storage** → **Buckets**
   - Tạo các buckets sau (tất cả đều **public**):
     - `avatars`
     - `transactions`
     - `comments`
     - `purchase-request-comments`
     - `group-avatars`
     - `group-messages`
     - `direct-messages`

3. **Lấy Supabase Credentials**
   - Vào **Settings** → **API**
   - Copy:
     - `SUPABASE_URL` (ví dụ: `https://xxxxx.supabase.co`)
     - `SUPABASE_SERVICE_ROLE_KEY` (key dài, bắt đầu với `eyJ...`)

### Bước 3: Thêm Environment Variables trên Render

Trên Render dashboard, thêm các biến sau:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lưu ý:** 
- `SUPABASE_SERVICE_ROLE_KEY` là **service role key**, không phải anon key
- Service role key có quyền cao hơn, cần để upload files từ server

### Bước 4: Update Các Controllers Còn Lại

Các controllers sau cần được update tương tự như `userController.ts`:

#### 4.1. Transaction Attachments
- File: `server/src/controllers/transactionAttachmentController.ts`
- Sử dụng `handleFileUpload(req.file, 'transactions')`

#### 4.2. Project Comments
- File: `server/src/controllers/projectCommentController.ts`
- Sử dụng `handleFileUpload(req.file, 'comments')`

#### 4.3. Purchase Request Comments
- File: `server/src/controllers/purchaseRequestCommentController.ts`
- Sử dụng `handleFileUpload(req.file, 'purchase-request-comments')`

#### 4.4. Group Chat
- File: `server/src/controllers/groupChatController.ts`
- Avatar: `handleFileUpload(req.file, 'group-avatars')`
- Messages: `handleFileUpload(req.file, 'group-messages')`

#### 4.5. Direct Messages
- File: `server/src/controllers/directMessageController.ts`
- Sử dụng `handleFileUpload(req.file, 'direct-messages')`

### Bước 5: Update URL Helper Functions

Các helper functions trong controllers cần được update để hỗ trợ Supabase URLs:

```typescript
function getMessageAttachmentUrl(filename: string): string {
  // If already a full URL (from Supabase), return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If Supabase Storage is enabled, get URL from Supabase
  if (isSupabaseStorageEnabled()) {
    return getSupabaseStorageUrl('direct-messages', filename);
  }
  
  // Fallback to local filesystem URL
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/direct-messages/${filename}`;
}
```

## 🔍 Cách Kiểm Tra

1. **Upload một file mới**
   - File sẽ được upload lên Supabase Storage
   - URL sẽ là: `https://xxxxx.supabase.co/storage/v1/object/public/{bucket}/{filename}`

2. **Kiểm tra trong Supabase Dashboard**
   - Vào **Storage** → **Buckets** → chọn bucket
   - Xem file đã được upload chưa

3. **Kiểm tra trong Database**
   - URL trong database sẽ là full URL từ Supabase (nếu dùng Supabase Storage)
   - Hoặc chỉ là filename (nếu dùng filesystem)

## ⚠️ Lưu Ý

### Files Cũ

Files đã upload trước khi migrate sẽ vẫn dùng URL cũ (local filesystem). Có 2 cách xử lý:

1. **Giữ nguyên** - Files cũ sẽ mất khi server restart (nhưng đã có trong database)
2. **Migrate files cũ** - Cần script để upload lại files cũ lên Supabase Storage

### Rollback

Nếu muốn quay lại filesystem storage:
1. Xóa environment variables `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trên Render
2. Code sẽ tự động fallback về filesystem storage

## 📝 Template Code để Update Controller

```typescript
import { handleFileUpload } from '../middleware/upload.js';
import { isSupabaseStorageEnabled, getSupabaseStorageUrl } from '../utils/supabaseStorage.js';

// In your upload handler:
if (!req.file) {
  return res.status(400).json({ error: 'Không có file được tải lên' });
}

// Handle file upload (Supabase or filesystem)
const { filename, url } = await handleFileUpload(req.file, 'bucket-name');

// Store filename or full URL in database
const fileValue = url.startsWith('http') ? url : filename;

// Save to database
await query(
  'INSERT INTO table_name (file_column) VALUES (?)',
  [fileValue]
);
```

## 🎯 Kết Quả

Sau khi migrate:
- ✅ Files được lưu trên Supabase Storage (persistent)
- ✅ Files không bị mất khi server restart
- ✅ URL tự động được generate từ Supabase
- ✅ Fallback về filesystem nếu Supabase không được config

