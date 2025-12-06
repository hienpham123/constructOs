# Xóa các bảng đã loại bỏ khỏi ứng dụng

File `drop_removed_tables.sql` được tạo để xóa các bảng sau khỏi database:

- `maintenance_schedules` - Lịch bảo trì thiết bị
- `equipment_usage` - Lịch sử sử dụng thiết bị
- `equipment` - Thiết bị
- `contract_documents` - Tài liệu hợp đồng
- `contracts` - Hợp đồng

## Cách chạy

### MySQL

```bash
mysql -u root -p constructos < database/drop_removed_tables.sql
```

Hoặc nếu dùng user khác:

```bash
mysql -u constructos_user -p constructos < database/drop_removed_tables.sql
```

### PostgreSQL

Nếu bạn đang dùng PostgreSQL, cần chỉnh sửa file để phù hợp với cú pháp PostgreSQL:

```sql
-- Drop foreign key constraints first, then drop tables
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS equipment_usage CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS contract_documents CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
```

## Lưu ý

⚠️ **CẢNH BÁO**: Script này sẽ xóa vĩnh viễn tất cả dữ liệu trong các bảng trên. Hãy đảm bảo bạn đã backup database trước khi chạy.

## Backup trước khi xóa

```bash
# MySQL
mysqldump -u root -p constructos > backup_before_drop.sql

# PostgreSQL
pg_dump -U postgres constructos > backup_before_drop.sql
```

