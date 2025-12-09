# 🔧 Fix RLS Policy - Script Đúng Cho Supabase Storage

## ❌ Lỗi

```
ERROR: 42501: must be owner of table objects
```

Không thể disable RLS trực tiếp cho `storage.objects` trong Supabase.

## ✅ Giải Pháp: Tạo Policies Đúng Cách

### Script SQL - Copy và Chạy

Chạy script này trong **Supabase SQL Editor**:

```sql
-- Drop all existing policies first (nếu có)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- Policy 1: Cho phép service_role upload và quản lý files (ALL operations)
CREATE POLICY "Service role can manage all files"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Cho phép authenticated users upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Cho phép public đọc files (tất cả buckets)
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
TO public
USING (true);
```

## 🚀 Cách Chạy

1. Vào **Supabase Dashboard → SQL Editor**
2. Click **New query**
3. Copy toàn bộ script trên
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Đợi kết quả "Success"

## ✅ Verify

Sau khi chạy:
1. Vào **Storage → Policies**
2. Kiểm tra có 3 policies:
   - "Service role can manage all files" (ALL operations)
   - "Authenticated users can upload" (INSERT)
   - "Public can read files" (SELECT)

## 🧪 Test

1. Upload một file mới
2. Check logs trên Render:
   - ✅ Phải thấy: `✅ Uploaded to Supabase: https://...`
   - ❌ Không còn lỗi: "RLS policy violation"

## ⚠️ Lưu Ý

- **Service role** sẽ có full access (upload, delete, update)
- **Authenticated users** chỉ có thể upload
- **Public** chỉ có thể đọc (xem files)

## 🔄 Nếu Vẫn Lỗi

Nếu vẫn còn lỗi, thử script này (đơn giản hơn):

```sql
-- Policy đơn giản nhất - cho phép tất cả từ service_role
CREATE POLICY "Allow service role everything"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Cho phép public đọc
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (true);
```

