# 🔧 Fix Database Connection Error trên Render

Lỗi: `PostgreSQL connection error: connect ENETUNREACH`

## 🔍 Nguyên Nhân

1. **Chưa set environment variables** trong Render
2. **DB_HOST sai** hoặc chưa được set
3. **DB_PASSWORD sai** hoặc chưa được set

## ✅ Giải Pháp

### Bước 1: Lấy Connection Info từ Supabase

1. Vào Supabase dashboard
2. Settings → Database
3. Scroll xuống **"Connection string"**
4. Chọn tab **"URI"**
5. Copy connection string hoặc lấy các giá trị:
   - **DB_HOST**: `db.wmnxjbaxtbxqbrbmynmm.supabase.co` (từ URL project)
   - **DB_PORT**: `5432`
   - **DB_USER**: `postgres`
   - **DB_PASSWORD**: Password bạn đã tạo khi tạo project
   - **DB_NAME**: `postgres`

### Bước 2: Thêm Environment Variables trong Render

1. Vào Render dashboard → Service `constructos-backend`
2. Click tab **"Environment"**
3. Thêm các biến sau (click **"+ Add Environment Variable"**):

| Key | Value | Secret? |
|-----|-------|---------|
| `DB_HOST` | `db.wmnxjbaxtbxqbrbmynmm.supabase.co` | No |
| `DB_PORT` | `5432` | No |
| `DB_USER` | `postgres` | No |
| `DB_PASSWORD` | `<your-supabase-password>` | ✅ Yes |
| `DB_NAME` | `postgres` | No |
| `DB_CONNECTION_LIMIT` | `10` | No |
| `DB_SSL` | `true` | No |
| `NODE_ENV` | `production` | No |
| `PORT` | `10000` | No |
| `JWT_SECRET` | `uuf6aCoozahV6OvS7ASWrehuf8X0EX+0fiE1XVTHJN4=` | ✅ Yes |
| `API_BASE_URL` | `https://constructos-backend.onrender.com` | No |
| `FRONTEND_URL` | `https://your-app.netlify.app` | No (set sau) |
| `CORS_ORIGIN` | `https://your-app.netlify.app` | No (set sau) |

### Bước 3: Restart Service

Sau khi thêm environment variables:
1. Scroll xuống cuối
2. Click **"Save Changes"**
3. Render sẽ tự động restart service
4. Xem logs để kiểm tra connection

## 🆘 Nếu Vẫn Lỗi

### Kiểm Tra Connection String

Nếu dùng connection string trực tiếp từ Supabase, có thể có format:
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

Parse thành các biến riêng lẻ như trên.

### Kiểm Tra Supabase Settings

1. Vào Supabase → Settings → Database
2. Kiểm tra **"Connection pooling"** settings
3. Có thể cần dùng **"Connection pooling"** URL thay vì **"URI"**

### Test Connection

Có thể test connection bằng cách:
1. Vào Render → Service → **"Shell"**
2. Chạy:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```

---

**Sau khi thêm environment variables, service sẽ tự động restart và kết nối database!**

