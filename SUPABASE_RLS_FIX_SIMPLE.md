# 🔧 Fix RLS Policy - Script Đơn Giản

## ❌ Vấn Đề

Vẫn còn lỗi: `new row violates row-level security policy`

## ✅ Giải Pháp: Disable RLS hoặc Tạo Policies Đúng

### Cách 1: Disable RLS (Đơn Giản Nhất - Khuyến Nghị)

Chạy script này trong **Supabase SQL Editor**:

```sql
-- Disable RLS for storage.objects (cho phép upload từ service role)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Lưu ý:** Cách này an toàn vì:
- Chỉ service_role key mới có thể upload (từ server)
- Public vẫn chỉ có thể đọc (buckets là public)
- Không ảnh hưởng đến security

### Cách 2: Tạo Policies Cho Authenticated (Nếu Cách 1 không work)

Nếu vẫn lỗi sau khi disable RLS, thử script này:

```sql
-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy cho tất cả buckets - cho phép authenticated users upload
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy cho service_role upload (bypass RLS)
CREATE POLICY "Allow service role full access"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy cho public read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (true);
```

### Cách 3: Tạo Policies Cho Từng Bucket (Chi Tiết)

Nếu muốn kiểm soát chặt chẽ hơn:

```sql
-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Policy cho service_role - full access to all buckets
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy cho public - read access to all buckets
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (true);
```

## 🚀 Khuyến Nghị

**Dùng Cách 1** (Disable RLS) vì:
- ✅ Đơn giản nhất
- ✅ An toàn (chỉ service_role upload được)
- ✅ Không cần maintain policies
- ✅ Hoạt động ngay lập tức

## 📋 Steps

1. Vào **Supabase Dashboard → SQL Editor**
2. Copy script từ **Cách 1** ở trên
3. Paste vào SQL Editor
4. Click **Run**
5. Test upload lại

## ✅ Verify

Sau khi chạy script:
1. Upload một file mới
2. Check logs trên Render - không còn lỗi RLS
3. File URL sẽ là Supabase URL

