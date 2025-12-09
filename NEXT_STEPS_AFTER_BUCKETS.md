# 🚀 Các Bước Tiếp Theo Sau Khi Tạo Buckets

Bạn đã tạo xong các buckets trong Supabase Storage! Bây giờ làm theo các bước sau:

## ✅ Bước 1: Lấy Supabase Credentials

1. **Vào Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn (hieho's Project)

2. **Lấy Supabase URL và Service Role Key**
   - Click vào **Settings** (biểu tượng bánh răng) ở sidebar trái
   - Chọn **API** trong menu
   - Tìm 2 thông tin sau:
     - **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
     - **service_role key** (key dài, bắt đầu với `eyJ...`)
   
   ⚠️ **QUAN TRỌNG:** Dùng **service_role key**, KHÔNG phải **anon key**!

## ✅ Bước 2: Thêm Environment Variables trên Render

1. **Vào Render Dashboard**
   - Truy cập: https://dashboard.render.com
   - Chọn service backend của bạn

2. **Thêm Environment Variables**
   - Vào tab **Environment**
   - Click **Add Environment Variable**
   - Thêm 2 biến sau:

   ```
   Key: SUPABASE_URL
   Value: https://xxxxx.supabase.co
   ```
   (Thay `xxxxx` bằng URL thực tế của bạn)

   ```
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Paste toàn bộ service_role key)

3. **Save và Deploy lại**
   - Click **Save Changes**
   - Render sẽ tự động deploy lại service

## ✅ Bước 3: Cài Đặt Package (Nếu chưa làm)

Nếu chưa cài `@supabase/supabase-js`:

```bash
cd server
npm install
```

## ✅ Bước 4: Test Upload

1. **Upload một file mới** (avatar hoặc attachment)
2. **Kiểm tra trong Supabase:**
   - Vào **Storage** → **Buckets**
   - Click vào bucket (ví dụ: `avatars`)
   - Xem file đã được upload chưa

3. **Kiểm tra URL:**
   - File URL sẽ có dạng:
   ```
   https://xxxxx.supabase.co/storage/v1/object/public/avatars/filename.jpg
   ```
   - Copy URL và paste vào browser để xem ảnh

## ✅ Bước 5: Verify Storage Usage

Chạy script để check storage:

```bash
cd server
npm run check:storage
```

Script sẽ hiển thị:
- Số files trong mỗi bucket
- Tổng dung lượng
- Usage percentage
- Cảnh báo nếu > 80%

## 🔍 Kiểm Tra Buckets Đã Tạo

Theo hình bạn gửi, các buckets sau đã được tạo:
- ✅ `avatars`
- ✅ `transactions`
- ✅ `comments`
- ✅ `purchase-request-comments`
- ✅ `group-avatars`
- ✅ `group-messages`
- ✅ `direct-messages`

**Lưu ý:** Tất cả buckets đang có **File Size Limit: Unset (50 MB)**. Điều này OK vì:
- Code của chúng ta đã giới hạn ở 2-5MB
- Supabase limit 50MB là maximum, không phải required

## ⚠️ Troubleshooting

### Nếu upload không hoạt động:

1. **Check environment variables:**
   ```bash
   # Trên Render, verify các biến:
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Check logs trên Render:**
   - Vào **Logs** tab
   - Tìm lỗi liên quan đến Supabase

3. **Verify buckets là public:**
   - Vào **Storage** → **Buckets**
   - Click vào từng bucket
   - Đảm bảo **Public bucket** = ON

### Nếu files không hiển thị:

1. **Check URL format:**
   - URL phải có format: `https://xxxxx.supabase.co/storage/v1/object/public/{bucket}/{filename}`
   - Nếu URL sai, check function `getSupabaseStorageUrl()` trong code

2. **Check file permissions:**
   - Buckets phải là **public**
   - Files phải có quyền public read

## 📝 Checklist

- [ ] Đã lấy SUPABASE_URL từ Settings → API
- [ ] Đã lấy SUPABASE_SERVICE_ROLE_KEY (service_role, không phải anon)
- [ ] Đã thêm 2 environment variables trên Render
- [ ] Đã save và deploy lại trên Render
- [ ] Đã test upload một file mới
- [ ] Đã verify file xuất hiện trong Supabase Storage
- [ ] Đã test xem file qua URL
- [ ] Đã chạy `npm run check:storage` để verify

## 🎉 Sau Khi Hoàn Thành

Sau khi làm xong các bước trên:
- ✅ Files sẽ được lưu vĩnh viễn trên Supabase Storage
- ✅ Files không bị mất khi server restart
- ✅ Image compression tự động hoạt động
- ✅ File size limits đã được giảm (2-5MB)

## 📚 Tài Liệu Tham Khảo

- `MIGRATE_TO_SUPABASE_STORAGE.md` - Hướng dẫn chi tiết migrate
- `STORAGE_CAPACITY_GUIDE.md` - Hướng dẫn về dung lượng
- `OPTIMIZATION_SUMMARY.md` - Tóm tắt các tối ưu đã làm

