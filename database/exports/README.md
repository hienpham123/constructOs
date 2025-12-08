# Database Exports

Thư mục này chứa các file export database.

## 📦 Files trong thư mục này

- `*.sql` - Database export files
- Files được tự động tạo bởi `export_database.sh`

## 🔄 Export Database

Để export database, chạy:

```bash
cd ../scripts
./export_database.sh
```

Files sẽ được lưu tại đây với format:
- `{database_name}_export_{timestamp}.sql` - Full export (schema + data)
- `{database_name}_schema_{timestamp}.sql` - Schema only
- `{database_name}_data_{timestamp}.sql` - Data only

## 📤 Chia Sẻ Database Với Team

### Option 1: Commit Schema File (khuyến nghị)

Chỉ commit file schema (không có data) để chia sẻ cấu trúc database:

```bash
git add database/exports/*_schema_*.sql
git commit -m "chore: Add database schema export"
git push
```

### Option 2: Cloud Storage

Upload file export lên Google Drive / Dropbox / OneDrive và chia sẻ link.

### Option 3: Git LFS (cho file lớn)

Nếu file lớn, dùng Git LFS:

```bash
git lfs track "database/exports/*.sql"
git add .gitattributes
git add database/exports/constructOS_*.sql
git commit -m "chore: Add database export via LFS"
git push
```

## 📥 Import Database

Để import database từ file export:

```bash
cd ../scripts
./import_database.sh ../exports/{filename}.sql
```

Xem hướng dẫn đầy đủ trong [SETUP_DATABASE.md](../SETUP_DATABASE.md)

---

**Note:** File exports có thể rất lớn, chỉ commit vào git nếu thực sự cần thiết. Ưu tiên chỉ commit schema files.

