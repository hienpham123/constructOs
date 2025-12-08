# 🔧 Fix Supabase IPv4 Connection Issue

## ⚠️ Vấn Đề

Supabase connection string hiện tại dùng **IPv6** và có cảnh báo:
> **"Not IPv4 compatible"**
> Use Session Pooler if on a IPv4 network or purchase IPv4 add-on

Render có thể không hỗ trợ IPv6, gây ra lỗi `ENETUNREACH`.

## ✅ Giải Pháp: Dùng Session Pooler

### Bước 1: Lấy Connection String từ Session Pooler

1. Trong modal "Connect to your project"
2. Ở phần **"Source"**, chọn **"Session Pooler"** (thay vì "Primary Database")
3. Connection string sẽ thay đổi thành dạng:
   ```
   postgresql://postgres:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   (Port sẽ là `6543` thay vì `5432`)

### Bước 2: Parse Connection String

Từ connection string, lấy các giá trị:

**Nếu dùng Session Pooler:**
- **DB_HOST**: `aws-0-ap-southeast-1.pooler.supabase.com` (hoặc host từ pooler)
- **DB_PORT**: `6543` (port của pooler, không phải 5432)
- **DB_USER**: `postgres`
- **DB_PASSWORD**: Password bạn đã tạo
- **DB_NAME**: `postgres`
- **DB_SSL**: `true`

**Nếu vẫn dùng Direct connection:**
- **DB_HOST**: `db.wmnxjbaxtbxqbrbmynmm.supabase.co`
- **DB_PORT**: `5432`
- Các giá trị khác giống nhau

### Bước 3: Cập Nhật Render Environment Variables

Quay lại Render và cập nhật:

**Option A: Dùng Session Pooler (Khuyến nghị)**
```env
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres
DB_PASSWORD=Anhhien123@
DB_NAME=postgres
DB_SSL=true
```

**Option B: Dùng Direct Connection (Nếu có IPv4 add-on)**
```env
DB_HOST=db.wmnxjbaxtbxqbrbmynmm.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Anhhien123@
DB_NAME=postgres
DB_SSL=true
```

---

## 🎯 Khuyến Nghị

**Dùng Session Pooler** vì:
- ✅ Hỗ trợ IPv4 (tương thích với Render)
- ✅ Tốt hơn cho serverless/cloud platforms
- ✅ Connection pooling tự động
- ✅ Miễn phí

---

**Sau khi cập nhật, restart service và kiểm tra logs!**

