# 🔧 Fix "Tenant or user not found" Error

## ⚠️ Vấn Đề

Lỗi: `PostgreSQL connection error: Tenant or user not found`

**Nguyên nhân:** Với Transaction Pooler của Supabase, username cần có format đặc biệt.

## ✅ Giải Pháp

### Từ Connection String

Connection string từ Supabase:
```
postgresql://postgres.wmnxjbaxtbxqbrbmynmm:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Lưu ý:** Username là `postgres.wmnxjbaxtbxqbrbmynmm` (có project ref), KHÔNG phải chỉ `postgres`!

### Cập Nhật Render Environment Variables

Vào Render → Environment và cập nhật:

**DB_USER:**
```
Key: DB_USER
Value: postgres.wmnxjbaxtbxqbrbmynmm
```

**Các biến khác giữ nguyên:**
- DB_HOST: `aws-1-ap-southeast-1.pooler.supabase.com` ✅
- DB_PORT: `6543` ✅
- DB_PASSWORD: `Anhhien123@` (đảm bảo đúng password)
- DB_NAME: `postgres` ✅
- DB_SSL: `true` ✅

## 🔍 Kiểm Tra Password

Nếu vẫn lỗi sau khi cập nhật DB_USER, kiểm tra:

1. **DB_PASSWORD có đúng không?**
   - Vào Supabase → Settings → Database
   - Click "Reset database password" nếu cần
   - Copy password mới và cập nhật trong Render

2. **Format của DB_USER:**
   - Phải là: `postgres.wmnxjbaxtbxqbrbmynmm`
   - KHÔNG phải: `postgres`

## 📋 Checklist

- [x] DB_HOST = `aws-1-ap-southeast-1.pooler.supabase.com` ✅
- [x] DB_PORT = `6543` ✅
- [ ] **DB_USER = `postgres.wmnxjbaxtbxqbrbmynmm`** ❌ **CẦN CẬP NHẬT!**
- [ ] DB_PASSWORD = `<đúng-password>` (kiểm tra lại)
- [x] DB_NAME = `postgres` ✅
- [x] DB_SSL = `true` ✅

---

**Cập nhật DB_USER ngay và kiểm tra lại!**

