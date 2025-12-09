# 🔧 Fix RLS Lỗi - Giải Pháp Cuối Cùng

## ⚠️ Vấn Đề

Vẫn lỗi: `new row violates row-level security policy` khi upload, dù đã tạo policies.

## 🔍 Nguyên Nhân Có Thể

1. **Service role key chưa đúng hoặc chưa được set trên Render**
2. **Policies chưa apply đúng cho service_role**
3. **Cần bypass RLS hoàn toàn cho service_role**

## ✅ Giải Pháp 1: Verify Environment Variables

### Bước 1: Kiểm Tra trên Render

1. Vào **Render Dashboard** → Chọn service backend
2. Vào tab **Environment**
3. Verify có 2 biến:
   - `SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = Service role key (bắt đầu với `eyJ...`)

### Bước 2: Lấy Service Role Key Đúng

1. Vào **Supabase Dashboard** → **Settings** → **API**
2. Tìm phần **"service_role"** (secret)
3. Copy toàn bộ key (rất dài, bắt đầu với `eyJ...`)
4. **KHÔNG dùng anon key!**

### Bước 3: Thêm Logging để Debug

Thêm logging vào code để verify service role key đang được dùng:

```typescript
// Trong server/src/utils/supabaseStorage.ts
export function getSupabaseClient(): SupabaseClient | null {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Supabase not configured - missing env vars');
    return null;
  }

  // Log để verify (chỉ log một phần key để security)
  const keyPreview = process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...';
  console.log(`✅ Using Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`✅ Using Service Role Key: ${keyPreview}`);

  // ... rest of code
}
```

## ✅ Giải Pháp 2: SQL Script Mạnh Hơn

Chạy script này trong **Supabase SQL Editor**:

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

-- Policy 1: Service role có FULL access (bypass RLS)
CREATE POLICY "service_role_full_access"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Authenticated users có thể upload
CREATE POLICY "authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN (
    'avatars', 'transactions', 'comments', 
    'purchase-request-comments', 'group-avatars',
    'group-messages', 'direct-messages'
));

-- Policy 3: Public có thể đọc tất cả
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
TO public
USING (true);
```

## ✅ Giải Pháp 3: Bypass RLS Hoàn Toàn (Nếu vẫn lỗi)

Nếu vẫn lỗi, thử disable RLS cho service_role bằng cách này:

```sql
-- Tạo function để bypass RLS
CREATE OR REPLACE FUNCTION storage.bypass_rls()
RETURNS void AS $$
BEGIN
    -- Service role sẽ bypass RLS
    SET LOCAL role = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION storage.bypass_rls() TO service_role;
```

**NHƯNG** cách tốt nhất là đảm bảo service_role key đúng và policies đúng.

## ✅ Giải Pháp 4: Verify Service Role Key trong Code

Thêm logging để verify:

```typescript
// Trong uploadBufferToSupabaseStorage
export async function uploadBufferToSupabaseStorage(...) {
  const client = getSupabaseClient();
  if (!client) {
    console.log('❌ Supabase client is null');
    return null;
  }

  // Verify client đang dùng service_role
  const { data: { user } } = await client.auth.getUser();
  console.log('Current user:', user ? 'authenticated' : 'service_role (expected)');

  // ... rest of upload code
}
```

## 🧪 Test Sau Khi Fix

1. **Restart service trên Render** (để load env vars mới)
2. **Upload một file mới**
3. **Kiểm tra logs:**
   - ✅ Phải thấy: `✅ Using Service Role Key: eyJ...`
   - ✅ Phải thấy: `✅ Uploaded to Supabase: https://...`
   - ❌ Không còn: `❌ Error: RLS policy violation`

## 📝 Checklist

- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` trên Render (không phải anon key)
- [ ] Chạy SQL script mới ở trên
- [ ] Restart service trên Render
- [ ] Test upload lại
- [ ] Kiểm tra logs để verify service_role đang được dùng

## 🚨 Quan Trọng Nhất

**Service role key phải là key "service_role" (secret), KHÔNG phải "anon" key!**

Nếu dùng anon key → sẽ bị RLS block vì anon key không có quyền bypass RLS.

