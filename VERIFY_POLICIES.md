# ✅ Verify Policies - Hướng Dẫn Kiểm Tra

## 📍 Nơi Xem Policies

Policies được tạo ở **table level** (`storage.objects`), không phải bucket level. UI có thể hiển thị "0 Policies" trong bucket view, nhưng policies vẫn hoạt động.

### Cách 1: Xem trong Tab Policies

1. Vào **Storage → Files**
2. Click tab **"Policies"** (bên cạnh "Buckets" và "Settings")
3. Xem danh sách policies đã tạo
4. Phải thấy 3 policies:
   - "Service role can manage all files"
   - "Authenticated users can upload"
   - "Public can read files"

### Cách 2: Xem qua SQL Query

Chạy query này trong **SQL Editor**:

```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Query này sẽ hiển thị tất cả policies đã tạo.

## 🧪 Test Upload Ngay

**Quan trọng:** Dù UI hiển thị "0 Policies", policies vẫn hoạt động nếu đã chạy SQL script thành công!

1. **Upload một file mới:**
   - Upload avatar hoặc image trong message

2. **Kiểm tra logs trên Render:**
   - ✅ Nếu thấy: `✅ Uploaded to Supabase: https://...` → **Policies đã hoạt động!**
   - ❌ Nếu vẫn lỗi: "RLS policy violation" → Cần kiểm tra lại

## 🔍 Nếu Vẫn Lỗi

Nếu upload vẫn bị lỗi RLS, thử script này (đơn giản hơn):

```sql
-- Xóa tất cả policies cũ
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

-- Policy đơn giản nhất - service_role có full access
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public có thể đọc
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (true);
```

## ✅ Verify Policies Hoạt Động

Cách tốt nhất để verify là **test upload**:

1. Upload một file mới
2. Nếu thành công → Policies đã hoạt động (dù UI hiển thị "0")
3. Nếu vẫn lỗi → Chạy lại script ở trên

## 📝 Lưu Ý

- UI có thể hiển thị "0 Policies" vì policies ở table level, không phải bucket level
- Quan trọng là **test upload** để verify
- Nếu upload thành công → Policies đã hoạt động đúng!

