# 🔧 Fix: Supabase Storage RLS Policy Error

## ❌ Lỗi Hiện Tại

```
StorageApiError: new row violates row-level security policy
status: 400
statusCode: '403'
```

## 🔍 Nguyên Nhân

Supabase Storage có **Row Level Security (RLS)** enabled. Ngay cả khi bucket là **Public**, bạn vẫn cần tạo **policies** để cho phép upload files.

## ✅ Giải Pháp: Tạo RLS Policies

### Bước 1: Vào Supabase SQL Editor

1. Vào **Supabase Dashboard**
2. Click **SQL Editor** ở sidebar trái
3. Click **New query**

### Bước 2: Chạy SQL Script

Copy và paste script sau vào SQL Editor, sau đó click **Run**:

```sql
-- Enable storage policies for all buckets
-- This allows service role to upload files to public buckets
-- Note: Drop existing policies first to avoid conflicts

-- Policy for avatars bucket
DROP POLICY IF EXISTS "Allow service role upload to avatars" ON storage.objects;
CREATE POLICY "Allow service role upload to avatars"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow public read from avatars" ON storage.objects;
CREATE POLICY "Allow public read from avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy for transactions bucket
DROP POLICY IF EXISTS "Allow service role upload to transactions" ON storage.objects;
CREATE POLICY "Allow service role upload to transactions"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'transactions');

DROP POLICY IF EXISTS "Allow public read from transactions" ON storage.objects;
CREATE POLICY "Allow public read from transactions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'transactions');

-- Policy for comments bucket
DROP POLICY IF EXISTS "Allow service role upload to comments" ON storage.objects;
CREATE POLICY "Allow service role upload to comments"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'comments');

DROP POLICY IF EXISTS "Allow public read from comments" ON storage.objects;
CREATE POLICY "Allow public read from comments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'comments');

-- Policy for purchase-request-comments bucket
DROP POLICY IF EXISTS "Allow service role upload to purchase-request-comments" ON storage.objects;
CREATE POLICY "Allow service role upload to purchase-request-comments"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'purchase-request-comments');

DROP POLICY IF EXISTS "Allow public read from purchase-request-comments" ON storage.objects;
CREATE POLICY "Allow public read from purchase-request-comments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'purchase-request-comments');

-- Policy for group-avatars bucket
DROP POLICY IF EXISTS "Allow service role upload to group-avatars" ON storage.objects;
CREATE POLICY "Allow service role upload to group-avatars"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'group-avatars');

DROP POLICY IF EXISTS "Allow public read from group-avatars" ON storage.objects;
CREATE POLICY "Allow public read from group-avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-avatars');

-- Policy for group-messages bucket
DROP POLICY IF EXISTS "Allow service role upload to group-messages" ON storage.objects;
CREATE POLICY "Allow service role upload to group-messages"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'group-messages');

DROP POLICY IF EXISTS "Allow public read from group-messages" ON storage.objects;
CREATE POLICY "Allow public read from group-messages"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-messages');

-- Policy for direct-messages bucket
DROP POLICY IF EXISTS "Allow service role upload to direct-messages" ON storage.objects;
CREATE POLICY "Allow service role upload to direct-messages"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'direct-messages');

DROP POLICY IF EXISTS "Allow public read from direct-messages" ON storage.objects;
CREATE POLICY "Allow public read from direct-messages"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'direct-messages');
```

### Bước 3: Verify Policies

1. Vào **Storage → Policies**
2. Kiểm tra xem các policies đã được tạo chưa
3. Mỗi bucket nên có 2 policies:
   - **INSERT policy** cho service_role (để upload)
   - **SELECT policy** cho public (để đọc)

## 🔄 Alternative: Disable RLS (Không khuyến nghị)

Nếu muốn disable RLS hoàn toàn (không khuyến nghị cho production):

```sql
-- Disable RLS for storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Lưu ý:** Cách này không an toàn, chỉ dùng cho testing.

## ✅ Sau Khi Fix

1. **Test upload lại:**
   - Upload một avatar mới
   - Upload một image trong message

2. **Check logs trên Render:**
   - Không còn lỗi "RLS policy"
   - Thấy log: `✅ Uploaded to Supabase: https://...`

3. **Verify file trong Supabase:**
   - Vào **Storage → Buckets → chọn bucket**
   - Xem file đã được upload chưa

4. **Check URL:**
   - URL phải là Supabase URL: `https://xxxxx.supabase.co/storage/v1/object/public/...`

## 📋 Checklist

- [ ] Đã chạy SQL script để tạo policies
- [ ] Đã verify policies trong Storage → Policies
- [ ] Đã test upload lại
- [ ] Files hiển thị trong Supabase Storage
- [ ] URL là Supabase URL (không phải Render URL)

## ⚠️ Lưu Ý

- **Service Role Key** phải được dùng (không phải anon key)
- Buckets phải là **Public** để users có thể xem files
- Policies cho phép:
  - **service_role** upload files (INSERT)
  - **public** đọc files (SELECT)

