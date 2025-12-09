# 🔧 Fix: Supabase Storage RLS Policy Error

## ❌ Lỗi

```
StorageApiError: new row violates row-level security policy
status: 400
statusCode: '403'
```

## 🔍 Nguyên Nhân

Supabase Storage có **Row Level Security (RLS)** enabled by default. Khi upload files, Supabase kiểm tra policies để xác định quyền truy cập. Nếu không có policy phù hợp, upload sẽ bị từ chối.

## ✅ Giải Pháp

Có 2 cách:

### Cách 1: Disable RLS cho Buckets (Đơn giản nhất - Khuyến nghị)

1. **Vào Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Vào Storage → Buckets**
   - Click vào từng bucket (avatars, transactions, comments, etc.)

3. **Disable RLS cho mỗi bucket:**
   - Scroll xuống phần **"Policies"**
   - Tìm toggle **"Enable RLS"** hoặc **"Public bucket"**
   - Đảm bảo bucket là **Public** (RLS disabled)
   - Hoặc nếu có toggle RLS, tắt nó đi

4. **Lưu ý:** 
   - Public buckets cho phép mọi người đọc files
   - Nhưng chỉ có service_role key mới có thể upload (từ server)
   - Đây là cách an toàn cho public assets như avatars, images

### Cách 2: Tạo RLS Policies (Nâng cao)

Nếu muốn giữ RLS enabled, cần tạo policies:

1. **Vào Supabase Dashboard → Storage → Policies**

2. **Tạo policy cho mỗi bucket:**

```sql
-- Policy cho avatars bucket
CREATE POLICY "Allow public read access on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow service role upload to avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Tương tự cho các buckets khác:
-- transactions, comments, group-messages, direct-messages, etc.
```

3. **Hoặc dùng SQL Editor:**

Vào **SQL Editor** và chạy script sau (thay thế tất cả buckets):

```sql
-- Disable RLS cho tất cả storage buckets
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Hoặc tạo policies cho từng bucket
-- (Chỉ cần làm 1 trong 2 cách trên)
```

## 🚀 Cách Nhanh Nhất

**Khuyến nghị:** Disable RLS cho tất cả buckets vì:
- ✅ Đơn giản nhất
- ✅ Buckets đã là public (mọi người có thể đọc)
- ✅ Chỉ server (với service_role key) mới có thể upload
- ✅ An toàn cho public assets

### Steps:

1. Vào **Storage → Buckets**
2. Click vào từng bucket
3. Đảm bảo **"Public bucket"** = **ON**
4. Hoặc tắt **"Enable RLS"** nếu có

## 📋 Checklist Buckets Cần Check

- [ ] `avatars` - Public bucket = ON
- [ ] `transactions` - Public bucket = ON  
- [ ] `comments` - Public bucket = ON
- [ ] `purchase-request-comments` - Public bucket = ON
- [ ] `group-avatars` - Public bucket = ON
- [ ] `group-messages` - Public bucket = ON
- [ ] `direct-messages` - Public bucket = ON

## 🔍 Verify

Sau khi fix, test lại upload:
1. Upload một file mới
2. Check logs trên Render - không còn lỗi RLS
3. File URL sẽ là Supabase URL: `https://xxxxx.supabase.co/storage/v1/object/public/...`

## ⚠️ Lưu Ý

- **Service Role Key** phải được dùng (không phải anon key)
- Buckets phải là **Public** để users có thể xem files
- RLS chỉ ảnh hưởng đến upload, không ảnh hưởng đến read nếu bucket là public

