# Hướng dẫn Chạy Migration trên Supabase

## Cách 1: Set biến môi trường trong file .env

Thêm các biến sau vào file `server/.env`:

```env
# Supabase Database Configuration
DB_TYPE=postgres
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
# Hoặc dùng IPv4 (port 6543):
# DB_PORT=6543
DB_USER=postgres.your-project-ref
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
DB_SSL=true
```

Sau đó chạy:

```bash
cd server
npx tsx src/scripts/runTaskMigration.ts
```

## Cách 2: Set biến môi trường trực tiếp khi chạy

```bash
cd server
DB_TYPE=postgres \
DB_HOST=your-project-ref.supabase.co \
DB_PORT=5432 \
DB_USER=postgres.your-project-ref \
DB_PASSWORD=your-supabase-password \
DB_NAME=postgres \
npx tsx src/scripts/runTaskMigration.ts
```

## Cách 3: Dùng script riêng cho Supabase

```bash
cd server
DB_HOST=your-project-ref.supabase.co \
DB_PORT=5432 \
DB_USER=postgres.your-project-ref \
DB_PASSWORD=your-supabase-password \
DB_NAME=postgres \
npx tsx src/scripts/runTaskMigrationSupabase.ts
```

## Lấy thông tin Supabase

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** > **Database**
4. Tìm **Connection string** hoặc **Connection info**:
   - **Host**: `db.xxxxx.supabase.co` hoặc `xxxxx.supabase.co`
   - **Port**: `5432` (hoặc `6543` cho IPv4)
   - **Database**: `postgres`
   - **User**: `postgres.xxxxx` (project ref)
   - **Password**: Password bạn đã set khi tạo project

## Lưu ý

- **IPv4 vs IPv6**: Nếu kết nối IPv4, dùng port `6543` thay vì `5432`
- **SSL**: Supabase yêu cầu SSL, script sẽ tự động enable
- **IP Whitelist**: Đảm bảo IP của bạn được whitelist trong Supabase dashboard (Settings > Database > Connection Pooling)

## Kiểm tra sau khi migration

Sau khi chạy migration thành công, bạn có thể kiểm tra trong Supabase SQL Editor:

```sql
-- Kiểm tra bảng đã tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_tasks', 'task_activity');

-- Xem cấu trúc bảng
\d project_tasks
\d task_activity
```

