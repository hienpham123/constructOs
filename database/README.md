# Database Setup Guide

Hướng dẫn setup database cho ConstructOS khi deploy production.

## Quick Start

### PostgreSQL (Khuyến nghị)

```bash
# 1. Tạo database
createdb constructos

# 2. Chạy schema
psql -U postgres -d constructos -f schema.sql

# 3. (Optional) Seed initial data
psql -U postgres -d constructos -f seeds/initial_data.sql
```

### MySQL

```bash
# 1. Tạo database
mysql -u root -p -e "CREATE DATABASE constructos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Chạy schema
mysql -u root -p constructos < mysql_schema.sql
```

## File Structure

```
database/
├── schema.sql              # PostgreSQL schema
├── mysql_schema.sql        # MySQL schema
├── seeds/
│   └── initial_data.sql    # Initial data (admin user, etc.)
└── migrations/             # Migration scripts (nếu dùng migration tool)
```

## Connection String

### PostgreSQL
```
postgresql://username:password@localhost:5432/constructos
```

### MySQL
```
mysql://username:password@localhost:3306/constructos
```

## Environment Variables

Thêm vào `.env` của server:

```env
# Database
DB_TYPE=postgresql  # hoặc mysql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=constructos
DB_USER=your_username
DB_PASSWORD=your_password
DB_URL=postgresql://username:password@localhost:5432/constructos
```

## Setup Database Cho Máy Mới

Khi clone code về máy mới, xem hướng dẫn chi tiết:
👉 **[SETUP_DATABASE.md](./SETUP_DATABASE.md)** - Hướng dẫn đầy đủ setup database

### Quick Start

1. **Export database từ máy hiện tại:**
   ```bash
   cd database/scripts
   ./export_database.sh
   ```

2. **Import database trên máy mới:**
   ```bash
   cd database/scripts
   ./import_database.sh ../exports/constructOS_schema_YYYYMMDD_HHMMSS.sql
   ```

## Next Steps

1. Cài đặt database client library (pg cho PostgreSQL, mysql2 cho MySQL)
2. Tạo database connection module trong server
3. Cập nhật controllers để query từ database thay vì in-memory
4. Setup connection pooling
5. Setup database migrations tool (nếu cần)

